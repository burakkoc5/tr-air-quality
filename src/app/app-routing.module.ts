import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'air-quality',
    pathMatch: 'full'
  },
  {
    path: 'air-quality',
    loadChildren: () => import('./air-quality/air-quality.module').then(m => m.AirQualityModule)
  }
]; 