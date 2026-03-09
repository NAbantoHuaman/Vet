import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-md mx-auto mt-12 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden animate-fade-in-up">
      <div class="absolute -top-24 -right-24 w-56 h-56 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-56 h-56 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="text-center mb-8 relative z-10">
        <div class="w-20 h-20 mx-auto bg-gradient-to-br from-teal-50 to-teal-100/50 text-teal-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner border border-teal-100/50">
          @if(!isRegisterMode()) {
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
          } @else {
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          }
        </div>
        <h2 class="text-4xl font-black text-gray-900 tracking-tight leading-tight">{{ isRegisterMode() ? 'Crear Cuenta' : 'Iniciar Sesión' }}</h2>
        <p class="text-[15px] font-medium text-gray-500 mt-2">{{ isRegisterMode() ? 'Regístrate para gestionar a tus mascotas.' : 'Accede al portal de VetCare.' }}</p>
      </div>

      <div class="flex bg-slate-50 border border-slate-100/50 rounded-2xl p-1.5 mb-8 relative z-10 shadow-inner">
        <button (click)="isRegisterMode.set(false)" class="flex-1 py-3 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all duration-300"
                [class]="!isRegisterMode() ? 'bg-white text-teal-600 shadow-sm border border-slate-100/50' : 'text-slate-400 hover:text-slate-600'">
          Ingresar
        </button>
        <button (click)="isRegisterMode.set(true)" class="flex-1 py-3 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all duration-300"
                [class]="isRegisterMode() ? 'bg-white text-teal-600 shadow-sm border border-slate-100/50' : 'text-slate-400 hover:text-slate-600'">
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

      @if(!isRegisterMode()) {
        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-5 relative z-10">
          <div>
            <label class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Correo Electrónico</label>
            <input type="email" formControlName="email" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium" placeholder="tu@correo.com">
          </div>
          <div>
            <div class="flex justify-between items-center mb-2">
               <label class="block text-xs font-black text-slate-700 uppercase tracking-widest">Contraseña</label>
               <a href="#" class="text-[11px] font-bold text-teal-600 hover:text-teal-700">¿Olvidaste tu contraseña?</a>
            </div>
            <input type="password" formControlName="password" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium" placeholder="••••••••">
          </div>
          <button type="submit" [disabled]="loginForm.invalid" class="w-full py-5 bg-teal-600 text-white font-black text-base tracking-wide rounded-2xl hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 shadow-xl shadow-teal-500/20 active:scale-95 transition-all mt-6">
            Iniciar Sesión
          </button>
        </form>
      }

      @if(isRegisterMode()) {
        <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="space-y-4 relative z-10 animate-fade-in">
          <div>
            <label class="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5">Nombre Completo</label>
            <input type="text" formControlName="fullName" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium text-sm" placeholder="Ej: Carlos Mendoza">
          </div>
          <div>
            <label class="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5">Correo Electrónico</label>
            <input type="email" formControlName="email" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium text-sm" placeholder="tu@correo.com">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5">Teléfono</label>
              <input type="tel" formControlName="phone" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium text-sm" placeholder="987654321">
            </div>
            <div>
              <label class="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5">Contraseña</label>
              <input type="password" formControlName="password" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium text-sm" placeholder="Min. 6 char">
            </div>
          </div>
          <button type="submit" [disabled]="registerForm.invalid" class="w-full py-5 bg-indigo-600 text-white font-black text-base tracking-wide rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all mt-4">
            Crear Cuenta
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
