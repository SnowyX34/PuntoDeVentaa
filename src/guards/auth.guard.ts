import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  id: string;
  username: string;
  role: string;
  exp: number;
}

export const authGuard: CanActivateFn = () => {
    const router = inject(Router);
    const token = localStorage.getItem('token');

    if (!token) {
        router.navigate(['/login']);
        return false;
    }

    try {
        const decoded = jwtDecode<TokenPayload>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
            return true; // ✅ Token válido, deja pasar
        } else {
            // ❌ Token expirado
            localStorage.removeItem('token');
            router.navigate(['/login']);
            return false;
        }
    } catch (error) {
        // ❌ Token malformado
        localStorage.removeItem('token');
        router.navigate(['/login']);
        return false;
    }
};