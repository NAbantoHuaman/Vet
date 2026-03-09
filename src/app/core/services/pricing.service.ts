import { Injectable } from '@angular/core';
import { ServiceType } from '../../shared/models/models';

export interface PricingConfig {
  medico: number;
  estetica: number;
  guarderia: number; 
}

@Injectable({
  providedIn: 'root',
})
export class PricingService {
  private prices: PricingConfig = {
    medico: 80.00,
    estetica: 45.00,
    guarderia: 35.00,
  };

  getPrice(serviceType: ServiceType): number {
    return this.prices[serviceType] || 0;
  }

  getPricing(): PricingConfig {
    return this.prices;
  }
}
