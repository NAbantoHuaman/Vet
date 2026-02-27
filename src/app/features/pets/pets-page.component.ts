import { Component, inject } from '@angular/core';
import { VetDataService } from '../../core/services/vet-data.service';
import { AuthService } from '../../core/services/auth.service';
import { PetManagerComponent } from './pet-manager.component';

@Component({
  selector: 'app-pets-page',
  standalone: true,
  imports: [PetManagerComponent],
  template: `
    <app-pet-manager 
      [pets]="dataService.pets()" 
      [isAdmin]="auth.isAdmin()" 
      [currentUser]="auth.currentUser()!" 
      [clients]="auth.getClients()" 
      (onAddPet)="dataService.addPet($event)"
      (onEditPet)="dataService.updatePet($event.id, $event.data)"
      (onDeletePet)="dataService.deletePet($event)">
    </app-pet-manager>
  `
})
export class PetsPageComponent {
  public dataService = inject(VetDataService);
  public auth = inject(AuthService);
}
