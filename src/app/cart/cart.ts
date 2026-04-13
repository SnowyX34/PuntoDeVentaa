import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartItem, CustomerInfo } from '../models/cart';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../models/payload';
import { CartService } from '../../services/cart.service';
import { Navbar } from "../navbar/navbar";

@Component({
  selector: 'app-cart',
  imports: [FormsModule, CommonModule, Navbar],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  standalone: true
})
export class Cart {

  cartItems: CartItem[] = [];
  customerInfo: CustomerInfo = {
    name: '',
    phone: '',
    email: '',
    tier: 'regular'
  };
  Math = Math;

  subtotal: number = 0;
  discount: number = 0;
  total: number = 0;
  isProcessing: boolean = false;
  showPaymentModal: boolean = false;
  selectedPaymentMethod: 'cash' | 'card' | 'transfer' = 'cash';
  paymentAmount: number = 0;
  change: number = 0;

  userId: string | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private readonly _cartService: CartService
  ) { }

  ngOnInit() {
    this.getUserId();
    this.loadCart();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }



  getUserId() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
          this.userId = decoded.userId;

        } else {
          console.warn('Token expirado');
        }
      } catch (error) {
        console.error('Error al decodificar token:', error);
      }
    }
  }

  loadCart() {
    this.cartItems = this._cartService.getCart();
    this.calculateTotals();
  }

  saveCart() {
    localStorage.setItem('shopping_cart', JSON.stringify(this.cartItems));
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    this.calculateDiscount();
    this.total = this.subtotal - this.discount;
  }

  calculateDiscount() {
    // Aplicar descuentos según nivel de cliente
    const tierDiscounts: { [key: string]: number } = {
      regular: 0,
      bronze: 5,
      silver: 10,
      gold: 15,
      platinum: 20,
      vip: 25
    };

    const discountPercent = tierDiscounts[this.customerInfo.tier] || 0;
    this.discount = (this.subtotal * discountPercent) / 100;
  }

  updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity < 1) {
      this.removeItem(item);
    } else if (newQuantity <= item.stock) {
      item.quantity = newQuantity;
      item.totalPrice = item.unitPrice * newQuantity;
      this.calculateTotals();
      this.saveCart();
    } else {
      this.toastr.warning(`Stock máximo: ${item.stock} unidades`);
    }
  }

  removeItem(item: CartItem) {
    this._cartService.removeItem(item.productId, item.tierApplied);
    this, this.loadCart();
    this.toastr.success('Prouctoelimindo cocrrectamente');
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
    this.calculateTotals();
    this.toastr.info('Carrito vaciado');
  }

  openPaymentModal() {
    if (this.cartItems.length === 0) {
      this.toastr.warning('Agrega productos al carrito');
      return;
    }

    if (!this.customerInfo.name) {
      this.toastr.warning('Ingresa el nombre del cliente');
      return;
    }

    this.showPaymentModal = true;
    this.paymentAmount = this.total;
  }

  calculateChange() {
    if (this.selectedPaymentMethod === 'cash') {
      this.change = this.paymentAmount - this.total;
    }
  }

  processSale() {
    if (this.selectedPaymentMethod === 'cash' && this.paymentAmount < this.total) {
      this.toastr.error('El monto pagado es insuficiente');
      return;
    }

    this.isProcessing = true;

    const saleData = {
      userId: this.userId,
      userName: this.customerInfo.name,
      userPhone: this.customerInfo.phone,

      items: this.cartItems.map(item => ({
        productId: item.productId,
        productModel: item.productModel,
        productColor: item.productColor,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        size: item.size,
        tierApplied: item.tierApplied, // 👈 FIX
        discount: (item.unitPrice * item.quantity * (this.getDiscountPercent() / 100)),
        createdAt: new Date().toISOString()
      })),
      total: this.total,

      paymentMethod: this.selectedPaymentMethod,

      status: 'completed',
      paymentStatus: 'paid',
    };

    console.log('Venta procesada:', saleData);
    console.log("BODY REAL:", JSON.stringify(saleData, null, 2));

    this._cartService.createSale(saleData).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.showPaymentModal = false;

        console.log('Backend response', res);

        this.toastr.success('Venta confirmada');
        this.generateTicket(saleData);
        this.clearCart();
        this.router.navigate(['/sales/recipit'], {
          state: { sale: saleData }
        });
        console.log('Success',res)
      },
      error: (err) => {
        this.isProcessing = false;
        console.log('Error en back');
        this.toastr.error(
          err.error?.message || 'Error al guardar la venta',
          'Error'
        );
      }
    });
  }

  getDiscountPercent(): number {
    const discounts: { [key: string]: number } = {
      regular: 0,
      bronze: 5,
      silver: 10,
      gold: 15,
      platinum: 20,
      vip: 25
    };
    return discounts[this.customerInfo.tier] || 0;
  }

  generateTicket(saleData: any) {
    // Guardar el ticket en localStorage para imprimir después
    localStorage.setItem('last_ticket', JSON.stringify({
      ...saleData,
      ticketNumber: this.generateTicketNumber(),
      ticketDate: new Date()
    }));
  }

  generateTicketNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000);
    return `TKT-${year}${month}${day}-${random}`;
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }
}
