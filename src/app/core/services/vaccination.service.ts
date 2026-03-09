import { Injectable, signal } from '@angular/core';

export interface Vaccine {
  id: string;
  name: string;
  description: string;
  frequencyMonths: number;
}

@Injectable({
  providedIn: 'root',
})
export class VaccinationService {
  private vaccines = signal<Vaccine[]>([
    { id: '1', name: 'Rabia', description: 'Prevención anual obligatoria', frequencyMonths: 12 },
    { id: '2', name: 'Parvovirus', description: 'Refuerzo semestral', frequencyMonths: 6 },
    { id: '3', name: 'Triple Felina', description: 'Protección respiratoria', frequencyMonths: 12 },
  ]);

  getAvailableVaccines() {
    return this.vaccines;
  }
}
