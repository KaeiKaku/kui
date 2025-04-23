import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotfoundComponent } from './notfound/notfound.component';

export const routes: Routes = [
  {
    path: 'notfound',
    component: NotfoundComponent,
  },
  {
    path: '**',
    component: HomeComponent,
  },
];
