import { Component, inject, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { VetDataService } from '../../core/services/vet-data.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AppointmentStatusPipe } from '../../shared/pipes/appointment-status.pipe';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [DatePipe, AppointmentStatusPipe],
  template: `
    <div class="space-y-8 animate-fade-in-up">
      
      <div>
        <h1 class="text-4xl font-black text-gray-900">
          @if(auth.isAdmin()) { Panel de Administración } @else { Mi Portal }
        </h1>
        <p class="text-gray-500 mt-1">Bienvenido/a, <span class="font-semibold text-teal-600">{{ auth.currentUser()?.fullName }}</span>. Aquí tienes tu resumen de actividad.</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="bg-white p-7 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-start hover:-translate-y-1 transition-all duration-300">
          <div class="p-3.5 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl mb-4 shadow-inner">
            <svg class="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </div>
          <p class="text-4xl font-black text-slate-800 tracking-tight">{{ totalPets() }}</p>
          <p class="text-sm text-slate-500 font-bold mt-1">Mis Mascotas</p>
        </div>

        <div class="bg-white p-7 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-start hover:-translate-y-1 transition-all duration-300">
          <div class="p-3.5 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl mb-4 shadow-inner">
            <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p class="text-4xl font-black text-amber-500 tracking-tight">{{ pendingAppointments() }}</p>
          <p class="text-sm text-slate-500 font-bold mt-1">Servicios Pendientes</p>
        </div>

        <div class="bg-white p-7 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-start hover:-translate-y-1 transition-all duration-300">
          <div class="p-3.5 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl mb-4 shadow-inner">
            <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p class="text-4xl font-black text-indigo-500 tracking-tight">{{ completedAppointments() }}</p>
          <p class="text-sm text-slate-500 font-bold mt-1">Completados</p>
        </div>

        <div class="bg-white p-7 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-start hover:-translate-y-1 transition-all duration-300">
          <div class="p-3.5 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl mb-4 shadow-inner">
            <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
          </div>
          <p class="text-4xl font-black text-red-400 tracking-tight">{{ cancelledAppointments() }}</p>
          <p class="text-sm text-slate-500 font-bold mt-1">Cancelados</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 class="text-xl font-bold text-gray-800 mb-5">Próximos Servicios</h3>
          
          @if(upcomingAppointments().length === 0) {
            <div class="flex flex-col items-center justify-center py-12 text-center opacity-60">
              <svg class="w-14 h-14 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <p class="text-gray-400 font-semibold text-sm">No hay servicios próximos</p>
            </div>
          }

          <div class="space-y-3">
            @for(appt of upcomingAppointments(); track appt.id) {
              <div class="flex items-center gap-5 p-5 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                <div class="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 flex flex-col items-center justify-center text-sm font-black leading-tight shadow-inner group-hover:scale-105 transition-transform">
                  <span>{{ appt.date | date:'dd' }}</span>
                  <span class="text-[10px] uppercase font-semibold">{{ appt.date | date:'MMM' }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-lg font-black text-gray-900 truncate tracking-tight">{{ getPetName(appt.petId) }}</p>
                  <p class="text-sm font-medium text-gray-500 truncate mt-0.5">{{ appt.reason }} · {{ appt.date | date:'shortTime' }}</p>
                </div>
                <span class="text-[10px] px-3 py-1.5 uppercase tracking-widest bg-white border border-gray-100 rounded-xl font-black text-gray-600 shrink-0 shadow-sm">{{ appt.status | appointmentStatus }}</span>
              </div>
            }
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 class="text-xl font-bold text-gray-800 mb-5">Pacientes Registrados</h3>
          
          @if(recentPets().length === 0) {
            <div class="flex flex-col items-center justify-center py-12 text-center opacity-60">
              <svg class="w-14 h-14 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              <p class="text-gray-400 font-semibold text-sm">No hay pacientes registrados</p>
            </div>
          }

          <div class="space-y-3">
            @for(pet of recentPets(); track pet.id) {
              <div class="flex items-center gap-5 p-5 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group cursor-pointer" (click)="goTo('client-pets')">
                <div class="relative w-14 h-14 shrink-0">
                  <div class="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner" [class.hidden]="!imageErrorMap[pet.id] && pet.imageUrl">
                    {{ pet.name.charAt(0).toUpperCase() }}
                  </div>
                  <img [src]="pet.imageUrl" (error)="imageErrorMap[pet.id] = true" class="absolute inset-0 w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" [class.hidden]="imageErrorMap[pet.id] || !pet.imageUrl">
                </div>
                
                <div class="flex-1 min-w-0">
                  <p class="text-lg font-black text-gray-900 truncate tracking-tight">{{ pet.name }}</p>
                  <p class="text-sm font-medium text-gray-500 mt-0.5">{{ pet.species }} · {{ pet.breed }} · {{ pet.age }} años</p>
                </div>
                <span class="text-[10px] px-3 py-1.5 uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-100 shadow-sm rounded-xl font-black shrink-0">{{ getAppointmentCount(pet.id) }} servicios</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardPageComponent {
  public auth = inject(AuthService);
  private dataService = inject(VetDataService);
  private router = inject(Router);

  imageErrorMap: { [key: string]: boolean } = {};

  totalPets = computed(() => this.dataService.pets().length);
  pendingAppointments = computed(() => this.dataService.appointments().filter(a => a.status === 'reservado' || a.status === 'en_camino_recojo' || a.status === 'mascota_recogida' || a.status === 'en_atencion' || a.status === 'de_regreso').length);
  completedAppointments = computed(() => this.dataService.appointments().filter(a => a.status === 'entregado').length);
  cancelledAppointments = computed(() => this.dataService.appointments().filter(a => a.status === 'cancelada').length);
  
  upcomingAppointments = computed(() => {
    return this.dataService.appointments()
      .filter(a => a.status !== 'entregado' && a.status !== 'cancelada')
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  });

  recentPets = computed(() => this.dataService.pets().slice(0, 5));

  getPetName(petId: string): string {
    return this.dataService.pets().find(p => p.id === petId)?.name || 'Desconocido';
  }

  getAppointmentCount(petId: string): number {
    return this.dataService.appointments().filter(a => a.petId === petId).length;
  }

  goTo(path: string) { this.router.navigate(['/' + path]); }
}
