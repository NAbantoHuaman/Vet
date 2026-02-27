import { Directive, Input, ElementRef, Renderer2, OnInit, inject } from '@angular/core';
import { AppointmentStatus } from '../models/models';

@Directive({ selector: '[appHighlightUpcoming]', standalone: true })
export class HighlightUpcomingDirective implements OnInit {
  @Input('appHighlightUpcoming') appointmentDate!: Date;
  @Input() status!: AppointmentStatus;
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnInit() {
    if (this.status !== 'pendiente') return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const apptDate = new Date(this.appointmentDate); apptDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(Math.abs(apptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1 && apptDate >= today) {
      this.renderer.addClass(this.el.nativeElement, 'bg-amber-50');
      this.renderer.addClass(this.el.nativeElement, 'border-l-4');
      this.renderer.addClass(this.el.nativeElement, 'border-amber-500');
    }
  }
}
