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
  filters: { radius: 10000 },
  loading: false,
  setPlaces: (places) => {
    const unique = places.filter((p, i, self) => self.findIndex(x => x.id === p.id) === i);
    set({ places: unique });
  },
  setSelectedPlace: (selectedPlace) => set({ selectedPlace }),
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  clearFilters: () => set({ filters: { radius: 10000 } }),
  setLoading: (loading) => set({ loading }),
}));
