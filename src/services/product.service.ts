import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../app/models/products';
import { environment } from '../environments/environment.prod';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private readonly myAppUrl: string;
    private readonly myApiUrl: string;

    constructor(private readonly http: HttpClient) {
        this.myAppUrl = environment.endpoint;
        this.myApiUrl = 'products';
    }

    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    private createHeaders(): HttpHeaders {
        const token = this.getToken();
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    }

    private handleError(error: HttpErrorResponse) {
        console.error('Error en ProductService:', error);

        let errorMessage = 'Error desconocido';
        if (error.error instanceof ErrorEvent) {
            // Error del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del servidor
            errorMessage = `Código: ${error.status}, Mensaje: ${error.error?.message || error.message}`;
        }

        return throwError(() => error);
    }

    getAlls(category?: string): Observable<Product[]> {
        const url = `${this.myAppUrl}${this.myApiUrl}`;
        let params = new HttpParams();

        if (category) {
            params = params.append('category', category);
        }

        return this.http.get<Product[]>(url, { params }).pipe(
            catchError(this.handleError)
        );
    }

    getAll(): Observable<Product[]> {
        const url = `${this.myAppUrl}${this.myApiUrl}`;
        return this.http.get<Product[]>(url).pipe(
            catchError(this.handleError)
        );
    }

    addProductFormData(formData: FormData): Observable<any> {
        const url = `${this.myAppUrl}${this.myApiUrl}/add`;
        const headers = this.createHeaders();

        console.log('URL:', url);
        console.log('Token existe:', !!this.getToken());

        return this.http.post(url, formData, {
            headers,
            reportProgress: true
        }).pipe(
            catchError(this.handleError)
        );
    }

    updateProduct(product: Product): Observable<any> {
        const url = `${this.myAppUrl}${this.myApiUrl}/${product.id}`;
        const headers = this.createHeaders();
        return this.http.put(url, product, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    updateProductFormData(id: string, formData: FormData): Observable<any> {
        const url = `${this.myAppUrl}${this.myApiUrl}/${id}`;
        const headers = this.createHeaders();
        return this.http.put(url, formData, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    deleteProduct(id: string): Observable<any> {
        const url = `${this.myAppUrl}${this.myApiUrl}/${id}`;
        const headers = this.createHeaders();
        return this.http.delete(url, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    getImageUrl(imagePath: string): string {
        if (!imagePath) {
            return this.getLocalPlaceholder();
        }
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        return `${this.myAppUrl}${cleanPath}`;
    }

    getOptimizedImageUrl(imagePath: string, width: number = 200, height: number = 200): string {
        const baseUrl = this.getImageUrl(imagePath);

        if (baseUrl.includes('cloudinary.com')) {
            return baseUrl.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`);
        }
        return baseUrl;
    }

    getProductById(id:string): Observable<any>{
        return this.http.get<any>(`${this.myAppUrl}${this.myApiUrl}/getProduct/${id}`)
    }

    private getLocalPlaceholder(): string {
        return 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23f3f4f6\'/%3E%3Ctext x=\'200\' y=\'150\' text-anchor=\'middle\' fill=\'%239ca3af\' font-family=\'Arial\' font-size=\'16\'%3ESin imagen%3C/text%3E%3C/svg%3E';
    }

    searchProduct(term: string): Observable<Product[]> {
    if (!term || term.trim() === '') {
        return this.getAll(); // Retornar todos los productos si no hay término
    }
    
    const url = `${this.myAppUrl}${this.myApiUrl}/search?term=${encodeURIComponent(term.trim())}`;
    
    return this.http.get<Product[]>(url).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 404) {
                return throwError(() => new Error('No se encontraron productos'));
            }
            return throwError(() => error);
        })
    );

}
}