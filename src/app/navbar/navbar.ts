// frontend/src/components/navbar/navbar.ts
import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { CommonModule } from '@angular/common';

interface DecodedToken {
  userId: string;
  role: number;
  nombre: string;
  exp: number;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [CommonModule, RouterLink],
})
export class Navbar implements OnInit {
  isLoggedIn = false;
  showProfileMenu = false;
  userName = 'Usuario';
  userRole: number | null = null;
  userId: string | null = null;
  cartCount: number = 0;

  constructor(
    private readonly router: Router,

  ) { }

  ngOnInit() {
    this.checkAuthStatus();

    window.addEventListener('storage', (e) => {
      if (e.key === 'token') {
        this.checkAuthStatus();
      }
    });

    this.updateCartCount();

    window.addEventListener('storage', () => {
      this.updateCartCount();
    });
  }
  mobileMenuOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }


  private checkAuthStatus() {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
          this.isLoggedIn = true;
          this.userId = decoded.userId;
          this.userRole = decoded.role;
          this.userName = decoded.nombre || 'Usuario';

          console.log('✅ Usuario autenticado:', {
            userId: this.userId,
            nombre: this.userName,
            role: this.userRole
          });
        } else {
          console.warn('Token expirado');
          this.logout();
        }
      } catch (error) {
        console.error('Error al decodificar token:', error);
        this.logout();
      }
    } else {
      this.resetAuthState();
    }
  }

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart_products') || '[]');

    this.cartCount = cart.reduce(
      (total: number, item: any) => total + item.quantity,
      0
    );
  }

  private resetAuthState() {
    this.isLoggedIn = false;
    this.userName = 'Usuario';
    this.userRole = null;
    this.userId = null;
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
    console.log('Menú abierto:', this.showProfileMenu);
  }

  logout() {
    localStorage.removeItem('token');
    this.resetAuthState();
    this.showProfileMenu = false;
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  goToProfile(): void {
    if (this.userId) {
      this.router.navigate(['/userProfile', this.userId]);
      this.showProfileMenu = false;
    } else {
      console.warn('No hay userId disponible');
      this.router.navigate(['/login']);
    }
  }

  goToCart(): void {
    if (this.userId) {
      this.router.navigate(['/cart']);
    } else {
      console.warn('Debes iniciar sesion primero');
      this.router.navigate(['/login']);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-trigger')) {
      this.showProfileMenu = false;
    }
  }
}