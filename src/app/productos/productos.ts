import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../models/products';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Navbar } from "../navbar/navbar";

import { ImageCacheService } from '../../services/image-cache.service';
@Component({
  selector: 'app-products',
  templateUrl: './productos.html',
  styleUrls: ['./productos.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, Navbar]
})
export class Productos implements OnInit {

  products: Product[] = [];
  allProducts: Product[]= [];
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

  // Agrega este método en tu componente
  toggleForm() {
    this.isOppened = this.isOppened === 1 ? 0 : 1;
  }

  constructor(
    private readonly _productService: ProductService,
    private readonly toastr: ToastrService,
    private readonly _imageService: ImageCacheService 
  ) { }

  // Método actualizado para usar URLs optimizadas
  getImageUrl(imgUrl: string, width: number = 200, height: number = 200): string {
    if(!imgUrl) return '';

    const cacheKey =  `${imgUrl}-${width}-${height}`;
    const cached = this._imageService.getImage(cacheKey);

    if(cached){
      return cached;
    }
    return this._productService.getOptimizedImageUrl(imgUrl, width, height);
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file) {
      // Validar tamaño del archivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.toastr.error('El archivo es demasiado grande. Máximo 10MB', 'Error');
        input.value = '';
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Solo se permiten archivos de imagen', 'Error');
        input.value = '';
        return;
      }

      try {
        const compressedFile = await this.compressImage(file);
        this.selectedFile = compressedFile;
         this.toastr.success(`imagen comprimida: ${(compressedFile.size / 1024).toFixed(2)} KB`, 'Success');
      }
      catch (error) {
        console.error('Error al comprimir:', error);
        this.selectedFile = file;
      }
    }
    else {
      this.selectedFile = null;
    }

    this.selectedFile = file;
  }

  async onFileSelectedForEdit(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file) {
      // Validar tamaño del archivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.toastr.error('El archivo es demasiado grande. Máximo 10MB', 'Error');
        input.value = '';
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Solo se permiten archivos de imagen', 'Error');
        input.value = '';
        return;
      }

      try {
        const compressedFile = await this.compressImage(file);
        this.selectedFile = compressedFile;
        this.toastr.success(`imagen comprimida: ${(compressedFile.size / 1024).toFixed(2)} KB`, 'Success');
      }
      catch (error) {
        console.error('Error al comprimir:', error);
        this.selectedFile = file;
      }
    }
    else {
      this.selectedFile = null;
    }

    this.selectedFile = file;
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
        this.getUniqueBrands(); // Obtener marcas únicas
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

  cancelEdit() {
    this.editingProduct = null;
    this.selectedFileForEdit = null;
    this.isUpdating = false;
  }

  addProduct(): void {
    const startTime = performance.now();

    if (!this.newProduct.modelo || !this.newProduct.price || !this.newProduct.category || !this.newProduct.brand) {
      this.toastr.error('Modelo, precio, categoría y marca son obligatorios', 'Error');
      return;
    }

    if (this.isUploading) {
      return; // Prevenir múltiples clicks
    }

    this.isUploading = true;

    const formData = new FormData();
    if (this.newProduct.modelo) formData.append('modelo', this.newProduct.modelo);
    if (this.newProduct.color) formData.append('color', this.newProduct.color);
    if (this.newProduct.price !== undefined) formData.append('price', String(this.newProduct.price));
    if (this.newProduct.size) formData.append('size', this.newProduct.size);
    if (this.newProduct.stock !== undefined) formData.append('stock', String(this.newProduct.stock || 0));
    if (this.newProduct.category) formData.append('category', this.newProduct.category);
    if (this.newProduct.brand) formData.append('brand', this.newProduct.brand);
    if (this.newProduct.description) formData.append('description', this.newProduct.description);


    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this._productService.addProductFormData(formData).subscribe({
      next: () => {
        const endTime = performance.now();
        console.log(`Producto agregado en ${(endTime - startTime).toFixed(2)}ms`)
        this.fetchProducts();
        this.newProduct = {
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
        this.selectedFile = null;
        this.clearFileInput();
        this.isUploading = false;
      },
      error: (error: HttpErrorResponse) => {
        const endTime = performance.now();
        this.toastr.error(
          error.error?.message || `Error en ${(endTime-startTime).toFixed(2)}ms`,
          'Error'
        );
        this.isUploading = false;
      }
    });
  }

  editProduct(product: Product): void {
    this.editingProduct = { ...product };
    this.selectedFileForEdit = null;

    if (product.imageUrl) {
      console.log("Imagen")
    }
  }

  
  saveProduct(): void {
    if (!this.editingProduct) return;

    if (this.isUpdating) return;

    this.isUpdating = true;

    console.log('Guardando producto:', {
      id: this.editingProduct.id,
      modelo: this.editingProduct.modelo,
      tieneNuevaImagen: !!this.selectedFileForEdit,
      imagenActual: this.editingProduct.imageUrl
    });

    // Si hay una nueva imagen seleccionada
    if (this.selectedFileForEdit) {
      const formData = new FormData();

      // Agregar todos los campos del producto
      formData.append('modelo', this.editingProduct.modelo || '');
      formData.append('color', this.editingProduct.color || '');
      formData.append('price', String(this.editingProduct.price || 0));
      formData.append('size', this.editingProduct.size || '');
      formData.append('stock', String(this.editingProduct.stock || 0));
      formData.append('category', this.editingProduct.category || '');
      formData.append('brand', this.editingProduct.brand || '');
      formData.append('description', this.editingProduct.description || '');

      // Agregar la nueva imagen
      formData.append('image', this.selectedFileForEdit, this.selectedFileForEdit.name);

      console.log('Enviando nueva imagen:', this.selectedFileForEdit.name);

      this._productService.updateProductFormData(this.editingProduct.id, formData).subscribe({
        next: (response) => {
          console.log('Producto actualizado con nueva imagen:', response);
          this.toastr.success('Producto actualizado correctamente', 'Éxito');
          this.fetchProducts();
          this.cancelEdit();
          this.isUpdating = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al actualizar con imagen:', error);
          this.toastr.error(error.error?.message || 'Error al actualizar producto', 'Error');
          this.isUpdating = false;
        }
      });
    } else {
      this._productService.updateProduct(this.editingProduct).subscribe({
        next: (response) => {
          console.log('Producto actualizado:', response);
          this.toastr.success('Producto actualizado correctamente', 'Éxito');
          this.fetchProducts();
          this.cancelEdit();
          this.isUpdating = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al actualizar:', error);
          this.toastr.error(error.error?.message || 'Error al actualizar producto', 'Error');
          this.isUpdating = false;
        }
      });
    }
  }

  deleteProduct(id: string): void {
    if (!confirm('¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.')) return;

    this._productService.deleteProduct(id).subscribe({
      next: () => {
        this.toastr.success('Producto eliminado correctamente', 'Éxito');
        this.fetchProducts();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al eliminar:', error);
        this.toastr.error(
          error.error?.message || 'Error al eliminar producto',
          'Error'
        );
      }
    });
  }

  private clearFileInput(): void {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input: any) => {
      input.value = '';
    });
  }

  //Método auxiliar para mostrar el nombre del archivo seleccionado
  getSelectedFileName(): string {
    return this.selectedFile ? this.selectedFile.name : 'Ningún archivo seleccionado';
  }

  getSelectedFileNameForEdit(): string {
    return this.selectedFileForEdit ? this.selectedFileForEdit.name : 'Ningún archivo seleccionado';
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
  
  clearSearch():void{
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
  
}