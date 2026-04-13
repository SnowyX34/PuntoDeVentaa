export interface Sale {
  id?: string;
  userId: string;
  userName: string;
  userPhone?: string;
  items: {
    id: string;
    productId: string;
    productModel: string;
    productColor?: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    size?: string;
    tierApplied?: string; // Nivel de cliente aplicado (bronze, silver, gold, etc.)
    discount?: number;
  }[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'transfer';
  paymentStatus?: 'pending' | 'paid' | 'partial';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SaleItem {
  id: string;
  productId: string;
  productModel: string;
  productColor?: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  size?: string;
  tierApplied?: string; // Nivel de cliente aplicado (bronze, silver, gold, etc.)
  discount?: number;
}

export interface SaleFilters {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  status?: string;
  minTotal?: number;
  maxTotal?: number;
}