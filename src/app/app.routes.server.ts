import { Home } from './home/home';
import { LoginComponent } from './login/login';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'Home',
    component: Home
  },
];
