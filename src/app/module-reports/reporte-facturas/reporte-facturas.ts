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

  // Propiedades de gráficos
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

  constructor(
    private invoiceService: ReportServices,
    private downloadService: FileDownloadService,
    private permissionsService: PermissionsService
  ) { }

  ngOnInit(): void {
    this.loadInvoices();
    this.permissionsService.checkPermissions();
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
  async exportExcel(): Promise<void> {
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
  async downloadCsv(): Promise<void> {
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

  // ✅ EXPORTAR REPORTE COMPLETO PDF - VERSIÓN CORREGIDA
  async exportFullReportPDF(): Promise<void> {
    const hasPermissions = await this.permissionsService.requestStoragePermissions();
    if (!hasPermissions) {
      alert('No se pueden descargar archivos sin permisos de almacenamiento');
      return;
    }

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      let y = 10;

      // Título
      doc.setFontSize(16);
      doc.text('Reporte Completo de Facturas', 10, y);
      y += 8;

      // Información de filtros aplicados
      doc.setFontSize(10);
      const filtersInfo = this.getFiltersInfo();
      doc.text(filtersInfo, 10, y);
      y += 15;

      // Agregar gráficos con manejo robusto de errores
      y = await this.addChartsToPDF(doc, y);

      // Agregar resumen estadístico
      y = await this.addSummaryToPDF(doc, y);

      // Agregar tabla de facturas
      y = await this.addInvoicesTableToPDF(doc, y);

      const pdfBlob = doc.output('blob');
      const fileUrl = URL.createObjectURL(pdfBlob);
      const fileName = `reporte_completo_facturas_${new Date().toISOString().slice(0, 10)}.pdf`;

      const success = await this.downloadService.download(fileUrl, fileName);

      URL.revokeObjectURL(fileUrl);

      if (success) {
        console.log('✅ Reporte completo PDF exportado exitosamente');
      } else {
        alert('Error al descargar el reporte');
      }

    } catch (error) {
      console.error('❌ Error exportando reporte completo:', error);
      alert('Error al exportar reporte completo: ' + (error as Error).message);
    }
  }

  // ========== MÉTODOS PRIVADOS ==========

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
      error: () => {
        this.loading = false;
      },
    });
  }

  private toNumber(v: any): number {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return v;
    const s = String(v).replace(/,/g, '').replace(/\$/g, '').trim();
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  }

  private fmt(d: string): string {
    if (!d) return '';
    const t = new Date(d);
    if (isNaN(t.getTime())) return d;
    return t.toISOString().slice(0, 10);
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

  private colorForEstado(e: string): string {
    const k = (e || '').toLowerCase();
    if (k === 'emitida') return '#10b981';
    if (k === 'borrador') return '#f59e0b';
    if (k === 'anulada') return '#ef4444';
    return '#0891b2';
  }

  // ✅ MÉTODO AUXILIAR PARA AGREGAR GRÁFICOS AL PDF
  private async addChartsToPDF(doc: jsPDF, startY: number): Promise<number> {
    let y = startY;

    try {
      const charts = [
        { id: 'chart-invoices-month', title: 'Facturas por Mes', chartComp: this.monthChartComp },
        { id: 'chart-invoices-status', title: 'Distribución por Estado', chartComp: this.statusChartComp },
        { id: 'chart-invoices-topclients', title: 'Top Clientes', chartComp: this.topChartComp }
      ];

      for (const chart of charts) {
        const imgData = await this.getChartImageDataUrl(chart.id);
        if (imgData && y < 250) {
          doc.setFontSize(12);
          doc.text(chart.title, 10, y);
          y += 5;

          try {
            doc.addImage(imgData, 'PNG', 10, y, 180, 80);
            y += 85;

            if (y > 250) {
              doc.addPage();
              y = 10;
            }
          } catch (imgError) {
            console.warn(`No se pudo agregar imagen del gráfico ${chart.id}:`, imgError);
            doc.text('(Gráfico no disponible)', 10, y);
            y += 10;
          }
        }
      }
    } catch (error) {
      console.error('Error agregando gráficos al PDF:', error);
      doc.text('Error al generar gráficos', 10, y);
      y += 10;
    }

    return y;
  }

  // ✅ MÉTODO AUXILIAR PARA AGREGAR RESUMEN AL PDF
  private async addSummaryToPDF(doc: jsPDF, startY: number): Promise<number> {
    let y = startY;

    try {
      doc.setFontSize(12);
      doc.text('Resumen Estadístico', 10, y);
      y += 8;

      const totalFacturas = this.dataSource.data.length;
      const totalValor = this.dataSource.data.reduce((sum, factura) => sum + (this.toNumber(factura.total) || 0), 0);
      const estadosCount = this.countByStatus();

      const summaryData = [
        ['Total Facturas:', totalFacturas.toString()],
        ['Valor Total:', `$${totalValor.toLocaleString('es-CO')}`],
        ['Facturas Emitidas:', (estadosCount['emitida'] || 0).toString()],
        ['Facturas Borrador:', (estadosCount['borrador'] || 0).toString()],
        ['Facturas Anuladas:', (estadosCount['anulada'] || 0).toString()],
      ];

      autoTable(doc, {
        startY: y,
        head: [['Métrica', 'Valor']],
        body: summaryData,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });

      y = (doc as any).lastAutoTable.finalY + 10;

    } catch (error) {
      console.error('Error agregando resumen al PDF:', error);
      doc.text('Error al generar resumen', 10, y);
      y += 10;
    }

    return y;
  }

  // ✅ MÉTODO AUXILIAR PARA AGREGAR TABLA DE FACTURAS AL PDF
  private async addInvoicesTableToPDF(doc: jsPDF, startY: number): Promise<number> {
    let y = startY;

    try {
      doc.setFontSize(12);
      doc.text('Detalle de Facturas', 10, y);
      y += 8;

      if (this.dataSource.data.length === 0) {
        doc.text('No hay facturas para mostrar', 10, y);
        return y + 10;
      }

      const facturasParaMostrar = this.dataSource.data.slice(0, 50);

      const tableBody = facturasParaMostrar.map((factura) => [
        this.formatDateForPDF(factura.fecha),
        'Factura',
        factura.numero || '-',
        factura.cliente?.substring(0, 20) || '-',
        factura.cc || '-',
        `$${this.toNumber(factura.total).toLocaleString('es-CO')}`,
        factura.estado || '-'
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Fecha', 'Tipo', 'Número', 'Cliente', 'NIT', 'Valor', 'Estado']],
        body: tableBody,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 139, 202] },
        pageBreak: 'auto'
      });

      y = (doc as any).lastAutoTable.finalY + 10;

      if (this.dataSource.data.length > 50) {
        doc.setFontSize(10);
        doc.text(`* Mostrando 50 de ${this.dataSource.data.length} facturas`, 10, y);
        y += 5;
      }

    } catch (error) {
      console.error('Error agregando tabla al PDF:', error);
      doc.text('Error al generar tabla de facturas', 10, y);
      y += 10;
    }

    return y;
  }

  // ✅ MÉTODOS AUXILIARES NUEVOS
  private getFiltersInfo(): string {
    const filters = [];
    if (this.startDate) filters.push(`Desde: ${this.startDate}`);
    if (this.endDate) filters.push(`Hasta: ${this.endDate}`);
    if (this.status !== 'Todos') filters.push(`Estado: ${this.status}`);
    if (this.clientName) filters.push(`Cliente: ${this.clientName}`);
    if (this.invoiceNumber) filters.push(`Factura: ${this.invoiceNumber}`);

    return filters.length > 0
      ? `Filtros aplicados: ${filters.join(', ')}`
      : 'Todos los registros';
  }

  private countByStatus(): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    this.dataSource.data.forEach(factura => {
      const estado = factura.estado?.toLowerCase() || 'desconocido';
      counts[estado] = (counts[estado] || 0) + 1;
    });
    return counts;
  }

  private formatDateForPDF(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO');
    } catch {
      return dateString;
    }
  }

  // ✅ MEJORAR EL MÉTODO getChartImageDataUrl EXISTENTE
  private async getChartImageDataUrl(id: string): Promise<string | null> {
    try {
      let comp: ChartComponent | undefined;

      switch (id) {
        case 'chart-invoices-status':
          comp = this.statusChartComp;
          break;
        case 'chart-invoices-month':
          comp = this.monthChartComp;
          break;
        case 'chart-invoices-topclients':
          comp = this.topChartComp;
          break;
      }

      if (comp?.chart) {
        try {
          const res = await (comp.chart as any).dataURI();
          return res?.imgURI || null;
        } catch (error) {
          console.warn(`Error con componente chart ${id}:`, error);
        }
      }

      try {
        if (typeof (ApexCharts as any).exec === 'function') {
          const res2 = await (ApexCharts as any).exec(id, 'dataURI');
          return res2?.imgURI || null;
        }
      } catch (error) {
        console.warn(`Error con ApexCharts.exec ${id}:`, error);
      }

      const canvas = document.querySelector(`#${id} canvas`) as HTMLCanvasElement;
      if (canvas) {
        return canvas.toDataURL('image/png');
      }

      return null;

    } catch (error) {
      console.error(`Error obteniendo imagen del gráfico ${id}:`, error);
      return null;
    }
  }

  estadoClass(e: string): string {
    const k = (e || '').toLowerCase();
    if (k === 'emitida') return 'estado-chip estado-emitida-chip';
    if (k === 'borrador') return 'estado-chip estado-borrador-chip';
    if (k === 'anulada') return 'estado-chip estado-anulada-chip';
    return 'estado-chip';
  }
}