export type Role = 'admin' | 'cliente';

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  role: Role;
  getDashboardUrl?(): string;
}

// Implementación de POO para la evaluación (Abstracción, Herencia, Polimorfismo y Encapsulamiento)
export abstract class BaseUser implements User {
  constructor(
    public id: string,
    public fullName: string,
    public email: string,
    public phone: string,
    public role: Role,
    public password?: string
  ) {}

  // Método abstracto (Polimorfismo)
  abstract getDashboardUrl(): string;
  
  // Encapsulamiento de lógica de visualización
  getDisplayName(): string {
    return `${this.fullName} (${this.role})`;
  }
}

export class AdminUser extends BaseUser {
  constructor(id: string, fullName: string, email: string, phone: string, password?: string) {
    super(id, fullName, email, phone, 'admin', password);
  }

  // Polimorfismo
  getDashboardUrl(): string {
    return '/dashboard/admin-overview';
  }
}

export class ClientUser extends BaseUser {
  constructor(id: string, fullName: string, email: string, phone: string, password?: string) {
    super(id, fullName, email, phone, 'cliente', password);
  }

  // Polimorfismo
  getDashboardUrl(): string {
    return '/dashboard/client-overview';
  }
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  imageUrl: string;
}

export type AppointmentStatus = 'reservado' | 'en_camino_recojo' | 'mascota_recogida' | 'en_atencion' | 'de_regreso' | 'entregado' | 'cancelada';
export type ServiceType = 'medico' | 'estetica' | 'guarderia';

export interface ServiceExtra {
  name: string;
  price: number;
}

export interface TrackingStep {
  status: AppointmentStatus;
  timestamp: string;
}

export interface Appointment {
  id: string;
  petId: string;
  clientId: string;
  serviceType: ServiceType;
  date: Date;
  reason: string;
  status: AppointmentStatus;
  basePrice: number;
  extras: ServiceExtra[];
  totalCharged?: number;
  tracking: TrackingStep[];
}
