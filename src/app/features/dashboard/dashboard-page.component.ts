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
      
      <!-- Header -->
      <div>
        <h1 class="text-4xl font-black text-gray-900">
          @if(auth.isAdmin()) { Panel de Administración } @else { Mi Portal }
        </h1>
        <p class="text-gray-500 mt-1">Bienvenido/a, <span class="font-semibold text-teal-600">{{ auth.currentUser()?.fullName }}</span>. Aquí tienes tu resumen de actividad.</p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div class="p-3 bg-teal-100 rounded-xl w-fit mb-3"><svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg></div>
          <p class="text-3xl font-black text-gray-900">{{ totalPets() }}</p>
          <p class="text-sm text-gray-500 font-medium">Pacientes</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div class="p-3 bg-amber-100 rounded-xl w-fit mb-3"><svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
          <p class="text-3xl font-black text-amber-600">{{ pendingAppointments() }}</p>
          <p class="text-sm text-gray-500 font-medium">Pendientes</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div class="p-3 bg-green-100 rounded-xl w-fit mb-3"><svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
          <p class="text-3xl font-black text-green-600">{{ completedAppointments() }}</p>
          <p class="text-sm text-gray-500 font-medium">Completadas</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div class="p-3 bg-red-100 rounded-xl w-fit mb-3"><svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg></div>
          <p class="text-3xl font-black text-red-500">{{ cancelledAppointments() }}</p>
          <p class="text-sm text-gray-500 font-medium">Canceladas</p>
        </div>
      </div>

      <!-- Contenido: Próximas Citas + Pacientes Recientes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <!-- Próximas Citas -->
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 class="text-xl font-bold text-gray-800 mb-5">Próximas Citas</h3>
          
          @if(upcomingAppointments().length === 0) {
            <div class="flex flex-col items-center justify-center py-12 text-center opacity-60">
              <svg class="w-14 h-14 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <p class="text-gray-400 font-semibold text-sm">No hay citas próximas</p>
            </div>
          }

          <div class="space-y-3">
            @for(appt of upcomingAppointments(); track appt.id) {
              <div class="flex items-center gap-4 p-4 bg-gray-50/80 rounded-xl border border-gray-100 hover:bg-gray-100/80 transition-colors">
                <div class="shrink-0 w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex flex-col items-center justify-center text-xs font-black leading-tight">
                  <span>{{ appt.date | date:'dd' }}</span>
                  <span class="text-[10px] uppercase font-semibold">{{ appt.date | date:'MMM' }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-gray-800 truncate">{{ getPetName(appt.petId) }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ appt.reason }} · {{ appt.date | date:'shortTime' }}</p>
                </div>
                <span class="text-xs px-2.5 py-1 bg-white border rounded-full font-semibold shrink-0">{{ appt.status | appointmentStatus }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Pacientes Recientes -->
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
              <div class="flex items-center gap-4 p-4 bg-gray-50/80 rounded-xl border border-gray-100 hover:bg-gray-100/80 transition-colors">
                <img [src]="pet.imageUrl" class="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0">
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-gray-800 truncate">{{ pet.name }}</p>
                  <p class="text-xs text-gray-500">{{ pet.species }} · {{ pet.breed }} · {{ pet.age }} años</p>
                </div>
                <span class="text-xs px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-full font-semibold shrink-0">{{ getAppointmentCount(pet.id) }} citas</span>
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

  totalPets = computed(() => this.dataService.pets().length);
  pendingAppointments = computed(() => this.dataService.appointments().filter(a => a.status === 'pendiente').length);
  completedAppointments = computed(() => this.dataService.appointments().filter(a => a.status === 'completada').length);
  cancelledAppointments = computed(() => this.dataService.appointments().filter(a => a.status === 'cancelada').length);
  
  upcomingAppointments = computed(() => {
    return this.dataService.appointments()
      .filter(a => a.status === 'pendiente')
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
