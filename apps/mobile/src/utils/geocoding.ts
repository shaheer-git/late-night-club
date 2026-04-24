import { NOMINATIM_BASE, NOMINATIM_UA } from '../constants/config';

const headers = { 'User-Agent': NOMINATIM_UA };

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers }
    );
    const data = await res.json();
    return data.display_name ?? '';
  } catch {
    return '';
  }
}

export async function searchLocations(query: string): Promise<any[]> {
  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
      { headers }
    );
    return res.json();
  } catch {
    return [];
  }
}
