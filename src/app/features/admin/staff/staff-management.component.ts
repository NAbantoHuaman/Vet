import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffService } from '../../../core/services/staff.service';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Equipo VetCare</h1>
        <p class="text-slate-500 font-medium leading-tight mt-1">Gestión del equipo veterinario y disponibilidad</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @for(doctor of staffService.getStaff()(); track doctor.id) {
          <div class="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 group hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
            <div class="relative w-24 h-24 mx-auto mb-6">
              <div class="w-full h-full rounded-[1.5rem] bg-slate-50 border border-slate-100/50 text-teal-600 flex items-center justify-center text-4xl font-black shadow-inner">
                {{ doctor.name[3] }}
              </div>
              <div [class]="statusClass(doctor.available)"></div>
            </div>
            
            <div class="text-center">
              <h3 class="font-black text-gray-900 text-xl tracking-tight leading-tight mb-2">{{ doctor.name }}</h3>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{{ doctor.role }}</p>
              
              <div class="flex items-center justify-center gap-3">
                <button class="flex-1 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100/50 text-slate-600 hover:text-gray-900 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm">Perfil</button>
                <button class="flex-1 py-3 bg-teal-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-teal-500/20 hover:bg-teal-700 active:scale-95 transition-all">Turnos</button>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30">
        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div class="text-center md:text-left">
            <h2 class="text-3xl font-black mb-3 tracking-tight">Calendario de Guardias</h2>
            <p class="text-indigo-100 font-medium text-[15px]">Configura los turnos rotativos y festivos del equipo clínico.</p>
          </div>
          <button class="px-8 py-4.5 bg-white text-indigo-600 font-black text-[13px] uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
            Gestionar Horario Semanal
          </button>
        </div>
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  `
})
export class StaffManagementComponent {
  public staffService = inject(StaffService);

  statusClass(available: boolean) {
    const base = "absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full shadow-sm ";
    return base + (available ? "bg-teal-500" : "bg-red-500");
  }
}
