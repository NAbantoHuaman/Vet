import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="space-y-16 pb-12 animate-fade-in-up">
      <div class="relative bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row items-center border border-gray-100">
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-teal-50 opacity-50 blur-3xl z-0"></div>
        <div class="p-10 md:p-16 md:w-1/2 z-10">
          <span class="inline-block py-1 px-3 rounded-full bg-teal-100 text-teal-700 text-sm font-bold tracking-wide mb-4">
            CLÍNICA VETERINARIA
          </span>
          <h1 class="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
            Cuidamos a tu <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-400">mejor amigo</span> como a uno más de la familia.
          </h1>
          <p class="text-lg text-gray-600 mb-8 leading-relaxed">Únete a la clínica más moderna. Regístrate en nuestro portal para gestionar las atenciones médicas de tus mascotas.</p>
          <div class="flex flex-wrap gap-4">
            <button (click)="goToLogin()" class="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
              Ingresar o Registrarse
            </button>
          </div>
        </div>
        <div class="md:w-1/2 relative h-64 md:h-full min-h-[400px]">
          <img src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=1000" class="absolute inset-0 w-full h-full object-cover">
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);

  ngOnInit() {
    // Si ya está logueado, redirigir al dashboard correspondiente
    if (this.auth.isAuthenticated()) {
      if (this.auth.isAdmin()) {
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.router.navigate(['/client-dashboard']);
      }
    }
  }

  goToLogin() { this.router.navigate(['/login']); }
}
