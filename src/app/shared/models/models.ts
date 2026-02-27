export type Role = 'admin' | 'cliente';

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  role: Role;
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

export type AppointmentStatus = 'pendiente' | 'completada' | 'cancelada';

export interface Appointment {
  id: string;
  petId: string;
  clientId: string;
  date: Date;
  reason: string;
  status: AppointmentStatus;
}
