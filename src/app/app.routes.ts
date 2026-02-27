import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  
  // Admin Routes
  { path: 'admin-dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent) },
  { path: 'admin-pets', canActivate: [authGuard], loadComponent: () => import('./features/pets/pets-page.component').then(m => m.PetsPageComponent) },
  { path: 'admin-appointments', canActivate: [authGuard], loadComponent: () => import('./features/appointments/appointments-page.component').then(m => m.AppointmentsPageComponent) },
  { path: 'admin-history', canActivate: [authGuard], loadComponent: () => import('./features/history/history-page.component').then(m => m.HistoryPageComponent) },
  
  // Client Routes
  { path: 'client-dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent) },
  { path: 'client-pets', canActivate: [authGuard], loadComponent: () => import('./features/pets/pets-page.component').then(m => m.PetsPageComponent) },
  { path: 'client-appointments', canActivate: [authGuard], loadComponent: () => import('./features/appointments/appointments-page.component').then(m => m.AppointmentsPageComponent) },
  { path: 'client-history', canActivate: [authGuard], loadComponent: () => import('./features/history/history-page.component').then(m => m.HistoryPageComponent) },
  
  { path: '**', redirectTo: 'home' }
];
