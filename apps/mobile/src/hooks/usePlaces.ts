import { useCallback } from 'react';
import { placesApi } from '../api/places';
import { usePlacesStore } from '../store/placesStore';
import { useLocationStore } from '../store/locationStore';

export function usePlaces() {
  const { places, filters, loading, setPlaces, setLoading } = usePlacesStore();
  const { lat, lng } = useLocationStore();

  const fetchNearby = useCallback(async () => {
    if (!lat || !lng) return;
    setLoading(true);
    try {
      const { data } = await placesApi.getNearby({
        lat, lng,
        radius: filters.radius ?? 3000,
        status: filters.status,
        category: filters.category,
      });
      setPlaces(data.items);
    } catch (e) {
      console.warn('fetchNearby error', e);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, filters]);

  return { places, loading, fetchNearby };
}
