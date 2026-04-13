import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser } from '../../backend/src/infrestructure/models/users';
import { environment } from '../environments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly myAppUrl: string;
  private readonly myApiUrl: string;
  constructor(private readonly http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'auth/login';
  }

  login(user: IUser): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.myAppUrl}${this.myApiUrl}`, user);
}

}