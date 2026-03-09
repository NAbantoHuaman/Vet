import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentStatus } from '../models/models';

@Pipe({ name: 'appointmentStatus', standalone: true })
export class AppointmentStatusPipe implements PipeTransform {
  transform(status: AppointmentStatus): string {
    const map: Record<string, string> = {
      'reservado': 'Reservado',
      'en_camino_recojo': 'En camino a recoger',
      'mascota_recogida': 'Mascota recogida',
      'en_atencion': 'En atención',
      'de_regreso': 'De regreso',
      'entregado': 'Entregado',
      'cancelada': 'Cancelada'
    };
    return map[status] || status;
  }
}
