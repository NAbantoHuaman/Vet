import { Injectable, signal, computed } from '@angular/core';
import { User } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  
  // Base de datos de usuarios (se persiste en localStorage)
  private users: User[] = [];

  constructor() {
    this.loadUsers();
    this.loadSession();
  }

  public currentUser = this.currentUserSignal.asReadonly();
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);
  public isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');
  public isClient = computed(() => this.currentUserSignal()?.role === 'cliente');

  login(email: string, pass: string): boolean {
    const user = this.users.find(u => u.email === email && u.password === pass);
    if (user) {
      const userWithoutPass = { ...user };
      delete userWithoutPass.password;
      this.currentUserSignal.set(userWithoutPass);
      this.saveSession(userWithoutPass);
      return true;
    }
    return false;
  }

  register(data: { fullName: string; email: string; password: string; phone: string }): { success: boolean; message: string } {
    // Verificar si el email ya existe
    if (this.users.some(u => u.email === data.email)) {
      return { success: false, message: 'Este correo electrónico ya está registrado.' };
    }

    const newUser: User = {
      id: 'client_' + Math.random().toString(36).substring(2, 9),
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: 'cliente'
    };

    this.users.push(newUser);
    this.persistUsers();

    // Auto-login después del registro
    const userWithoutPass = { ...newUser };
    delete userWithoutPass.password;
    this.currentUserSignal.set(userWithoutPass);
    this.saveSession(userWithoutPass);

    return { success: true, message: 'Cuenta creada exitosamente.' };
  }

  logout(): void {
    this.currentUserSignal.set(null);
    try { localStorage.removeItem('vet_session'); } catch(e) {}
  }

  getClients(): User[] {
    return this.users.filter(u => u.role === 'cliente').map(u => {
      const safeUser = { ...u }; delete safeUser.password; return safeUser;
    });
  }

  private saveSession(user: User) {
    try { localStorage.setItem('vet_session', JSON.stringify(user)); } catch (e) {}
  }

  private loadSession() {
    try {
      const session = localStorage.getItem('vet_session');
      if (session) this.currentUserSignal.set(JSON.parse(session));
    } catch (e) {}
  }

  private persistUsers() {
    try { localStorage.setItem('vet_users', JSON.stringify(this.users)); } catch (e) {}
  }

  private loadUsers() {
    try {
      const stored = localStorage.getItem('vet_users');
      if (stored) {
        this.users = JSON.parse(stored);
      } else {
        // Usuarios iniciales (solo la primera vez)
        this.users = [
          { id: 'admin1', fullName: 'Dra. Ana López (Admin)', email: 'admin@vet.com', password: 'admin123', phone: '000000000', role: 'admin' },
          { id: 'client1', fullName: 'Juan Pérez', email: 'juan@mail.com', password: 'cliente123', phone: '987654321', role: 'cliente' },
          { id: 'client2', fullName: 'María Gómez', email: 'maria@mail.com', password: 'cliente123', phone: '912345678', role: 'cliente' }
        ];
        this.persistUsers();
      }
    } catch (e) {
      this.users = [
        { id: 'admin1', fullName: 'Dra. Ana López (Admin)', email: 'admin@vet.com', password: 'admin123', phone: '000000000', role: 'admin' }
      ];
    }
  }
}
