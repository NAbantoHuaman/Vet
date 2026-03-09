import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ToastService } from './core/services/toast.service';
import { CartService } from './core/services/cart.service';
import { FloatingChatComponent } from './shared/components/ai-chat/floating-chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FloatingChatComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 font-sans selection:bg-teal-200 pattern-bg">
      
      <div class="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
        @for(toast of toastService.toasts(); track toast.id) {
          <div class="pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl animate-fade-in-up w-80 max-w-full"
               [ngClass]="{
                 'bg-green-500 text-white': toast.type === 'success',
                 'bg-red-500 text-white': toast.type === 'error',
                 'bg-indigo-600 text-white': toast.type === 'info'
               }">
            <div class="shrink-0">
              @if(toast.type === 'success') { <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> }
              @if(toast.type === 'info') { <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> }
            </div>
            <p class="font-medium font-sm leading-tight flex-1">{{ toast.message }}</p>
            <button (click)="toastService.remove(toast.id)" class="shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        }
      </div>

      <nav class="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-20">
            <div class="flex items-center gap-3 cursor-pointer group" (click)="goHome()">
              <div class="w-12 h-12 rounded-xl shadow-lg shadow-teal-500/20 overflow-hidden bg-white border border-teal-100 flex items-center justify-center">
                <img src="https://static.vecteezy.com/system/resources/previews/006/694/529/non_2x/dog-icon-design-vector.jpg" class="w-full h-full object-cover scale-125 mix-blend-darken">
              </div>
              <span class="font-black text-2xl tracking-tight text-gray-800">VetCare<span class="text-teal-500">.</span></span>
            </div>
            
            <button (click)="toggleMobileMenu()" class="md:hidden p-2 text-gray-600 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="mobileMenuOpen() ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'"></path>
              </svg>
            </button>
            
            <div class="hidden md:flex space-x-2 bg-gray-100/50 p-1.5 rounded-2xl items-center">
              
              @if(!auth.isAuthenticated()) {
                <button (click)="navigate('home')" [class]="navClass('home')">Inicio</button>
                <button (click)="navigate('login')" [class]="navClass('login')">Ingresar</button>
              }

              @if(auth.isAdmin()) {
                <span class="px-3 text-xs font-bold text-purple-600 uppercase tracking-wider border-r border-gray-300">Admin</span>
                <button (click)="navigate('admin-dashboard')" [class]="navClass('admin-dashboard')">Dashboard</button>
                <button (click)="navigate('admin-pets')" [class]="navClass('admin-pets')">Gestión Mascotas</button>
                <button (click)="navigate('admin-appointments')" [class]="navClass('admin-appointments')">Gestión Servicios</button>
                <button (click)="navigate('admin-history')" [class]="navClass('admin-history')">Historial Global</button>
                <button (click)="navigate('admin-inventory')" [class]="navClass('admin-inventory')">Inventario</button>
                <button (click)="navigate('admin-staff')" [class]="navClass('admin-staff')">Equipo VetCare</button>
                <button (click)="logout()" class="px-4 py-2 text-red-600 hover:bg-red-50 font-medium rounded-xl text-sm transition-all ml-2">Salir</button>
              }

              @if(auth.isClient()) {
                <span class="px-3 text-xs font-bold text-teal-600 uppercase tracking-wider border-r border-gray-300">Cliente</span>
                <button (click)="navigate('client-dashboard')" [class]="navClass('client-dashboard')">Resumen</button>
                <button (click)="navigate('client-pets')" [class]="navClass('client-pets')">Mis Mascotas</button>
                <button (click)="navigate('client-appointments')" [class]="navClass('client-appointments')">Mis Servicios</button>
                <button (click)="navigate('client-history')" [class]="navClass('client-history')">Historial Médico</button>
                <button (click)="navigate('client-store')" [class]="navClass('client-store') + ' relative'">
                  Tienda
                  @if(cartService.count() > 0) {
                    <span class="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                      {{ cartService.count() }}
                    </span>
                  }
                </button>
                <button (click)="navigate('client-billing')" [class]="navClass('client-billing')">Facturación</button>

                <button (click)="logout()" class="px-4 py-2 text-red-600 hover:bg-red-50 font-medium rounded-xl text-sm transition-all ml-2">Salir</button>
              }
            </div>
          </div>
          
          @if(mobileMenuOpen()) {
            <div class="md:hidden py-4 border-t border-gray-100 space-y-2 animate-fade-in">
              @if(!auth.isAuthenticated()) {
                <button (click)="navigate('home')" class="w-full text-left px-4 py-3 rounded-xl font-medium" [class]="navClass('home')">Inicio</button>
                <button (click)="navigate('login')" class="w-full text-left px-4 py-3 rounded-xl font-medium" [class]="navClass('login')">Ingresar</button>
              }

              @if(auth.isAdmin()) {
                <div class="px-4 py-2 text-xs font-bold text-purple-600 uppercase tracking-wider">Modo Administrador</div>
                <button (click)="navigate('admin-dashboard')" class="w-full text-left px-4 py-3 rounded-xl font-medium" [class]="navClass('admin-dashboard')">Dashboard</button>
                <button (click)="navigate('admin-pets')" class="w-full text-left px-4 py-3 rounded-xl font-medium" [class]="navClass('admin-pets')">Gestión Mascotas</button>
                <button (click)="navigate('admin-appointments')" class="w-full text-left px-4 py-3 rounded-xl font-medium" [class]="navClass('admin-appointments')">Gestión Servicios</button>
                <button (click)="navigate('admin-history')" class="w-full text-left px-4 py-3 rounded-xl font-medium" [class]="navClass('admin-history')">Historial Global</button>
                <button (click)="navigate('admin-inventory')" class="w-full text-left px-4 py-3 rounded-xl font-medium" [class]="navClass('admin-inventory')">Inventario</button>
                <button (click)="navigate('admin-staff')" class="w-full text-left px-4 py-3 rounded-xl font-medium" [class]="navClass('admin-staff')">Equipo VetCare</button>
                <button (click)="logout()" class="w-full text-left px-4 py-3 text-red-600 font-medium">Cerrar Sesión</button>
              }

              @if(auth.isClient()) {
                <div class="px-4 py-2 text-xs font-bold text-teal-600 uppercase tracking-wider">Modo Cliente</div>
                <button (click)="navigate('client-dashboard')" class="w-full text-left px-4 py-3 rounded-xl font-medium" [class]="navClass('client-dashboard')">Resumen</button>
                <button (click)="navigate('client-pets')" class="w-full text-left px-4 py-3 rounded-xl font-medium" [class]="navClass('client-pets')">Mis Mascotas</button>
                <button (click)="navigate('client-appointments')" class="w-full text-left px-4 py-3 rounded-xl font-medium" [class]="navClass('client-appointments')">Mis Servicios</button>
                <button (click)="navigate('client-history')" class="w-full text-left px-4 py-3 rounded-xl font-medium" [class]="navClass('client-history')">Historial Médico</button>
                <button (click)="navigate('client-store')" class="w-full text-left px-4 py-3 rounded-xl font-medium flex justify-between items-center" [class]="navClass('client-store')">
                  <span>Tienda</span>
                  @if(cartService.count() > 0) {
                    <span class="bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                      {{ cartService.count() }}
                    </span>
                  }
                </button>
                <button (click)="navigate('client-billing')" class="w-full text-left px-4 py-3 rounded-xl font-medium" [class]="navClass('client-billing')">Facturación</button>
                <button (click)="logout()" class="w-full text-left px-4 py-3 text-red-600 font-medium">Cerrar Sesión</button>
              }
            </div>
          }
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <router-outlet></router-outlet>
      </main>

      <app-floating-chat></app-floating-chat>
    </div>
  `
})
export class App {
  public auth = inject(AuthService);
  public toastService = inject(ToastService);
  public cartService = inject(CartService);
  private router = inject(Router);
  
  mobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu() { this.mobileMenuOpen.set(!this.mobileMenuOpen()); }

  navigate(path: string) {
    this.mobileMenuOpen.set(false);
    this.router.navigate(['/' + path]);
  }

  goHome() {
    if (this.auth.isAdmin()) this.navigate('admin-dashboard');
    else if (this.auth.isClient()) this.navigate('client-dashboard');
    else this.navigate('home');
  }

  logout() {
    this.auth.logout();
    this.navigate('login');
  }

  navClass(path: string) {
    const isActive = this.router.url.includes(path);
    return `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600 hover:text-teal-600 hover:bg-white/50'}`;
  }
}