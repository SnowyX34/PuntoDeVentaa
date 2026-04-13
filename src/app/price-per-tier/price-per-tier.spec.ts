import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricePerTier } from './price-per-tier';

describe('PricePerTier', () => {
  let component: PricePerTier;
  let fixture: ComponentFixture<PricePerTier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricePerTier]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricePerTier);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
