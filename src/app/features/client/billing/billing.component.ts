import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-gray-800 tracking-tight">Facturación</h1>
          <p class="text-gray-500 font-medium">Historial de pagos y descargas</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-12 space-y-4">
          @for(pay of paymentService.getPaymentsByClient(auth.currentUser()?.id || ''); track pay.id) {
            <div class="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
              
              <div class="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50/80 rounded-2xl p-2.5 shrink-0 border border-slate-100/50 flex items-center justify-center overflow-hidden shadow-inner">
                @if(pay.productImage) {
                  <img [src]="pay.productImage" class="w-full h-full object-contain mix-blend-multiply">
                } @else {
                  <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 14h6m-6 4h6m-6-8h6M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16l-3-2-3 2-3-2-3 2-3-2z"></path></svg>
                }
              </div>

              <div class="flex-1 w-full">
                <div class="flex flex-wrap items-center gap-3 mb-2">
                  <span class="px-3.5 py-1.5 bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm border border-teal-100/50">Completado</span>
                  <span class="text-xs text-slate-400 font-bold font-mono tracking-wider">{{ pay.id }}</span>
                </div>
                <h3 class="text-xl sm:text-2xl font-black text-gray-900 leading-tight mb-1.5 tracking-tight">{{ pay.productName || 'Servicio Veterinario' }}</h3>
                <p class="text-slate-500 text-[13px] font-medium leading-relaxed">{{ pay.description }}</p>
                <div class="flex items-center gap-2 mt-3 text-xs text-slate-400 font-bold uppercase tracking-widest">
                  <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  {{ pay.date | date:'dd MMM yyyy, hh:mm a' }}
                </div>
              </div>

              <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-4 sm:mt-0 pt-5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <p class="text-3xl font-black text-teal-600 mb-0 sm:mb-4 tracking-tight"><span class="text-lg">S/ </span>{{ pay.amount.toFixed(2) }}</p>
                
                <button 
                  (click)="invoiceService.generatePDF(pay, auth.currentUser()?.fullName || 'Cliente')" 
                  class="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-gray-900 font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-slate-100/50 shadow-sm active:scale-95 group"
                >
                  <svg class="w-[18px] h-[18px] text-slate-400 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Factura
                </button>
              </div>
            </div>
          } @empty {
            <div class="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-sm">
              <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 class="text-2xl font-black text-gray-800 mb-2 tracking-tight">Aún no tienes compras</h3>
              <p class="text-slate-500 font-medium">Tus pagos y facturas aparecerán aquí.</p>
            </div>
          }
        </div>


      </div>
    </div>
  `
})
export class BillingComponent {
  public paymentService = inject(PaymentService);
  public invoiceService = inject(InvoiceService);
  public auth = inject(AuthService);
}
