import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../models/products';
import { ProductService } from '../../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { ImageCacheService } from '../../services/image-cache.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductTierPricingComponent } from '../product-tier-pricing/product-tier-pricing';
import { Navbar } from "../navbar/navbar"; // Importar desde carpeta diferente

@Component({
  selector: 'app-price-per-tier',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductTierPricingComponent, Navbar], //Importar el componente
  templateUrl: './price-per-tier.html',
  styleUrls: ['./price-per-tier.css']
})
export class PricePerTier implements OnInit {
  products: Product[] = [];
  allProducts: Product[] = [];
  
  showPricingModal: boolean = false;
  selectedProduct: Product | null = null;
  
  searchTerm: string = '';
  isSearching: boolean = false;
  selectedCategory: string = '';
  selectedBrand: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  categories: string[] = [];
  brands: string[] = [];
  showFilters: boolean = false;

  constructor(
    private readonly _productService: ProductService,
    private readonly toastr: ToastrService,
    private readonly _imageService: ImageCacheService
  ) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this._productService.getAll().subscribe({
      next: (data: Product[]) => {
        this.allProducts = data;
        this.products = [...data];
        this.getUniqueCategories();
        this.getUniqueBrands();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al cargar productos:', error);
        this.toastr.error('Error al cargar productos', 'Error');
      }
    });
  }

  getImageUrl(imgUrl: string, width: number = 200, height: number = 200): string {
    if (!imgUrl) return '';
    return this._productService.getOptimizedImageUrl(imgUrl, width, height);
  }

  onImageError(event: any) {
    const placeholderSvg = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23f3f4f6\'/%3E%3Ctext x=\'200\' y=\'150\' text-anchor=\'middle\' fill=\'%239ca3af\' font-size=\'14\'%3EImagen no disponible%3C/text%3E%3C/svg%3E';
    event.target.src = placeholderSvg;
  }

  openPricingModal(product: Product): void {
    console.log('Abriendo modal para:', product.modelo);
    this.selectedProduct = product;
    this.showPricingModal = true;
  }

  closePricingModal(): void {
    this.showPricingModal = false;
    this.selectedProduct = null;
  }

 // En tu componente (productos.ts o price-per-tier.ts)
saveProductPrices(pricingData: any): void {
  console.log('=== GUARDANDO PRECIOS ===');
  console.log('pricingData:', pricingData);
  console.log('ProductId a buscar:', pricingData.productId);
  console.log('allProducts disponibles:', this.allProducts.map(p => ({ id: p.id, modelo: p.modelo })));
  
  // Buscar el producto original
  const productToUpdate = this.allProducts.find(p => p.id === pricingData.productId);
  
  if (!productToUpdate) {
    console.error('❌ Producto NO encontrado con ID:', pricingData.productId);
    this.toastr.error('Producto no encontrado en la lista', 'Error');
    return;
  }
  
  
  // Crear una copia del producto con los nuevos precios
  const updatedProduct: Product = {
    ...productToUpdate,
    price: pricingData.regularPrice,
    tierPrices: pricingData.tierPrices
  };
  
  console.log('Producto actualizado:', updatedProduct);
  
  // Usar el servicio updateProduct existente
  this._productService.updateProduct(updatedProduct).subscribe({
    next: (response) => {
      
      // Actualizar localmente
      const index = this.products.findIndex(p => p.id === pricingData.productId);
      if (index !== -1) {
        this.products[index] = { ...this.products[index], ...updatedProduct };
      } else {
      }
      
      const allIndex = this.allProducts.findIndex(p => p.id === pricingData.productId);
      if (allIndex !== -1) {
        this.allProducts[allIndex] = { ...this.allProducts[allIndex], ...updatedProduct };
      }
      
      this.toastr.success(`Precios actualizados para ${pricingData.productModelo}`, 'Éxito');
      this.closePricingModal();
    },
    error: (error: HttpErrorResponse) => {
      this.toastr.error('Error al guardar los precios', 'Error');
    }
  });
}

  searchProducts(): void {
    let filteredProducts = [...this.allProducts];
    
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filteredProducts = filteredProducts.filter(product =>
        product.modelo?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term)
      );
    }
    
    if (this.selectedCategory) {
      filteredProducts = filteredProducts.filter(product => product.category === this.selectedCategory);
    }
    
    if (this.selectedBrand) {
      filteredProducts = filteredProducts.filter(product => product.brand === this.selectedBrand);
    }
    
    if (this.minPrice !== null) {
      filteredProducts = filteredProducts.filter(product => product.price >= this.minPrice!);
    }
    
    if (this.maxPrice !== null) {
      filteredProducts = filteredProducts.filter(product => product.price <= this.maxPrice!);
    }
    
    this.products = filteredProducts;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.products = [...this.allProducts];
  }

  getUniqueCategories(): void {
    const uniqueCategories = [...new Set(this.allProducts.map(p => p.category).filter(c => c))];
    this.categories = uniqueCategories;
  }

  getUniqueBrands(): void {
    const uniqueBrands = [...new Set(this.allProducts.map(p => p.brand).filter(b => b))];
    this.brands = uniqueBrands;
  }
  
}