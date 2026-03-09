import { Injectable, signal, effect } from '@angular/core';

export interface HealthRecord {
  date: string;
  weight: number;
  note?: string;
}

export interface PetHealth {
  petId: string;
  weightHistory: HealthRecord[];
  vaccines: { name: string; date: string; status: 'pending' | 'completed' }[];
}

@Injectable({
  providedIn: 'root',
})
export class PetHealthService {
  private healthData = signal<PetHealth[]>([]);

  constructor() {
    const saved = localStorage.getItem('vet_health');
    if (saved) {
      try { this.healthData.set(JSON.parse(saved)); } catch (e) {}
    }
    
    effect(() => {
      localStorage.setItem('vet_health', JSON.stringify(this.healthData()));
    });
  }

  public ensurePetHealth(petId: string) {
    const existing = this.healthData().find(h => h.petId === petId);
    if (!existing) {
      this.healthData.update(prev => [...prev, { petId, weightHistory: [], vaccines: [] }]);
    }
  }

  getHealthByPet(petId: string) {
    const data = this.healthData().find(h => h.petId === petId);
    return data && data.weightHistory.length > 0 ? data : undefined;
  }

  addWeightRecord(petId: string, record: HealthRecord) {
    this.ensurePetHealth(petId);
    this.healthData.update(prev => 
      prev.map(h => h.petId === petId 
        ? { ...h, weightHistory: [...h.weightHistory, record] } 
        : h
      )
    );
  }
}
