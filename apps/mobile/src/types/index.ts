export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  contribution_count: number;
  verification_count: number;
  created_at: string;
}

export interface VerifierInfo {
  id: string;
  name: string;
  avatar_url?: string;
}

export type PlaceStatus = 'open' | 'closed' | 'unknown';
export type PlaceCategory =
  | 'cafe'
  | 'restaurant'
  | 'bar'
  | 'pharmacy'
  | 'convenience_store'
  | 'other';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  status: PlaceStatus;
  address?: string;
  phone?: string;
  reported_hours?: string;
  image_urls: string[];
  distance?: number;
  last_verified_at?: string;
  last_verified_by?: VerifierInfo;
  verification_count?: number;
  lat: number;
  lng: number;
  recent_verifications?: Verification[];
  added_by?: VerifierInfo;
  created_at?: string;
  updated_at?: string;
}

export interface Verification {
  id: string;
  place_id: string;
  user_id: string;
  user_name: string;
  status: PlaceStatus;
  note?: string;
  created_at: string;
}

export interface City {
  id: string;
  name: string;
  state?: string;
  country: string;
  lat: number;
  lng: number;
}

export interface PlaceFilters {
  status?: PlaceStatus;
  category?: PlaceCategory;
  radius?: number;
}

export interface NearbyPlacesParams {
  lat: number;
  lng: number;
  radius?: number;
  status?: string;
  category?: string;
  limit?: number;
  offset?: number;
}
