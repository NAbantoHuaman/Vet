import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetHealthService } from '../../../core/services/pet-health.service';

@Component({
  selector: 'app-vaccination-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 animate-fade-in overflow-hidden">
      <div class="px-8 pt-8 pb-2">
        <h2 class="text-2xl font-black text-gray-800 tracking-tight">Plan de Vacunación</h2>
        <p class="text-gray-400 font-medium text-sm mt-1">Registro y calendario de inmunización</p>
      </div>
      
      <div class="px-8 py-6">
        <div class="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-teal-500 before:via-gray-200 before:to-transparent">
          
          @for(vac of vaccines(); track vac.name) {
            <div class="relative flex items-center justify-between group pl-2">
              <div class="flex items-center">
                <div [class]="dotClass(vac.status)">
                  @if(vac.status === 'completed') {
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"></path></svg>
                  }
                </div>
                <div class="ml-10">
                  <p class="font-black text-gray-800 text-base">{{ vac.name }}</p>
                  <p class="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">{{ vac.date | date:'longDate' }}</p>
                </div>
              </div>
              
              <span [class]="badgeClass(vac.status)">
                {{ vac.status === 'completed' ? 'Aplicada' : 'Pendiente' }}
              </span>
            </div>
          }
        </div>
      </div>

      <div class="px-8 pb-8">
        <div class="p-6 bg-gradient-to-r from-indigo-50 to-white rounded-2xl border border-indigo-100/50 flex items-center gap-5 shadow-sm">
          <div class="p-3.5 bg-white rounded-xl shadow-sm shadow-indigo-200/50 shrink-0">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p class="text-indigo-900 text-[15px] font-medium leading-relaxed">Próximo refuerzo: <span class="font-black text-indigo-700">Parvovirus</span> en <span class="font-black text-indigo-700">45 días</span>.</p>
        </div>
      </div>
    </div>
  `
})
export class VaccinationTimelineComponent {
  @Input() petId: string = '1';
  private healthService = inject(PetHealthService);

  vaccines = () => this.healthService.getHealthByPet(this.petId)?.vaccines || [];

  dotClass(status: string) {
    const base = "absolute left-0 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10 transition-all ";
    return status === 'completed' ? base + "bg-teal-500 text-white" : base + "bg-gray-200 text-gray-400";
  }

  badgeClass(status: string) {
    const base = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ";
    return status === 'completed' ? base + "bg-teal-100 text-teal-600" : base + "bg-orange-100 text-orange-600";
  }
}
