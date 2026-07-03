import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Image, StyleSheet, Alert, Platform, ActivityIndicator
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocationStore } from '../src/store/locationStore';
import { useAuth } from '../src/hooks/useAuth';
import { useAuthStore } from '../src/store/authStore';
import { usePlacesStore } from '../src/store/placesStore';
import { placesApi } from '../src/api/places';
import { mediaApi } from '../src/api/media';
import { reverseGeocode } from '../src/utils/geocoding';
import { usePlaces } from '../src/hooks/usePlaces';

export default function AddPlaceScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { restoreSession } = useAuth();
  const { lat, lng } = useLocationStore();
  const { fetchNearby } = usePlaces();
  const mapRef = useRef<MapView>(null);

  const [pinLat, setPinLat] = useState(lat ?? 12.9352);
  const [pinLng, setPinLng] = useState(lng ?? 77.6245);
  const [name, setName] = useState('');
  
  // Default to 9:00 PM and 4:00 AM
  const defaultOpen = new Date();
  defaultOpen.setHours(21, 0, 0, 0);
  const [openTime, setOpenTime] = useState<Date>(defaultOpen);
  const [showOpen, setShowOpen] = useState(false);

  const defaultClose = new Date();
  defaultClose.setHours(4, 0, 0, 0);
  const [closeTime, setCloseTime] = useState<Date>(defaultClose);
  const [showClose, setShowClose] = useState(false);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState('cafe');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // ── Not logged in — redirect to login screen ─────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  // ── Success screen ────────────────────────────────────────────────────────────
  if (done) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.doneSafe} edges={['top', 'bottom']}>
          <View style={styles.doneContent}>
            <Text style={styles.doneTitle}>This place is now{'\n'}on the map</Text>
            <Text style={styles.doneSub}>
              Thanks for helping others discover{'\n'}great spots nearby.
            </Text>
            <View style={styles.communityBadge}>
              <Ionicons name="medal-outline" size={18} color="#7E3BED" />
              <Text style={styles.communityLabel}>Community point</Text>
              <Text style={styles.communityPoints}>+20</Text>
            </View>
          </View>
          <View style={styles.doneBtnWrap}>
            <TouchableOpacity
              style={styles.btnLime}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.btnLimeText}>Done</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Add Place form ────────────────────────────────────────────────────────────

  const pickImage = () => {
    Alert.alert('Upload Photo', 'Choose an option', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Take Photo', onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') return Alert.alert('Permission needed', 'Camera permission is required');
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          });
          if (!result.canceled) setImageUri(result.assets[0].uri);
      }},
      { text: 'Choose from Library', onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') return Alert.alert('Permission needed', 'Media permission is required');
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          });
          if (!result.canceled) setImageUri(result.assets[0].uri);
      }}
    ]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      let imageUrls: string[] = [];
      const uploadPromise = async () => {
        if (!imageUri) return;
        const form = new FormData();
        form.append('file', { uri: imageUri, name: 'photo.jpg', type: 'image/jpeg' } as any);
        const { data } = await mediaApi.upload(form);
        imageUrls = [data.url];
      };

      const [addr] = await Promise.all([
        reverseGeocode(pinLat, pinLng),
        uploadPromise()
      ]);

      const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const payload = {
        name,
        category,
        lat: pinLat,
        lng: pinLng,
        address: addr,
        reported_hours: `${formatTime(openTime)} – ${formatTime(closeTime)}`,
        status: 'open',
        image_urls: imageUrls,
      };

      const { data } = await placesApi.create(payload);
      // Refresh the places store so the new pin appears on Home/Search maps
      await fetchNearby();
      // Fetch latest user data so Trust Score points are updated!
      await restoreSession();
      usePlacesStore.getState().setSelectedPlace(data as any);
      setDone(true);
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e.message ?? 'Something went wrong';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>

        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Store Image ── */}
          <View style={styles.section}>
            <Text style={styles.label}>Store Image</Text>
            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
              ) : (
                <View style={styles.imageEmpty}>
                  <View style={styles.imageIcon}>
                    <Ionicons name="camera-outline" size={28} color="rgba(44,44,44,0.4)" />
                  </View>
                  <Text style={styles.imageUploadText}>Tap to upload image</Text>
                  <Text style={styles.imageUploadSub}>JPG up to 10MB</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Shop Name ── */}
          <View style={styles.section}>
            <Text style={styles.label}>Shop Name</Text>
            <View style={styles.inputBox}>
              <Ionicons name="storefront-outline" size={18} color="rgba(44,44,44,0.4)" />
              <TextInput
                style={styles.inputText}
                placeholder="Enter Shop name"
                placeholderTextColor="rgba(44,44,44,0.4)"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* ── Category ── */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {['cafe', 'restaurant', 'bar', 'pharmacy', 'convenience_store', 'other'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, category === cat && styles.catChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                    {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ── Location Selection ── */}
          <View style={styles.section}>
            <Text style={styles.label}>Location Selection</Text>
            <View style={styles.mapBox}>
              <MapView
                ref={mapRef}
                style={styles.mapInner}
                provider={PROVIDER_GOOGLE}
                customMapStyle={DARK_MAP_STYLE}
                initialRegion={{
                  latitude: pinLat,
                  longitude: pinLng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onPress={e => {
                  setPinLat(e.nativeEvent.coordinate.latitude);
                  setPinLng(e.nativeEvent.coordinate.longitude);
                }}
              >
                <Marker coordinate={{ latitude: pinLat, longitude: pinLng }} />
              </MapView>
              {/* Location button overlay */}
              <TouchableOpacity 
                style={styles.locBtn}
                onPress={() => {
                  if (lat && lng) {
                    setPinLat(lat);
                    setPinLng(lng);
                    mapRef.current?.animateToRegion({
                      latitude: lat,
                      longitude: lng,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }, 400);
                  }
                }}
              >
                <Ionicons name="locate" size={18} color="#7E3BED" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Open Time + Close Time ── */}
          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <Text style={styles.label}>Open Time</Text>
              <TouchableOpacity style={styles.timeBox} onPress={() => setShowOpen(true)}>
                <Ionicons name="time-outline" size={16} color="rgba(44,44,44,0.5)" />
                <Text style={styles.timeText}>
                  {openTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Ionicons name="chevron-down" size={14} color="rgba(44,44,44,0.4)" />
              </TouchableOpacity>
              {showOpen && (
                <DateTimePicker
                  value={openTime}
                  mode="time"
                  display="default"
                  onChange={(e, date) => {
                    setShowOpen(Platform.OS === 'ios');
                    if (date) setOpenTime(date);
                  }}
                />
              )}
            </View>
            <View style={styles.timeField}>
              <Text style={styles.label}>Close Time</Text>
              <TouchableOpacity style={styles.timeBox} onPress={() => setShowClose(true)}>
                <Ionicons name="time-outline" size={16} color="rgba(44,44,44,0.5)" />
                <Text style={styles.timeText}>
                  {closeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Ionicons name="chevron-down" size={14} color="rgba(44,44,44,0.4)" />
              </TouchableOpacity>
              {showClose && (
                <DateTimePicker
                  value={closeTime}
                  mode="time"
                  display="default"
                  onChange={(e, date) => {
                    setShowClose(Platform.OS === 'ios');
                    if (date) setCloseTime(date);
                  }}
                />
              )}
            </View>
          </View>

          {/* ── Add to the map button ── */}
          <TouchableOpacity
            style={[styles.btnLime, styles.submitBtn, (!name.trim() || loading) && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={!name.trim() || loading}
          >
            <Text style={styles.btnLimeText}>
              {loading ? 'Adding...' : 'Add to the map'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color="#C6FF34" />
          <Text style={styles.loadingText}>Saving Place...</Text>
        </View>
      )}
    </View>
  );
}

// Dark navy Google Maps style — identical to Home and Search screens
const DARK_MAP_STYLE = [
  { elementType: 'geometry',            stylers: [{ color: '#1A212B' }] },
  { elementType: 'labels.icon',         stylers: [{ visibility: 'on' }, { saturation: -100 }, { lightness: 20 }] },
  { elementType: 'labels.text.fill',    stylers: [{ color: '#8E96A0' }] },
  { elementType: 'labels.text.stroke',  stylers: [{ color: '#1A212B' }] },
  { featureType: 'landscape',            elementType: 'geometry',        stylers: [{ color: '#1A212B' }] },
  { featureType: 'administrative',       elementType: 'geometry',        stylers: [{ color: '#242F3E' }] },
  { featureType: 'administrative',       elementType: 'geometry.stroke', stylers: [{ color: '#38414E' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#9DA5B1' }] },
  { featureType: 'poi',                  stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.park',             elementType: 'geometry',        stylers: [{ color: '#18202A' }] },
  { featureType: 'road',                 elementType: 'geometry',        stylers: [{ color: '#2A3442' }] },
  { featureType: 'road',                 elementType: 'geometry.stroke', stylers: [{ color: '#212A37' }] },
  { featureType: 'road',                 elementType: 'labels.text.fill', stylers: [{ color: '#737D8C' }] },
  { featureType: 'road.arterial',        elementType: 'geometry',        stylers: [{ color: '#2A3442' }] },
  { featureType: 'road.highway',         elementType: 'geometry',        stylers: [{ color: '#303B4C' }] },
  { featureType: 'road.highway',         elementType: 'geometry.stroke', stylers: [{ color: '#212A37' }] },
  { featureType: 'road.local',           elementType: 'labels.text.fill', stylers: [{ color: '#737D8C' }] },
  { featureType: 'transit',               stylers: [{ visibility: 'off' }] },
  { featureType: 'water',                elementType: 'geometry',        stylers: [{ color: '#11171E' }] },
  { featureType: 'water',                elementType: 'labels.text.fill', stylers: [{ color: '#3D4D5D' }] },
];

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#2C2C2C' },

  // Done screen
  doneSafe: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24 },
  doneContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  doneTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  doneSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  communityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F6FF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
  },
  communityLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#0F1724', flex: 1 },
  communityPoints: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#7E3BED' },
  doneBtnWrap: { paddingBottom: 16 },

  // Back button
  backBtn: {
    marginTop: 8,
    marginLeft: 16,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Form
  formContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 24,
  },
  section: { gap: 8 },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Image upload
  imageUpload: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    height: 160,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.1)',
  },
  imagePreview: { width: '100%', height: '100%' },
  imageEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageIcon: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(44,44,44,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  imageUploadText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#2C2C2C' },
  imageUploadSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(44,44,44,0.4)' },

  // Input
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.08)',
    paddingHorizontal: 16,
    height: 56,
    gap: 10,
  },
  inputText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#2C2C2C',
    padding: 0,
  },

  // Map box
  mapBox: {
    height: 186,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#1E1E1E',
  },
  mapInner: { flex: 1 },
  locBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // Time row
  timeRow: { flexDirection: 'row', gap: 16 },
  timeField: { flex: 1, gap: 8 },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.08)',
    paddingHorizontal: 12,
    height: 56,
    gap: 8,
  },
  timeText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#2C2C2C',
    padding: 0,
  },

  // Buttons
  btnLime: {
    height: 68,
    backgroundColor: '#C6FF34',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  btnLimeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#2C2C2C',
  },
  submitBtn: { marginTop: 12 },
  btnDisabled: { opacity: 0.5 },

  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  loadingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
  catChip: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#333333',
  },
  catChipActive: {
    backgroundColor: '#7E3BED',
    borderColor: '#7E3BED',
  },
  catChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  catChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
});
