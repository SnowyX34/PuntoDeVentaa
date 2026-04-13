export interface TierConfig {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
}

// ✅ Definir la interfaz para tierPrices
export interface TierPrice {
  price: number;
  enabled: boolean;
}

export interface TierPrices {
  [key: string]: TierPrice; // ✅ Index signature
}

export const TIERS: TierConfig[] = [
  { id: 'regular', name: 'Regular', color: 'gray', icon: '', description: 'Precio estándar' },
  { id: 'bronze', name: 'Bronce', color: 'amber', icon: '', description: 'Clientes frecuentes' },
  { id: 'silver', name: 'Plata', color: 'gray', icon: '', description: 'Clientes leales' },
  { id: 'gold', name: 'Oro', color: 'yellow', icon: '', description: 'Clientes premium' },
  { id: 'platinum', name: 'Platino', color: 'blue', icon: '', description: 'Clientes élite' },
  { id: 'vip', name: 'VIP', color: 'purple', icon: '', description: 'Clientes especiales' }
];