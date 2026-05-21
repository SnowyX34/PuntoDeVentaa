import { Routes } from '@angular/router';

import { Home } from './home/home';
import { LoginComponent } from './login/login';
import { Productos } from './productos/productos';
import { PricePerTier } from './price-per-tier/price-per-tier';
import { Venta } from './venta/venta';
import { Cart } from './cart/cart';
import { HistorialVentas } from './historial-ventas/historial-ventas';
import { Reportes } from './reportes/reportes';

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
        path: 'home',
        component: Home
    },
    {
        path: 'productos',
        component: Productos
    },
    { 
        path: 'orders', 
        component: Venta 
    }, 
    { 
        path: 'cart', 
        component: Cart 
    }, 
    { path: 'userProfile/:id', component: Productos }, // Temporal
    {
        path:'priceList',
        component:PricePerTier
    },
    {
        path:'salesHistory',
        component:HistorialVentas
    },
    {
        path:'reportes',
        component:Reportes
    },{
        path: '**',
        redirectTo: 'login'
    }
];
