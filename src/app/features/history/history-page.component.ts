import { Component, inject } from '@angular/core';
import { VetDataService } from '../../core/services/vet-data.service';
import { AuthService } from '../../core/services/auth.service';
import { PetHistoryComponent } from './pet-history.component';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [PetHistoryComponent],
  template: `
    <app-pet-history 
      [pets]="dataService.pets()" 
      [appointments]="dataService.appointments()" 
      [clients]="auth.getClients()" 
      [isAdmin]="auth.isAdmin()">
    </app-pet-history>
  `
})
export class HistoryPageComponent {
  public dataService = inject(VetDataService);
  public auth = inject(AuthService);
}
