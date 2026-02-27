import { Injectable, signal, inject, computed } from '@angular/core';
import { Pet, Appointment, AppointmentStatus } from '../../shared/models/models';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class VetDataService {
  private petsSignal = signal<Pet[]>([]);
  private appointmentsSignal = signal<Appointment[]>([]);
  private auth = inject(AuthService);
  private toastObj = inject(ToastService);

  constructor() {
    this.loadInitialMockData();
  }

  // Getters reactivos que filtran automáticamente según el rol usando computed()
  get pets() { 
    return computed(() => {
      const user = this.auth.currentUser();
      if (!user) return [];
      if (user.role === 'admin') return this.petsSignal();
      return this.petsSignal().filter(p => p.ownerId === user.id);
    });
  }

  get appointments() {
    return computed(() => {
      const user = this.auth.currentUser();
      if (!user) return [];
      if (user.role === 'admin') return this.appointmentsSignal();
      return this.appointmentsSignal().filter(a => a.clientId === user.id);
    });
  }

  // Métodos CRUD
  addPet(petData: Omit<Pet, 'id' | 'imageUrl'>): void {
    const petId = this.generateId();
    const newPet: Pet = { 
      ...petData, 
      id: petId, 
      imageUrl: this.getPetImage(petData.species, petId)
    };
    this.petsSignal.update(pets => [...pets, newPet]);
    this.toastObj.show(`Mascota ${newPet.name} registrada exitosamente`, 'success');
  }

  addAppointment(appointmentData: Omit<Appointment, 'id' | 'status'>): void {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: this.generateId(),
      status: 'pendiente'
    };
    this.appointmentsSignal.update(apps => [...apps, newAppointment].sort((a, b) => a.date.getTime() - b.date.getTime()));
    this.toastObj.show('Cita programada con éxito', 'success');
  }

  updateAppointmentStatus(id: string, newStatus: AppointmentStatus): void {
    this.appointmentsSignal.update(apps => apps.map(app => app.id === id ? { ...app, status: newStatus } : app));
    this.toastObj.show(`Estado de la cita actualizado a ${newStatus}`, 'info');
  }

  updatePet(id: string, data: Partial<Pet>): void {
    this.petsSignal.update(pets => pets.map(p => p.id === id ? { ...p, ...data } : p));
    this.toastObj.show('Datos de la mascota actualizados correctamente', 'success');
  }

  updateAppointment(id: string, data: Partial<Appointment>): void {
    this.appointmentsSignal.update(apps => 
      apps.map(a => a.id === id ? { ...a, ...data } : a)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
    );
    this.toastObj.show('Cita actualizada correctamente', 'success');
  }

  deletePet(id: string): void {
    this.petsSignal.update(pets => pets.filter(p => p.id !== id));
    this.appointmentsSignal.update(apps => apps.filter(a => a.petId !== id));
    this.toastObj.show('Mascota eliminada del sistema', 'info');
  }

  private generateId(): string { return Math.random().toString(36).substring(2, 9); }

  private getPetImage(species: string, id: string): string {
    let keyword = species === 'Perro' ? 'dog,puppy' : species === 'Gato' ? 'cat,kitten' : species === 'Ave' ? 'bird,parrot' : 'pet,cute';
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return `https://loremflickr.com/200/200/${keyword}?lock=${Math.abs(hash) % 1000}`;
  }

  private loadInitialMockData() {
    // La app arranca vacía. Los datos se crean en tiempo real
    // al registrar mascotas y agendar citas desde el portal.
    this.petsSignal.set([]);
    this.appointmentsSignal.set([]);
  }
}
