import { useEffect } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useLocation } from '../../src/hooks/useLocation';
import { usePlaces } from '../../src/hooks/usePlaces';
import PlaceCard from '../../src/components/place/PlaceCard';

export default function HomeScreen() {
  const router = useRouter();
  const { lat, lng } = useLocation();
  const { places, loading, fetchNearby } = usePlaces();

  useEffect(() => {
    if (lat && lng) fetchNearby();
  }, [lat, lng]);

  return (
    <View className="flex-1 bg-map-bg">
      <StatusBar style="light" />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-3">
          <Text className="font-semibold text-[18px] text-white">
            Open Now Near You
          </Text>
        </View>

        {/* List */}
        <FlatList
          data={places}
          keyExtractor={p => p.id}
          renderItem={({ item }) => (
            <View className="px-4 mb-3">
              <PlaceCard
                place={item}
                onPress={() => router.push(`/place/${item.id}`)}
              />
            </View>
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 140 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchNearby} tintColor="#fff" />
          }
          ListEmptyComponent={
            !loading ? (
              <View className="items-center justify-center py-20">
                <Text className="font-medium text-[16px] text-white/50 text-center">
                  No places found nearby.{'\n'}Be the first to add one!
                </Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </View>
  );
}
