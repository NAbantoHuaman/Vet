import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Pet, Appointment, AppointmentStatus, User } from '../../shared/models/models';
import { DatePipe } from '@angular/common';
import { AppointmentStatusPipe } from '../../shared/pipes/appointment-status.pipe';
import { HighlightUpcomingDirective } from '../../shared/directives/highlight-upcoming.directive';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, AppointmentStatusPipe, HighlightUpcomingDirective],
  template: `
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in-up">
      <div class="xl:col-span-4">
        <div class="bg-white p-6 rounded-3xl shadow-xl border border-indigo-50 sticky top-24">
          <h3 class="text-2xl font-bold mb-6 text-gray-800">
            @if(editingApptId()) { ✏️ Editando Cita } @else { Agendar Cita }
          </h3>
          <form [formGroup]="apptForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Seleccionar Mascota</label>
              <select formControlName="petId" class="w-full p-3 bg-gray-50 border rounded-xl focus:ring-indigo-500 focus:ring-2">
                <option value="">Seleccione...</option>
                @for(pet of pets; track pet.id) { <option [value]="pet.id">{{ pet.name }} ({{ pet.species }})</option> }
              </select>
            </div>
            <div><label class="block text-sm font-bold text-gray-700 mb-2">Fecha y Hora</label><input type="datetime-local" formControlName="date" class="w-full p-3 bg-gray-50 border rounded-xl focus:ring-indigo-500 focus:ring-2"></div>
            <div><label class="block text-sm font-bold text-gray-700 mb-2">Motivo</label><textarea formControlName="reason" rows="3" class="w-full p-3 bg-gray-50 border rounded-xl focus:ring-indigo-500 focus:ring-2"></textarea></div>
            <button type="submit" [disabled]="apptForm.invalid" class="w-full py-3.5 text-white font-bold rounded-xl disabled:bg-gray-300 shadow-md"
                    [class]="editingApptId() ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'">
              {{ editingApptId() ? 'Actualizar Cita' : 'Confirmar Cita' }}
            </button>

            @if(editingApptId()) {
              <button type="button" (click)="cancelEdit()" class="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">
                Cancelar Edición
              </button>
            }
          </form>
        </div>
      </div>

      <div class="xl:col-span-8">
        <div class="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 min-h-[500px]">
          <h3 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">{{ isAdmin ? 'Gestión de Citas (Global)' : 'Mis Próximas Citas' }}</h3>
          
          @if(isAdmin) {
            <!-- TABLA DE ADMINISTRADOR -->
            <div class="overflow-x-auto rounded-2xl border border-gray-100">
              <table class="w-full text-left border-collapse">
                <thead class="bg-gray-50 text-gray-700">
                  <tr>
                    <th class="p-4 font-bold border-b">Paciente</th>
                    <th class="p-4 font-bold border-b">Fecha programada</th>
                    <th class="p-4 font-bold border-b">Estado</th>
                    <th class="p-4 font-bold border-b text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @if(appointments.length === 0) {
                    <tr><td colspan="4" class="p-8 text-center text-gray-500">No hay citas registradas.</td></tr>
                  }
                  @for(app of appointments; track app.id) {
                    <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors" [class.bg-amber-50]="editingApptId() === app.id">
                      <td class="p-4 flex items-center gap-3">
                        <img [src]="getPetImage(app.petId)" class="w-10 h-10 rounded-full object-cover border border-gray-200">
                        <div>
                          <span class="font-bold text-gray-800 block">{{ getPetName(app.petId) }}</span>
                          <span class="text-xs text-gray-500 max-w-[150px] truncate block">{{ app.reason }}</span>
                        </div>
                      </td>
                      <td class="p-4 text-sm text-gray-600 font-medium">{{ app.date | date:'short' }}</td>
                      <td class="p-4">
                        <span class="text-xs px-2 py-1 bg-gray-100 rounded-full font-semibold">{{ app.status | appointmentStatus }}</span>
                      </td>
                      <td class="p-4 text-right">
                        <div class="flex justify-end gap-2">
                          <!-- Botón Editar (siempre visible) -->
                          <button aria-label="Editar cita" (click)="startEdit(app)" class="p-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors" title="Editar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </button>
                          @if(app.status === 'pendiente') {
                            <button aria-label="Marcar cita como completada" (click)="onStatusChange.emit({id: app.id, status: 'completada'})" class="p-2 bg-green-50 text-green-700 font-medium hover:bg-green-100 rounded-lg transition-colors" title="Completar">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                            </button>
                            <button aria-label="Cancelar cita" (click)="onStatusChange.emit({id: app.id, status: 'cancelada'})" class="p-2 bg-red-50 text-red-700 font-medium hover:bg-red-100 rounded-lg transition-colors" title="Cancelar">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="space-y-4">
              @if(appointments.length === 0) { <p class="text-center text-gray-500 py-10">No hay citas programadas.</p> }
              
              @for(app of appointments; track app.id) {
                <div class="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden" [appHighlightUpcoming]="app.date" [status]="app.status">
                  @if(app.status === 'completada') { <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-400"></div> }
                  @if(app.status === 'cancelada') { <div class="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div> }

                  <div class="flex items-center gap-4 z-10 pl-2">
                    <img [src]="getPetImage(app.petId)" class="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 shadow-sm">
                    <div>
                      <div class="flex items-center gap-3 mb-1">
                        <span class="font-bold text-lg text-gray-800">{{ getPetName(app.petId) }}</span>
                        <span class="text-xs px-3 py-1 bg-gray-100/80 rounded-full font-semibold">{{ app.status | appointmentStatus }}</span>
                      </div>
                      <p class="text-sm text-gray-600 font-medium">{{ app.date | date:'medium' }} | {{ app.reason }}</p>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class AppointmentCalendarComponent {
  @Input() pets: Pet[] = [];
  @Input() appointments: Appointment[] = [];
  @Input() isAdmin: boolean = false;
  @Input() currentUser!: User;
  @Output() onAddAppointment = new EventEmitter<any>();
  @Output() onEditAppointment = new EventEmitter<{id: string, data: Partial<Appointment>}>();
  @Output() onStatusChange = new EventEmitter<{id: string, status: AppointmentStatus}>();

  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  apptForm: FormGroup = this.fb.group({ petId: ['', Validators.required], date: ['', Validators.required], reason: ['', Validators.required] });
  editingApptId = signal<string | null>(null);

  getPetName(petId: string): string { return this.pets.find(p => p.id === petId)?.name || 'Desconocido'; }
  getPetImage(petId: string): string { return this.pets.find(p => p.id === petId)?.imageUrl || ''; }

  startEdit(appt: Appointment) {
    this.editingApptId.set(appt.id);
    const dateStr = new Date(appt.date.getTime() - appt.date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    this.apptForm.patchValue({ petId: appt.petId, date: dateStr, reason: appt.reason });
  }

  cancelEdit() {
    this.editingApptId.set(null);
    this.apptForm.reset();
  }

  onSubmit() {
    if (this.apptForm.valid) {
      const newDate = new Date(this.apptForm.value.date);

      if (this.editingApptId()) {
        // Modo edición: actualizar cita existente
        this.onEditAppointment.emit({ id: this.editingApptId()!, data: { petId: this.apptForm.value.petId, date: newDate, reason: this.apptForm.value.reason } });
        this.cancelEdit();
        return;
      }
      
      // Modo creación: validar conflicto
      const hasConflict = this.appointments.some(app => {
        const diffInMs = Math.abs(app.date.getTime() - newDate.getTime());
        return diffInMs < 1800000 && app.status !== 'cancelada';
      });

      if (hasConflict) {
        this.toastService.show('¡Ese horario ya está ocupado! Por favor, selecciona otro momento para la cita.', 'error');
        return; 
      }

      const pet = this.pets.find(p => p.id === this.apptForm.value.petId);
      this.onAddAppointment.emit({ ...this.apptForm.value, date: newDate, clientId: pet?.ownerId });
      this.apptForm.reset();
    }
  }
}
