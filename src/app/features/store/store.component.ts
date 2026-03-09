import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, Product } from '../../core/services/inventory.service';
import { CartService, CartItem } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in relative min-h-screen pb-20">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-gray-800 tracking-tight">VetStore<span class="text-teal-500">.</span></h1>
          <p class="text-gray-500 font-medium">Todo lo que tu mascota necesita, a un clic.</p>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="flex bg-slate-100/80 p-1.5 rounded-2xl overflow-x-auto max-w-full shadow-inner border border-slate-200/50">
            <button (click)="filter.set('all')" [class]="filterClass('all')">Todo</button>
            <button (click)="filter.set('food')" [class]="filterClass('food')">Comida</button>
            <button (click)="filter.set('medicine')" [class]="filterClass('medicine')">Medicinas</button>
            <button (click)="filter.set('accessory')" [class]="filterClass('accessory')">Accesorios</button>
          </div>
        </div>
      </div>

      <button 
        (click)="showCart.set(true)"
        class="fixed bottom-24 right-8 z-[90] p-4 bg-teal-600 border-4 border-slate-50 rounded-full shadow-2xl shadow-teal-600/40 hover:-translate-y-1 hover:shadow-teal-600/60 active:scale-95 transition-all group flex items-center justify-center text-white"
      >
        <svg class="w-7 h-7 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        @if(cart.count() > 0) {
          <span class="absolute -top-1 -right-1 bg-red-500 text-white text-[10.5px] font-black w-6 h-6 flex items-center justify-center rounded-full border-[2.5px] border-slate-50 px-1 shadow-sm">
            {{ cart.count() }}
          </span>
        }
      </button>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        @for(product of filteredProducts(); track product.id) {
          <div 
            (click)="openModal(product)"
            class="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-gray-100 flex flex-col group hover:-translate-y-2 transition-all duration-300 cursor-pointer"
          >
            <div class="relative aspect-square bg-slate-50 rounded-[2rem] mb-6 overflow-hidden flex items-center justify-center p-4">
              @if(product.image) {
                <img [src]="product.image" [alt]="product.name" class="w-full h-full object-contain transition-transform group-hover:scale-110 duration-500">
              } @else {
                <span class="text-5xl opacity-20 transition-transform group-hover:scale-110 duration-500">
                  {{ product.category === 'medicine' ? '💊' : product.category === 'food' ? '🦴' : '🧸' }}
                </span>
              }
              @if(product.stock <= 0) {
                <div class="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span class="px-4 py-2 bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-xl rotate-12">Agotado</span>
                </div>
              }
            </div>

            <div class="flex-1">
              <div class="flex flex-col mb-4">
                <span class="text-[10px] uppercase font-black tracking-widest text-teal-500 mb-1">
                  {{ product.category === 'medicine' ? 'Farmacia' : product.category === 'food' ? 'Nutrición' : 'Diversión' }}
                </span>
                <h3 class="font-black text-gray-800 leading-tight">{{ product.name }}</h3>
              </div>
              <p class="text-2xl font-black text-gray-900 mb-6">S/ {{ product.price.toFixed(2) }}</p>
            </div>

            <button 
              (click)="$event.stopPropagation(); addToCart(product)"
              [disabled]="product.stock <= 0"
              class="w-full py-4 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white disabled:bg-slate-50 disabled:text-slate-400 font-bold rounded-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group/btn"
            >
              <svg class="w-5 h-5 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              Añadir
            </button>
          </div>
        }
      </div>
    </div>

    @if(selectedProduct()) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6" (click)="closeModal()">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"></div>
          <div class="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up" (click)="$event.stopPropagation()">
            <div class="flex flex-col md:flex-row h-full">
              <div class="w-full md:w-1/2 bg-slate-50 p-12 flex items-center justify-center">
                <img [src]="selectedProduct()?.image" class="w-full h-auto object-contain drop-shadow-2xl">
              </div>
              <div class="w-full md:w-1/2 p-10 flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-start mb-4">
                    <span class="px-3 py-1 bg-teal-50 text-teal-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Detalles</span>
                    <button (click)="closeModal()" class="text-gray-400">✕</button>
                  </div>
                  <h2 class="text-3xl font-black text-gray-800 mb-4">{{ selectedProduct()?.name }}</h2>
                  <p class="text-gray-500 font-medium mb-8">{{ selectedProduct()?.description }}</p>
                  <p class="text-3xl font-black text-gray-900 mb-8">S/ {{ selectedProduct()?.price?.toFixed(2) }}</p>
                </div>
                <button (click)="addToCart(selectedProduct()!)" class="w-full py-5 bg-teal-600 text-white font-black rounded-2xl transition-all active:scale-95">Añadir al carrito</button>
              </div>
            </div>
          </div>
        </div>
      }

      @if(showCart()) {
        <div class="fixed inset-0 z-[100] overflow-hidden" (click)="showCart.set(false)">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"></div>
          <div class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-slide-in-right p-8 flex flex-col" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-2xl font-black text-gray-800">Tu Carrito<span class="text-teal-500">.</span></h2>
              <button (click)="showCart.set(false)" class="p-2 bg-slate-100 rounded-xl">✕</button>
            </div>

            <div class="flex-1 overflow-y-auto space-y-6">
              @for(item of cart.items(); track item.id) {
                <div class="flex gap-4 group">
                  <div class="w-20 h-20 bg-slate-50 rounded-2xl p-2 shrink-0">
                    <img [src]="item.image" class="w-full h-full object-contain">
                  </div>
                  <div class="flex-1">
                    <h4 class="font-bold text-gray-800 text-sm leading-tight mb-1">{{ item.name }}</h4>
                    <p class="text-teal-600 font-black mb-2 sm:text-lg">S/ {{ (item.price * item.quantity).toFixed(2) }}</p>
                    <div class="flex items-center gap-3">
                      <button (click)="cart.updateQuantity(item.id, -1)" class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold">-</button>
                      <span class="font-bold w-4 text-center">{{ item.quantity }}</span>
                      <button (click)="cart.updateQuantity(item.id, 1)" class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold">+</button>
                    </div>
                  </div>
                  <button (click)="cart.removeFromCart(item.id)" class="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity self-start p-2">🗑</button>
                </div>
              } @empty {
                <div class="h-full flex flex-col items-center justify-center text-center p-10">
                  <div class="w-24 h-24 bg-teal-50 text-teal-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-teal-100/50">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  </div>
                  <h3 class="font-black text-gray-800 mb-2">Tu carrito está vacío</h3>
                  <p class="text-gray-500 text-sm">Agrega algunos productos para verlos aquí.</p>
                </div>
              }
            </div>

            @if(cart.count() > 0) {
              <div class="pt-8 border-t border-gray-100 space-y-4">
                <div class="flex justify-between items-end">
                  <span class="text-gray-500 font-bold">Total a pagar</span>
                  <span class="text-3xl font-black text-gray-900">S/ {{ cart.total().toFixed(2) }}</span>
                </div>
                <button (click)="openCheckout()" class="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-lg shadow-teal-500/20 active:scale-95 transition-all">Pagar Ahora</button>
              </div>
            }
          </div>
        </div>
      }

      @if(showCheckout()) {
        <div class="fixed inset-0 z-[150] flex items-center justify-center px-4" (click)="checkoutState() === 'select' ? showCheckout.set(false) : null">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" [class.bg-white]="checkoutState() !== 'select'" [class.backdrop-blur-none]="checkoutState() !== 'select'"></div>
          
          @if(checkoutState() === 'select') {
            <div class="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-8 sm:p-10 animate-slide-up" (click)="$event.stopPropagation()">
              <div class="flex items-center justify-between mb-8">
                <h2 class="text-2xl font-black text-gray-900 tracking-tight">Finalizar Compra</h2>
                <button (click)="showCheckout.set(false)" class="p-2 text-gray-400 hover:text-gray-800 transition-colors bg-gray-50 rounded-full">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <div class="space-y-6">
                <p class="text-gray-500 font-medium">Selecciona tu método de pago:</p>
                
                <div class="grid grid-cols-2 gap-4">
                  <button (click)="paymentMethod.set('card')" [class]="paymentMethodClass('card')">
                    <div class="flex items-center justify-center mb-3 h-8">
                      <img src="https://1000marcas.net/wp-content/uploads/2019/12/VISA-Logo.jpg" class="h-8 object-contain" alt="Visa">
                    </div>
                    <span class="text-xs font-black uppercase tracking-wider">Tarjetas</span>
                  </button>
                  <button (click)="paymentMethod.set('paypal')" [class]="paymentMethodClass('paypal')">
                    <div class="flex items-center justify-center mb-3 h-8">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" class="h-6 object-contain" alt="PayPal">
                    </div>
                    <span class="text-xs font-black uppercase tracking-wider">PayPal</span>
                  </button>
                  <button (click)="paymentMethod.set('yape')" [class]="paymentMethodClass('yape')">
                    <div class="flex items-center justify-center mb-3 h-8">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Icono_de_la_aplicaci%C3%B3n_Yape.png" class="h-8 object-contain" alt="Yape">
                    </div>
                    <span class="text-xs font-black uppercase tracking-wider">Yape / Plin</span>
                  </button>
                  <button (click)="paymentMethod.set('wallet')" [class]="paymentMethodClass('wallet')">
                    <div class="flex items-center justify-center mb-3 h-8">
                      <svg class="h-7 w-7 text-indigo-500 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                    </div>
                    <span class="text-xs font-black uppercase tracking-wider">Billeteras</span>
                  </button>
                </div>

                @if(paymentMethod() === 'yape') {
                  <div class="bg-[#f0f0f5] p-4 rounded-[2rem] text-center animate-fade-in border border-[#e0e0e9]">
                    <img src="yape-qr-real.jpeg" class="w-full max-w-[200px] h-auto mx-auto mb-2 rounded-2xl shadow-sm object-contain">
                    <p class="text-[#5B2B82] font-black tracking-tight mb-1">Escanea con Yape o Plin</p>
                    <p class="text-2xl font-black text-gray-900 mt-0">S/ {{ cart.total().toFixed(2) }}</p>
                  </div>
                }

                @if(paymentMethod() === 'card') {
                  <div class="space-y-4 animate-fade-in">
                    <div class="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 flex items-center justify-between shadow-sm cursor-pointer hover:border-teal-400 transition-colors">
                      <div class="flex items-center gap-4">
                        <div class="w-16 h-10 bg-white rounded flex items-center justify-center p-2 shadow-sm border border-gray-100">
                          <img src="https://1000marcas.net/wp-content/uploads/2019/12/VISA-Logo.jpg" class="w-full h-full object-contain">
                        </div>
                        <div class="flex flex-col">
                          <span class="text-sm font-black text-gray-800 tracking-wider">**** 4492</span>
                          <span class="text-[10px] font-bold text-gray-400 uppercase">Expira 12/28</span>
                        </div>
                      </div>
                      <div class="w-5 h-5 rounded-full border-[5px] border-teal-500 bg-white"></div>
                    </div>
                    <button class="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-teal-600 font-bold text-sm hover:bg-teal-50 hover:border-teal-300 transition-all">+ Agregar nueva tarjeta</button>
                  </div>
                }

                <button 
                  (click)="confirmPurchase()"
                  class="w-full py-5 bg-gray-900 hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-gray-900/20 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3"
                >
                  Pagar S/ {{ cart.total().toFixed(2) }}
                  <svg class="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
                
                <div class="flex items-center justify-center gap-2 text-gray-400 mt-6">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  <p class="text-[9px] uppercase tracking-[0.2em] font-black">Pagos encriptados por VetTrust™</p>
                </div>
              </div>
            </div>
          }

          @if(checkoutState() === 'processing') {
            <div class="relative z-50 flex flex-col items-center justify-center text-center animate-fade-in w-full h-full bg-white">
              <div class="relative w-32 h-32 mb-10">
                <div class="absolute inset-0 rounded-full border-[8px] border-slate-100"></div>
                <div class="absolute inset-0 rounded-full border-[8px] border-teal-500 border-t-transparent animate-spin"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <svg class="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
              </div>
              <h3 class="text-4xl font-black text-gray-900 mb-4 tracking-tight">Procesando pago</h3>
              <p class="text-xl text-gray-500 font-medium">Conectando de forma segura con tu banco...</p>
            </div>
          }

          @if(checkoutState() === 'success') {
            <div class="relative z-50 flex flex-col items-center justify-center text-center animate-fade-in w-full h-full bg-white px-4">
              <div class="w-40 h-40 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-10 shadow-inner shadow-green-100 border-4 border-green-100 animate-bounce">
                <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              </div>
              <h3 class="text-5xl font-black text-gray-900 mb-6 tracking-tight">¡Pago Exitoso!</h3>
              <p class="text-xl text-gray-500 font-medium mb-12 max-w-lg mx-auto">Tu orden ha sido confirmada y está en preparación. Te enviamos el comprobante a tu correo con todos los detalles.</p>
              
              <div class="bg-slate-50 w-full max-w-lg mx-auto rounded-[2rem] p-8 border-2 border-slate-100 mb-10 text-left space-y-6 shadow-sm">
                <div class="flex justify-between items-center bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <span class="text-gray-400 text-sm font-bold uppercase tracking-widest">Orden N°</span>
                  <span class="text-gray-900 font-black font-mono text-xl">{{ orderNumber() }}</span>
                </div>
                <div class="flex justify-between items-center px-4">
                  <span class="text-gray-500 text-lg font-bold">Total pagado</span>
                  <span class="text-teal-600 font-black text-3xl">S/ {{ checkoutTotal().toFixed(2) }}</span>
                </div>
              </div>

              <button 
                (click)="finishCheckout()"
                class="w-full max-w-lg mx-auto py-6 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-2xl shadow-teal-600/30 active:scale-95 transition-all text-xl"
              >
                Volver a la tienda VetStore
              </button>
            </div>
          }
        </div>
      }
  `,
  styles: [`
    .animate-slide-in-right { animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `]
})
export class StoreComponent {
  public inventoryService = inject(InventoryService);
  public cart = inject(CartService);
  private toast = inject(ToastService);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);

  filter = signal<'all' | 'medicine' | 'food' | 'accessory'>('all');
  selectedProduct = signal<Product | null>(null);
  showCart = signal(false);
  showCheckout = signal(false);
  paymentMethod = signal<'card' | 'paypal' | 'yape' | 'wallet'>('card');
  checkoutState = signal<'select' | 'processing' | 'success'>('select');
  orderNumber = signal('');
  checkoutTotal = signal(0);

  filteredProducts = () => {
    const all = this.inventoryService.getProducts()();
    if (this.filter() === 'all') return all;
    return all.filter(p => p.category === this.filter());
  }

  openModal(product: Product) { this.selectedProduct.set(product); }
  closeModal() { this.selectedProduct.set(null); }

  addToCart(product: Product) {
    if (product.stock > 0) {
      this.inventoryService.updateStock(product.id, product.stock - 1);
      this.cart.addToCart(product);
      this.toast.show(`¡${product.name} añadido al carrito!`, 'success');
      
      if (this.selectedProduct()?.id === product.id) {
        this.selectedProduct.set({ ...product, stock: product.stock - 1 });
      }
    } else {
      this.toast.show('Producto agotado', 'error');
    }
  }

  filterClass(type: string) {
    const isActive = this.filter() === type;
    return `px-5 py-2 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`;
  }

  paymentMethodClass(method: string) {
    const isActive = this.paymentMethod() === method;
    return `flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${isActive ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`;
  }

  openCheckout() {
    this.showCart.set(false);
    this.checkoutState.set('select');
    this.showCheckout.set(true);
  }

  confirmPurchase() {
    this.checkoutTotal.set(this.cart.total());
    this.checkoutState.set('processing');
    
    setTimeout(() => {
      const newOrder = 'VET-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      this.orderNumber.set(newOrder);
      
      const firstItem = this.cart.items()[0];

      this.paymentService.processPayment({
        clientId: this.authService.currentUser()?.id || 'anon',
        amount: this.cart.total(),
        date: new Date().toISOString(),
        description: `Compra en VetStore (Orden: ${newOrder}) - ${this.cart.count()} productos`,
        productImage: firstItem?.image,
        productName: this.cart.count() > 1 ? `${firstItem?.name} y otros` : firstItem?.name
      });

      this.cart.clearCart();
      this.checkoutState.set('success');
    }, 2500);
  }

  finishCheckout() {
    this.showCheckout.set(false);
    setTimeout(() => this.checkoutState.set('select'), 300);
  }
}

