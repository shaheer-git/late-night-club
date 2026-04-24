import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useLocation } from '../../src/hooks/useLocation';
import { usePlaces } from '../../src/hooks/usePlaces';
import { usePlacesStore } from '../../src/store/placesStore';
import { useMapStore } from '../../src/store/mapStore';
import CustomMarker from '../../src/components/map/CustomMarker';
import StatusBadge from '../../src/components/place/StatusBadge';
import { formatDistance, formatDuration } from '../../src/utils/formatDistance';
import { getRoute } from '../../src/utils/routing';
import { Place } from '../../src/types';

const { height } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const { lat, lng } = useLocation();
  const { places, fetchNearby } = usePlaces();
  const { selectedPlace, setSelectedPlace } = usePlacesStore();
  const { route, routeDistance, routeDuration, setRoute, clearRoute } = useMapStore();
  const mapRef = useRef<MapView>(null);

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
  };

  const handleDirections = async () => {
    if (!selectedPlace || !lat || !lng) return;
    const r = await getRoute(lat, lng, selectedPlace.lat, selectedPlace.lng);
    if (r) setRoute(r.coordinates, r.distance, r.duration);
  };

  return (
    <View className="flex-1 bg-map-bg">
      <StatusBar style="light" />

      {/* Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: lat ?? 12.9716,
          longitude: lng ?? 77.5946,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {places.map(place => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            onPress={() => handleMarkerPress(place)}
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
          />
        )}
      </MapView>

      {/* Route banner */}
      {route && routeDistance != null && (
        <SafeAreaView className="absolute top-0 left-0 right-0" edges={['top']}>
          <View className="mx-4 mt-2 bg-dark/90 rounded-xl px-4 py-3 flex-row items-center justify-between">
            <Text className="font-semibold text-white text-[15px]">
              {formatDistance(routeDistance)} · {formatDuration(routeDuration ?? 0)}
            </Text>
            <TouchableOpacity onPress={clearRoute}>
              <Text className="text-lime font-medium text-[14px]">Clear</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {/* Bottom sheet mini */}
      {selectedPlace && (
        <View className="absolute bottom-[120px] left-4 right-4 bg-dark rounded-xl p-4 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold text-white text-[18px] flex-1" numberOfLines={1}>
              {selectedPlace.name}
            </Text>
            <StatusBadge status={selectedPlace.status} size="sm" />
          </View>

          {selectedPlace.address && (
            <Text className="font-regular text-[13px] text-white/60" numberOfLines={1}>
              {selectedPlace.address}
            </Text>
          )}

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 h-10 bg-lime rounded-lg items-center justify-center"
              onPress={handleDirections}
            >
              <Text className="font-semibold text-[14px] text-dark">Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 h-10 bg-white/10 rounded-lg items-center justify-center"
              onPress={() => router.push(`/place/${selectedPlace.id}`)}
            >
              <Text className="font-semibold text-[14px] text-white">View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 bg-white/10 rounded-lg items-center justify-center"
              onPress={() => setSelectedPlace(null)}
            >
              <Text className="text-white text-lg">✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
