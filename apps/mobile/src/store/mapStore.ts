import { create } from 'zustand';

interface RouteCoord { latitude: number; longitude: number; }

interface MapStore {
  route: RouteCoord[] | null;
  routeDistance: number | null;
  routeDuration: number | null;
  setRoute: (coords: RouteCoord[], distance: number, duration: number) => void;
  clearRoute: () => void;
}

export const useMapStore = create<MapStore>((set) => ({
  route: null,
  routeDistance: null,
  routeDuration: null,
  setRoute: (route, routeDistance, routeDuration) =>
    set({ route, routeDistance, routeDuration }),
  clearRoute: () => set({ route: null, routeDistance: null, routeDuration: null }),
}));
