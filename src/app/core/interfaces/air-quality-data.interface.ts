import { Observable } from 'rxjs';
import { City, CityGeometry, AirQualityData } from '../models/air-quality.models';

export interface IAirQualityDataService {
  cities$: Observable<City[]>;
  loadInitialData(): Observable<CityGeometry[]>;
  fetchCityGeometries(): Observable<CityGeometry[]>;
  fetchAirQualityData(cityId: number): Observable<AirQualityData>;
  updateCityData(cityId: number): Observable<void>;
  getCityById(id: number): City | undefined;
} 