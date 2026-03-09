import { Component, Input, computed, signal } from '@angular/core';
import { Pet, Appointment, User } from '../../shared/models/models';
import { DatePipe } from '@angular/common';
import { AppointmentStatusPipe } from '../../shared/pipes/appointment-status.pipe';

@Component({
  selector: 'app-pet-history',
  standalone: true,
  imports: [DatePipe, AppointmentStatusPipe],
  template: `
    <div class="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 min-h-[600px] animate-fade-in-up">
      <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 class="text-3xl font-black text-gray-800 flex items-center gap-3">
          <div class="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100/50 shadow-sm">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          {{ isAdmin ? 'Historial Clínico Global' : 'Historial de mis Mascotas' }}
        </h2>

        <div class="w-full md:w-96 relative group">
          <svg class="w-5 h-5 absolute left-4 top-3.5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <select (change)="selectPet($event)" class="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-slate-700 font-medium appearance-none shadow-inner cursor-pointer">
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
          <div class="bg-gradient-to-r from-purple-50/80 to-pink-50/50 rounded-[2rem] p-6 border border-purple-100/50 flex items-center gap-6 mb-10 shadow-sm">
            
            <div class="relative w-24 h-24 shrink-0 bg-white p-1 rounded-full shadow-md z-10">
              <div class="absolute inset-1 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-4xl shadow-inner" [class.hidden]="!imageErrorMap[selectedPet()!.id] && selectedPet()?.imageUrl">
                {{ selectedPet()?.name?.charAt(0)?.toUpperCase() }}
              </div>
              <img [src]="selectedPet()?.imageUrl" (error)="imageErrorMap[selectedPet()!.id] = true" class="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full object-cover" [class.hidden]="imageErrorMap[selectedPet()!.id] || !selectedPet()?.imageUrl">
            </div>

            <div class="z-10">
              <h3 class="text-3xl font-black text-gray-900 mb-2 tracking-tight">{{ selectedPet()?.name }}</h3>
              <div class="flex flex-wrap gap-2 mt-2">
                <span class="flex items-center gap-1.5 px-4 py-1.5 bg-white text-purple-700 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border border-purple-50/50">
                  <svg class="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12,4c2.2,0,4,1.8,4,4c0,2.2-1.8,4-4,4s-4-1.8-4-4C8,5.8,9.8,4,12,4z M6.6,18.4c1.1-1.1,2.8-1.5,4.3-1l0.3,0.1c0.5,0.2,1,0.2,1.5,0l0.3-0.1c1.5-0.5,3.2-0.2,4.3,1c1.2,1.2,1.7,2.8,1.4,4.4C18,24,16.5,25,14.8,25h-5.6C7.5,25,6,24,5.3,22.8c-0.3-1.6,0.2-3.2,1.4-4.4z M17,2c1.7,0,3,1.3,3,3c0,1.7-1.3,3-3,3s-3-1.3-3-3C14,3.3,15.3,2,17,2C17,2,17,2,17,2z M7,2C8.7,2,10,3.3,10,5c0,1.7-1.3,3-3,3S4,6.7,4,5C4,3.3,5.3,2,7,2z M3.5,8c1.4,0,2.5,1.1,2.5,2.5c0,1.4-1.1,2.5-2.5,2.5C2.1,13,1,11.9,1,10.5C1,9.1,2.1,8,3.5,8z M20.5,8c1.4,0,2.5,1.1,2.5,2.5c0,1.4-1.1,2.5-2.5,2.5c-1.4,0-2.5-1.1-2.5-2.5C18,9.1,19.1,8,20.5,8z"/></svg>
                  {{ selectedPet()?.species }}
                </span>
                <span class="flex items-center gap-1.5 px-4 py-1.5 bg-white text-purple-700 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border border-purple-50/50">
                  <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"></path></svg>
                  {{ selectedPet()?.age }} años
                </span>
              </div>
            </div>
          </div>

          <h4 class="text-2xl font-black text-gray-800 mb-8 tracking-tight">Registro de Atenciones</h4>
          <div class="relative border-l-2 border-slate-100 ml-6 space-y-8 pb-4">
            @if(filteredAppointments().length === 0) {
              <div class="pl-8 text-slate-400 italic">No hay registros de atención previos.</div>
            }
            @for(app of filteredAppointments(); track app.id) {
              <div class="relative pl-8 md:pl-10 group">
                <div class="absolute -left-[9px] top-2 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-transform group-hover:scale-125 duration-300"
                     [class.bg-amber-400]="app.status === 'reservado' || app.status === 'en_camino_recojo' || app.status === 'mascota_recogida'"
                     [class.bg-indigo-500]="app.status === 'en_atencion' || app.status === 'de_regreso'"
                     [class.bg-teal-500]="app.status === 'entregado'"
                     [class.bg-red-500]="app.status === 'cancelada'"></div>
                
                <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-shadow">
                  <div class="flex justify-between items-start mb-4 gap-4 flex-wrap">
                    <span class="font-black text-xl text-gray-900 tracking-tight">{{ app.date | date:'longDate' }}</span>
                    <span class="text-[11px] px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full font-black uppercase tracking-widest text-slate-600 shadow-sm whitespace-nowrap">{{ app.status | appointmentStatus }}</span>
                  </div>
                  <div class="bg-slate-50/50 p-5 rounded-2xl border border-slate-50">
                    <span class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Motivo / Notas médicas:</span>
                    <p class="text-slate-700 leading-relaxed font-medium">{{ app.reason }}</p>
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
  imageErrorMap: { [key: string]: boolean } = {};
  
  selectedPet = computed(() => this.pets.find(p => p.id === this.selectedPetId()) || null);
  filteredAppointments = computed(() => this.appointments.filter(a => a.petId === this.selectedPetId()).sort((a, b) => b.date.getTime() - a.date.getTime()));

  getOwnerName(ownerId: string): string { return this.clients.find(c => c.id === ownerId)?.fullName || 'Desconocido'; }
  selectPet(event: any) { this.selectedPetId.set(event.target.value || null); }
}
