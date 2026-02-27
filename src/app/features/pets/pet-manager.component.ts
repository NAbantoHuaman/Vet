import { Component, Input, Output, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Pet, User } from '../../shared/models/models';

@Component({
  selector: 'app-pet-manager',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
      <!-- Formulario de Registro / Edición -->
      <div class="lg:col-span-1 bg-white p-6 rounded-3xl shadow-xl border border-teal-50 h-fit sticky top-24">
        <h3 class="text-2xl font-bold mb-6 text-gray-800">
          @if(editingPetId()) { ✏️ Editando Mascota } @else { {{ isAdmin ? 'Registrar Paciente' : 'Añadir mi Mascota' }} }
        </h3>
        
        <form [formGroup]="petForm" (ngSubmit)="onSubmit()" class="space-y-4">
          @if(isAdmin) {
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Propietario (Cliente)</label>
              <select formControlName="ownerId" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500">
                <option value="">Seleccione cliente...</option>
                @for(client of clients; track client.id) { <option [value]="client.id">{{ client.fullName }} ({{ client.email }})</option> }
              </select>
            </div>
          }

          <div><label class="block text-sm font-bold text-gray-700 mb-2">Nombre</label><input type="text" formControlName="name" class="w-full p-3 bg-gray-50 border rounded-xl focus:ring-teal-500 focus:ring-2"></div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Especie</label>
            <select formControlName="species" class="w-full p-3 bg-gray-50 border rounded-xl focus:ring-teal-500 focus:ring-2">
              <option value="">Seleccione...</option><option value="Perro">🐶 Perro</option><option value="Gato">🐱 Gato</option><option value="Ave">🦜 Ave</option><option value="Otro">🐾 Otro</option>
            </select>
          </div>
          <div><label class="block text-sm font-bold text-gray-700 mb-2">Raza</label><input type="text" formControlName="breed" class="w-full p-3 bg-gray-50 border rounded-xl focus:ring-teal-500 focus:ring-2"></div>
          <div><label class="block text-sm font-bold text-gray-700 mb-2">Edad</label><input type="number" formControlName="age" class="w-full p-3 bg-gray-50 border rounded-xl focus:ring-teal-500 focus:ring-2"></div>

          <button type="submit" [disabled]="petForm.invalid" class="w-full py-4 text-white font-bold rounded-xl disabled:bg-gray-300 transition-all"
                  [class]="editingPetId() ? 'bg-amber-500 hover:bg-amber-600' : 'bg-teal-600 hover:bg-teal-700'">
            {{ editingPetId() ? 'Actualizar Datos' : 'Guardar Datos' }}
          </button>

          @if(editingPetId()) {
            <button type="button" (click)="cancelEdit()" class="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">
              Cancelar Edición
            </button>
          }
        </form>
      </div>

      <!-- Lista de Mascotas -->
      <div class="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
        <h3 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">{{ isAdmin ? 'Directorio de Pacientes' : 'Mis Mascotas' }}</h3>
        
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
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors" [class.bg-amber-50]="editingPetId() === pet.id">
                    <td class="p-4 text-xs font-mono text-gray-400">{{ pet.id }}</td>
                    <td class="p-4 flex items-center gap-3">
                      <img [src]="pet.imageUrl" class="w-10 h-10 rounded-full object-cover border border-gray-200">
                      <span class="font-bold text-gray-800">{{ pet.name }}</span>
                    </td>
                    <td class="p-4 text-sm text-gray-600">{{ pet.species }}<br><span class="text-xs text-gray-400">{{ pet.breed }}</span></td>
                    <td class="p-4 text-sm text-gray-600 font-semibold">{{ pet.age }} años</td>
                    <td class="p-4 text-xs text-indigo-500 font-mono">{{ pet.ownerId }}</td>
                    <td class="p-4 text-right">
                      <div class="flex justify-end gap-2">
                        <button aria-label="Editar mascota" (click)="startEdit(pet)" class="p-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors" title="Editar">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button aria-label="Eliminar mascota" (click)="onDeletePet.emit(pet.id)" class="p-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar">
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
              <div class="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
                <img [src]="pet.imageUrl" class="w-16 h-16 rounded-full object-cover border-2 border-teal-100">
                <div>
                  <h4 class="font-bold text-lg text-gray-900 leading-tight">{{ pet.name }}</h4>
                  <p class="text-sm text-gray-500">{{ pet.species }} - {{ pet.breed }}</p>
                  <p class="text-xs font-semibold text-teal-600 mt-1">{{ pet.age }} años</p>
                </div>
              </div>
            }
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
  petForm!: FormGroup;
  editingPetId = signal<string | null>(null);

  ngOnInit() {
    this.petForm = this.fb.group({
      ownerId: [this.isAdmin ? '' : this.currentUser?.id, Validators.required],
      name: ['', Validators.required],
      species: ['', Validators.required],
      breed: [''],
      age: [0, [Validators.required, Validators.min(0)]]
    });
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
