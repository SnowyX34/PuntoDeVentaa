export interface Product {
  id: string;
  modelo: string;
  color: string;
  price: number;
  size: string;
  stock: number;
  imageUrl?: string;
  category?: string;
  brand?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  categories: string[];
  brands: string[];
  maxPrice: number;
  minPrice?: number;
  search?: string;
}

export interface AddProductBody {
  modelo: string;
  color: string;
  price: number;
  category: string;
  brand?: string;
  descripcion?: string;
  img_Url?: string;
}

export interface UpdateProductBody {
  modelo?: string;
  color?: string;
  price?: number;
  category?: string;
  brand?: string;
  descripcion?: string;
  img_Url?: string;
}
