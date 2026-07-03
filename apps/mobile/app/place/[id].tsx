import { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, Alert, Linking, TextInput, Dimensions, ActivityIndicator
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import ImageViewing from 'react-native-image-viewing';
import { Ionicons } from '@expo/vector-icons';
import { placesApi } from '../../src/api/places';
import { verificationsApi } from '../../src/api/verifications';
import { useAuthStore } from '../../src/store/authStore';
import { Place } from '../../src/types';
import StatusBadge from '../../src/components/place/StatusBadge';
import { timeAgo } from '../../src/utils/formatTime';
import { formatDistance, calculateDistance } from '../../src/utils/formatDistance';
import { useLocationStore } from '../../src/store/locationStore';

function SkeletonImage({ uri, onPress }: { uri: string, onPress: () => void }) {
  const [loading, setLoading] = useState(true);
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{ width: screenWidth, height: 220, backgroundColor: '#2C2C2C' }}>
      <Image 
        source={{ uri }} 
        style={{ width: '100%', height: '100%' }} 
        resizeMode="cover" 
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
      {loading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2C2C2C' }}>
          <ActivityIndicator color="rgba(255,255,255,0.3)" />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { lat: userLat, lng: userLng } = useLocationStore();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyNote, setVerifyNote] = useState('');
  const [verifyImage, setVerifyImage] = useState<string | null>(null);
  const [viewerImages, setViewerImages] = useState<{uri: string}[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const sheetRef = useRef<BottomSheet>(null);

  const openImageViewer = (urls: string[], index = 0) => {
    setViewerImages(urls.map(u => ({ uri: u })));
    setViewerIndex(index);
    setViewerVisible(true);
  };

  const pickVerifyImage = () => {
    Alert.alert('Upload Photo', 'Choose an option', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Take Photo', onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') return Alert.alert('Permission needed', 'Camera permission is required');
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          });
          if (!result.canceled) setVerifyImage(result.assets[0].uri);
      }},
      { text: 'Choose from Library', onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') return Alert.alert('Permission needed', 'Media permission is required');
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          });
          if (!result.canceled) setVerifyImage(result.assets[0].uri);
      }}
    ]);
  };

  useEffect(() => {
    fetchPlace();
  }, [id]);

  const fetchPlace = async () => {
    try {
      const { data } = await placesApi.getById(id);
      setPlace(data);
    } catch {
      // use mock for demo
      setPlace({
        id, name: 'Dyu Art Cafe', category: 'cafe', status: 'open',
        address: 'Koramangala, Bangalore', phone: '+91 98765 43210',
        reported_hours: 'Open until 3 AM', image_urls: [],
        distance: 1200, last_verified_at: new Date(Date.now() - 8 * 60000).toISOString(),
        last_verified_by: { id: '1', name: 'Bharath' },
        verification_count: 230, lat: 12.9352, lng: 77.6245,
        recent_verifications: [],
        added_by: { id: '1', name: 'Bharath' },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (status: 'open' | 'closed') => {
    if (!isAuthenticated) { router.push('/(auth)/login'); return; }
    setVerifying(true);
    try {
      await verificationsApi.submit({ 
        place_id: id, 
        status,
        note: verifyNote.trim() || undefined,
        imageUri: verifyImage || undefined,
      });
      setVerifyNote('');
      setVerifyImage(null);
      await fetchPlace();
      sheetRef.current?.close();
    } catch {}
    setVerifying(false);
  };

  const openDirections = () => {
    if (!place) return;
    Alert.alert('Get Directions', 'Choose navigation app', [
      { text: 'Google Maps', onPress: () => Linking.openURL(`https://maps.google.com/?q=${place.lat},${place.lng}`) },
      { text: 'Apple Maps', onPress: () => Linking.openURL(`maps://maps.apple.com/?q=${place.lat},${place.lng}`) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (loading || !place) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator size="large" color="#C6FF34" />
      </View>
    );
  }

  const allImages = [
    ...(place.image_urls || []),
    ...(place.recent_verifications?.filter(v => v.image_url).map(v => v.image_url as string) || [])
  ];

  return (
    <View className="flex-1 bg-dark">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top']}>

        {/* Back header */}
        <View className="flex-row items-center px-4 py-3 gap-3">
          <TouchableOpacity
            className="w-10 h-10 bg-[#3A3A3A] rounded-md items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="font-semibold text-[18px] text-white flex-1" numberOfLines={1}>
            {place.name}
          </Text>
          <StatusBadge status={place.status} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 170 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero image slider */}
          <View className="w-full h-[220px] bg-[#333]">
            {allImages.length > 0 ? (
              <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} className="w-full h-full">
                {allImages.map((img, idx) => (
                  <SkeletonImage
                    key={idx}
                    uri={img}
                    onPress={() => openImageViewer(allImages, idx)}
                  />
                ))}
              </ScrollView>
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-[64px]">🏪</Text>
              </View>
            )}
          </View>

          <View className="px-6 pt-5 gap-5">
            {/* Name + category */}
            <View className="gap-1">
              <Text className="font-bold text-[24px] text-white">{place.name}</Text>
              <Text className="font-regular text-[14px] text-white/60 capitalize">
                {place.category.replace('_', ' ')}
              </Text>
            </View>

            {/* Info rows */}
            <View className="bg-white/10 rounded-xl p-4 gap-3">
              {place.address && (
                <View className="flex-row gap-3 items-start">
                  <Ionicons name="location-outline" size={18} color="rgba(255,255,255,0.7)" />
                  <Text className="font-regular text-[14px] text-white/80 flex-1">{place.address}</Text>
                </View>
              )}
              {place.phone && (
                <View className="flex-row gap-3 items-center">
                  <Ionicons name="call-outline" size={18} color="rgba(255,255,255,0.7)" />
                  <Text className="font-regular text-[14px] text-white/80">{place.phone}</Text>
                </View>
              )}
              {place.reported_hours && (
                <View className="flex-row gap-3 items-center">
                  <Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.7)" />
                  <Text className="font-regular text-[14px] text-white/80">{place.reported_hours}</Text>
                </View>
              )}
              {(place.distance != null || (userLat && userLng)) && (
                <View className="flex-row gap-3 items-center">
                  <Ionicons name="navigate-outline" size={18} color="rgba(255,255,255,0.7)" />
                  <Text className="font-regular text-[14px] text-white/80">
                    {formatDistance(
                      place.distance != null
                        ? place.distance
                        : calculateDistance(userLat!, userLng!, place.lat, place.lng)
                    )} away
                  </Text>
                </View>
              )}
            </View>

            {/* Verification info */}
            <View className="bg-white/10 rounded-xl p-4 gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-[15px] text-white">Community Verifications</Text>
                <View className="bg-purple/20 rounded-full px-3 py-1">
                  <Text className="font-semibold text-[13px] text-white">
                    {place.verification_count}
                  </Text>
                </View>
              </View>
              {place.last_verified_by && (
                <Text className="font-regular text-[13px] text-white/60">
                  Last verified by{' '}
                  <Text className="text-white font-medium">{place.last_verified_by.name}</Text>
                  {place.last_verified_at && ` · ${timeAgo(place.last_verified_at)}`}
                </Text>
              )}
              {place.recent_verifications?.slice(0, 5).map(v => (
                <View key={v.id} className="py-2 border-b border-white/5">
                  <View className="flex-row items-center gap-2 mb-1">
                    <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center">
                      <Text className="text-[10px] text-white font-semibold">
                        {v.user_name?.[0]?.toUpperCase() || '?'}
                      </Text>
                    </View>
                    <Text className="font-regular text-[13px] text-white/70 flex-1">
                      {v.user_name || 'Someone'} marked{' '}
                      <Text className={v.status === 'open' ? 'text-status-open' : 'text-status-closed'}>
                        {v.status === 'open' ? 'Open' : 'Closed'}
                      </Text>
                    </Text>
                    <Text className="font-regular text-[11px] text-white/40">{timeAgo(v.created_at)}</Text>
                  </View>
                  {v.note && (
                    <Text className="font-regular text-[13px] text-white/90 mt-1 pl-8">
                      "{v.note}"
                    </Text>
                  )}
                  {v.image_url && (
                    <TouchableOpacity 
                      className="ml-8 mt-2 w-24 h-24 rounded-lg overflow-hidden border border-white/10"
                      onPress={() => openImageViewer([v.image_url!], 0)}
                    >
                      <Image source={{ uri: v.image_url }} className="w-full h-full" resizeMode="cover" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Added by */}
            {place.added_by && (
              <Text className="font-regular text-[13px] text-white/40 text-center">
                Added by {place.added_by.name}
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Action buttons */}
        <View className="absolute bottom-5 left-0 right-0 bg-dark/95 px-6 pt-4 pb-8 gap-3">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 h-[52px] bg-lime rounded-lg items-center justify-center"
              onPress={() => sheetRef.current?.expand()}
            >
              <Text className="font-semibold text-[15px] text-dark">Verify Status</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 h-[52px] bg-white/10 rounded-lg items-center justify-center"
              onPress={openDirections}
            >
              <Text className="font-semibold text-[15px] text-white">Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {verifying && (
          <View className="absolute inset-0 bg-black/60 items-center justify-center z-50">
            <ActivityIndicator size="large" color="#C6FF34" />
            <Text className="text-white font-medium mt-4">Verifying...</Text>
          </View>
        )}
      </SafeAreaView>

      {/* Verify bottom sheet */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['55%', '85%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#1A1A1A' }}
        handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16, gap: 20 }}>
          <Text className="font-bold text-[22px] text-white text-center tracking-tight">
            Verify Status
          </Text>
          
          <Text className="font-regular text-[14px] text-white/60 text-center -mt-2">
            Is this place currently open or closed?
          </Text>

          {/* Note Input */}
          <View className="gap-2">
            <Text className="font-semibold text-[14px] text-white/80">Add a note (optional)</Text>
            <View className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-h-[80px]">
              <TextInput
                className="text-white text-[15px] p-0 flex-1"
                placeholder="e.g. They are closing in 10 mins"
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                value={verifyNote}
                onChangeText={setVerifyNote}
              />
            </View>
          </View>

          {/* Photo Upload */}
          <View className="gap-2">
            <Text className="font-semibold text-[14px] text-white/80">Photo proof (optional)</Text>
            <TouchableOpacity 
              className="bg-white/5 border border-white/10 border-dashed rounded-xl h-[100px] items-center justify-center overflow-hidden"
              onPress={pickVerifyImage}
            >
              {verifyImage ? (
                <Image source={{ uri: verifyImage }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="items-center gap-2">
                  <Ionicons name="camera-outline" size={28} color="rgba(255,255,255,0.5)" />
                  <Text className="text-white/50 text-[13px]">Tap to upload photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Submit buttons */}
          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              className={`flex-1 h-[56px] bg-lime rounded-[18px] items-center justify-center ${verifying ? 'opacity-50' : ''}`}
              onPress={() => handleVerify('open')}
              disabled={verifying}
            >
              <Text className="font-semibold text-[16px] text-dark">Yes, Open</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 h-[56px] bg-white/10 border border-white/20 rounded-[18px] items-center justify-center ${verifying ? 'opacity-50' : ''}`}
              onPress={() => handleVerify('closed')}
              disabled={verifying}
            >
              <Text className="font-semibold text-[16px] text-white">No, Closed</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>

      <ImageViewing
        images={viewerImages}
        imageIndex={viewerIndex}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />
    </View>
  );
}
