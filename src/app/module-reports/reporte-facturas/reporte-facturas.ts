import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportServices } from '../services/report.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Invoice {
  date: string;
  documentType: string;
  invoiceNumber: string;
  client: string;
  nit: string;
  responsible: string;
  totalValue: string;
  status: string;
}

@Component({
  selector: 'app-reporte-facturas',
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-facturas.html',
  styleUrl: './reporte-facturas.css',
})
export class ReporteFacturas implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];

  // filtros
  invoiceNumber = '';
  status = 'Todos';
  startDate = '';
  endDate = '';
  clientName = '';
  responsible = '';
  documentType = 'Todos';

  // opciones para selects
  statusOptions = ['Todos', 'Borrador', 'Emitida', 'Anulada'];
  documentOptions = ['Todos', 'Factura Electrónica', 'Nota Crédito', 'Nota Débito'];

  constructor(private invoiceService: ReportServices) {}

  ngOnInit(): void {
    this.invoiceService.getInvoices().subscribe({
      next: (data) => {
        this.invoices = data.map((item: any) => ({
          date: item.fecha_emision,
          documentType: item.tipo_documento || 'Factura Electrónica',
          invoiceNumber: item.numero_factura,
          client: item.cliente_nombre,
          nit: item.cliente_nit,
          responsible: item.user?.nombre || '',
          totalValue: item.payment?.valor_pagado || '0',
          status: this.mapEstado(item.estado_interno),
        }));

        this.filteredInvoices = [...this.invoices];
      },
      error: (err) => console.error(err),
    });
  }

  mapEstado(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'borrador':
        return 'Borrador';
      case 'emitida':
        return 'Emitida';
      case 'anulada':
        return 'Anulada';
      default:
        return estado;
    }
  }

  applyFilters(): void {
    this.filteredInvoices = this.invoices.filter((inv) => {
      const matchesInvoice =
        !this.invoiceNumber ||
        inv.invoiceNumber.toLowerCase() === this.invoiceNumber.toLowerCase();

      const matchesClient =
        !this.clientName ||
        inv.client.toLowerCase().includes(this.clientName.toLowerCase());

      const matchesResponsible =
        !this.responsible ||
        inv.responsible.toLowerCase().includes(this.responsible.toLowerCase());

      const matchesStatus =
        this.status === 'Todos' ||
        inv.status.toLowerCase() === this.status.toLowerCase();

      const matchesDocument =
        this.documentType === 'Todos' ||
        inv.documentType.toLowerCase() === this.documentType.toLowerCase();

      const matchesStartDate =
        !this.startDate || new Date(inv.date) >= new Date(this.startDate);

      const matchesEndDate =
        !this.endDate || new Date(inv.date) <= new Date(this.endDate);

      return (
        matchesInvoice &&
        matchesClient &&
        matchesResponsible &&
        matchesStatus &&
        matchesDocument &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }

  // 🔹 limpiar filtros
  resetFilters(): void {
    this.invoiceNumber = '';
    this.status = 'Todos';
    this.startDate = '';
    this.endDate = '';
    this.clientName = '';
    this.responsible = '';
    this.documentType = 'Todos';
    this.filteredInvoices = [...this.invoices];
  }

  // 🔹 Exportar Excel (solo filtradas)
  exportExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredInvoices);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Facturas');
    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    saveAs(data, `Reporte_Facturas_${new Date().getTime()}.xlsx`);
  }

  // 🔹 Exportar PDF (solo filtradas)
  exportPDF(): void {
    const doc = new jsPDF();
    doc.text('Reporte de Facturas', 14, 10);

    autoTable(doc, {
      head: [
        [
          'Fecha',
          'Tipo Doc',
          'No. Factura',
          'Cliente',
          'NIT',
          'Responsable',
          'Valor',
          'Estado',
        ],
      ],
      body: this.filteredInvoices.map((f) => [
        f.date,
        f.documentType,
        f.invoiceNumber,
        f.client,
        f.nit,
        f.responsible,
        f.totalValue,
        f.status,
      ]),
    });

    doc.save(`Reporte_Facturas_${new Date().getTime()}.pdf`);
  }
}
