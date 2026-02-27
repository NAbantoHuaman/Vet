import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentStatus } from '../models/models';

@Pipe({ name: 'appointmentStatus', standalone: true })
export class AppointmentStatusPipe implements PipeTransform {
  transform(status: AppointmentStatus): string {
    switch (status) { case 'pendiente': return '🟡 Pendiente'; case 'completada': return '🟢 Completada'; case 'cancelada': return '🔴 Cancelada'; default: return status; }
  }
}
