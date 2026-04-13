import { Component } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../models/products';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Navbar } from "../navbar/navbar";

import { ImageCacheService } from '../../services/image-cache.service';
import { CartService } from '../../services/cart.service';


@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [FormsModule, CommonModule, Navbar],
  templateUrl: './venta.html',
  styleUrl: './venta.css',
})
export class Venta {

  products: Product[] = [];
  allProducts: Product[] = [];
  newProduct: Product = {
    id: '',
    modelo: '',
    color: '',
    price: 0,
    size: '',
    stock: 0,
    imageUrl: '',
    category: '',
    brand: '',
    description: ''
  };

  editingProduct: Product | null = null;
  selectedFile: File | null = null;
  selectedFileForEdit: File | null = null;

  //Estados de carga para mejor UX
  isUploading: boolean = false;
  isUpdating: boolean = false;

  isOppened: number = 0;

  searchTerm: string = '';
  isSearching: boolean = false;

  selectedCategory: string = '';
  selectedBrand: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  categories: string[] = [];
  brands: string[] = [];

  showFilters: boolean = false;

  cantidades: { [key: string]: number } = {};

  // Agrega este método en tu componente
  toggleForm() {
    this.isOppened = this.isOppened === 1 ? 0 : 1;
  }

  constructor(
    private readonly _productService: ProductService,
    private readonly toastr: ToastrService,
    private readonly _imageService: ImageCacheService,
    private readonly router: Router,
    private readonly _cartService: CartService
  ) { }

  // Método actualizado para usar URLs optimizadas
  getImageUrl(imgUrl: string, width: number = 200, height: number = 200): string {
    if (!imgUrl) return '';

    const cacheKey = `${imgUrl}-${width}-${height}`;
    const cached = this._imageService.getImage(cacheKey);

    if (cached) {
      return cached;
    }
    return this._productService.getOptimizedImageUrl(imgUrl, width, height);
  }


  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this._productService.getAll().subscribe({
      next: (data: Product[]) => {
        this.allProducts = data;
        this.products = [...data];
        this.getUniqueCategories(); // Obtener categorías únicas
        this.getUniqueBrands();
        this.products.forEach(product => {
          this.cantidades[product.id] = 1; // valor por defecto
        }); // Obtener marcas únicas
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al cargar productos:', error);
        this.toastr.error('Error al cargar productos', 'Error');
      }
    });
  }

  onImageError(event: any) {
    console.error('Error al cargar imagen');
    // Establecer imagen por defecto en caso de error
    // Crear un SVG inline como placeholder
    const svgString = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="14">
        Imagen no disponible
      </text>
      <text x="50%" y="65%" text-anchor="middle" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="12">
        Sin conexión
      </text>
    </svg>
  `;

    // Convertir SVG a data URL
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    // Asignar la URL al src
    event.target.src = url;

    // Liberar memoria cuando la imagen se cargue o haya error
    event.target.onload = () => URL.revokeObjectURL(url);
    event.target.onerror = () => URL.revokeObjectURL(url);
  }

  private compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

          let width = img.width;
          let height = img.height;

          const maxSize = 1200;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            }
            else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            }
            else {
              reject(new Error('Error en la imagen'));
            }
          }, 'image/jpeg', 0.8);
        };
      };
      reader.onerror = reject;
    });
  }
  clearSearch(): void {
    this.searchTerm = '';
    this.fetchProducts();
  }

  getUniqueCategories(): void {
    const uniqueCategories = [...new Set(this.allProducts.map(p => p.category).filter(c => c))];
    this.categories = uniqueCategories;
  }

  getUniqueBrands(): void {
    const uniqueBrands = [...new Set(this.allProducts.map(p => p.brand).filter(b => b))];
    this.brands = uniqueBrands;
  }

  searchProducts(): void {
    let filteredProducts = [...this.allProducts];

    // 1. Filtrar por término de búsqueda
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filteredProducts = filteredProducts.filter(product =>
        product.modelo?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term)
      );
    }

    // 2. Filtrar por categoría
    if (this.selectedCategory) {
      filteredProducts = filteredProducts.filter(product =>
        product.category === this.selectedCategory
      );
    }

    // 3. Filtrar por marca
    if (this.selectedBrand) {
      filteredProducts = filteredProducts.filter(product =>
        product.brand === this.selectedBrand
      );
    }

    // 4. Filtrar por rango de precios
    if (this.minPrice !== null) {
      filteredProducts = filteredProducts.filter(product =>
        product.price >= this.minPrice!
      );
    }

    if (this.maxPrice !== null) {
      filteredProducts = filteredProducts.filter(product =>
        product.price <= this.maxPrice!
      );
    }

    this.products = filteredProducts;
    this.isSearching = false;

    if (filteredProducts.length === 0) {
      this.toastr.info('No se encontraron productos con los filtros seleccionados', 'Búsqueda');
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.showFilters = false;
    this.products = [...this.allProducts]
    this.fetchProducts(); // Recargar todos los productos
  }

  addToCart(product: Product, tierId: string = 'regular', cantidad: number) {
    this._cartService.addToCart(product, tierId, cantidad);
  }

  getEnabledTiers(product: any) {
    return Object.entries(product.tierPrices || {})
      .filter(([_, value]: any) => value.enabled);
  }

  hasEnabledTiers(product: any): boolean {
    return Object.values(product.tierPrices || {}).some(
      (t: any) => t.enabled
    );
  }
}