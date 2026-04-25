import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Image, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocationStore } from '../../src/store/locationStore';

const POPULAR = [
  { id: '1', name: 'Delhi',     lat: 28.6139, lng: 77.2090, icon: require('../../assets/images/city-delhi.png') },
  { id: '2', name: 'Mumbai',    lat: 19.0760, lng: 72.8777, icon: require('../../assets/images/city-mumbai.png') },
  { id: '3', name: 'Bangalore', lat: 12.9716, lng: 77.5946, icon: require('../../assets/images/city-bangalore.png'), active: true },
  { id: '4', name: 'Chennai',   lat: 13.0827, lng: 80.2707, icon: require('../../assets/images/city-chennai.png') },
  { id: '5', name: 'Kolkata',   lat: 22.5726, lng: 88.3639, icon: require('../../assets/images/city-kolkata.png') },
  { id: '6', name: 'Hyderabad', lat: 17.3850, lng: 78.4867, icon: require('../../assets/images/city-hyderabad.png') },
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
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* Header — Inter SemiBold 18, padding 12 20 12 24 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select City</Text>
        </View>

        {/* Search bar — 342×58, white, borderRadius 14 */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#2C2C2C" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search city,"
              placeholderTextColor="rgba(44,44,44,0.5)"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

          {/* Popular Destinations */}
          {!search && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular Destinations</Text>
              </View>

              {/* Grid: wrap, gap 12, centered — 342px wide */}
              <View style={styles.popularGrid}>
                {POPULAR.map(city => (
                  <Pressable
                    key={city.id}
                    style={({ pressed }) => [
                      styles.cityTile,
                      pressed && styles.cityTilePressed,
                    ]}
                    onPress={() => selectCity(city.name, city.lat, city.lng)}
                  >
                    {/* Icon box: 102×102, borderRadius 28 */}
                    <View style={[
                      styles.cityIconBox,
                      city.active && styles.cityIconBoxActive,
                    ]}>
                      {/* Image fills the full box — Figma shows icon fills 102×102 */}
                      <Image
                        source={city.icon}
                        style={styles.cityIconImg}
                        resizeMode="cover"
                      />
                    </View>
                    {/* Label: Inter Medium 13, centered, 97px wide */}
                    <Text style={styles.cityName}>{city.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* All Cities */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Cities</Text>
          </View>
          <View style={styles.allCitiesContainer}>
            {filtered.map((city, idx) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityRow,
                  idx < filtered.length - 1 && styles.cityRowBorder,
                ]}
                onPress={() => selectCity(city)}
                activeOpacity={0.6}
              >
                <Text style={styles.cityRowText}>{city}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C2C2C' },
  safe: { flex: 1 },

  header: {
    paddingLeft: 24,
    paddingRight: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },

  searchWrapper: {
    height: 84,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    width: 342,
    height: 58,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#2C2C2C',
    padding: 0,
  },

  scroll: { flex: 1 },

  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },

  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },

  // Tile: 104×126 (Figma layout_EMC72O)
  cityTile: {
    width: 104,
    height: 126,
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  cityTilePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },

  // Icon box: 102×102, borderRadius 28, dark translucent bg
  cityIconBox: {
    width: 102,
    height: 102,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  cityIconBoxActive: {
    backgroundColor: '#FFFFFF',
  },
  // Image fills the full 102×102 box
  cityIconImg: {
    width: 102,
    height: 102,
  },

  // City name: Inter Medium 13, centered, 97px wide
  cityName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    width: 97,
  },

  allCitiesContainer: {
    paddingHorizontal: 20,
  },
  cityRow: {
    paddingVertical: 16,
  },
  cityRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  cityRowText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
});
