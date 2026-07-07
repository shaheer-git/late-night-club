import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '../store/locationStore';

export function useLocation() {
  const { lat, lng, setLocation, setPermission } = useLocationStore();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status === 'granted');
      if (status !== 'granted') return;
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation(loc.coords.latitude, loc.coords.longitude);
      } catch (err) {
        console.warn("Failed to get current position:", err);
      }
    })();
  }, []);

  return { lat, lng };
}
