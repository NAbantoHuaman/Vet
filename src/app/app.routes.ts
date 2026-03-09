import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  
  { path: 'admin-dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent) },
  { path: 'admin-pets', canActivate: [authGuard], loadComponent: () => import('./features/pets/pets-page.component').then(m => m.PetsPageComponent) },
  { path: 'admin-appointments', canActivate: [authGuard], loadComponent: () => import('./features/appointments/appointments-page.component').then(m => m.AppointmentsPageComponent) },
  { path: 'admin-history', canActivate: [authGuard], loadComponent: () => import('./features/history/history-page.component').then(m => m.HistoryPageComponent) },
  
  { path: 'client-dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent) },
  { path: 'client-pets', canActivate: [authGuard], loadComponent: () => import('./features/pets/pets-page.component').then(m => m.PetsPageComponent) },
  { path: 'client-appointments', canActivate: [authGuard], loadComponent: () => import('./features/appointments/appointments-page.component').then(m => m.AppointmentsPageComponent) },
  { path: 'client-history', canActivate: [authGuard], loadComponent: () => import('./features/history/history-page.component').then(m => m.HistoryPageComponent) },
  
  { path: 'admin-inventory', canActivate: [authGuard], loadComponent: () => import('./features/admin/inventory/admin-inventory.component').then(m => m.AdminInventoryComponent) },
  { path: 'admin-staff', canActivate: [authGuard], loadComponent: () => import('./features/admin/staff/staff-management.component').then(m => m.StaffManagementComponent) },
  { path: 'client-store', canActivate: [authGuard], loadComponent: () => import('./features/store/store.component').then(m => m.StoreComponent) },
  { path: 'client-billing', canActivate: [authGuard], loadComponent: () => import('./features/client/billing/billing.component').then(m => m.BillingComponent) },
  
  { path: '**', redirectTo: 'home' }
];
