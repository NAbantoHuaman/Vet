import { Injectable, signal, effect } from '@angular/core';

export interface PaymentRecord {
  id: string;
  clientId: string;
  amount: number;
  date: string;
  description: string;
  status: 'pending' | 'success' | 'failed';
  productImage?: string;
  productName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private payments = signal<PaymentRecord[]>([]);

  constructor() {
    const saved = localStorage.getItem('vet_payments');
    if (saved) {
      try { this.payments.set(JSON.parse(saved)); } catch(e) {}
    }
    
    effect(() => {
      localStorage.setItem('vet_payments', JSON.stringify(this.payments()));
    });
  }

  processPayment(record: Omit<PaymentRecord, 'id' | 'status'>) {
    const id = 'PAY-' + Math.random().toString(36).substring(7).toUpperCase();
    const newRecord: PaymentRecord = { ...record, id, status: 'success' };
    this.payments.update(prev => [newRecord, ...prev]);
    return newRecord;
  }

  getPaymentsByClient(clientId: string) {
    return this.payments()?.filter(p => p.clientId === clientId);
  }
}
