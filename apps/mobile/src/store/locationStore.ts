import { create } from 'zustand';

interface LocationStore {
  lat: number | null;
  lng: number | null;
  city: string | null;
  permissionGranted: boolean;
  setLocation: (lat: number, lng: number) => void;
  setCity: (city: string) => void;
  setPermission: (granted: boolean) => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  lat: null,
  lng: null,
  city: null,
  permissionGranted: false,
  setLocation: (lat, lng) => set({ lat, lng }),
  setCity: (city) => set({ city }),
  setPermission: (permissionGranted) => set({ permissionGranted }),
}));
