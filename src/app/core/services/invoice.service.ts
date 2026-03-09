import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { PaymentRecord } from './payment.service';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {

  generatePDF(payment: PaymentRecord, clientName: string) {
    const doc = new jsPDF();

    const tealColor: [number, number, number] = [20, 184, 166];
    const darkGray: [number, number, number] = [30, 41, 59];
    const lightGray: [number, number, number] = [100, 116, 139];

    doc.setFillColor(...tealColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('VetStore.', 20, 26);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('COMPROBANTE DE PAGO', 140, 26);

    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA A:', 20, 60);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightGray);
    doc.text(clientName.toUpperCase(), 20, 68);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('N° DE ORDEN:', 140, 60);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightGray);
    doc.text(payment.id, 140, 68);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('FECHA:', 140, 80);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightGray);
    const dateStr = new Date(payment.date).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    doc.text(dateStr, 140, 88);

    doc.setDrawColor(226, 232, 240);
    doc.line(20, 105, 190, 105);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('DESCRIPCIÓN DEL SERVICIO / PRODUCTO', 20, 115);
    doc.text('IMPORTE', 170, 115);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 120, 190, 120);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkGray);
    
    const itemName = payment.productName || payment.description;
    
    const splitTitle = doc.splitTextToSize(itemName, 130);
    doc.text(splitTitle, 20, 130);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`S/ ${payment.amount.toFixed(2)}`, 170, 130);

    doc.setFillColor(248, 250, 252);
    doc.rect(130, 150, 60, 30, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(...lightGray);
    doc.text('Total Pagado', 135, 160);
    
    doc.setFontSize(16);
    doc.setTextColor(...tealColor);
    doc.text(`S/ ${payment.amount.toFixed(2)}`, 135, 172);

    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.setFont('helvetica', 'normal');
    doc.text('Este documento es un comprobante electrónico de pago válido.', 105, 270, { align: 'center' });
    doc.text('Gracias por elegir VetStore y cuidar de tu mascota.', 105, 275, { align: 'center' });

    doc.save(`Factura-${payment.id}.pdf`);
  }
}
