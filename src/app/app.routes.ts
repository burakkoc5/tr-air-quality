import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./air-quality/air-quality.module').then(m => m.AirQualityModule)
  }
];
