export type AirQualityParameter = 'pm25' | 'pm10' | 'co' | 'no2' | 'o3' | 'temperature' | 'humidity';

export interface CityGeometry {
  gid: number;
  name: string;
  geometryGeoJson: string;
}

export interface AirQualityData {
  [key: string]: number | null | string;
  pm25: number | null;
  pm10: number | null;
  co: number | null;
  so2: number | null;
  no2: number | null;
  o3: number | null;
  temperature: number;
  humidity: number;
  timestamp: string;
}

export interface City {
  gid: number;
  name: string;
  airQuality: AirQualityData;
} 