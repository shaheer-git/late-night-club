export const API_URL = 'http://172.20.10.4:8000';
export const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME ?? 'Late Night Club';

export const MAP_CONFIG = {
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  defaultDelta: 0.05,
  defaultRadius: 3000,
};

export const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';
export const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
export const NOMINATIM_UA = 'LateNightClub/1.0 (opensource)';

export const STATUS_EXPIRY_HOURS = 4;
export const VERIFICATION_CONFLICT_WINDOW_HOURS = 1;
