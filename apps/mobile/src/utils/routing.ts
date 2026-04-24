import { OSRM_BASE } from '../constants/config';

export interface OSRMRoute {
  distance: number;
  duration: number;
  coordinates: { latitude: number; longitude: number }[];
}

export async function getRoute(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number
): Promise<OSRMRoute | null> {
  try {
    const url = `${OSRM_BASE}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok') return null;
    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map(
      ([lng, lat]: number[]) => ({ latitude: lat, longitude: lng })
    );
    return { distance: route.distance, duration: route.duration, coordinates };
  } catch {
    return null;
  }
}
