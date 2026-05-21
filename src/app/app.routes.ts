import { Routes } from '@angular/router';

import { Home } from './home/home';
import { LoginComponent } from './login/login';
import { Productos } from './productos/productos';
import { PricePerTier } from './price-per-tier/price-per-tier';
import { Venta } from './venta/venta';
import { Cart } from './cart/cart';
import { HistorialVentas } from './historial-ventas/historial-ventas';
import { Reportes } from './reportes/reportes';
import { authGuard } from '../guards/auth.guard';

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
        component: Home,
        canActivate: [authGuard]
    },
    {
        path: 'productos',
        component: Productos,
        canActivate: [authGuard]
    },
    { 
        path: 'orders', 
        component: Venta,
        canActivate: [authGuard]
    }, 
    { 
        path: 'cart', 
        component: Cart,
        canActivate: [authGuard]
    }, 
    { 
        path: 'userProfile/:id', 
        component: Productos,
        canActivate: [authGuard]
    },
    {
        path: 'priceList',
        component: PricePerTier,
        canActivate: [authGuard]
    },
    {
        path: 'salesHistory',
        component: HistorialVentas,
        canActivate: [authGuard]
    },
    {
        path: 'reportes',
        component: Reportes,
        canActivate: [authGuard]
    },
    // Wildcard al final
    {
        path: '**',
        redirectTo: 'login'
    }
];