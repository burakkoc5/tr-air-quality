import { Injectable, OnDestroy, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin, of, Subject } from 'rxjs';
import { map, tap, catchError, takeUntil, switchMap, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IAirQualityDataService } from '../../core/interfaces/air-quality-data.interface';
import { City, CityGeometry, AirQualityData } from '../../core/models/air-quality.models';
import { ErrorHandlingService } from '../../core/services/error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class DataService implements IAirQualityDataService, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly errorHandler = inject(ErrorHandlingService);
  private readonly API_BASE_URL = environment.apiBaseUrl;
  private readonly citiesSubject = new BehaviorSubject<City[]>([]);
  private readonly destroy$ = new Subject<void>();
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    withCredentials: false
  };
  
  private readonly httpTextOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'text/plain'
    }),
    withCredentials: false,
    responseType: 'text' as 'text'
  };
  
  readonly cities$ = this.citiesSubject.asObservable();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInitialData(): Observable<CityGeometry[]> {
    return this.fetchCityGeometries().pipe(
      tap(cities => {
        const updateRequests = cities.map(city =>
          this.http.post(`${this.API_BASE_URL}/airquality/${city.gid}`, {}, this.httpTextOptions).pipe(
            delay(2000),
            switchMap(() => this.fetchAirQualityData(city.gid)),
            map(aqData => ({
              gid: city.gid,
              name: city.name,
              airQuality: aqData
            })),
            catchError(error => {
              this.errorHandler.handleHttpError(`update city ${city.gid}`)(error);
              return of({
                gid: city.gid,
                name: city.name,
                airQuality: this.getDefaultAirQualityData()
              });
            })
          )
        );

        forkJoin(updateRequests)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: citiesWithData => this.citiesSubject.next(citiesWithData),
            error: error => {
              this.errorHandler.handleError(error);
              this.citiesSubject.next(
                cities.map(city => ({
                  gid: city.gid,
                  name: city.name,
                  airQuality: this.getDefaultAirQualityData()
                }))
              );
            }
          });
      }),
      catchError(error => {
        this.errorHandler.handleHttpError('load initial data')(error);
        return of([]);
      })
    );
  }

  fetchCityGeometries(): Observable<CityGeometry[]> {
    return this.http.get<CityGeometry[]>(`${this.API_BASE_URL}/cities/geojson`, this.httpOptions).pipe(
      catchError(this.errorHandler.handleHttpError('fetch city geometries', []))
    );
  }

  fetchAirQualityData(cityId: number): Observable<AirQualityData> {
    return this.http.get<AirQualityData[]>(`${this.API_BASE_URL}/airquality/${cityId}`, this.httpOptions).pipe(
      map(data => data[0]),
      catchError(this.errorHandler.handleHttpError(`fetch air quality data for city ${cityId}`, this.getDefaultAirQualityData()))
    );
  }

  updateCityData(cityId: number): Observable<void> {
    return this.http.post(`${this.API_BASE_URL}/airquality/${cityId}`, {}, this.httpTextOptions).pipe(
      delay(2000),
      switchMap(() => this.fetchAirQualityData(cityId)),
      tap(newData => {
        const currentCities = this.citiesSubject.value;
        const updatedCities = currentCities.map(city => 
          city.gid === cityId ? { ...city, airQuality: newData } : city
        );
        this.citiesSubject.next(updatedCities);
      }),
      map(() => void 0),
      catchError(this.errorHandler.handleHttpError(`update data for city ${cityId}`, undefined))
    );
  }

  getCityById(id: number): City | undefined {
    return this.citiesSubject.value.find(city => city.gid === id);
  }

  private getDefaultAirQualityData(): AirQualityData {
    return {
      pm25: null,
      pm10: null,
      co: null,
      so2: null,
      no2: null,
      o3: null,
      temperature: 0,
      humidity: 0,
      timestamp: new Date().toISOString()
    };
  }
} 