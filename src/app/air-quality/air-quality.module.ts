import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AirQualityRoutingModule } from './air-quality-routing.module';
import { AirQualityMapComponent } from './components/air-quality-map/air-quality-map.component';
import { ParameterSelectorComponent } from './components/parameter-selector/parameter-selector.component';
import { MapLegendComponent } from './components/map-legend/map-legend.component';

@NgModule({
  imports: [
    CommonModule,
    LeafletModule,
    MatProgressSpinnerModule,
    AirQualityRoutingModule
  ],
  providers: []
})
export class AirQualityModule { } 