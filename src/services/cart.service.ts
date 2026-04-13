import { Injectable } from '@angular/core';
import { CartItem } from '../app/models/cart';
import { HttpClient, HttpHeaders,HttpParams, HttpErrorResponse  } from '@angular/common/http';
import { environment } from '../environments/environment.prod';
import { Sale } from '../app/models/sales';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CartService {

    private readonly myAppUrl: string;
    private readonly myApiUrl: string;

    constructor(private readonly http: HttpClient) {
        this.myAppUrl = environment.endpoint;
        this.myApiUrl = 'sales';
    }

    private storageKey = 'cart_products';

    getCart(): CartItem[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    getSales() {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/`, { headers });
    }

    updateSaleStatus(saleId: string, status: string) {
        const token = localStorage.getItem('token');    
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.patch<any>(`${this.myAppUrl}${this.myApiUrl}/${saleId}/status`, { status }, { headers });
    }

    saveCart(cart: CartItem[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(cart));
    }

    addToCart(product: any, tierId: string = 'regular', quantity: number = 1): void {
        const cart = this.getCart();

        let price = product.price;

        if (tierId !== 'regular' && product.tierPrices?.[tierId]?.enabled) {
            price = product.tierPrices[tierId].price;
        }

        // verificar si ya existe mismo producto + tier
        const existing = cart.find(
            item => item.productId === product.id && item.tierApplied === tierId
        );

        if (existing) {
            existing.quantity += quantity;
            existing.totalPrice = existing.quantity * existing.unitPrice;
        } else {
            const newItem: CartItem = {
                productId: product.id,
                productModel: product.modelo,
                productColor: product.color,
                productImage: product.imageUrl,
                quantity: quantity,
                unitPrice: price,
                totalPrice: price * quantity,
                size: product.size,
                stock: product.stock,
                tierApplied: tierId,
                discount: this.calculateDiscount(product.price, price)
            };

            cart.push(newItem);
        }

        this.saveCart(cart);
    }

    calculateDiscount(basePrice: number, tierPrice: number): number {
        if (!basePrice || basePrice <= tierPrice) return 0;
        return Math.round(((basePrice - tierPrice) / basePrice) * 100);
    }

    updateQuantity(productId: string, tierId: string, quantity: number): void {
        const cart = this.getCart();

        const item = cart.find(
            i => i.productId === productId && i.tierApplied === tierId
        );

        if (item) {
            item.quantity = quantity;
            item.totalPrice = item.unitPrice * quantity;
        }

        this.saveCart(cart);
    }

    removeItem(productId: string, tierId: string): void {
        const cart = this.getCart().filter(
            item => !(item.productId === productId && item.tierApplied === tierId)
        );

        this.saveCart(cart);
    }

    clearCart(): void {
        localStorage.removeItem(this.storageKey);
    }

    createSale(saleData: any) {
        const token = localStorage.getItem('token');

        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.post<any>(
            `${this.myAppUrl}${this.myApiUrl}/`,
            saleData,
            { headers }
        );
    }

    getSalesById(id: string) {
        const token = localStorage.getItem('token');    
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<any>(`${this.myAppUrl}${this.myApiUrl}/${id}`, { headers });
    }

    getSummary() {
        const token = localStorage.getItem('token');    
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<any>(`${this.myAppUrl}${this.myApiUrl}/summary/report`, { headers });
    }

    changeStatus(id: string, status: string) {
        const token = localStorage.getItem('token');    
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.patch<any>(`${this.myAppUrl}${this.myApiUrl}/${id}/status`, { status }, { headers });
    }

    searchSale(terms: string): Observable<Sale[]> {
        if (!terms || terms.trim() === '') {
            return this.getSales() ; // Retornar todos los productos si no hay término
        }
        
        const url = `${this.myAppUrl}${this.myApiUrl}/searchSale?terms=${encodeURIComponent(terms.trim())}`;
        
        return this.http.get<Sale[]>(url).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 404) {
                    return throwError(() => new Error('No se encontraron ventas'));
                }
                return throwError(() => error);
            })
        );
    
    }
}