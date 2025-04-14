import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AirQualityMapComponent } from './components/air-quality-map/air-quality-map.component';

const routes: Routes = [
  { path: '', component: AirQualityMapComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AirQualityRoutingModule { } 