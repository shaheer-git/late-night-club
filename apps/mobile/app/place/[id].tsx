import { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { placesApi } from '../../src/api/places';
import { verificationsApi } from '../../src/api/verifications';
import { useAuthStore } from '../../src/store/authStore';
import { Place } from '../../src/types';
import StatusBadge from '../../src/components/place/StatusBadge';
import { timeAgo } from '../../src/utils/formatTime';
import { formatDistance } from '../../src/utils/formatDistance';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const sheetRef = useRef<BottomSheet>(null);

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
      await verificationsApi.submit({ place_id: id, status });
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
        <Text className="text-white font-medium text-[16px]">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top']}>

        {/* Back header */}
        <View className="flex-row items-center px-4 py-3 gap-3">
          <TouchableOpacity
            className="w-10 h-10 bg-white/10 rounded-lg items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>
          <Text className="font-semibold text-[18px] text-white flex-1" numberOfLines={1}>
            {place.name}
          </Text>
          <StatusBadge status={place.status} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero image */}
          <View className="w-full h-[220px] bg-[#333]">
            {place.image_urls?.[0]
              ? <Image source={{ uri: place.image_urls[0] }} className="w-full h-full" resizeMode="cover" />
              : <View className="flex-1 items-center justify-center">
                  <Text className="text-[64px]">🏪</Text>
                </View>
            }
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
                  <Text className="text-[16px]">📍</Text>
                  <Text className="font-regular text-[14px] text-white/80 flex-1">{place.address}</Text>
                </View>
              )}
              {place.phone && (
                <View className="flex-row gap-3 items-center">
                  <Text className="text-[16px]">📞</Text>
                  <Text className="font-regular text-[14px] text-white/80">{place.phone}</Text>
                </View>
              )}
              {place.reported_hours && (
                <View className="flex-row gap-3 items-center">
                  <Text className="text-[16px]">🕐</Text>
                  <Text className="font-regular text-[14px] text-white/80">{place.reported_hours}</Text>
                </View>
              )}
              {place.distance != null && (
                <View className="flex-row gap-3 items-center">
                  <Text className="text-[16px]">📏</Text>
                  <Text className="font-regular text-[14px] text-white/80">
                    {formatDistance(place.distance)} away
                  </Text>
                </View>
              )}
            </View>

            {/* Verification info */}
            <View className="bg-white/10 rounded-xl p-4 gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-[15px] text-white">Community Verifications</Text>
                <View className="bg-purple/20 rounded-full px-3 py-1">
                  <Text className="font-semibold text-[13px] text-purple">
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
              {place.recent_verifications?.slice(0, 3).map(v => (
                <View key={v.id} className="flex-row items-center gap-2 py-1">
                  <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center">
                    <Text className="text-[10px] text-white font-semibold">
                      {v.user_name?.[0]?.toUpperCase()}
                    </Text>
                  </View>
                  <Text className="font-regular text-[13px] text-white/70 flex-1">
                    {v.user_name} marked{' '}
                    <Text className={v.status === 'open' ? 'text-status-open' : 'text-status-closed'}>
                      {v.status}
                    </Text>
                  </Text>
                  <Text className="font-regular text-[11px] text-white/40">{timeAgo(v.created_at)}</Text>
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
        <View className="absolute bottom-0 left-0 right-0 bg-dark/95 px-6 pt-4 pb-8 gap-3">
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
      </SafeAreaView>

      {/* Verify bottom sheet */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['35%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#2C2C2C' }}
        handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
      >
        <BottomSheetView className="px-6 pt-4 gap-4">
          <Text className="font-semibold text-[18px] text-white text-center">
            Is this place open right now?
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 h-[56px] bg-status-open/20 border border-status-open rounded-xl items-center justify-center ${verifying ? 'opacity-50' : ''}`}
              onPress={() => handleVerify('open')}
              disabled={verifying}
            >
              <Text className="font-semibold text-[16px] text-status-open">🟢 Yes, Open</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 h-[56px] bg-status-closed/20 border border-status-closed rounded-xl items-center justify-center ${verifying ? 'opacity-50' : ''}`}
              onPress={() => handleVerify('closed')}
              disabled={verifying}
            >
              <Text className="font-semibold text-[16px] text-status-closed">🔴 No, Closed</Text>
            </TouchableOpacity>
          </View>
          <Text className="font-regular text-[12px] text-white/40 text-center">
            Your verification helps the community. Only verify if you're physically present.
          </Text>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
