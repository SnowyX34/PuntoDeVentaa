import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTierPricing } from './product-tier-pricing';

describe('ProductTierPricing', () => {
  let component: ProductTierPricing;
  let fixture: ComponentFixture<ProductTierPricing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTierPricing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductTierPricing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
