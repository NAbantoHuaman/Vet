import { Component, inject } from '@angular/core';
import { VetDataService } from '../../core/services/vet-data.service';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentCalendarComponent } from './appointment-calendar.component';

@Component({
  selector: 'app-appointments-page',
  standalone: true,
  imports: [AppointmentCalendarComponent],
  template: `
    <app-appointment-calendar 
      [pets]="dataService.pets()" 
      [appointments]="dataService.appointments()" 
      [isAdmin]="auth.isAdmin()" 
      [currentUser]="auth.currentUser()!" 
      (onAddAppointment)="dataService.addAppointment($event)" 
      (onEditAppointment)="dataService.updateAppointment($event.id, $event.data)"
      (onAdvanceStep)="dataService.advanceStep($event)"
      (onCancelService)="dataService.cancelService($event)"
      (onCompleteService)="dataService.completeServiceWithExtras($event.id, $event.extras)">
    </app-appointment-calendar>
  `
})
export class AppointmentsPageComponent {
  public dataService = inject(VetDataService);
  public auth = inject(AuthService);
}
