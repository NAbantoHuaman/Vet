import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetHealthService } from '../../../core/services/pet-health.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-health-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 animate-fade-in overflow-hidden">
      <div class="px-8 pt-8 pb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 class="text-2xl font-black text-gray-800 tracking-tight">Historial de Peso</h2>
          <p class="text-gray-400 font-medium text-sm mt-1">Evolución del peso de tu mascota</p>
        </div>
        <div class="px-5 py-2.5 bg-teal-50 text-teal-700 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm border border-teal-100">
          Consolidado
        </div>
      </div>

      <div class="px-6 pb-2">
        <div class="relative h-[280px] w-full">
          <canvas #weightChart></canvas>
        </div>
      </div>

      <div class="grid grid-cols-3 border-t border-slate-100 bg-slate-50/50">
        <div class="p-6 text-center border-r border-slate-100 hover:bg-white transition-colors">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Último Peso</p>
          <p class="text-4xl font-black text-slate-800 tracking-tight">{{ currentWeight() }}<span class="text-sm font-bold text-slate-400 ml-1">kg</span></p>
        </div>
        <div class="p-6 text-center border-r border-slate-100 hover:bg-white transition-colors">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Variación</p>
          <p class="text-4xl font-black text-teal-500 tracking-tight">+0.4<span class="text-sm font-bold text-teal-400 ml-1">kg</span></p>
        </div>
        <div class="p-6 text-center hover:bg-white transition-colors">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estado</p>
          <p class="text-2xl font-black text-indigo-500 mt-2">Saludable</p>
        </div>
      </div>
    </div>
  `
})
export class HealthChartsComponent implements AfterViewInit {
  @ViewChild('weightChart') canvas!: ElementRef<HTMLCanvasElement>;
  @Input() petId: string = '1';
  
  private healthService = inject(PetHealthService);
  currentWeight = signal(0);
  chart: any;

  ngAfterViewInit() {
    this.renderChart();
  }

  renderChart() {
    const data = this.healthService.getHealthByPet(this.petId);
    if (!data) return;

    const history = data.weightHistory;
    this.currentWeight.set(history[history.length - 1].weight);

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(20, 184, 166, 0.4)');
    gradient.addColorStop(1, 'rgba(20, 184, 166, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: history.map(h => h.date),
        datasets: [{
          label: 'Peso (kg)',
          data: history.map(h => h.weight),
          borderColor: '#14b8a6',
          borderWidth: 4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#14b8a6',
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true,
          backgroundColor: gradient,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 14 },
            cornerRadius: 12,
            displayColors: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: { display: false },
            ticks: { font: { weight: 'bold' } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { weight: 'bold' } }
          }
        }
      }
    });
  }
}
