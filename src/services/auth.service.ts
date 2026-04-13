import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  id: number;
  role: string;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {}

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return false;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;
      
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number | null {
    const token = this.getToken();
    
    if (!token) {
      return null;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.id;
    } catch (error) {
      return null;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    
    if (!token) {
      return null;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.role;
    } catch (error) {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    
    if (!token) {
      return true;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;
      
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}