import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl shadow-xl border border-teal-50 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 w-40 h-40 bg-teal-50 rounded-full opacity-50 blur-2xl"></div>
      
      <div class="text-center mb-6 relative z-10">
        <div class="w-16 h-16 mx-auto bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          @if(!isRegisterMode()) {
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
          } @else {
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          }
        </div>
        <h2 class="text-3xl font-black text-gray-800">{{ isRegisterMode() ? 'Crear Cuenta' : 'Iniciar Sesión' }}</h2>
        <p class="text-gray-500 mt-2">{{ isRegisterMode() ? 'Regístrate para gestionar a tus mascotas.' : 'Accede al portal de VetCare.' }}</p>
      </div>

      <!-- TABS -->
      <div class="flex bg-gray-100 rounded-xl p-1 mb-6 relative z-10">
        <button (click)="isRegisterMode.set(false)" class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                [class]="!isRegisterMode() ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          Ingresar
        </button>
        <button (click)="isRegisterMode.set(true)" class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                [class]="isRegisterMode() ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          Registrarse
        </button>
      </div>

      @if(errorMsg()) {
        <div class="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 text-center animate-fade-in mb-4 relative z-10">
          {{ errorMsg() }}
        </div>
      }
      @if(successMsg()) {
        <div class="p-3 bg-green-50 text-green-600 rounded-xl text-sm font-semibold border border-green-100 text-center animate-fade-in mb-4 relative z-10">
          {{ successMsg() }}
        </div>
      }

      <!-- FORMULARIO LOGIN -->
      @if(!isRegisterMode()) {
        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-5 relative z-10">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
            <input type="email" formControlName="email" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="tu@correo.com">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
            <input type="password" formControlName="password" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="••••••••">
          </div>
          <button type="submit" [disabled]="loginForm.invalid" class="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-2xl hover:from-teal-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-300 shadow-md transition-all">
            Ingresar al Sistema
          </button>
        </form>

        <div class="mt-6 pt-5 border-t border-gray-100 text-xs text-gray-400 text-center space-y-1 relative z-10">
          <p><strong>Credenciales Admin:</strong> admin&#64;vet.com / admin123</p>
          <p>O crea tu cuenta de cliente en la pestaña "Registrarse"</p>
        </div>
      }

      <!-- FORMULARIO REGISTRO -->
      @if(isRegisterMode()) {
        <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="space-y-4 relative z-10">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Nombre Completo</label>
            <input type="text" formControlName="fullName" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Ej: Carlos Mendoza">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
            <input type="email" formControlName="email" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="tu@correo.com">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Teléfono</label>
            <input type="tel" formControlName="phone" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="987654321">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
            <input type="password" formControlName="password" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Mínimo 6 caracteres">
          </div>
          <button type="submit" [disabled]="registerForm.invalid" class="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 shadow-md transition-all">
            Crear mi Cuenta
          </button>
        </form>
      }
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  isRegisterMode = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onLogin() {
    this.errorMsg.set('');
    this.successMsg.set('');
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      if (this.auth.login(email, password)) {
        this.router.navigate([this.auth.isAdmin() ? '/admin-dashboard' : '/client-dashboard']);
      } else {
        this.errorMsg.set('Credenciales incorrectas. Verifica tu correo y contraseña.');
      }
    }
  }

  onRegister() {
    this.errorMsg.set('');
    this.successMsg.set('');
    if (this.registerForm.valid) {
      const result = this.auth.register(this.registerForm.value);
      if (result.success) {
        this.router.navigate(['/client-dashboard']);
      } else {
        this.errorMsg.set(result.message);
      }
    }
  }
}
