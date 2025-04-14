import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DataService } from '../../services/data.service';
import { StyleService } from '../../services/style.service';
import { City, AirQualityParameter } from '../../../core/models/air-quality.models';
import { latLng, tileLayer, Layer, Map, geoJSON, GeoJSON, LeafletMouseEvent, divIcon, marker, control } from 'leaflet';
import { Subject, takeUntil } from 'rxjs';
import { ParameterSelectorComponent } from '../parameter-selector/parameter-selector.component';
import { MapLegendComponent } from '../map-legend/map-legend.component';
import { LoadingOverlayComponent } from '../../../shared/components/loading-overlay/loading-overlay.component';
import * as turf from '@turf/turf';

@Component({
  selector: 'app-air-quality-map',
  standalone: true,
  imports: [
    CommonModule,
    LeafletModule,
    MatProgressSpinnerModule,
    ParameterSelectorComponent,
    MapLegendComponent,
    LoadingOverlayComponent
  ],
  templateUrl: './air-quality-map.component.html',
  styleUrls: ['./air-quality-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AirQualityMapComponent implements OnDestroy {
  private readonly dataService = inject(DataService);
  private readonly styleService = inject(StyleService);
  private readonly destroy$ = new Subject<void>();
  private map!: Map;
  private cityLayers: { [key: number]: GeoJSON } = {};
  private cityLabels: { [key: number]: Layer } = {};
  private geometries: { [key: number]: any } = {};
  private readonly LABEL_ZOOM_THRESHOLD = 6.5;
  
  readonly cities = signal<City[]>([]);
  readonly selectedParameter = signal<AirQualityParameter>('pm25');
  readonly isLoading = signal(true);
  
  readonly mapOptions = {
    zoom: 6,
    center: latLng(39.0, 35.0), // Center of Turkey
    minZoom: 5,
    maxZoom: 10,
    zoomControl: false,
    attributionControl: false,
    zoomDelta: 0.5,  // More granular zoom steps
    zoomSnap: 0.25,  // Allows for fractional zoom levels
    wheelPxPerZoomLevel: 100  // Requires more mouse wheel movement per zoom
  };

  layers: Layer[] = [];
  
  readonly parameterData = computed(() => 
    this.cities().map(city => ({
      ...city,
      value: city.airQuality[this.selectedParameter()]
    }))
  );

  constructor() {
    this.isLoading.set(true);
    
    effect(() => {
      this.dataService.cities$
        .pipe(takeUntil(this.destroy$))
        .subscribe(cities => {
          if (cities.length > 0) {
            this.cities.set(cities);
            this.updateMapData(cities);
            this.isLoading.set(false);
          }
        });
    });

    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.isLoading.set(true);
    this.dataService.fetchCityGeometries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: cityGeometries => {
          console.log('Received city geometries:', cityGeometries);
          // Store geometries first
          cityGeometries.forEach(city => {
            try {
              this.geometries[city.gid] = JSON.parse(city.geometryGeoJson);
              console.log(`Parsed geometry for city ${city.name}:`, this.geometries[city.gid]);
            } catch (error) {
              console.error(`Failed to parse geometry for city ${city.name}:`, error);
            }
          });
          
          // Then load the data which will use these geometries
          this.dataService.loadInitialData().subscribe({
            error: () => this.isLoading.set(false)
          });
        },
        error: () => this.isLoading.set(false)
      });
  }

  updateParameter(parameter: AirQualityParameter): void {
    this.selectedParameter.set(parameter);
    this.updateMapStyles();
  }

  refreshCityData(cityId: number): void {
    this.isLoading.set(true);
    this.dataService.updateCityData(cityId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => this.isLoading.set(false)
      });
  }

  onMapReady(map: Map): void {
    this.map = map;
    
    if (window.innerWidth > 480) {
      control.zoom({
        position: 'topleft'
      }).addTo(this.map);
      
      control.scale({
        maxWidth: 200,
        metric: true,
        imperial: false,
        position: 'bottomright'
      }).addTo(this.map);
    }
    
    this.map.on('zoomend', () => {
      this.updateLabelVisibility();
    });
  }

  private updateMapData(cities: City[]): void {
    console.log('Updating map data with cities:', cities);
    const newLayers: Layer[] = [];
    
    cities.forEach(city => {
      const geometry = this.geometries[city.gid];
      console.log(`Geometry for city ${city.name}:`, geometry);
      if (geometry) {
        const layer = this.cityLayers[city.gid];
        const label = this.cityLabels[city.gid];
        if (layer) {
          this.updateCityData(city);
          newLayers.push(layer);
          if (label) {
            newLayers.push(label);
          }
        } else {
          const { geoJsonLayer, labelLayer } = this.addCity(city, geometry);
          if (geoJsonLayer) {
            newLayers.push(geoJsonLayer);
          }
          if (labelLayer) {
            newLayers.push(labelLayer);
          }
        }
      }
    });

    // Update layers array with all current layers
    this.layers = [...newLayers];
    this.updateLabelVisibility();
  }

  private addCity(city: City, geometry: any): { geoJsonLayer: Layer | null, labelLayer: Layer | null } {
    try {
      if (geometry.type !== 'MultiPolygon') {
        console.error(`Invalid geometry type for city ${city.name}: ${geometry.type}`);
        return { geoJsonLayer: null, labelLayer: null };
      }

      const geoJsonLayer = geoJSON(geometry, {
        style: () => this.styleService.getPolygonStyle(
          city.airQuality[this.selectedParameter()],
          this.selectedParameter()
        ),
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: (e: LeafletMouseEvent) => this.onPolygonMouseOver(e, city),
            mouseout: (e: LeafletMouseEvent) => this.onPolygonMouseOut(e)
          });
        }
      });

      let labelPosition;
      try {
        const largestPolygon = this.findLargestPolygon(geometry.coordinates);
        if (largestPolygon) {
          const point = turf.pointOnFeature(turf.polygon([largestPolygon]));
          labelPosition = latLng(point.geometry.coordinates[1], point.geometry.coordinates[0]);
        } else {
          const centroid = turf.centroid(turf.multiPolygon(geometry.coordinates));
          labelPosition = latLng(centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]);
        }
      } catch (error) {
        const bounds = geoJsonLayer.getBounds();
        labelPosition = bounds.getCenter();
      }

      const cityLabel = marker(labelPosition, {
        icon: divIcon({
          className: 'city-label',
          html: `<span>${city.name}</span>`,
          iconSize: [120, 24],  // Increased size to accommodate longer names
          iconAnchor: [10, 10], // Center point of the icon (half of iconSize)
          popupAnchor: [0, -12] // Popup appears above the label
        }),
        zIndexOffset: 500 // Ensure labels are above polygons
      });

      this.cityLayers[city.gid] = geoJsonLayer;
      this.cityLabels[city.gid] = cityLabel;
      
      return { geoJsonLayer, labelLayer: cityLabel };
    } catch (error) {
      console.error(`Error adding city ${city.name}:`, error);
      return { geoJsonLayer: null, labelLayer: null };
    }
  }

  private findLargestPolygon(coordinates: number[][][][]): number[][] | null {
    let maxArea = 0;
    let largestPolygon = null;

    coordinates.forEach(polygonCoords => {
      polygonCoords.forEach(ring => {
        const area = Math.abs(turf.area(turf.polygon([ring])));
        if (area > maxArea) {
          maxArea = area;
          largestPolygon = ring;
        }
      });
    });

    return largestPolygon;
  }

  private updateCityData(city: City): void {
    const layer = this.cityLayers[city.gid];
    if (layer) {
      layer.setStyle(this.styleService.getPolygonStyle(
        city.airQuality[this.selectedParameter()],
        this.selectedParameter()
      ));
    }
  }

  private updateMapStyles(): void {
    Object.entries(this.cityLayers).forEach(([cityId, layer]) => {
      const city = this.dataService.getCityById(Number(cityId));
      if (city) {
        layer.setStyle(this.styleService.getPolygonStyle(
          city.airQuality[this.selectedParameter()],
          this.selectedParameter()
        ));
      }
    });
  }

  private onPolygonMouseOver(e: LeafletMouseEvent, city: City): void {
    const layer = e.target;
    layer.setStyle({
      weight: 2,
      fillOpacity: 0.8
    });
    
    if (layer.getTooltip()) {
      layer.closeTooltip();
      layer.unbindTooltip();
    }
    
    layer.bindTooltip(this.getTooltipContent(city), {
      direction: 'top',
      sticky: true,
      opacity: 0.9,
      offset: [0, -10],
      className: 'city-tooltip'
    }).openTooltip();
  }

  private onPolygonMouseOut(e: LeafletMouseEvent): void {
    const layer = e.target;
    layer.setStyle({
      weight: 1,
      fillOpacity: 0.7
    });
    if (layer.getTooltip()) {
      layer.closeTooltip();
      layer.unbindTooltip();
    }
  }

  private getTooltipContent(city: City): string {
    const value = city.airQuality[this.selectedParameter()];
    const quality = value !== null ? 
      this.styleService.getQualityLabel(value, this.selectedParameter()) :
      'Veri yok';
    
    const timestamp = city.airQuality.timestamp;
    const date = new Date(timestamp);
    const formattedDate = new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);

    let parameterDisplay = this.selectedParameter().toUpperCase();
    let unit = '';
    
    switch (this.selectedParameter()) {
      case 'temperature':
        parameterDisplay = 'Sıcaklık';
        unit = '°C';
        break;
      case 'humidity':
        parameterDisplay = 'Nem';
        unit = '%';
        break;
    }
    
    const valueDisplay = value !== null ? `${value}${unit}` : 'N/A';
    
    return `
      <div class="tooltip">
        <h4>${city.name}</h4>
        <p>${parameterDisplay}: ${valueDisplay}</p>
        <p>Kalite: ${quality}</p>
        <p class="timestamp">Son Güncelleme: ${formattedDate}</p>
      </div>
    `;
  }

  private updateLabelVisibility(): void {
    if (!this.map) return;

    const currentZoom = this.map.getZoom();
    const shouldShowLabels = currentZoom >= this.LABEL_ZOOM_THRESHOLD;

    Object.values(this.cityLabels).forEach(label => {
      const element = (label as any)._icon;
      if (element) {
        element.style.opacity = shouldShowLabels ? '1' : '0';
      }
    });
  }
}