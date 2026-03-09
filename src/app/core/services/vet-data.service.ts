import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { Pet, Appointment, AppointmentStatus, ServiceExtra } from '../../shared/models/models';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { PetHealthService } from './pet-health.service';
import { PaymentService } from './payment.service';

@Injectable({ providedIn: 'root' })
export class VetDataService {
  private petsSignal = signal<Pet[]>([]);
  private appointmentsSignal = signal<Appointment[]>([]);
  private auth = inject(AuthService);
  private toastObj = inject(ToastService);
  private healthService = inject(PetHealthService);
  private paymentService = inject(PaymentService);

  constructor() {
    this.loadInitialData();

    effect(() => {
      localStorage.setItem('vet_pets', JSON.stringify(this.petsSignal()));
    });

    effect(() => {
      localStorage.setItem('vet_appointments', JSON.stringify(this.appointmentsSignal()));
    });
  }


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


  addPet(petData: Omit<Pet, 'id' | 'imageUrl'>): void {
    const petId = this.generateId();
    const newPet: Pet = { 
      ...petData, 
      id: petId, 
      imageUrl: this.getPetImage(petData.species, petId, petData.breed)
    };
    this.petsSignal.update(pets => [...pets, newPet]);
    this.toastObj.show(`Mascota ${newPet.name} registrada exitosamente`, 'success');
  }

  addAppointment(appointmentData: Omit<Appointment, 'id' | 'status' | 'extras' | 'totalCharged' | 'tracking'>): void {
    const now = new Date().toISOString();
    const newAppointment: Appointment = {
      ...appointmentData,
      id: this.generateId(),
      status: 'reservado',
      extras: [],
      tracking: [{ status: 'reservado', timestamp: now }],
    };
    this.appointmentsSignal.update(apps => [...apps, newAppointment].sort((a, b) => a.date.getTime() - b.date.getTime()));
    this.toastObj.show('Reserva de servicio programada con éxito', 'success');
  }

  private readonly PIPELINE: AppointmentStatus[] = [
    'reservado', 'en_camino_recojo', 'mascota_recogida', 'en_atencion', 'de_regreso', 'entregado'
  ];

  private readonly STATUS_MESSAGES: Record<string, string> = {
    'en_camino_recojo': 'Equipo en camino a recoger a tu mascota',
    'mascota_recogida': 'Tu mascota ha sido recogida exitosamente',
    'en_atencion': 'Tu mascota está siendo atendida',
    'de_regreso': 'Tu mascota va de regreso a casa',
    'entregado': 'Tu mascota ha sido entregada. ¡Gracias!',
    'cancelada': 'Servicio cancelado',
  };

  advanceStep(id: string): void {
    const appt = this.appointmentsSignal().find(a => a.id === id);
    if (!appt) return;

    const currentIndex = this.PIPELINE.indexOf(appt.status);
    if (currentIndex === -1 || currentIndex >= this.PIPELINE.length - 1) return;

    const nextStatus = this.PIPELINE[currentIndex + 1];
    const now = new Date().toISOString();

    this.appointmentsSignal.update(apps => apps.map(app => 
      app.id === id ? { 
        ...app, 
        status: nextStatus, 
        tracking: [...app.tracking, { status: nextStatus, timestamp: now }] 
      } : app
    ));

    this.toastObj.show(this.STATUS_MESSAGES[nextStatus] || 'Estado actualizado', 'info');
  }

  cancelService(id: string): void {
    const now = new Date().toISOString();
    this.appointmentsSignal.update(apps => apps.map(app => 
      app.id === id ? { ...app, status: 'cancelada' as AppointmentStatus, tracking: [...app.tracking, { status: 'cancelada' as AppointmentStatus, timestamp: now }] } : app
    ));
    this.toastObj.show('Servicio cancelado', 'info');
  }

  completeServiceWithExtras(id: string, extras: ServiceExtra[]): void {
    const appt = this.appointmentsSignal().find(a => a.id === id);
    if (!appt) return;

    const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);
    const totalCharged = appt.basePrice + extrasTotal;
    const now = new Date().toISOString();

    this.appointmentsSignal.update(apps => apps.map(app => 
      app.id === id ? { 
        ...app, 
        status: 'de_regreso' as AppointmentStatus, 
        extras, 
        totalCharged,
        tracking: [...app.tracking, { status: 'de_regreso' as AppointmentStatus, timestamp: now }]
      } : app
    ));

   
    const hashData = appt.petId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseWeight = (hashData % 15) + 3; 
    const variation = parseFloat(((Math.random() * 2) - 1).toFixed(1)); 

    this.healthService.addWeightRecord(appt.petId, {
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat((baseWeight + variation).toFixed(1)),
      note: `Triaje por: ${appt.reason || 'Servicio General'}`
    });

    const serviceNames: Record<string, string> = { 'medico': 'Consulta Médica', 'estetica': 'Baño y Estética', 'guarderia': 'Guardería' };
    const petName = this.petsSignal().find(p => p.id === appt.petId)?.name || 'Mascota';
    const description = `${serviceNames[appt.serviceType]} — ${petName}` + (extras.length > 0 ? ` + ${extras.length} extras` : '');

    this.paymentService.processPayment({
      clientId: appt.clientId,
      amount: totalCharged,
      date: now,
      description,
      productName: `${serviceNames[appt.serviceType]} para ${petName}`,
    });

    this.toastObj.show(`Servicio completado — Boleta S/ ${totalCharged.toFixed(2)} generada`, 'success');
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

  private getPetImage(species: string, id: string, breed: string = ''): string {
    const speciesLower = species.toLowerCase();
    const breedLower = breed.toLowerCase();
    
    let keywords = [];
    
    if (speciesLower.includes('perro') || speciesLower.includes('dog') || speciesLower.includes('can')) {
      keywords.push('dog', 'puppy');
    } else if (speciesLower.includes('gato') || speciesLower.includes('cat') || speciesLower.includes('felin')) {
      keywords.push('cat', 'kitten');
    } else if (speciesLower.includes('ave') || speciesLower.includes('bird') || speciesLower.includes('pájaro') || speciesLower.includes('loro')) {
      keywords.push('bird', 'parrot');
    } else if (speciesLower.includes('conejo') || speciesLower.includes('rabbit')) {
      keywords.push('rabbit', 'bunny');
    } else if (speciesLower.includes('hámster') || speciesLower.includes('hamster')) {
      keywords.push('hamster');
    } else {
      keywords.push('pet', 'animal');
    }

    if (breedLower && breedLower.length > 2) {
      keywords.unshift(breedLower);
    }

    const keywordParam = keywords.join(',');
    
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    const lock = Math.abs(hash) % 1000;

    return `https://loremflickr.com/400/400/${keywordParam}?lock=${lock}`;
  }

  private loadInitialData() {
    const savedPets = localStorage.getItem('vet_pets');
    if (savedPets) {
      try { this.petsSignal.set(JSON.parse(savedPets)); } catch (e) {}
    } else {
      this.petsSignal.set([]);
    }

    const savedAppts = localStorage.getItem('vet_appointments');
    if (savedAppts) {
      try {
        const parsed = JSON.parse(savedAppts);
        this.appointmentsSignal.set(parsed.map((a: any) => ({ 
          ...a, 
          date: new Date(a.date),
          tracking: a.tracking || [{ status: a.status || 'reservado', timestamp: a.date }],
          extras: a.extras || [],
          basePrice: a.basePrice || 0,
          status: a.status || 'reservado',
        })));
      } catch (e) {}
    } else {
      this.appointmentsSignal.set([]);
    }
  }
}
