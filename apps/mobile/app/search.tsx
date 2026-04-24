import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { placesApi } from '../src/api/places';
import { useLocationStore } from '../src/store/locationStore';
import { Place } from '../src/types';
import PlaceCard from '../src/components/place/PlaceCard';

const RECENT_KEY = 'lnc_recent_searches';

export default function SearchScreen() {
  const router = useRouter();
  const { lat, lng } = useLocationStore();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    inputRef.current?.focus();
    loadRecent();
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const loadRecent = async () => {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    if (raw) setRecent(JSON.parse(raw));
  };

  const saveRecent = async (q: string) => {
    const updated = [q, ...recent.filter(r => r !== q)].slice(0, 8);
    setRecent(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const doSearch = async (q: string) => {
    if (!lat || !lng) return;
    setLoading(true);
    try {
      const { data } = await placesApi.search(q, lat, lng);
      setResults(data.items);
      saveRecent(q);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-dark">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top']}>

        {/* Search bar */}
        <View className="flex-row items-center gap-3 px-4 py-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-white text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center bg-white/10 rounded-lg px-4 h-11 gap-3">
            <Text className="text-[14px]">🔍</Text>
            <TextInput
              ref={inputRef}
              className="flex-1 font-regular text-[15px] text-white"
              placeholder="Search places..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={() => query && doSearch(query)}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text className="text-white/50 text-lg">✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Loading */}
        {loading && (
          <View className="py-8 items-center">
            <ActivityIndicator color="#C6FF34" />
          </View>
        )}

        {/* Results */}
        {results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={p => p.id}
            renderItem={({ item }) => (
              <View className="px-4 mb-3">
                <PlaceCard place={item} onPress={() => router.push(`/place/${item.id}`)} />
              </View>
            )}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
          />
        )}

        {/* Recent searches */}
        {!query && recent.length > 0 && (
          <View className="px-4 pt-2">
            <Text className="font-semibold text-[14px] text-white/50 mb-3">Recent</Text>
            {recent.map(r => (
              <TouchableOpacity
                key={r}
                className="flex-row items-center gap-3 py-3 border-b border-white/10"
                onPress={() => setQuery(r)}
              >
                <Text className="text-white/40 text-[16px]">🕐</Text>
                <Text className="font-regular text-[15px] text-white flex-1">{r}</Text>
                <Text className="text-white/30 text-lg">↗</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty */}
        {!loading && query && results.length === 0 && (
          <View className="items-center py-16">
            <Text className="font-medium text-[16px] text-white/40 text-center">
              No results for "{query}"
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
