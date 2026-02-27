import { Component, Input, computed, signal } from '@angular/core';
import { Pet, Appointment, User } from '../../shared/models/models';
import { DatePipe } from '@angular/common';
import { AppointmentStatusPipe } from '../../shared/pipes/appointment-status.pipe';

@Component({
  selector: 'app-pet-history',
  standalone: true,
  imports: [DatePipe, AppointmentStatusPipe],
  template: `
    <div class="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 min-h-[600px] animate-fade-in-up">
      <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 class="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
          <div class="p-3 bg-purple-100 text-purple-600 rounded-2xl">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          {{ isAdmin ? 'Historial Clínico Global' : 'Historial de mis Mascotas' }}
        </h2>

        <div class="w-full md:w-96 relative">
          <svg class="w-5 h-5 absolute left-4 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <select (change)="selectPet($event)" class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white text-gray-700 font-medium appearance-none transition-colors shadow-sm cursor-pointer">
            <option value="">Selecciona un paciente para buscar...</option>
            @for(pet of pets; track pet.id) {
              <option [value]="pet.id">{{ pet.name }} {{ isAdmin ? '(Dueño: ' + getOwnerName(pet.ownerId) + ')' : '' }}</option>
            }
          </select>
        </div>
      </div>

      @if(!selectedPet()) {
        <div class="flex flex-col items-center justify-center py-20 text-center opacity-70">
          <svg class="w-32 h-32 text-gray-200 mb-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
          <h3 class="text-2xl font-bold text-gray-400">Selecciona un paciente</h3>
        </div>
      }

      @if(selectedPet()) {
        <div class="animate-fade-in">
          <!-- Tarjeta Perfil -->
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 flex items-center gap-6 mb-10 shadow-sm">
            <img [src]="selectedPet()?.imageUrl" class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md z-10 bg-purple-100">
            <div class="z-10">
              <h3 class="text-3xl font-extrabold text-gray-900 mb-1">{{ selectedPet()?.name }}</h3>
              <div class="flex gap-3 mt-2">
                <span class="px-3 py-1 bg-white text-purple-700 rounded-full text-sm font-semibold shadow-sm">🐾 {{ selectedPet()?.species }}</span>
                <span class="px-3 py-1 bg-white text-purple-700 rounded-full text-sm font-semibold shadow-sm">🎂 {{ selectedPet()?.age }} años</span>
              </div>
            </div>
          </div>

          <h4 class="text-xl font-bold text-gray-800 mb-6">Registro de Atenciones</h4>
          <div class="relative border-l-2 border-purple-100 ml-6 space-y-8 pb-4">
            @if(filteredAppointments().length === 0) {
              <div class="pl-8 text-gray-500 italic">No hay registros de atención previos.</div>
            }
            @for(app of filteredAppointments(); track app.id) {
              <div class="relative pl-8 md:pl-10">
                <div class="absolute -left-[9px] top-2 w-4 h-4 rounded-full border-4 border-white"
                     [class.bg-yellow-400]="app.status === 'pendiente'"
                     [class.bg-green-500]="app.status === 'completada'"
                     [class.bg-red-500]="app.status === 'cancelada'"></div>
                
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div class="flex justify-between items-start mb-3 gap-2">
                    <span class="font-bold text-lg text-gray-800">{{ app.date | date:'longDate' }}</span>
                    <span class="text-sm px-3 py-1 bg-gray-50 border rounded-full font-semibold">{{ app.status | appointmentStatus }}</span>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-xl">
                    <span class="block text-xs font-bold text-gray-500 uppercase mb-1">Motivo / Notas médicas:</span>
                    <p class="text-gray-700">{{ app.reason }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class PetHistoryComponent {
  @Input() pets: Pet[] = [];
  @Input() appointments: Appointment[] = [];
  @Input() clients: User[] = [];
  @Input() isAdmin: boolean = false;

  selectedPetId = signal<string | null>(null);
  selectedPet = computed(() => this.pets.find(p => p.id === this.selectedPetId()) || null);
  filteredAppointments = computed(() => this.appointments.filter(a => a.petId === this.selectedPetId()).sort((a, b) => b.date.getTime() - a.date.getTime()));

  getOwnerName(ownerId: string): string { return this.clients.find(c => c.id === ownerId)?.fullName || 'Desconocido'; }
  selectPet(event: any) { this.selectedPetId.set(event.target.value || null); }
}
