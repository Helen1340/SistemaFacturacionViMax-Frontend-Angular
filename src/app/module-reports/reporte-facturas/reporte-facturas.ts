import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportServices, Factura } from '../services/report.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexPlotOptions, ApexXAxis, ChartComponent } from 'ng-apexcharts';
import ApexCharts from 'apexcharts';
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
import { FileDownloadService } from '../services/file-download.service';
import { PermissionsService } from '../services/permissions.service';

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
  displayedColumns: string[] = ['fecha', 'tipo', 'numero', 'cliente', 'cc', 'total', 'estado'];
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
  statusOptions = ['Todos', 'draft', 'issued', 'cancelled'];
  documentOptions = ['Todos', 'Factura Electrónica', 'Nota Crédito', 'Nota Débito'];

  loading = false;

  constructor(
    private invoiceService: ReportServices,
    private downloadService: FileDownloadService,
    private permissionsService: PermissionsService
  ) { }

  ngOnInit(): void {
    this.loadInvoices();
    this.permissionsService.checkPermissions(); // ← AÑADIR
  }

  // ✅ VERIFICAR PERMISOS AL INICIAR
  async checkStoragePermissions(): Promise<void> {
    const hasPermissions = await this.permissionsService.checkPermissions();
    if (!hasPermissions) {
      console.log('⚠️ No hay permisos de almacenamiento');
    }
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
  }

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

  // ✅ EXPORTAR EXCEL - Adaptado
  // ✅ PEDIR PERMISOS ANTES DE DESCARGAR
  async exportExcel(): Promise<void> {
    // Pedir permisos primero
    const hasPermissions = await this.permissionsService.requestStoragePermissions();
    if (!hasPermissions) {
      alert('No se pueden descargar archivos sin permisos de almacenamiento');
      return;
    }

    try {
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Facturas');

      const excelBuffer: any = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'array',
      });

      const data: Blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileUrl = URL.createObjectURL(data);
      const fileName = `Reporte_Facturas_${Date.now()}.xlsx`;

      const success = await this.downloadService.download(fileUrl, fileName);

      URL.revokeObjectURL(fileUrl);

      if (success) {
        console.log('✅ Excel exportado exitosamente');
      }

    } catch (error) {
      console.error('❌ Error exportando Excel:', error);
      alert('Error al exportar Excel');
    }
  }

  // ✅ EXPORTAR PDF - Adaptado
  async exportPDF(): Promise<void> {

    // Pedir permisos primero
    const hasPermissions = await this.permissionsService.requestStoragePermissions();
    if (!hasPermissions) {
      alert('No se pueden descargar archivos sin permisos de almacenamiento');
      return;
    }
    try {
      const doc = new jsPDF();
      doc.text('Reporte de Facturas', 14, 10);

      autoTable(doc, {
        head: [['Fecha', 'Tipo Doc', 'No. Factura', 'Cliente', 'NIT', 'Valor', 'Estado']],
        body: this.dataSource.data.map((f) => [
          f.fecha,
          'Factura',
          f.numero,
          f.cliente,
          f.cc || '',
          f.total,
          f.estado,
        ]),
      });

      const pdfBlob = doc.output('blob');
      const fileUrl = URL.createObjectURL(pdfBlob);
      const fileName = `Reporte_Facturas_${Date.now()}.pdf`;

      const success = await this.downloadService.download(fileUrl, fileName);

      URL.revokeObjectURL(fileUrl);

      if (success) {
        console.log('✅ PDF exportado exitosamente');
      }

    } catch (error) {
      console.error('❌ Error exportando PDF:', error);
      alert('Error al exportar PDF');
    }
  }

  // ✅ DESCARGAR CSV - Adaptado
  // ✅ PEDIR PERMISOS ANTES DE DESCARGAR
  async downloadCsv(): Promise<void> {
    // Pedir permisos primero
    const hasPermissions = await this.permissionsService.requestStoragePermissions();
    if (!hasPermissions) {
      alert('No se pueden descargar archivos sin permisos de almacenamiento');
      return;
    }
    try {
      const params: any = {
        numero_factura: this.invoiceNumber || undefined,
        cliente: this.clientName || undefined,
        desde: this.startDate || undefined,
        hasta: this.endDate || undefined,
        estado: this.status && this.status !== 'Todos' ? this.status : undefined,
      };

      this.invoiceService.downloadInvoicesCsv(params).subscribe(async (blob) => {
        const fileUrl = URL.createObjectURL(blob);
        const fileName = `facturas_${new Date().toISOString().slice(0, 10)}.csv`;

        const success = await this.downloadService.download(fileUrl, fileName);

        URL.revokeObjectURL(fileUrl);

        if (success) {
          console.log('✅ CSV descargado exitosamente');
        }
      }, (error) => {
        console.error('❌ Error descargando CSV:', error);
        alert('Error al descargar CSV');
      });

    } catch (error) {
      console.error('❌ Error en downloadCsv:', error);
      alert('Error al descargar CSV');
    }
  }

  // ✅ DESCARGAR GRÁFICO PNG - Adaptado
  async downloadChartPng(id: string, filename: string): Promise<void> {
    // Pedir permisos primero
    const hasPermissions = await this.permissionsService.requestStoragePermissions();
    if (!hasPermissions) {
      alert('No se pueden descargar archivos sin permisos de almacenamiento');
      return;
    }
    try {
      const dataUrl = await this.getChartImageDataUrl(id);
      if (!dataUrl) {
        alert('No se pudo obtener la imagen del gráfico');
        return;
      }

      // Convertir data URL a blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);

      const success = await this.downloadService.download(fileUrl, filename);

      URL.revokeObjectURL(fileUrl);

      if (success) {
        console.log('✅ Gráfico PNG descargado exitosamente');
      }

    } catch (error) {
      console.error('❌ Error descargando gráfico PNG:', error);
      alert('Error al descargar gráfico');
    }
  }

  // ✅ EXPORTAR GRÁFICOS A PDF - Adaptado
  async exportChartsToPDF(): Promise<void> {
    // Pedir permisos primero
    const hasPermissions = await this.permissionsService.requestStoragePermissions();
    if (!hasPermissions) {
      alert('No se pueden descargar archivos sin permisos de almacenamiento');
      return;
    }
    try {
      const doc = new jsPDF('p', 'mm', 'a4');

      const addImg = async (id: string, y: number, title: string) => {
        const img = await this.getChartImageDataUrl(id);
        if (!img) return y;
        doc.text(title, 10, y);
        doc.addImage(img, 'PNG', 10, y + 5, 190, 90);
        return y + 100;
      };

      let y = 10;
      y = await addImg('chart-invoices-status', y, 'Totales por estado');
      y = await addImg('chart-invoices-month', y, 'Número de facturas por mes');
      y = await addImg('chart-invoices-topclients', y, 'Top clientes por cantidad');

      const pdfBlob = doc.output('blob');
      const fileUrl = URL.createObjectURL(pdfBlob);
      const fileName = `graficos_facturas_${new Date().toISOString().slice(0, 10)}.pdf`;

      const success = await this.downloadService.download(fileUrl, fileName);

      URL.revokeObjectURL(fileUrl);

      if (success) {
        console.log('✅ Gráficos PDF exportados exitosamente');
      }

    } catch (error) {
      console.error('❌ Error exportando gráficos a PDF:', error);
      alert('Error al exportar gráficos a PDF');
    }
  }

  // ✅ EXPORTAR REPORTE COMPLETO PDF - Versión más robusta
  async exportFullReportPDF(): Promise<void> {
    const hasPermissions = await this.permissionsService.requestStoragePermissions();
    if (!hasPermissions) {
      alert('No se pueden descargar archivos sin permisos de almacenamiento');
      return;
    }

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      let y = 10;
      const title = 'Reporte de Facturas';
      doc.setFontSize(16);
      doc.text(title, 10, y);
      y += 8;

      // Agregar gráficos si están disponibles
      const addImg = async (id: string, title2: string) => {
        try {
          const img = await this.getChartImageDataUrl(id);
          if (!img) return y;
          doc.setFontSize(12);
          doc.text(title2, 10, y);
          y += 5;
          doc.addImage(img, 'PNG', 10, y, 190, 80);
          return y + 85;
        } catch (error) {
          console.warn(`No se pudo agregar gráfico ${id}:`, error);
          return y;
        }
      };

      y = await addImg('chart-invoices-month', 'Número de facturas por mes');
      y = await addImg('chart-invoices-status', 'Estado de facturas');
      y = await addImg('chart-invoices-topclients', 'Top clientes');

      // ✅ VERIFICACIONES MÁS ROBUSTAS PARA LOS DATOS
      const byMonthHeader = [['Mes', 'Total']];
      let monthBody: any[][] = [];
      if (this.monthXAxis?.categories && this.monthSeries[0]?.data) {
        monthBody = this.monthXAxis.categories.map((category: string, i: number) => {
          const dataValue = this.monthSeries[0].data[i] || 0;
          return [category, String(dataValue)];
        });
      }

      const byStatusHeader = [['Estado', 'Total']];
      let statusBody: any[][] = [];
      if (this.statusLabels && this.statusSeries) {
        statusBody = this.statusLabels.map((label, i) => [label, String(this.statusSeries[i] || 0)]);
      }

      const topHeader = [['Cliente', 'Total']];
      let topBody: any[][] = [];
      if (this.topXAxis?.categories && this.topSeries[0]?.data) {
        topBody = this.topXAxis.categories.map((category: string, i: number) => {
          const dataValue = this.topSeries[0].data[i] || 0;
          return [category, String(dataValue)];
        });
      }

      doc.setFontSize(12);

      // Agregar tablas solo si tienen datos
      if (monthBody.length > 0) {
        autoTable(doc, { startY: y, head: byMonthHeader, body: monthBody });
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      if (statusBody.length > 0) {
        autoTable(doc, { startY: y, head: byStatusHeader, body: statusBody });
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      if (topBody.length > 0) {
        autoTable(doc, { startY: y, head: topHeader, body: topBody });
      }

      // Si no hay datos en las tablas, mostrar mensaje
      if (monthBody.length === 0 && statusBody.length === 0 && topBody.length === 0) {
        doc.text('No hay datos disponibles para mostrar en las tablas', 10, y);
      }

      const pdfBlob = doc.output('blob');
      const fileUrl = URL.createObjectURL(pdfBlob);
      const fileName = `reporte_facturas_${new Date().toISOString().slice(0, 10)}.pdf`;

      const success = await this.downloadService.download(fileUrl, fileName);

      URL.revokeObjectURL(fileUrl);

      if (success) {
        console.log('✅ Reporte completo PDF exportado exitosamente');
      }

    } catch (error) {
      console.error('❌ Error exportando reporte completo:', error);
      alert('Error al exportar reporte completo: ' + (error as Error).message);
    }
  }

  // ========== MÉTODOS SIN CAMBIOS ==========

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
      desde: this.fmt(this.startDate) || undefined,
      hasta: this.fmt(this.endDate) || undefined,
      estado: this.status && this.status !== 'Todos' ? this.status : undefined,
    };
    this.loading = true;
    this.invoiceService.getInvoices(params).subscribe({
      next: (data) => {
        this.invoices = data.map((item: any) => {
          const subtotal = this.toNumber(item.sub_total || item.subtotal || item.valor_subtotal);
          const impuestos = this.toNumber(item.total_tax || item.impuestos || item.valor_impuestos);
          const totalPrimario = this.toNumber(item.total_invoice || item.total || item.valor_total || item.payment?.valor_pagado);
          const total = totalPrimario > 0 ? totalPrimario : subtotal + impuestos;
          return {
            numero: item.invoice_number || item.numero_factura || '',
            fecha: item.issue_date || item.fecha_emision || '',
            estado: this.mapEstado(item.internal_status || item.estado_interno || item.estado || ''),
            subtotal,
            impuestos,
            total,
            cliente: (item.buyer?.first_name || item.cliente_nombre || item.buyer_name || ''),
            cc: (item.buyer?.document_number || item.cliente_documento || ''),
          } as Factura;
        });
        this.dataSource.data = [...this.invoices];
        if (this.paginator) this.dataSource.paginator = this.paginator;
        this.updateChartsFromData();
        this.loadInvoiceSummary();
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  statusSeries: number[] = [];
  statusLabels: string[] = [];
  statusColors: string[] = ['#10b981', '#f59e0b', '#ef4444'];
  statusChart: ApexChart = { type: 'pie', height: 280, id: 'chart-invoices-status' };

  monthSeries: ApexAxisChartSeries = [{ name: 'Cantidad', data: [] }];
  monthChart: ApexChart = { type: 'line', height: 280, id: 'chart-invoices-month' };
  monthXAxis: ApexXAxis = { categories: [] };
  monthColors: string[] = ['#0891b2'];

  topSeries: ApexAxisChartSeries = [{ name: 'Cantidad', data: [] }];
  topChart: ApexChart = { type: 'bar', height: 280, id: 'chart-invoices-topclients' };
  topXAxis: ApexXAxis = { categories: [] };
  topPlotOptions: ApexPlotOptions = { bar: { horizontal: true } };
  topColors: string[] = ['#0891b2'];

  @ViewChild('statusChartComp') statusChartComp!: ChartComponent;
  @ViewChild('monthChartComp') monthChartComp!: ChartComponent;
  @ViewChild('topChartComp') topChartComp!: ChartComponent;

  private loadInvoiceSummary(): void {
    const params: any = {
      desde: this.fmt(this.startDate) || undefined,
      hasta: this.fmt(this.endDate) || undefined,
    };
    this.invoiceService.getInvoiceSummary(params).subscribe({
      next: (summary) => {
        const byStatus = summary?.totales_por_estado || {};
        const byMonth = summary?.cantidad_por_mes || {};
        const hasStatus = byStatus && Object.keys(byStatus).length > 0;
        const hasMonth = byMonth && Object.keys(byMonth).length > 0;
        const monthKeys = Object.keys(byMonth || {}).sort();
        const topClients = summary?.top_clientes || [];
        if (hasStatus) {
          this.statusLabels = Object.keys(byStatus);
          this.statusSeries = Object.values(byStatus).map((v: any) => Number(v));
          this.statusColors = this.statusLabels.map((l) => this.colorForEstado(l));
        }
        if (hasMonth) {
          this.monthXAxis = { categories: monthKeys };
          this.monthSeries = [{ name: 'Cantidad', data: monthKeys.map((k) => Number((byMonth as any)[k])) }];
        }
        this.topXAxis = { categories: topClients.map((c: any) => c?.cliente || c?.buyer || '') };
        this.topSeries = [{ name: 'Cantidad', data: topClients.map((c: any) => Number(c?.cantidad || c?.count || 0)) }];
      },
      error: () => { },
    });
  }

  private updateChartsFromData(): void {
    const byStatus: Record<string, number> = {};
    const byMonth: Record<string, number> = {};
    (this.dataSource.data || []).forEach((f) => {
      const e = (f.estado || '').toLowerCase();
      byStatus[e] = (byStatus[e] || 0) + 1;
      const d = (f.fecha || '').slice(0, 7);
      if (d) byMonth[d] = (byMonth[d] || 0) + 1;
    });
    const monthKeys = Object.keys(byMonth).sort();
    this.statusLabels = Object.keys(byStatus);
    this.statusSeries = Object.values(byStatus).map((v) => Number(v));
    this.statusColors = this.statusLabels.map((l) => this.colorForEstado(l));
    this.monthXAxis = { categories: monthKeys };
    this.monthSeries = [{ name: 'Cantidad', data: monthKeys.map((k) => Number(byMonth[k])) }];
  }

  estadoClass(e: string): string {
    const k = (e || '').toLowerCase();
    if (k === 'emitida') return 'estado-chip estado-emitida-chip';
    if (k === 'borrador') return 'estado-chip estado-borrador-chip';
    if (k === 'anulada') return 'estado-chip estado-anulada-chip';
    return 'estado-chip';
  }

  private colorForEstado(e: string): string {
    const k = (e || '').toLowerCase();
    if (k === 'emitida') return '#10b981';
    if (k === 'borrador') return '#f59e0b';
    if (k === 'anulada') return '#ef4444';
    return '#0891b2';
  }

  private fmt(d: string): string {
    if (!d) return '';
    const t = new Date(d);
    if (isNaN(t.getTime())) return d;
    return t.toISOString().slice(0, 10);
  }

  private async getChartImageDataUrl(id: string): Promise<string | null> {
    let comp: ChartComponent | undefined;
    if (id === 'chart-invoices-status') comp = this.statusChartComp;
    else if (id === 'chart-invoices-month') comp = this.monthChartComp;
    else if (id === 'chart-invoices-topclients') comp = this.topChartComp;

    // Intento con instancia del componente
    if (comp && comp.chart) {
      try {
        const res = await (comp.chart as any).dataURI();
        return (res?.imgURI as string) || (res?.blobURI as string) || null;
      } catch { }
    }

    // Fallback usando ApexCharts.exec y el id del chart
    try {
      const res2 = await (ApexCharts as any).exec(id, 'dataURI');
      return (res2?.imgURI as string) || (res2?.blobURI as string) || null;
    } catch { }

    return null;
  }
}