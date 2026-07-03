import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usersApi } from '../src/api/users';
import { Place, Verification } from '../src/types';

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1A212B' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8E96A0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1A212B' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2A3442' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#11171E' }] },
];

type Tab = 'added' | 'verified';
type ViewMode = 'list' | 'map';

export default function MyContributionsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('added');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [addedPlaces, setAddedPlaces] = useState<Place[]>([]);
  const [verifiedPlaces, setVerifiedPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'added') {
        const { data } = await usersApi.getMyContributions();
        setAddedPlaces(data);
      } else {
        const { data } = await usersApi.getMyVerifications();
        setVerifiedPlaces(data);
      }
    } catch {}
    setLoading(false);
  };

  const currentPlaces: Place[] = activeTab === 'added' ? addedPlaces : verifiedPlaces;

  const mapPlaces = currentPlaces.filter(p => p.lat !== 0 && p.lng !== 0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Contributions</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Toggle row */}
        <View style={styles.toggleRow}>
          <View style={styles.tabToggle}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'added' && styles.tabBtnActive]}
              onPress={() => setActiveTab('added')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, activeTab === 'added' && styles.tabBtnTextActive]}>
                Added Places
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'verified' && styles.tabBtnActive]}
              onPress={() => setActiveTab('verified')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, activeTab === 'verified' && styles.tabBtnTextActive]}>
                Verified Places
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.mapToggleBtn, viewMode === 'map' && styles.mapToggleBtnActive]}
            onPress={() => setViewMode(v => v === 'list' ? 'map' : 'list')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="map-outline"
              size={18}
              color={viewMode === 'map' ? '#2C2C2C' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#C6FF34" />
          </View>
        ) : (
          <FlatList
            data={currentPlaces}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              viewMode === 'map' && mapPlaces.length > 0 ? (
                <MapView
                  style={styles.map}
                  provider={PROVIDER_GOOGLE}
                  customMapStyle={DARK_MAP_STYLE}
                  initialRegion={{
                    latitude: mapPlaces[0]?.lat ?? 12.9352,
                    longitude: mapPlaces[0]?.lng ?? 77.6245,
                    latitudeDelta: 0.08,
                    longitudeDelta: 0.08,
                  }}
                >
                  {mapPlaces.map(place => (
                    <Marker
                      key={place.id}
                      coordinate={{ latitude: place.lat, longitude: place.lng }}
                      title={place.name}
                    />
                  ))}
                </MapView>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No places yet</Text>
              </View>
            }
            renderItem={({ item }) => (
              <PlaceCard
                place={item}
                onPress={() => {
                  if (item.lat !== 0) router.push(`/place/${item.id}`);
                }}
              />
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

// ── Place card ────────────────────────────────────────────────────────────────
function PlaceCard({ place, onPress }: { place: Place; onPress: () => void }) {
  const isOpen = place.status === 'open';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Image */}
      <View style={styles.cardImg}>
        {place.image_urls?.[0] ? (
          <Image
            source={{ uri: place.image_urls[0] }}
            style={styles.cardImgFill}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.cardImgPlaceholder}>
            <Ionicons name="storefront-outline" size={24} color="rgba(44,44,44,0.3)" />
          </View>
        )}
      </View>
      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{place.name}</Text>
        <View style={styles.cardStatus}>
          <View style={[styles.statusDot, { backgroundColor: isOpen ? '#22C55E' : '#EF4444' }]} />
          <Text style={[styles.statusText, { color: isOpen ? '#22C55E' : '#EF4444' }]}>
            {isOpen ? 'Now Open' : 'Closed'}
          </Text>
        </View>
      </View>
      {/* Checkmark */}
      <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C2C2C',
  },
  safe: {
    flex: 1,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#3A3A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // ── Toggle row ──
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  tabToggle: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3A3A3A',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#C6FF34',
  },
  tabBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  tabBtnTextActive: {
    color: '#2C2C2C',
    fontFamily: 'Inter_600SemiBold',
  },
  mapToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#3A3A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapToggleBtnActive: {
    backgroundColor: '#C6FF34',
  },

  // ── List ──
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },

  // ── Map ──
  map: {
    width: '100%',
    height: 300,
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
  },

  // ── Card ──
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardImg: {
    width: 70,
    height: 70,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  cardImgFill: {
    width: '100%',
    height: '100%',
  },
  cardImgPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 6,
  },
  cardName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#2C2C2C',
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },

  // ── Empty / loading ──
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.4)',
  },
});
