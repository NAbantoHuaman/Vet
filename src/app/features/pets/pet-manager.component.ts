import { Component, Input, Output, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { HealthChartsComponent } from './health/health-charts.component';
import { VaccinationTimelineComponent } from './health/vaccination-timeline.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Pet, User } from '../../shared/models/models';
import { PetHealthService } from '../../core/services/pet-health.service';

@Component({
  selector: 'app-pet-manager',
  standalone: true,
  imports: [ReactiveFormsModule, HealthChartsComponent, VaccinationTimelineComponent],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
      <div class="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 h-fit sticky top-24">
        <h3 class="text-2xl font-bold mb-6 text-gray-800">
          @if(editingPetId()) { ✏️ Editando Mascota } @else { {{ isAdmin ? 'Registrar Paciente' : 'Añadir mi Mascota' }} }
        </h3>
        
        <form [formGroup]="petForm" (ngSubmit)="onSubmit()" class="space-y-4">
          @if(isAdmin) {
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Propietario (Cliente)</label>
              <select formControlName="ownerId" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <option value="">Seleccione cliente...</option>
                @for(client of clients; track client.id) { <option [value]="client.id">{{ client.fullName }} ({{ client.email }})</option> }
              </select>
            </div>
          }

          <div><label class="block text-sm font-bold text-gray-700 mb-2">Nombre</label><input type="text" formControlName="name" class="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"></div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Especie</label>
            <select formControlName="species" class="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none">
              <option value="">Seleccione...</option><option value="Perro">🐶 Perro</option><option value="Gato">🐱 Gato</option><option value="Ave">🦜 Ave</option><option value="Otro">🐾 Otro</option>
            </select>
          </div>
          <div><label class="block text-sm font-bold text-gray-700 mb-2">Raza</label><input type="text" formControlName="breed" class="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"></div>
          <div><label class="block text-sm font-bold text-gray-700 mb-2">Edad</label><input type="number" formControlName="age" class="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"></div>

          <button type="submit" [disabled]="petForm.invalid" class="w-full py-4 text-white font-black rounded-2xl disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none shadow-lg shadow-teal-500/20 transition-all duration-300 active:scale-95"
                  [class]="editingPetId() ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-teal-600 hover:bg-teal-700'">
            {{ editingPetId() ? 'Actualizar Datos' : 'Guardar Datos' }}
          </button>

          @if(editingPetId()) {
            <button type="button" (click)="cancelEdit()" class="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">
              Cancelar Edición
            </button>
          }
        </form>
      </div>

      <div class="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100">
        <h3 class="text-2xl font-black mb-8 text-gray-800 border-b pb-4">{{ isAdmin ? 'Directorio de Pacientes' : 'Mis Mascotas' }}</h3>
        
        @if(isAdmin) {
          <div class="overflow-x-auto rounded-2xl border border-gray-100">
            <table class="w-full text-left border-collapse">
              <thead class="bg-gray-50 text-gray-700">
                <tr>
                  <th class="p-4 font-bold border-b">ID</th>
                  <th class="p-4 font-bold border-b">Paciente</th>
                  <th class="p-4 font-bold border-b">Especie/Raza</th>
                  <th class="p-4 font-bold border-b">Edad</th>
                  <th class="p-4 font-bold border-b">Dueño ID</th>
                  <th class="p-4 font-bold border-b text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @if(pets.length === 0) { <tr><td colspan="6" class="p-8 text-center text-gray-500">No hay mascotas registradas.</td></tr> }
                @for(pet of pets; track pet.id) {
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" 
                      [class.bg-teal-50]="selectedPetId() === pet.id"
                      (click)="selectedPetId.set(pet.id)">
                    <td class="p-4 text-xs font-mono text-gray-400">{{ pet.id }}</td>
                    <td class="p-4 flex items-center gap-3">
                      <div class="relative w-10 h-10 shrink-0">
                        <div class="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-inner" [class.hidden]="!imageErrorMap[pet.id] && pet.imageUrl">
                          {{ pet.name.charAt(0).toUpperCase() }}
                        </div>
                        <img [src]="pet.imageUrl" (error)="imageErrorMap[pet.id] = true" class="absolute inset-0 w-10 h-10 rounded-full object-cover border border-gray-200" [class.hidden]="imageErrorMap[pet.id] || !pet.imageUrl">
                      </div>
                      <span class="font-bold text-gray-800">{{ pet.name }}</span>
                    </td>
                    <td class="p-4 text-sm text-gray-600">{{ pet.species }}<br><span class="text-xs text-gray-400">{{ pet.breed }}</span></td>
                    <td class="p-4 text-sm text-gray-600 font-semibold">{{ pet.age }} años</td>
                    <td class="p-4 text-xs text-indigo-500 font-mono">{{ pet.ownerId }}</td>
                    <td class="p-4 text-right">
                      <div class="flex justify-end gap-2">
                        <button aria-label="Editar mascota" (click)="startEdit(pet); $event.stopPropagation()" class="p-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors" title="Editar">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button aria-label="Eliminar mascota" (click)="onDeletePet.emit(pet.id); $event.stopPropagation()" class="p-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            @if(pets.length === 0) { <p class="text-gray-500 italic col-span-2 text-center py-8">No hay mascotas registradas.</p> }
            
            @for(pet of pets; track pet.id) {
              <div 
                (click)="selectedPetId.set(pet.id)"
                class="flex items-center gap-5 p-5 border rounded-[2rem] cursor-pointer transition-all duration-300 group"
                [class]="selectedPetId() === pet.id ? 'bg-teal-50 border-teal-200 shadow-md ring-4 ring-teal-50 scale-[1.02]' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1'"
              >
                <div class="relative w-16 h-16 shrink-0">
                  <div class="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-inner" [class.hidden]="!imageErrorMap[pet.id] && pet.imageUrl">
                    {{ pet.name.charAt(0).toUpperCase() }}
                  </div>
                  <img [src]="pet.imageUrl" (error)="imageErrorMap[pet.id] = true" class="absolute inset-0 w-16 h-16 rounded-[1.25rem] object-cover shadow-sm transition-transform" [class]="selectedPetId() === pet.id ? 'ring-2 ring-teal-400 ring-offset-2' : 'group-hover:scale-105'" [class.hidden]="imageErrorMap[pet.id] || !pet.imageUrl">
                </div>
                
                <div>
                  <h4 class="font-black text-xl text-gray-900 tracking-tight leading-tight">{{ pet.name }}</h4>
                  <p class="text-sm font-medium text-gray-500 mt-0.5">{{ pet.species }} - {{ pet.breed }}</p>
                  <p class="text-xs font-black text-teal-600 mt-1 uppercase tracking-wider">{{ pet.age }} años</p>
                </div>
              </div>
            }
          </div>
        }

        @if(selectedPetId() && healthService.getHealthByPet(selectedPetId()!)) {
          <div class="mt-12 border-t pt-12 animate-fade-in">
            <h2 class="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3 mb-8">
              <span class="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </span>
              Seguimiento Clínico: {{ getSelectedPetName() }}
            </h2>
            <div class="space-y-8">
              <app-health-charts [petId]="selectedPetId()!"></app-health-charts>
              <app-vaccination-timeline [petId]="selectedPetId()!"></app-vaccination-timeline>
            </div>
          </div>
        } @else if(pets.length > 0) {
          <div class="mt-8 p-8 bg-slate-50 rounded-3xl border border-dashed border-gray-300 text-center animate-pulse">
             <p class="text-gray-500 font-medium">No hay registros clínicos para esta mascota todavía. Aparecerán después de su primera consulta en la clínica.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class PetManagerComponent implements OnInit {
  @Input() pets: Pet[] = [];
  @Input() isAdmin: boolean = false;
  @Input() currentUser!: User;
  @Input() clients: User[] = [];
  @Output() onAddPet = new EventEmitter<any>();
  @Output() onEditPet = new EventEmitter<{id: string, data: Partial<Pet>}>();
  @Output() onDeletePet = new EventEmitter<string>();

  private fb = inject(FormBuilder);
  public healthService = inject(PetHealthService);
  petForm!: FormGroup;
  editingPetId = signal<string | null>(null);
  selectedPetId = signal<string | null>(null);
  imageErrorMap: { [key: string]: boolean } = {};

  ngOnInit() {
    this.petForm = this.fb.group({
      ownerId: [this.isAdmin ? '' : this.currentUser?.id, Validators.required],
      name: ['', Validators.required],
      species: ['', Validators.required],
      breed: [''],
      age: [0, [Validators.required, Validators.min(0)]]
    });

    if (this.pets.length > 0) {
      this.selectedPetId.set(this.pets[0].id);
    }
  }

  getSelectedPetName(): string {
    return this.pets.find(p => p.id === this.selectedPetId())?.name || '';
  }

  startEdit(pet: Pet) {
    this.editingPetId.set(pet.id);
    this.petForm.patchValue({
      ownerId: pet.ownerId,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age
    });
  }

  cancelEdit() {
    this.editingPetId.set(null);
    this.petForm.reset({ ownerId: this.isAdmin ? '' : this.currentUser?.id, age: 0 });
  }

  onSubmit() {
    if (this.petForm.valid) {
      if (this.editingPetId()) {
        this.onEditPet.emit({ id: this.editingPetId()!, data: this.petForm.value });
        this.cancelEdit();
      } else {
        this.onAddPet.emit(this.petForm.value);
        this.petForm.reset({ ownerId: this.isAdmin ? '' : this.currentUser?.id, age: 0 });
      }
    }
  }
}
