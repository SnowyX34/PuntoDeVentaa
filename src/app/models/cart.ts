export interface CartItem {
  productId: string;
  productModel: string;
  productColor?: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  size?: string;
  stock: number;
  tierApplied: string;
  discount?: number;
}
export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  tier: string;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  total: number;
  itemsCount: number;
}

