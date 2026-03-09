import { Injectable, signal } from '@angular/core';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  available: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  private staff = signal<StaffMember[]>([
    { id: '1', name: 'Dr. Roberto Mendoza', role: 'Veterinario General', available: true },
    { id: '2', name: 'Lic. Elena Ruiz', role: 'Groomer / Estilista', available: true },
    { id: '3', name: 'Carlos Vega', role: 'Cuidador de Guardería', available: false },
    { id: '4', name: 'Dra. Sofía Blanco', role: 'Veterinaria Cirujana', available: true },
  ]);

  getStaff() {
    return this.staff;
  }
}
