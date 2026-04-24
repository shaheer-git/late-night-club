import { create } from 'zustand';
import { Place, PlaceFilters } from '../types';

interface PlacesStore {
  places: Place[];
  selectedPlace: Place | null;
  filters: PlaceFilters;
  loading: boolean;
  setPlaces: (places: Place[]) => void;
  setSelectedPlace: (place: Place | null) => void;
  setFilter: (key: keyof PlaceFilters, value: any) => void;
  clearFilters: () => void;
  setLoading: (v: boolean) => void;
}

export const usePlacesStore = create<PlacesStore>((set) => ({
  places: [],
  selectedPlace: null,
  filters: { radius: 3000 },
  loading: false,
  setPlaces: (places) => set({ places }),
  setSelectedPlace: (selectedPlace) => set({ selectedPlace }),
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  clearFilters: () => set({ filters: { radius: 3000 } }),
  setLoading: (loading) => set({ loading }),
}));
