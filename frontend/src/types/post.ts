export type Post = {
  id: number;
  user_id: number;
  message: string;
  latitude: number;
  longitude: number;
  signal_count: number;
  noise_count: number;
};

export type Reaction = 'signal' | 'noise';

/** [longitude, latitude] - the GeoJSON order MapLibre expects. */
export type LngLat = [number, number];
