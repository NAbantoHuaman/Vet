import { Component, Input, Output, EventEmitter, inject, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Pet, Appointment, AppointmentStatus, ServiceType, ServiceExtra, TrackingStep, User } from '../../shared/models/models';
import { DatePipe } from '@angular/common';
import { AppointmentStatusPipe } from '../../shared/pipes/appointment-status.pipe';
import { ToastService } from '../../core/services/toast.service';
import { PricingService } from '../../core/services/pricing.service';

const PIPELINE: AppointmentStatus[] = [
  'reservado', 'en_camino_recojo', 'mascota_recogida', 'en_atencion', 'de_regreso', 'entregado'
];

const STEP_ICONS: Record<string, string> = {
  'reservado':        'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  'en_camino_recojo': 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
  'mascota_recogida': 'M5 13l4 4L19 7',
  'en_atencion':      'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  'de_regreso':       'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  'entregado':        'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
};

const STEP_LABELS: Record<string, string> = {
  'reservado':        'Reservado',
  'en_camino_recojo': 'En camino',
  'mascota_recogida': 'Recogida',
  'en_atencion':      'En atención',
  'de_regreso':       'De regreso',
  'entregado':        'Entregado',
};

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DatePipe, AppointmentStatusPipe],
  template: `
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in-up">
      <div class="xl:col-span-4">
        <div class="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 h-fit sticky top-24">
          <h3 class="text-2xl font-black mb-8 text-gray-800">
            @if(editingApptId()) { ✏️ Editando Reserva } @else { Programar Servicio }
          </h3>
          <form [formGroup]="apptForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Seleccionar Mascota</label>
              <select formControlName="petId" class="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none">
                <option value="">Seleccione...</option>
                @for(pet of pets; track pet.id) { <option [value]="pet.id">{{ pet.name }} ({{ pet.species }})</option> }
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Tipo de Servicio</label>
              <select formControlName="serviceType" (change)="onServiceTypeChange()" class="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none">
                <option value="">Seleccione servicio...</option>
                <option value="medico">Consulta Veterinaria</option>
                <option value="estetica">Baño y Estética</option>
                <option value="guarderia">Guardería (por día)</option>
              </select>
            </div>

            @if(selectedPrice() > 0) {
              <div class="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                <span class="text-sm font-bold text-teal-700">Tarifa base:</span>
                <span class="text-xl font-black text-teal-600">S/ {{ selectedPrice().toFixed(2) }}</span>
              </div>
            }

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Fecha</label>
                <input type="date" formControlName="date" [min]="minDate" class="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Hora</label>
                <select formControlName="time" class="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none">
                  <option value="">Hora...</option>
                  @for(slot of availableTimeSlots(); track slot.time) { 
                    <option [value]="slot.time" [disabled]="slot.disabled">{{ slot.time }} {{ slot.disabled ? '(No Disponible)' : '' }}</option> 
                  }
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Detalles / Motivo</label>
              <textarea formControlName="reason" rows="3" placeholder="Ej. Control de vacunas, baño completo..." class="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none resize-none"></textarea>
            </div>
            
            <button type="submit" [disabled]="apptForm.invalid" class="w-full py-4 text-white font-black rounded-2xl disabled:bg-slate-200 disabled:text-slate-400 border-none shadow-lg shadow-teal-500/20 transition-all duration-300 active:scale-95"
                    [class]="editingApptId() ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-teal-600 hover:bg-teal-700'">
              {{ editingApptId() ? 'Actualizar Reserva' : 'Confirmar Reserva' }}
            </button>
            @if(editingApptId()) {
              <button type="button" (click)="cancelEdit()" class="w-full py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all mt-2">Cancelar</button>
            }
          </form>
        </div>
      </div>

      <div class="xl:col-span-8">
        <div class="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 min-h-[500px]">
          <h3 class="text-2xl font-black mb-8 text-gray-800 border-b pb-4">{{ isAdmin ? 'Gestión de Servicios' : 'Mis Servicios' }}</h3>
          
          <div class="space-y-5">
            @if(appointments.length === 0) { 
              <div class="text-center py-16">
                <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <p class="text-gray-400 font-medium">No hay servicios programados</p>
              </div>
            }
              
            @for(app of appointments; track app.id) {
              <div class="bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all overflow-hidden" 
                   [class.border-l-[6px]]="true"
                   [class.border-l-amber-400]="app.status === 'reservado'"
                   [class.border-l-blue-400]="app.status === 'en_camino_recojo'"
                   [class.border-l-indigo-400]="app.status === 'mascota_recogida'"
                   [class.border-l-purple-400]="app.status === 'en_atencion'"
                   [class.border-l-teal-400]="app.status === 'de_regreso'"
                   [class.border-l-green-400]="app.status === 'entregado'"
                   [class.border-l-red-400]="app.status === 'cancelada'">
                <div class="p-6">
                  <!-- Header -->
                  <div class="flex items-center justify-between mb-5">
                    <div class="flex items-center gap-4">
                      
                      <!-- Contenedor Avatar + Fallback -->
                      <div class="relative w-14 h-14 shrink-0">
                        <div class="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner" [class.hidden]="!imageErrorMap[app.petId] && getPetImage(app.petId)">
                          {{ getPetName(app.petId).charAt(0).toUpperCase() }}
                        </div>
                        <img [src]="getPetImage(app.petId)" (error)="imageErrorMap[app.petId] = true" class="absolute inset-0 w-14 h-14 rounded-full object-cover shadow-sm border-2 border-slate-50" [class.hidden]="imageErrorMap[app.petId] || !getPetImage(app.petId)">
                      </div>

                      <div>
                        <h4 class="font-black text-gray-900 text-xl tracking-tight leading-tight">{{ getPetName(app.petId) }}</h4>
                        <p class="text-sm text-gray-500 font-medium mt-0.5">{{ getServiceLabel(app.serviceType) }} · {{ app.date | date:'dd MMM, hh:mm a' }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-base font-black text-teal-600 tracking-tight">S/ {{ (app.totalCharged || app.basePrice || 0).toFixed(2) }}</span>
                      <button (click)="openTrackingModal(app)" class="p-2.5 bg-slate-50 hover:bg-teal-50 text-slate-500 hover:text-teal-600 rounded-xl transition-all shadow-sm border border-slate-100" title="Ver seguimiento">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      </button>
                    </div>
                  </div>

                  @if(app.status !== 'cancelada') {
                    <div class="flex items-center gap-1.5 mb-4">
                      @for(step of pipeline; track step; let i = $index) {
                        <div class="flex-1 h-2 rounded-full transition-all duration-500"
                             [class.bg-teal-500]="getStepIndex(app.status) >= i"
                             [class.bg-slate-100]="getStepIndex(app.status) < i"></div>
                      }
                    </div>
                    <p class="text-xs font-bold text-gray-500 mb-3">{{ app.status | appointmentStatus }}</p>
                  } @else {
                    <p class="text-xs font-bold text-red-500 mb-3">Servicio cancelado</p>
                  }

                  @if(isAdmin && app.status !== 'entregado' && app.status !== 'cancelada') {
                    <div class="flex gap-2 pt-3 border-t border-gray-50">
                      @if(app.status === 'en_atencion') {
                        <button (click)="openCompleteModal(app)" class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white font-bold text-xs rounded-xl hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-500/20">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Completar y Facturar
                        </button>
                      } @else {
                        <button (click)="onAdvanceStep.emit(app.id)" class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all active:scale-95">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                          Siguiente Paso
                        </button>
                      }
                      @if(app.status === 'reservado') {
                        <button (click)="onCancelService.emit(app.id)" class="py-2.5 px-4 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-all active:scale-95">
                          Cancelar
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    @if(trackingAppt()) {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" (click)="closeTrackingModal()">
        <div class="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 animate-fade-in-up border border-slate-100/50" (click)="$event.stopPropagation()">
          
          <!-- Avatar + Cabecera -->
          <div class="flex items-center gap-5 mb-8">
            <div class="relative w-16 h-16 shrink-0">
              <div class="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-inner" [class.hidden]="!imageErrorMap[trackingAppt()!.petId] && getPetImage(trackingAppt()!.petId)">
                {{ getPetName(trackingAppt()!.petId).charAt(0).toUpperCase() }}
              </div>
              <img [src]="getPetImage(trackingAppt()!.petId)" (error)="imageErrorMap[trackingAppt()!.petId] = true" class="absolute inset-0 w-16 h-16 rounded-[1.25rem] object-cover shadow-sm border border-slate-100" [class.hidden]="imageErrorMap[trackingAppt()!.petId] || !getPetImage(trackingAppt()!.petId)">
            </div>
            <div>
              <h2 class="text-2xl font-black text-gray-900 tracking-tight leading-tight">{{ getPetName(trackingAppt()!.petId) }}</h2>
              <p class="text-[13px] text-gray-500 font-bold mt-0.5">{{ getServiceLabel(trackingAppt()!.serviceType) }}</p>
              <p class="text-sm text-teal-600 font-black mt-1">S/ {{ (trackingAppt()!.totalCharged || trackingAppt()!.basePrice || 0).toFixed(2) }}</p>
            </div>
          </div>

          <!-- Timeline de Estados -->
          <div class="space-y-0 relative ml-2">
            @for(step of pipeline; track step; let i = $index; let last = $last) {
              <div class="flex gap-6 group">
                <div class="flex flex-col items-center">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 z-10"
                       [class.bg-teal-500]="getStepIndex(trackingAppt()!.status) >= i"
                       [class.text-white]="getStepIndex(trackingAppt()!.status) >= i"
                       [class.shadow-lg]="getStepIndex(trackingAppt()!.status) >= i"
                       [class.shadow-teal-500/30]="getStepIndex(trackingAppt()!.status) >= i"
                       [class.bg-slate-50]="getStepIndex(trackingAppt()!.status) < i"
                       [class.text-slate-400]="getStepIndex(trackingAppt()!.status) < i"
                       [class.ring-[6px]]="trackingAppt()!.status === step"
                       [class.ring-teal-50]="trackingAppt()!.status === step"
                       [class.scale-110]="trackingAppt()!.status === step">
                    <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getStepIcon(step)"></path></svg>
                  </div>
                  @if(!last) {
                    <div class="w-[3px] h-10 transition-all duration-500 rounded-full my-1"
                         [class.bg-teal-400]="getStepIndex(trackingAppt()!.status) > i"
                         [class.bg-slate-100]="getStepIndex(trackingAppt()!.status) <= i"></div>
                  }
                </div>
                <div class="pt-2.5 pb-2">
                  <p class="font-black text-[15px] tracking-tight transition-colors duration-300" 
                     [class.text-slate-900]="getStepIndex(trackingAppt()!.status) >= i"
                     [class.text-slate-400]="getStepIndex(trackingAppt()!.status) < i">{{ getStepLabel(step) }}</p>
                  @if(getTrackingTimestamp(step)) {
                    <p class="textxs font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{{ getTrackingTimestamp(step) | date:'dd MMM, hh:mm a' }}</p>
                  }
                </div>
              </div>
            }
          </div>

          @if(trackingAppt()!.status === 'cancelada') {
            <div class="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
              <p class="text-red-600 font-bold text-sm">Este servicio fue cancelado</p>
            </div>
          }

          @if(trackingAppt()!.extras && trackingAppt()!.extras.length > 0) {
            <div class="mt-6 pt-4 border-t border-gray-100">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Cargos adicionales</p>
              @for(extra of trackingAppt()!.extras; track $index) {
                <div class="flex justify-between py-2">
                  <span class="text-sm text-gray-700">{{ extra.name }}</span>
                  <span class="text-sm font-bold text-gray-900">S/ {{ extra.price.toFixed(2) }}</span>
                </div>
              }
            </div>
          }

          <button (click)="closeTrackingModal()" class="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-800 font-black rounded-2xl transition-all active:scale-95 border border-slate-100/50">
            Cerrar
          </button>
        </div>
      </div>
    }

    @if(completingAppt()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6 animate-fade-in-up">
          <div class="text-center">
            <div class="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 class="text-2xl font-black text-gray-800">Completar Servicio</h2>
            <p class="text-gray-500 text-sm mt-1">{{ getServiceLabel(completingAppt()!.serviceType) }} — {{ getPetName(completingAppt()!.petId) }}</p>
          </div>

          <div class="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
            <span class="font-bold text-gray-700">Tarifa base</span>
            <span class="font-black text-gray-900">S/ {{ completingAppt()!.basePrice.toFixed(2) }}</span>
          </div>

          <div class="space-y-3">
            <p class="text-sm font-bold text-gray-700">Cargos adicionales (medicamentos, procedimientos):</p>
            @for(extra of modalExtras(); track $index) {
              <div class="flex items-center gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100">
                <span class="flex-1 font-medium text-gray-800">{{ extra.name }}</span>
                <span class="font-bold text-gray-900 shrink-0">S/ {{ extra.price.toFixed(2) }}</span>
                <button (click)="removeExtra($index)" class="p-1 text-red-400 hover:text-red-600 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            }
            <div class="flex gap-2">
              <input [(ngModel)]="extraName" placeholder="Ej. Desparasitante" class="flex-1 p-3 bg-white border rounded-xl text-sm focus:ring-indigo-500 focus:ring-2">
              <input [(ngModel)]="extraPrice" type="number" placeholder="S/" class="w-24 p-3 bg-white border rounded-xl text-sm focus:ring-indigo-500 focus:ring-2">
              <button (click)="addExtra()" class="px-4 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all active:scale-95">+</button>
            </div>
          </div>

          <div class="bg-teal-600 text-white rounded-2xl p-5 flex items-center justify-between">
            <span class="text-lg font-bold">TOTAL</span>
            <span class="text-3xl font-black">S/ {{ modalTotal().toFixed(2) }}</span>
          </div>

          <div class="flex gap-3">
            <button (click)="closeCompleteModal()" class="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95">Cancelar</button>
            <button (click)="confirmComplete()" class="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-500/20">Confirmar y Facturar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class AppointmentCalendarComponent implements OnInit, OnChanges {
  @Input() pets: Pet[] = [];
  @Input() appointments: Appointment[] = [];
  @Input() isAdmin: boolean = false;
  @Input() currentUser!: User;
  @Output() onAddAppointment = new EventEmitter<any>();
  @Output() onEditAppointment = new EventEmitter<{id: string, data: Partial<Appointment>}>();
  @Output() onAdvanceStep = new EventEmitter<string>();
  @Output() onCancelService = new EventEmitter<string>();
  @Output() onCompleteService = new EventEmitter<{id: string, extras: ServiceExtra[]}>();

  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private pricingService = inject(PricingService);
  
  pipeline = PIPELINE;

  apptForm: FormGroup = this.fb.group({ 
    petId: ['', Validators.required], 
    serviceType: ['', Validators.required],
    date: ['', Validators.required], 
    time: ['', Validators.required],
    reason: ['', Validators.required] 
  });
  
  editingApptId = signal<string | null>(null);
  selectedPrice = signal<number>(0);
  imageErrorMap: { [key: string]: boolean } = {};
  
  trackingAppt = signal<Appointment | null>(null);
  
  completingAppt = signal<Appointment | null>(null);
  modalExtras = signal<ServiceExtra[]>([]);
  extraName = '';
  extraPrice = 0;
  modalTotal = signal<number>(0);
  
  minDate = new Date().toISOString().split('T')[0];
  availableTimeSlots = signal<{time: string, disabled: boolean}[]>([]);

  ngOnInit() {
    this.apptForm.get('serviceType')?.valueChanges.subscribe(() => this.generateTimeSlots());
    this.apptForm.get('date')?.valueChanges.subscribe(() => this.generateTimeSlots());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appointments']) {
      this.generateTimeSlots();
    }
  }

  generateTimeSlots() {
    const serviceType = this.apptForm.get('serviceType')?.value;
    const dateStr = this.apptForm.get('date')?.value;
    
    if (!serviceType || !dateStr) {
      this.availableTimeSlots.set([]);
      return;
    }
    
    let times: string[] = [];
    if (serviceType === 'medico') {
      times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
    } else if (serviceType === 'estetica') {
      times = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];
    } else if (serviceType === 'guarderia') {
      times = ['08:00', '08:30', '09:00', '09:30'];
    }
    
    const slots = times.map(timeStr => {
      const slotD = new Date(`${dateStr}T${timeStr}:00`);
      
      const isOccupied = this.appointments.some(a => {
        if (a.status === 'cancelada') return false;
        
        // Determinar fecha local de la cita para compararla sin el timezone desfase.
        const aDateLocalStr = new Date(a.date.getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        if (aDateLocalStr !== dateStr) return false;
        
        const diffMin = Math.abs(a.date.getTime() - slotD.getTime()) / 60000;
        if (serviceType === 'estetica' || a.serviceType === 'estetica') return diffMin < 60;
        return diffMin < 30;
      });

      const isPast = slotD.getTime() < Date.now();

      return { time: timeStr, disabled: isOccupied || isPast };
    });
    
    this.availableTimeSlots.set(slots);
    
    const currentTime = this.apptForm.get('time')?.value;
    if (currentTime) {
      const slot = slots.find(s => s.time === currentTime);
      if (!slot || slot.disabled) {
        this.apptForm.patchValue({ time: '' }, { emitEvent: false });
      }
    }
  }

  getPetName(petId: string): string { return this.pets.find(p => p.id === petId)?.name || 'Desconocido'; }
  getPetImage(petId: string): string { return this.pets.find(p => p.id === petId)?.imageUrl || ''; }
  getStepIndex(status: AppointmentStatus): number { return PIPELINE.indexOf(status); }
  getStepIcon(step: string): string { return STEP_ICONS[step] || ''; }
  getStepLabel(step: string): string { return STEP_LABELS[step] || step; }
  
  getServiceLabel(type: ServiceType | string): string {
    const m: Record<string, string> = { 'medico': 'Consulta Veterinaria', 'estetica': 'Baño y Estética', 'guarderia': 'Guardería' };
    return m[type] || type;
  }

  getTrackingTimestamp(step: string): string | null {
    const entry = this.trackingAppt()?.tracking?.find(t => t.status === step);
    return entry?.timestamp || null;
  }

  onServiceTypeChange() {
    const st = this.apptForm.value.serviceType;
    this.selectedPrice.set(st ? this.pricingService.getPrice(st) : 0);
  }

  openTrackingModal(appt: Appointment) { this.trackingAppt.set(appt); }
  closeTrackingModal() { this.trackingAppt.set(null); }
  openCompleteModal(appt: Appointment) {
    this.completingAppt.set(appt);
    this.modalExtras.set([]);
    this.extraName = '';
    this.extraPrice = 0;
    this.recalcTotal();
  }
  closeCompleteModal() { this.completingAppt.set(null); this.modalExtras.set([]); }
  
  addExtra() {
    if (!this.extraName.trim() || this.extraPrice <= 0) {
      this.toastService.show('Ingresa nombre y precio del cargo', 'error');
      return;
    }
    this.modalExtras.update(prev => [...prev, { name: this.extraName.trim(), price: this.extraPrice }]);
    this.extraName = '';
    this.extraPrice = 0;
    this.recalcTotal();
  }
  removeExtra(i: number) { this.modalExtras.update(prev => prev.filter((_, idx) => idx !== i)); this.recalcTotal(); }
  recalcTotal() {
    const base = this.completingAppt()?.basePrice || 0;
    this.modalTotal.set(base + this.modalExtras().reduce((s, e) => s + e.price, 0));
  }
  confirmComplete() {
    const a = this.completingAppt();
    if (!a) return;
    this.onCompleteService.emit({ id: a.id, extras: this.modalExtras() });
    this.closeCompleteModal();
  }

  startEdit(appt: Appointment) {
    this.editingApptId.set(appt.id);
    const tz = (new Date()).getTimezoneOffset() * 60000;
    const local = (new Date(appt.date.getTime() - tz)).toISOString().slice(0, -1);
    this.apptForm.patchValue({ petId: appt.petId, serviceType: appt.serviceType || 'medico', date: local.split('T')[0], time: local.split('T')[1].substring(0, 5), reason: appt.reason });
    this.onServiceTypeChange();
  }
  cancelEdit() { this.editingApptId.set(null); this.apptForm.reset(); this.selectedPrice.set(0); }

  onSubmit() {
    if (!this.apptForm.valid) return;
    const { date, time, petId, serviceType, reason } = this.apptForm.value;
    const combined = new Date(`${date}T${time}:00`);

    if (combined.getTime() < Date.now()) { this.toastService.show('No puedes agendar en el pasado', 'error'); return; }
    if (combined.getDay() === 0) { this.toastService.show('No atendemos domingos', 'error'); return; }

    const basePrice = this.pricingService.getPrice(serviceType);

    if (this.editingApptId()) {
      this.onEditAppointment.emit({ id: this.editingApptId()!, data: { petId, serviceType, date: combined, reason, basePrice } });
      this.cancelEdit();
      return;
    }

    if (this.appointments.some(a => Math.abs(a.date.getTime() - combined.getTime()) < 1800000 && a.status !== 'cancelada')) {
      this.toastService.show('Horario ocupado, selecciona otro momento', 'error');
      return;
    }

    const pet = this.pets.find(p => p.id === petId);
    this.onAddAppointment.emit({ petId, serviceType, reason, date: combined, clientId: pet?.ownerId, basePrice });
    this.apptForm.reset();
    this.selectedPrice.set(0);
  }
}
