import { Routes } from '@angular/router';
import { SliderComponent } from './slider.component';
import { HomeComponent } from './home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'slider', component: SliderComponent },
];
