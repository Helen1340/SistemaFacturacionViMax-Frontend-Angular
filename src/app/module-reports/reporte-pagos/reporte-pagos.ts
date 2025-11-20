import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportServices } from '../services/report.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart, registerables } from 'chart.js';

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
    Chart.register(...registerables);
    this.loadPayments();
    this.loadPaymentSummary();
  }

  applyFilters(): void {
    this.loadPayments();
    this.loadPaymentSummary();
  }

  clearFilters(): void {
    this.invoiceNumber = '';
    this.startDate = '';
    this.endDate = '';
    this.clientSearch = '';
    this.paymentMethod = 'Todos';
    this.associatedInvoice = '';
    this.loadPayments();
    this.loadPaymentSummary();
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

  downloadCsv(): void {
    const params: any = {
      cliente: this.clientSearch || undefined,
      desde: this.startDate || undefined,
      hasta: this.endDate || undefined,
    };
    this.reportService.downloadPaymentsCsv(params).subscribe((blob) => {
      saveAs(blob, `pagos_${new Date().toISOString().slice(0, 10)}.csv`);
    });
  }

  private loadPayments(): void {
    const params: any = {
      cliente: this.clientSearch || undefined,
      desde: this.startDate || undefined,
      hasta: this.endDate || undefined,
    };
    this.reportService.getPayments(params).subscribe({
      next: (data) => {
        this.payments = data.map((item: any) => ({
          date: item.payment_date || item.fecha_pago || '',
          client: item.buyer?.first_name || item.cliente_nombre || '',
          nit: item.buyer?.document_number || item.cliente_nit || '',
          invoiceNumber: item.invoice_number || item.numero_factura || '',
          value: item.amount_paid || item.valor_pagado || '',
          method: item.payment_method?.name || item.payment_method?.nombre || '',
          status: item.internal_status || item.electronic_invoice?.estado_interno || '',
          responsible: item.user?.first_name || item.electronic_invoice?.user?.nombre || '',
        }));
        this.filteredPayments = [...this.payments];
      },
      error: () => {},
    });
  }

  private loadPaymentSummary(): void {
    const params: any = {
      desde: this.startDate || undefined,
      hasta: this.endDate || undefined,
    };
    this.reportService.getPaymentSummary(params).subscribe({
      next: (summary) => {
        const byMonth = summary?.totales_por_mes || {};
        const byMethod = summary?.totales_por_metodo || {};
        this.renderPaymentsMonthChart(byMonth);
        this.renderPaymentsMethodChart(byMethod);
      },
      error: () => {},
    });
  }

  private renderPaymentsMonthChart(byMonth: any): void {
    const labels = Object.keys(byMonth);
    const data = Object.values(byMonth).map((v: any) => Number(v));
    const ctx = document.getElementById('chart-payments-month') as HTMLCanvasElement;
    if (!ctx) return;
    if ((this as any)._paymentsMonthChart) (this as any)._paymentsMonthChart.destroy();
    (this as any)._paymentsMonthChart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label: 'Pagos por mes', data, borderColor: '#3b82f6', backgroundColor: '#93c5fd' }] },
      options: { responsive: true, scales: { y: { beginAtZero: true } } },
    });
  }

  private renderPaymentsMethodChart(byMethod: any): void {
    const labels = Object.keys(byMethod);
    const data = Object.values(byMethod).map((v: any) => Number(v));
    const ctx = document.getElementById('chart-payments-method') as HTMLCanvasElement;
    if (!ctx) return;
    if ((this as any)._paymentsMethodChart) (this as any)._paymentsMethodChart.destroy();
    (this as any)._paymentsMethodChart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Pagos por método', data, backgroundColor: '#f59e0b' }] },
      options: { responsive: true, scales: { y: { beginAtZero: true } } },
    });
  }
}
