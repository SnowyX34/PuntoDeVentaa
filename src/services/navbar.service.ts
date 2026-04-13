// frontend/src/services/navbar.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class userService {
  private readonly myAppUrl: string;
  private readonly myApiUrl: string;

  constructor(private readonly http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'users';
  }

  // Método para obtener headers con token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // En navbar.service.ts
getUserName(userId: string): Observable<{nombre: string, tipoUsuario: number}> {
  const url = `${this.myAppUrl}${this.myApiUrl}/${userId}`;
  console.log('🔍 URL de la petición:', url);
  console.log('🔍 userId enviado:', userId);
  return this.http.get<{nombre: string, tipoUsuario: number}>(url, {
    headers: this.getHeaders()
  });
}
}