import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TIERS} from '../models/priceModel';

@Component({
  selector: 'app-product-tier-pricing',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-tier-pricing.html',
  styleUrl: './product-tier-pricing.css',
  standalone: true
})

export class ProductTierPricingComponent implements OnInit {
  @Input() product: any;
  @Output() pricesSaved = new EventEmitter<any>();
  
  regularPrice: number = 0;
  specialTiers = TIERS.filter(t => t.id !== 'regular');
  
  
  // Definir con tipos correctos
  tierPrices: { [key: string]: { price: number; enabled: boolean } } = {};
  
  ngOnInit() {
    // Asegurar que regularPrice sea número
    this.regularPrice = typeof this.product?.price === 'number' ? this.product.price : 0;
    
    this.specialTiers.forEach(tier => {
      const savedPrice = this.product?.tierPrices?.[tier.id];
      this.tierPrices[tier.id] = {
        price: typeof savedPrice?.price === 'number' ? savedPrice.price : this.regularPrice,
        enabled: savedPrice?.enabled === true
      };
    });
  }
  
  // Método que siempre devuelve número
  getEnabled(tierId: string): boolean {
    return this.tierPrices[tierId]?.enabled === true;
  }
  
  // Método que siempre devuelve número
  getPrice(tierId: string): number {
    const price = this.tierPrices[tierId]?.price;
    return typeof price === 'number' && !isNaN(price) ? price : this.regularPrice;
  }
  
  // Método para actualizar precio
  setPrice(tierId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    let value = parseFloat(input.value);
    
    if (isNaN(value)) {
      value = 0;
    }
    
    if (this.tierPrices[tierId]) {
      this.tierPrices[tierId].price = value;
    }
  }
  
  // Alternar habilitado
  toggleTier(tierId: string) {
    if (this.tierPrices[tierId]) {
      this.tierPrices[tierId].enabled = !this.tierPrices[tierId].enabled;
    }
  }
  
  // Actualizar precio regular
  updateRegularPrice() {
    // Asegurar que sea número
    if (typeof this.regularPrice !== 'number' || isNaN(this.regularPrice)) {
      this.regularPrice = 0;
    }
  }
  
  // Restablecer precios
  resetPrices() {
    this.specialTiers.forEach(tier => {
      this.tierPrices[tier.id] = {
        price: this.regularPrice,
        enabled: false
      };
    });
  }
  
  //Guardar precios
  save() {
    const pricesToSave = {
      productId: this.product?.id,
      productModelo: this.product?.modelo,
      regularPrice: this.regularPrice,
      tierPrices: this.tierPrices
    };
    
    this.pricesSaved.emit(pricesToSave);
  }
}