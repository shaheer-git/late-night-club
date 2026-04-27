import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, FlatList, Dimensions, Image,
  Linking, Platform,
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

const { height } = Dimensions.get('window');

const FILTER_CHIPS = [
  { label: 'Cafe',              value: 'cafe' },
  { label: 'Recently verified', value: 'recent' },
  { label: 'Road Side Shop',    value: 'roadside' },
  { label: 'Nearby',            value: 'nearby' },
  { label: 'Food',              value: 'food' },
];

function openNativeNavigation(toLat: number, toLng: number) {
  const url = Platform.select({
    ios: `maps://app?daddr=${toLat},${toLng}&dirflg=d`,
    android: `google.navigation:q=${toLat},${toLng}&mode=d`,
  });
  if (url) {
    Linking.canOpenURL(url).then(supported => {
      Linking.openURL(
        supported
          ? url
          : `https://www.google.com/maps/dir/?api=1&destination=${toLat},${toLng}&travelmode=driving`
      );
    });
  }
}

// Drawer has two heights: collapsed (search + chips) and expanded (full list)
type DrawerState = 'collapsed' | 'expanded';

export default function SearchScreen() {
  const router = useRouter();
  const { lat, lng } = useLocation();
  const { places: apiPlaces, fetchNearby } = usePlaces();
  const { selectedPlace, setSelectedPlace } = usePlacesStore();
  const { route, routeDistance, routeDuration, setRoute, clearRoute } = useMapStore();
  const mapRef = useRef<MapView>(null);
  const searchRef = useRef<TextInput>(null);

  const places = apiPlaces.length > 0 ? apiPlaces : DUMMY_PLACES;

  const [drawer, setDrawer] = useState<DrawerState>('collapsed');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showChips, setShowChips] = useState(true);

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
    setDrawer('collapsed');
    searchRef.current?.blur();
  };

  const handleDirections = async (place: Place) => {
    if (!lat || !lng) return;
    const r = await getRoute(lat, lng, place.lat, place.lng);
    if (r) {
      setRoute(r.coordinates, r.distance, r.duration);
      mapRef.current?.fitToCoordinates(r.coordinates, {
        edgePadding: { top: 80, right: 40, bottom: 300, left: 40 },
        animated: true,
      });
      setDrawer('collapsed');
      searchRef.current?.blur();
    }
    openNativeNavigation(place.lat, place.lng);
  };

  const filteredPlaces = places.filter(p => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !activeFilter || p.category === activeFilter ||
      (activeFilter === 'recent' && p.last_verified_at) ||
      (activeFilter === 'nearby' && (p.distance ?? 9999) < 1500);
    return matchesSearch && matchesFilter;
  });

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
        onPress={() => {
          setSelectedPlace(null);
          searchRef.current?.blur();
        }}
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

      {/* ── Bottom Drawer ──
          Figma: #2C2C2C, borderRadius 38, left 5, right 5, bottom 66
          Collapsed: search + chips only
          Expanded: search + chips + full scrollable list */}
      <View style={[
        styles.drawer,
        drawer === 'expanded' && styles.drawerExpanded,
      ]}>
        {/* Drag handle */}
        <TouchableOpacity
          style={styles.handleWrap}
          onPress={() => setDrawer(d => d === 'collapsed' ? 'expanded' : 'collapsed')}
        >
          <View style={styles.handle} />
        </TouchableOpacity>

        {/* Search row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.5)" />
            <TextInput
              ref={searchRef}
              style={styles.searchText}
              placeholder="Nearby open shop's..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setDrawer('expanded')}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            )}
          </View>
          {/* Filter icon button — toggles chips */}
          <TouchableOpacity
            style={[styles.filterBtn, showChips && styles.filterBtnActive]}
            onPress={() => setShowChips(v => !v)}
          >
            <Ionicons name="options-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Filter chips — toggled by filter button */}
        {showChips && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {FILTER_CHIPS.map(chip => {
              const active = activeFilter === chip.value;
              return (
                <TouchableOpacity
                  key={chip.value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setActiveFilter(active ? null : chip.value)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Expanded: scrollable place list */}
        {drawer === 'expanded' && (
          <FlatList
            data={filteredPlaces}
            keyExtractor={p => p.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <SearchPlaceCard
                place={item}
                onPress={() => {
                  handleMarkerPress(item);
                  router.push(`/place/${item.id}`);
                }}
                onDirections={() => handleDirections(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No places found</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

// ── Search result card (same Figma spec as home card) ────────────────────────
function SearchPlaceCard({
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
      <View style={styles.cardImg}>
        {place.image_urls?.[0] ? (
          <Image source={{ uri: place.image_urls[0] }} style={styles.cardImgFill} resizeMode="cover" />
        ) : (
          <View style={styles.cardImgPlaceholder}>
            <Ionicons name="storefront-outline" size={22} color="rgba(44,44,44,0.25)" />
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{place.name}</Text>
        <View style={styles.cardMeta}>
          <View style={[styles.statusDot, { backgroundColor: isOpen ? '#22C55E' : '#EF4444' }]} />
          <Text style={[styles.statusText, { color: isOpen ? '#22C55E' : '#EF4444' }]}>
            {isOpen ? 'Now Open' : 'Closed'}
          </Text>
          {place.distance != null && (
            <Text style={styles.distText}> · {formatDistance(place.distance)}</Text>
          )}
        </View>
        {place.last_verified_at && (
          <View style={styles.cardVerified}>
            <Ionicons name="checkmark-circle" size={12} color="#2C2C2C" />
            <Text style={styles.verifiedText}>Verified {timeAgo(place.last_verified_at)}</Text>
          </View>
        )}
      </View>
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

  // Drawer collapsed: just search + chips
  drawer: {
    position: 'absolute',
    left: 5, right: 5, bottom: 135,
    backgroundColor: '#2C2C2C',
    borderRadius: 38,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 12,
  },
  // Expanded: grows upward to show list
  drawerExpanded: {
    maxHeight: height * 0.72,
  },

  handleWrap: { alignItems: 'center', paddingVertical: 2 },
  handle: {
    width: 68, height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchBox: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 62,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    padding: 0,
  },
  filterBtn: {
    width: 62, height: 62,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(198,255,52,0.15)',
    borderWidth: 1,
    borderColor: '#C6FF34',
  },

  chipsRow: { flexDirection: 'row', gap: 7, paddingHorizontal: 4 },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 4,
  },
  chipActive: { backgroundColor: '#C6FF34' },
  chipText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#2C2C2C' },
  chipTextActive: { color: '#2C2C2C' },

  list: { flexGrow: 0 },
  listContent: { paddingBottom: 4 },

  emptyWrap: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.4)' },

  // Place card
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1, borderColor: '#2C2C2C',
    padding: 10, paddingRight: 22,
    gap: 20,
  },
  cardImg: {
    width: 70, height: 72,
    borderRadius: 18, overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  cardImgFill: { width: '100%', height: '100%' },
  cardImgPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(44,44,44,0.05)',
  },
  cardInfo: { flex: 1, gap: 4 },
  cardName: { fontFamily: 'Inter_600SemiBold', fontSize: 20, color: '#2C2C2C', lineHeight: 24 },
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
