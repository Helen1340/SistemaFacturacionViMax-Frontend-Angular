import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportServices } from '../services/report.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Payment {
  date: string;
  client: string;
  nit: string;
  invoiceNumber: string;
  value: string;
  method: string;
  status: string;
  responsible: string;
}

@Component({
  selector: 'app-reporte-pagos',
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-pagos.html',
  styleUrl: './reporte-pagos.css',
})
export class ReportePagos implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];

  // filtros
  invoiceNumber = '';
  startDate = '';
  endDate = '';
  clientSearch = '';
  paymentMethod = 'Todos';
  associatedInvoice = '';

  // lista de métodos permitidos
  paymentMethods: string[] = [
    'Todos',
    'Efectivo',
    'Transferencia Bancaria',
    'Tarjeta Débito',
    'Tarjeta de Crédito',
    'Cheque',
  ];

  constructor(private reportService: ReportServices) {}

  ngOnInit(): void {
    this.reportService.getPayments().subscribe({
      next: (data) => {
        this.payments = data.map((item: any) => ({
          date: item.fecha_pago,
          client: item.cliente_nombre,
          nit: item.cliente_nit,
          invoiceNumber: item.numero_factura,
          value: item.valor_pagado,
          method: item.payment_method?.nombre || '',
          status: item.electronic_invoice?.estado_interno || '',
          responsible: item.electronic_invoice?.user?.nombre || '',
        }));
        this.filteredPayments = [...this.payments];
      },
      error: (err) => console.error('Error cargando pagos:', err),
    });
  }

  applyFilters(): void {
    this.filteredPayments = this.payments.filter((p) => {
      const matchesInvoice =
        !this.invoiceNumber ||
        p.invoiceNumber.toLowerCase() === this.invoiceNumber.toLowerCase();

      const matchesClient =
        !this.clientSearch ||
        p.client.toLowerCase().includes(this.clientSearch.toLowerCase()) ||
        p.nit.includes(this.clientSearch);

      const matchesMethod =
        this.paymentMethod === 'Todos' ||
        p.method.toLowerCase() === this.paymentMethod.toLowerCase();

      const matchesAssociated =
        !this.associatedInvoice ||
        p.invoiceNumber.toLowerCase() === this.associatedInvoice.toLowerCase();

      const matchesStartDate =
        !this.startDate || new Date(p.date) >= new Date(this.startDate);

      const matchesEndDate =
        !this.endDate || new Date(p.date) <= new Date(this.endDate);

      return (
        matchesInvoice &&
        matchesClient &&
        matchesMethod &&
        matchesAssociated &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }

  clearFilters(): void {
    this.invoiceNumber = '';
    this.startDate = '';
    this.endDate = '';
    this.clientSearch = '';
    this.paymentMethod = 'Todos';
    this.associatedInvoice = '';
    this.filteredPayments = [...this.payments];
  }

  exportToExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.filteredPayments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagos');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    saveAs(data, `Reporte_Pagos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Reporte de Pagos', 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [['Factura', 'Cliente', 'NIT', 'Fecha Pago', 'Valor', 'Método', 'Estado', 'Responsable']],
      body: this.filteredPayments.map((p) => [
        p.invoiceNumber,
        p.client,
        p.nit,
        p.date,
        p.value,
        p.method,
        p.status,
        p.responsible,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`Reporte_Pagos_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'emitida':
        return 'text-green-600';
      case 'anulada':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
}
