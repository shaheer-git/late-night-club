import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, Image, Linking, Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../../src/hooks/useLocation';
import { usePlaces } from '../../src/hooks/usePlaces';
import { usePlacesStore } from '../../src/store/placesStore';
import { useMapStore } from '../../src/store/mapStore';
import CustomMarker from '../../src/components/map/CustomMarker';
import { formatDistance, formatDuration } from '../../src/utils/formatDistance';
import { getRoute } from '../../src/utils/routing';
import { timeAgo } from '../../src/utils/formatTime';
import { DUMMY_PLACES } from '../../src/data/dummyPlaces';
import { Place } from '../../src/types';

const { width } = Dimensions.get('window');
// Card width: 352px (Figma), with 14px left margin
const CARD_WIDTH = 352;
const CARD_MARGIN = 14;

/** Open Google Maps (Android) or Apple Maps (iOS) for turn-by-turn navigation */
function openNativeNavigation(toLat: number, toLng: number) {
  const url = Platform.select({
    ios: `maps://app?daddr=${toLat},${toLng}&dirflg=d`,
    android: `google.navigation:q=${toLat},${toLng}&mode=d`,
  });
  if (url) {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to Google Maps web
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${toLat},${toLng}&travelmode=driving`);
      }
    });
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const { lat, lng } = useLocation();
  const { places: apiPlaces, fetchNearby } = usePlaces();
  const { selectedPlace, setSelectedPlace } = usePlacesStore();
  const { route, routeDistance, routeDuration, setRoute, clearRoute } = useMapStore();
  const mapRef = useRef<MapView>(null);
  const listRef = useRef<FlatList>(null);

  // Use dummy data merged with any real API data
  const places = apiPlaces.length > 0 ? apiPlaces : DUMMY_PLACES;

  useEffect(() => {
    if (lat && lng) fetchNearby();
  }, [lat, lng]);

  const handleMarkerPress = (place: Place) => {
    setSelectedPlace(place);
    clearRoute();
    mapRef.current?.animateToRegion({
      latitude: place.lat,
      longitude: place.lng,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 400);
    // Scroll card list to selected
    const idx = places.findIndex(p => p.id === place.id);
    if (idx >= 0) {
      listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0 });
    }
  };

  const handleDirections = async (place: Place) => {
    if (!lat || !lng) return;
    // Draw route line on map
    const r = await getRoute(lat, lng, place.lat, place.lng);
    if (r) {
      setRoute(r.coordinates, r.distance, r.duration);
      mapRef.current?.fitToCoordinates(r.coordinates, {
        edgePadding: { top: 80, right: 40, bottom: 220, left: 40 },
        animated: true,
      });
    }
    // Open native navigation app for turn-by-turn
    openNativeNavigation(place.lat, place.lng);
  };

  const handleCardPress = (place: Place) => {
    router.push(`/place/${place.id}`);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* ── Full-screen Map ── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={{
          latitude: lat ?? 12.9352,
          longitude: lng ?? 77.6245,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {places.map(place => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            onPress={() => handleMarkerPress(place)}
            tracksViewChanges={false}
          >
            <CustomMarker
              status={place.status}
              label={place.name}
              active={selectedPlace?.id === place.id}
            />
          </Marker>
        ))}
        {route && (
          <Polyline
            coordinates={route}
            strokeColor="#7E3BED"
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}
      </MapView>

      {/* ── Route banner ── */}
      {route && routeDistance != null && (
        <SafeAreaView style={styles.routeSafe} edges={['top']}>
          <View style={styles.routeBanner}>
            <Text style={styles.routeText}>
              {formatDistance(routeDistance)} · {formatDuration(routeDuration ?? 0)}
            </Text>
            <TouchableOpacity onPress={clearRoute}>
              <Text style={styles.routeClear}>Clear</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {/* ── Place cards overlaid at bottom ──
          Figma: cards sit above the nav bar, horizontally scrollable
          Each card: 352×hug, white bg, borderRadius 28, border 1px #2C2C2C */}
      <View style={styles.cardsContainer}>
        <FlatList
          ref={listRef}
          data={places}
          keyExtractor={p => p.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_MARGIN}
          decelerationRate="fast"
          contentContainerStyle={styles.cardsList}
          onScrollToIndexFailed={() => {}}
          renderItem={({ item }) => (
            <PlaceCardOverlay
              place={item}
              onPress={() => handleCardPress(item)}
              onDirections={() => handleDirections(item)}
            />
          )}
        />
      </View>
    </View>
  );
}

// ── Inline place card matching Figma "Shop List card / Default" ──────────────
function PlaceCardOverlay({
  place,
  onPress,
  onDirections,
}: {
  place: Place;
  onPress: () => void;
  onDirections: () => void;
}) {
  const isOpen = place.status === 'open';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Thumbnail: 70×72, borderRadius 18 */}
      <View style={styles.cardImg}>
        {place.image_urls?.[0] ? (
          <Image source={{ uri: place.image_urls[0] }} style={styles.cardImgFill} resizeMode="cover" />
        ) : (
          <View style={styles.cardImgPlaceholder}>
            <Ionicons name="storefront-outline" size={22} color="rgba(44,44,44,0.25)" />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        {/* Name: Inter SemiBold 20px */}
        <Text style={styles.cardName} numberOfLines={1}>{place.name}</Text>

        {/* Status + distance */}
        <View style={styles.cardMeta}>
          <View style={[styles.statusDot, { backgroundColor: isOpen ? '#22C55E' : '#EF4444' }]} />
          <Text style={[styles.statusText, { color: isOpen ? '#22C55E' : '#EF4444' }]}>
            {isOpen ? 'Now Open' : 'Closed'}
          </Text>
          {place.distance != null && (
            <Text style={styles.distText}> · {formatDistance(place.distance)}</Text>
          )}
        </View>

        {/* Verified */}
        {place.last_verified_at && (
          <View style={styles.cardVerified}>
            <Ionicons name="checkmark-circle" size={12} color="#2C2C2C" />
            <Text style={styles.verifiedText}>Verified {timeAgo(place.last_verified_at)}</Text>
          </View>
        )}
      </View>

      {/* Navigate button: 40×40, #C6FF34, borderRadius 14 */}
      <TouchableOpacity style={styles.navBtn} onPress={onDirections}>
        <Ionicons name="navigate" size={18} color="#2C2C2C" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// Figma dark purple map style — matches #1B003F basemap
const DARK_MAP_STYLE = [
  { elementType: 'geometry',            stylers: [{ color: '#1B003F' }] },
  { elementType: 'labels.icon',         stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill',    stylers: [{ color: '#B289F4' }] },
  { elementType: 'labels.text.stroke',  stylers: [{ color: '#1B003F' }] },
  { featureType: 'landscape',            elementType: 'geometry',        stylers: [{ color: '#1B003F' }] },
  { featureType: 'administrative',       elementType: 'geometry',        stylers: [{ color: '#2C1A4A' }] },
  { featureType: 'administrative',       elementType: 'geometry.stroke', stylers: [{ color: '#4A2080' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#D0AAFF' }] },
  { featureType: 'poi',                  stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park',             elementType: 'geometry',        stylers: [{ color: '#150030' }] },
  { featureType: 'road',                 elementType: 'geometry',        stylers: [{ color: '#2C1A4A' }] },
  { featureType: 'road',                 elementType: 'geometry.stroke', stylers: [{ color: '#3D2060' }] },
  { featureType: 'road',                 elementType: 'labels.text.fill', stylers: [{ color: '#9E7FBF' }] },
  { featureType: 'road.arterial',        elementType: 'geometry',        stylers: [{ color: '#2C1A4A' }] },
  { featureType: 'road.highway',         elementType: 'geometry',        stylers: [{ color: '#3D2060' }] },
  { featureType: 'road.highway',         elementType: 'geometry.stroke', stylers: [{ color: '#5A3090' }] },
  { featureType: 'road.local',           elementType: 'labels.text.fill', stylers: [{ color: '#7B5EA7' }] },
  { featureType: 'transit',              stylers: [{ visibility: 'off' }] },
  { featureType: 'water',                elementType: 'geometry',        stylers: [{ color: '#0D001F' }] },
  { featureType: 'water',                elementType: 'labels.text.fill', stylers: [{ color: '#4A2080' }] },
];

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1B003F' },

  routeSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  routeBanner: {
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: 'rgba(44,44,44,0.92)',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  routeText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFFFFF' },
  routeClear: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#C6FF34' },

  // Cards container sits above the tab bar (bottom: 112 = tab bar height)
  cardsContainer: {
    position: 'absolute',
    bottom: 135,
    left: 0,
    right: 0,
  },
  cardsList: {
    paddingLeft: CARD_MARGIN,
    paddingRight: CARD_MARGIN,
    gap: 12,
  },

  // Card: 352×hug, white, borderRadius 28, border 1px #2C2C2C, padding 10 22 10 10
  card: {
    width: CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    padding: 10,
    paddingRight: 22,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardImg: {
    width: 70, height: 72,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  cardImgFill: { width: '100%', height: '100%' },
  cardImgPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(44,44,44,0.05)',
  },
  cardInfo: { flex: 1, gap: 4 },
  cardName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#2C2C2C',
    lineHeight: 24,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  distText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(44,44,44,0.5)' },
  cardVerified: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2 },
  verifiedText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#2C2C2C' },
  navBtn: {
    width: 40, height: 40,
    borderRadius: 14,
    backgroundColor: '#C6FF34',
    alignItems: 'center', justifyContent: 'center',
  },
});
