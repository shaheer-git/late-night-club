import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Image, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocationStore } from '../../src/store/locationStore';

const POPULAR = [
  { id: '1', name: 'Delhi',     lat: 28.6139, lng: 77.2090 },
  { id: '2', name: 'Mumbai',    lat: 19.0760, lng: 72.8777 },
  { id: '3', name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { id: '4', name: 'Chennai',   lat: 13.0827, lng: 80.2707 },
  { id: '5', name: 'Kolkata',   lat: 22.5726, lng: 88.3639 },
  { id: '6', name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
];

const ALL_CITIES = [
  'Agra','Ahmedabad','Alwar','Amla','Amritsar','Aurangabad',
  'Bangalore','Bhopal','Chennai','Coimbatore','Delhi',
  'Goa','Gurgaon','Hyderabad','Indore','Jaipur',
  'Kochi','Kolkata','Lucknow','Mumbai','Mysore',
  'Nagpur','Noida','Pune','Surat','Vadodara','Visakhapatnam',
];

export default function CitySelectScreen() {
  const router = useRouter();
  const { setCity, setLocation } = useLocationStore();
  const [search, setSearch] = useState('');

  const filtered = ALL_CITIES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const selectCity = (name: string, lat?: number, lng?: number) => {
    setCity(name);
    if (lat && lng) setLocation(lat, lng);
    router.replace('/onboarding/location-permission');
  };

  return (
    <View className="flex-1 bg-dark">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top']}>

        {/* Header */}
        <View className="px-6 py-3">
          <Text className="font-semibold text-[18px] text-white">Select City</Text>
        </View>

        {/* Search bar */}
        <View className="px-5 py-[10px] h-[84px] justify-center">
          <View className="flex-row items-center bg-white rounded-md px-3 h-[58px] gap-3">
            <Text className="text-[14px]">🔍</Text>
            <TextInput
              className="flex-1 font-regular text-[15px] text-dark"
              placeholder="Search city..."
              placeholderTextColor="#2C2C2C"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-2">

          {/* Popular */}
          {!search && (
            <View className="mb-4">
              <Text className="font-semibold text-[16px] text-white px-4 pt-6 pb-4">
                Popular Destinations
              </Text>
              <View className="flex-row flex-wrap justify-center gap-3 px-4">
                {POPULAR.map(city => (
                  <TouchableOpacity
                    key={city.id}
                    className="w-[104px] h-[126px] items-center gap-2 justify-center"
                    onPress={() => selectCity(city.name, city.lat, city.lng)}
                  >
                    <View className="w-[102px] h-[102px] rounded-xl overflow-hidden bg-white/10">
                      <Image
                        source={require('../../assets/images/city-icon.png')}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    <Text className="font-medium text-[13px] text-white text-center w-[97px]">
                      {city.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* All cities */}
          <View className="mb-4">
            <Text className="font-semibold text-[16px] text-white px-4 pt-6 pb-4">
              All Cities
            </Text>
            {filtered.map((city, idx) => (
              <TouchableOpacity
                key={city}
                className={`flex-row justify-between items-center px-4 py-4 ${
                  idx < filtered.length - 1 ? 'border-b border-white/10' : ''
                }`}
                onPress={() => selectCity(city)}
              >
                <Text className="font-medium text-[15px] text-white capitalize">
                  {city}
                </Text>
                <Text className="text-white/50 text-lg">›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
