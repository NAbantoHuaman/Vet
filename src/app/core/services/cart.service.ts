import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from './inventory.service';

export interface CartItem extends Product {
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private itemsSignal = signal<CartItem[]>([]);
  
  constructor() {
    const saved = localStorage.getItem('vet_cart');
    if (saved) {
      try { this.itemsSignal.set(JSON.parse(saved)); } catch (e) {}
    }
    
    effect(() => {
      localStorage.setItem('vet_cart', JSON.stringify(this.itemsSignal()));
    });
  }

  items = this.itemsSignal.asReadonly();
  
  count = computed(() => 
    this.itemsSignal().reduce((acc, item) => acc + item.quantity, 0)
  );
  
  total = computed(() => 
    this.itemsSignal().reduce((acc, item) => acc + (item.price * item.quantity), 0)
  );

  addToCart(product: Product) {
    this.itemsSignal.update(items => {
      const existing = items.find(i => i.id === product.id);
      if (existing) {
        return items.map(i => i.id === product.id 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
        );
      }
      return [...items, { ...product, quantity: 1 }];
    });
  }

  removeFromCart(productId: string) {
    this.itemsSignal.update(items => items.filter(i => i.id !== productId));
  }

  updateQuantity(productId: string, delta: number) {
    this.itemsSignal.update(items => {
      return items.map(i => {
        if (i.id === productId) {
          const newQty = Math.max(0, i.quantity + delta);
          return { ...i, quantity: newQty };
        }
        return i;
      }).filter(i => i.quantity > 0);
    });
  }

  clearCart() {
    this.itemsSignal.set([]);
  }
}
