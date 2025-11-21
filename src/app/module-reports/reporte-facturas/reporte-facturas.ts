import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportServices, Factura } from '../services/report.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexLegend, ApexPlotOptions, ApexTitleSubtitle, ApexXAxis } from 'ng-apexcharts';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

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
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './reporte-facturas.html',
  styleUrl: './reporte-facturas.css',
})
export class ReporteFacturas implements OnInit {
  invoices: Factura[] = [];
  dataSource = new MatTableDataSource<Factura>([]);
  displayedColumns: string[] = ['fecha', 'tipo', 'numero', 'cliente', 'nit', 'responsable', 'total', 'estado'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

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

  loading = false;
  constructor(private invoiceService: ReportServices) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.loadInvoiceSummary();
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
    this.loadInvoices();
    this.loadInvoiceSummary();
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
    this.dataSource.data = [...this.invoices];
  }

  // 🔹 Exportar Excel (solo filtradas)
  exportExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
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
      body: this.dataSource.data.map((f) => [
        f.fecha,
        'Factura',
        f.numero,
        f.cliente,
        '',
        '',
        f.total,
        f.estado,
      ]),
    });

    doc.save(`Reporte_Facturas_${new Date().getTime()}.pdf`);
  }

  downloadCsv(): void {
    const params: any = {
      numero_factura: this.invoiceNumber || undefined,
      cliente: this.clientName || undefined,
      desde: this.startDate || undefined,
      hasta: this.endDate || undefined,
      estado: this.status && this.status !== 'Todos' ? this.status : undefined,
    };
    this.invoiceService.downloadInvoicesCsv(params).subscribe((blob) => {
      saveAs(blob, `facturas_${new Date().toISOString().slice(0, 10)}.csv`);
    });
  }

  private toNumber(v: any): number {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return v;
    const s = String(v).replace(/,/g, '').trim();
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  }

  private loadInvoices(): void {
    const params: any = {
      numero_factura: this.invoiceNumber || undefined,
      cliente: this.clientName || undefined,
      desde: this.startDate || undefined,
      hasta: this.endDate || undefined,
      estado: this.status && this.status !== 'Todos' ? this.status : undefined,
    };
    this.loading = true;
    this.invoiceService.getInvoices(params).subscribe({
      next: (data) => {
        this.invoices = data.map((item: any) => {
          const subtotal = this.toNumber(item.subtotal || item.valor_subtotal);
          const impuestos = this.toNumber(item.impuestos || item.valor_impuestos);
          const totalPrimario = this.toNumber(item.total || item.valor_total || item.payment?.valor_pagado);
          const total = totalPrimario > 0 ? totalPrimario : subtotal + impuestos;
          return {
            numero: item.invoice_number || item.numero_factura || '',
            fecha: item.issue_date || item.fecha_emision || '',
            estado: this.mapEstado(item.internal_status || item.estado_interno || item.estado || ''),
            subtotal,
            impuestos,
            total,
            cliente: (item.buyer?.first_name || item.cliente_nombre || item.buyer_name || ''),
          } as Factura;
        });
        this.dataSource.data = [...this.invoices];
        if (this.paginator) this.dataSource.paginator = this.paginator;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  statusSeries: number[] = [];
  statusLabels: string[] = [];
  statusChart: ApexChart = { type: 'pie', height: 280 };

  monthSeries: ApexAxisChartSeries = [{ name: 'Cantidad', data: [] }];
  monthChart: ApexChart = { type: 'line', height: 280 };
  monthXAxis: ApexXAxis = { categories: [] };

  topSeries: ApexAxisChartSeries = [{ name: 'Total', data: [] }];
  topChart: ApexChart = { type: 'bar', height: 280 };
  topXAxis: ApexXAxis = { categories: [] };
  topPlotOptions: ApexPlotOptions = { bar: { horizontal: true } };

  private loadInvoiceSummary(): void {
    const params: any = {
      desde: this.startDate || undefined,
      hasta: this.endDate || undefined,
    };
    this.invoiceService.getInvoiceSummary(params).subscribe({
      next: (summary) => {
        const byStatus = summary?.totales_por_estado || {};
        const byMonth = summary?.cantidad_por_mes || {};
        const topClients = summary?.top_clientes || [];
        this.statusLabels = Object.keys(byStatus);
        this.statusSeries = Object.values(byStatus).map((v: any) => Number(v));
        this.monthXAxis = { categories: Object.keys(byMonth) };
        this.monthSeries = [{ name: 'Cantidad', data: Object.values(byMonth).map((v: any) => Number(v)) }];
        this.topXAxis = { categories: topClients.map((c: any) => c?.cliente || c?.buyer || '') };
        this.topSeries = [{ name: 'Total', data: topClients.map((c: any) => Number(c?.total || c?.monto || 0)) }];
      },
      error: () => {},
    });
  }

  downloadChartPng(id: string, filename: string): void {
    const el = document.getElementById(id) as HTMLElement;
    if (!el) return;
    const canvas = el.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  }

  exportChartsToPDF(): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    const addCanvas = (id: string, y: number, title: string) => {
      const canvas = document.getElementById(id) as HTMLCanvasElement;
      if (!canvas) return y;
      const img = canvas.toDataURL('image/png', 1.0);
      doc.text(title, 10, y);
      doc.addImage(img, 'PNG', 10, y + 5, 190, 90);
      return y + 100;
    };
    let y = 10;
    y = addCanvas('chart-invoices-status', y, 'Totales por estado');
    y = addCanvas('chart-invoices-month', y, 'Totales por mes');
    y = addCanvas('chart-invoices-topclients', y, 'Top clientes');
    doc.save(`graficos_facturas_${new Date().toISOString().slice(0,10)}.pdf`);
  }

  exportFullReportPDF(): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 10;
    const title = 'Reporte de Facturas';
    doc.setFontSize(16);
    doc.text(title, 10, y);
    y += 8;

    const addCanvas = (id: string, title2: string) => {
      const canvas = document.getElementById(id) as HTMLCanvasElement;
      if (!canvas) return;
      const img = canvas.toDataURL('image/png', 1.0);
      doc.setFontSize(12);
      doc.text(title2, 10, y);
      y += 5;
      doc.addImage(img, 'PNG', 10, y, 190, 80);
      y += 85;
    };

    addCanvas('chart-invoices-month', 'Número de facturas por mes');
    addCanvas('chart-invoices-status', 'Estado de facturas');
    addCanvas('chart-invoices-topclients', 'Top clientes');

    const byStatusHeader = [['Estado', 'Total']];
    const byStatus = (this as any)._statusChart?.data || { labels: [], datasets: [{ data: [] }] };
    const statusBody = (byStatus.labels as string[]).map((l, i) => [l, String((byStatus.datasets[0].data as number[])[i] || 0)]);

    const byMonthHeader = [['Mes', 'Total']];
    const byMonth = (this as any)._monthChart?.data || { labels: [], datasets: [{ data: [] }] };
    const monthBody = (byMonth.labels as string[]).map((l, i) => [l, String((byMonth.datasets[0].data as number[])[i] || 0)]);

    const topHeader = [['Cliente', 'Total']];
    const top = (this as any)._topClientsChart?.data || { labels: [], datasets: [{ data: [] }] };
    const topBody = (top.labels as string[]).map((l, i) => [l, String((top.datasets[0].data as number[])[i] || 0)]);

    doc.setFontSize(12);
    autoTable(doc, { startY: y, head: byMonthHeader, body: monthBody });
    const afterMonth = (doc as any).lastAutoTable.finalY || y + 10;
    autoTable(doc, { startY: afterMonth + 6, head: byStatusHeader, body: statusBody });
    const afterStatus = (doc as any).lastAutoTable.finalY || afterMonth + 16;
    autoTable(doc, { startY: afterStatus + 6, head: topHeader, body: topBody });

    doc.save(`reporte_facturas_${new Date().toISOString().slice(0,10)}.pdf`);
  }
}
