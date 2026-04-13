import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IUser } from '../models/user.model';
import { ErrorService } from '../../services/error.service';
import { LoginService } from '../../services/login.service';
import { jwtDecode } from 'jwt-decode';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface TokenPayload {
  id: string;
  username: string;
  role: string;
  exp: number;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [FormsModule,CommonModule],
  standalone: true
})

export class LoginComponent implements OnInit {
  // Definición de variables
  id: string = '';
  passwordEncrypt: string = '';
  loading: boolean = false;
  userInfo: any = null;

  private toastr = inject(ToastrService);

  // Inyección de dependencias
  constructor(
    private readonly _userService: LoginService,
    private readonly router: Router,
    private readonly _errorService: ErrorService
  ) { }

  // Método de inicialización
  ngOnInit(): void {
    this.checkExistingToken();
  }

  // Verificar si ya existe un token válido en el localStorage
  private checkExistingToken(): void {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
          this.userInfo = decoded; // Almacenar info del usuario
          this.redirectBasedOnRole(decoded.role);
          return;
        } else {
          localStorage.removeItem('token');
          this.router.navigate(['/']);
        }
      } catch (error) {
        localStorage.removeItem('token');
        this.router.navigate(['/']);
      }
    }
  }
  // Redirigir al usuario según su rol (Para un futuro manejo de roles)

  private redirectBasedOnRole(role: string): void {
    this.router.navigate(['/home']);
  }


  // Método de login
  login() {
    if (this.id === '' || this.passwordEncrypt === '') {
      this.toastr.error('Todos los campos son obligatorios', 'Error');
      return;
    }

    const user: IUser = {
      id: this.id,
      passwordEncrypt: this.passwordEncrypt,
    };

    this.loading = true;

    // Llamada al servicio de login
    this._userService.login(user).subscribe({
      next: (response: any) => {
        this.loading = false;

        // Manejo del token recibido
        if (response && response.token) {
          try {
            const decoded = jwtDecode<TokenPayload>(response.token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp > currentTime) {
              localStorage.removeItem('token');
              localStorage.setItem('token', response.token);

              this.userInfo = decoded; //Almacenar info del usuario

              this.redirectBasedOnRole(decoded.role);
            } else {
              this.toastr.error('Token expirado recibido del servidor', 'Error');
            }
          } catch (error) {
            console.error('Error al decodificar token:', error);
            this.toastr.error('Token inválido recibido del servidor', 'Error');
          }
        } else {
          this.toastr.error('Token no recibido del servidor', 'Error');
        }
      },
      // Manejo de errores
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
        this.loading = false;
        console.log("Error en el login:", e);
      }
    });
  }
}