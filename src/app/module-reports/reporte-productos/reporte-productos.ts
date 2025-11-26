import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexPlotOptions, ApexXAxis } from 'ng-apexcharts';
import ApexCharts from 'apexcharts';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { ReportServices, ProductoItem, ResumenProductos } from '../services/report.service';
import { InvoiceService, Invoice } from '../../module-invoices-notes/services/invoice.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FileDownloadService } from '../services/file-download.service';
import { PermissionsService } from '../services/permissions.service';

@Component({
  selector: 'app-reporte-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './reporte-productos.html',
})
export class ReporteProductos implements OnInit {
  texto = '';
  estado = '';
  desde = '';
  hasta = '';

  dataSource = new MatTableDataSource<ProductoItem>([]);
  displayedColumns: string[] = ['codigo', 'nombre', 'unidad', 'cantidad_vendida', 'subtotal', 'impuestos', 'total', 'precio_promedio'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  lineSeries: ApexAxisChartSeries = [{ name: 'Total vendido', data: [] }];
  lineChart: ApexChart = { type: 'line', height: 280, id: 'productsMonthChart', toolbar: { show: true } };
  lineXAxis: ApexXAxis = { categories: [] };

  topSeries: ApexAxisChartSeries = [{ name: 'Top por valor', data: [] }];
  topChart: ApexChart = { type: 'bar', height: 280, id: 'productsTopChart', toolbar: { show: true } };
  topXAxis: ApexXAxis = { categories: [] };
  topPlotOptions: ApexPlotOptions = { bar: { horizontal: true } };
  hasTopData = false;
  hasTopNonZero = false;
  aggregated: ProductoItem[] = [];

  loading = false;

  // Opciones para selects
  estadoOptions = ['Todos', 'emitido', 'anulado'];

  constructor(
    private reports: ReportServices,
    private invoiceService: InvoiceService,
    private downloadService: FileDownloadService,
    private permissionsService: PermissionsService
  ) { }

  ngOnInit(): void {
    this.load();
    this.loadResumen();
    this.permissionsService.checkPermissions();
  }

  // ✅ VERIFICAR PERMISOS AL INICIAR
  async checkStoragePermissions(): Promise<void> {
    const hasPermissions = await this.permissionsService.checkPermissions();
    if (!hasPermissions) {
      console.log('⚠️ No hay permisos de almacenamiento');
    }
  }

  apply(): void {
    this.load();
    this.loadResumen();
  }

  reset(): void {
    this.texto = '';
    this.estado = '';
    this.desde = '';
    this.hasta = '';
    this.load();
    this.loadResumen();
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
        texto: this.texto || undefined,
        estado: this.estado && this.estado !== 'Todos' ? this.estado : undefined,
        desde: this.desde || undefined,
        hasta: this.hasta || undefined
      };

      this.reports.downloadProductosCsv(params).subscribe(async (blob) => {
        const fileUrl = URL.createObjectURL(blob);
        const fileName = `productos_${new Date().toISOString().slice(0, 10)}.csv`;

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
      XLSX.utils.book_append_sheet(wb, ws, 'Productos');

      const excelBuffer: any = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'array',
      });

      const data: Blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileUrl = URL.createObjectURL(data);
      const fileName = `Reporte_Productos_${Date.now()}.xlsx`;

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
      doc.text('Reporte de Productos', 14, 10);

      autoTable(doc, {
        head: [['Código', 'Nombre', 'Unidad', 'Cantidad Vendida', 'Subtotal', 'Impuestos', 'Total', 'Precio Promedio']],
        body: this.dataSource.data.map((p) => [
          p.codigo,
          p.nombre,
          p.unidad,
          p.cantidad_vendida?.toString() || '0',
          p.subtotal?.toString() || '0',
          p.impuestos?.toString() || '0',
          p.total?.toString() || '0',
          p.precio_promedio?.toString() || '0',
        ]),
      });

      const pdfBlob = doc.output('blob');
      const fileUrl = URL.createObjectURL(pdfBlob);
      const fileName = `Reporte_Productos_${Date.now()}.pdf`;

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

  // ✅ DESCARGAR GRÁFICO PNG - Adaptado
  async downloadChartPng(chartId: string, filename: string): Promise<void> {
    const hasPermissions = await this.permissionsService.requestStoragePermissions();
    if (!hasPermissions) {
      alert('No se pueden descargar archivos sin permisos de almacenamiento');
      return;
    }

    try {
      const dataUrl = await this.getChartImageDataUrl(chartId);
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
      let y = 10;

      const addImg = async (id: string, title: string) => {
        const img = await this.getChartImageDataUrl(id);
        if (!img) return y;
        doc.text(title, 10, y);
        doc.addImage(img, 'PNG', 10, y + 5, 190, 90);
        return y + 100;
      };

      y = await addImg('productsTopChart', 'Top 5 Productos por Unidades Vendidas');
      y = await addImg('productsMonthChart', 'Ventas por Mes');

      const pdfBlob = doc.output('blob');
      const fileUrl = URL.createObjectURL(pdfBlob);
      const fileName = `graficos_productos_${new Date().toISOString().slice(0, 10)}.pdf`;

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

  // ✅ EXPORTAR REPORTE COMPLETO PDF - Adaptado
  async exportFullReportPDF(): Promise<void> {
    const hasPermissions = await this.permissionsService.requestStoragePermissions();
    if (!hasPermissions) {
      alert('No se pueden descargar archivos sin permisos de almacenamiento');
      return;
    }

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      let y = 10;
      const title = 'Reporte Completo de Productos';
      doc.setFontSize(16);
      doc.text(title, 10, y);
      y += 8;

      // Agregar gráficos
      const addImg = async (id: string, title2: string) => {
        const img = await this.getChartImageDataUrl(id);
        if (!img) return y;
        doc.setFontSize(12);
        doc.text(title2, 10, y);
        y += 5;
        doc.addImage(img, 'PNG', 10, y, 190, 80);
        return y + 85;
      };

      y = await addImg('productsMonthChart', 'Ventas por Mes');
      y = await addImg('productsTopChart', 'Top Productos por Unidades Vendidas');

      // Agregar tabla de top productos
      doc.setFontSize(12);
      doc.text('Resumen de Top Productos', 10, y);
      y += 5;

      const topProducts = [...this.dataSource.data]
        .sort((a, b) => (b.cantidad_vendida || 0) - (a.cantidad_vendida || 0))
        .slice(0, 10);

      const topHeader = [['Producto', 'Unidades Vendidas', 'Total Vendido']];
      const topBody = topProducts.map(p => [
        p.nombre,
        String(p.cantidad_vendida || 0),
        `$${(p.total || 0).toLocaleString()}`
      ]);

      autoTable(doc, { startY: y, head: topHeader, body: topBody });
      const afterTop = (doc as any).lastAutoTable.finalY || y + 10;

      // Agregar tabla completa de productos
      doc.setFontSize(12);
      doc.text('Lista Completa de Productos', 10, afterTop + 6);

      autoTable(doc, {
        startY: afterTop + 12,
        head: [['Código', 'Nombre', 'Unidad', 'Cantidad', 'Subtotal', 'Impuestos', 'Total']],
        body: this.dataSource.data.map((p) => [
          p.codigo,
          p.nombre,
          p.unidad,
          p.cantidad_vendida?.toString() || '0',
          `$${(p.subtotal || 0).toLocaleString()}`,
          `$${(p.impuestos || 0).toLocaleString()}`,
          `$${(p.total || 0).toLocaleString()}`,
        ]),
      });

      const pdfBlob = doc.output('blob');
      const fileUrl = URL.createObjectURL(pdfBlob);
      const fileName = `reporte_completo_productos_${new Date().toISOString().slice(0, 10)}.pdf`;

      const success = await this.downloadService.download(fileUrl, fileName);

      URL.revokeObjectURL(fileUrl);

      if (success) {
        console.log('✅ Reporte completo PDF exportado exitosamente');
      }

    } catch (error) {
      console.error('❌ Error exportando reporte completo:', error);
      alert('Error al exportar reporte completo');
    }
  }

  // ========== MÉTODOS EXISTENTES (CON ALGUNAS MEJORAS) ==========

  private load(): void {
    this.loading = true;

    const estadoMap: Record<string, string> = { emitido: 'issued', anulado: 'cancelled' };
    const filters: any = {
      internal_status: this.estado && this.estado !== 'Todos' ? estadoMap[this.estado.toLowerCase()] : undefined,
      date_from: this.fmt(this.desde) || undefined,
      date_to: this.fmt(this.hasta) || undefined,
      per_page: 500,
    };

    this.invoiceService.getInvoices(filters).pipe(catchError(() => of([]))).subscribe((invoices: Invoice[]) => {
      if (!invoices || invoices.length === 0) {
        const params: any = {
          texto: this.texto || undefined,
          estado: this.estado && this.estado !== 'Todos' ? this.estado : undefined,
          desde: this.fmt(this.desde) || undefined,
          hasta: this.fmt(this.hasta) || undefined,
          page: 1,
          perPage: 50
        };

        this.reports.getProductos(params).pipe(catchError(() => of({ data: [] as ProductoItem[], total: 0 }))).subscribe(({ data }) => {
          const mapped: ProductoItem[] = (data || []).map((item: any) => ({
            codigo: item.codigo || item.code || item.product_code || '',
            nombre: item.nombre || item.name || item.product_name || '',
            unidad: item.unidad || item.unit || item.measure || '',
            cantidad_vendida: Number(item.cantidad_vendida ?? item.cantidad ?? item.quantity ?? 0),
            subtotal: Number(item.subtotal ?? item.valor_subtotal ?? item.sub_total ?? 0),
            impuestos: Number(item.impuestos ?? item.taxes ?? item.iva ?? 0),
            total: Number(item.total ?? item.valor_total ?? 0),
            precio_promedio: Number(item.precio_promedio ?? item.average_price ?? 0),
          }));
          this.dataSource.data = mapped;
          this.aggregated = mapped;
          if (this.paginator) this.dataSource.paginator = this.paginator;
          if (this.sort) this.dataSource.sort = this.sort;
          this.loading = false;
        });
        return;
      }

      const detailRequests = invoices.map((inv: any) =>
        this.invoiceService.getInvoice(inv.id).pipe(catchError(() => of(null)))
      );

      forkJoin(detailRequests).subscribe((fulls) => {
        const grouped = new Map<string, ProductoItem>();
        for (const inv of fulls.filter(Boolean) as Invoice[]) {
          const details = (inv?.invoiceDetails || []) as any[];
          for (const d of details) {
            const item = d?.item || {};
            const code = item?.product_code || '';
            const name = item?.name || d?.description || '';
            if (!code && !item?.product_code) continue;
            const unidad = item?.measurementUnit?.name || '';
            const key = code || name;
            const prev = grouped.get(key);
            const cantidad = Number(d?.quantity || 0);
            const subtotal = Number(d?.line_extension_amount || 0);
            const impuestos = Number(d?.tax_amount || 0);
            const total = Number(d?.total_line_amount || 0);

            if (!prev) {
              grouped.set(key, {
                codigo: code,
                nombre: name,
                unidad,
                cantidad_vendida: cantidad,
                subtotal,
                impuestos,
                total,
                precio_promedio: cantidad > 0 ? total / cantidad : 0,
              });
            } else {
              const nc = (prev.cantidad_vendida || 0) + cantidad;
              const ns = (prev.subtotal || 0) + subtotal;
              const ni = (prev.impuestos || 0) + impuestos;
              const nt = (prev.total || 0) + total;
              grouped.set(key, {
                ...prev,
                cantidad_vendida: nc,
                subtotal: ns,
                impuestos: ni,
                total: nt,
                precio_promedio: nc > 0 ? nt / nc : prev.precio_promedio
              });
            }
          }
        }
        const arr = Array.from(grouped.values());
        this.aggregated = arr;
        this.dataSource.data = arr;
        if (this.paginator) this.dataSource.paginator = this.paginator;
        if (this.sort) this.dataSource.sort = this.sort;

        const tops = [...arr].sort((a, b) => (b.cantidad_vendida || 0) - (a.cantidad_vendida || 0)).slice(0, 5);
        const vals = tops.map(t => Number(t.cantidad_vendida || 0));
        this.topXAxis = { categories: tops.map(t => t.nombre) };
        this.topSeries = [{ name: 'Top por unidades', data: vals }];
        this.hasTopData = vals.length > 0;
        this.hasTopNonZero = vals.some(v => v > 0);
        this.loading = false;
      });
    });
  }

  private loadResumen(): void {
    const params: any = {
      desde: this.fmt(this.desde) || undefined,
      hasta: this.fmt(this.hasta) || undefined
    };

    this.reports.getResumenProductos(params).subscribe((r: ResumenProductos) => {
      const byMonth = r?.total_por_mes || {};
      const keys = Object.keys(byMonth).sort();
      this.lineXAxis = { categories: keys };
      this.lineSeries = [{ name: 'Total vendido', data: keys.map(k => Number((byMonth as any)[k])) }];

      const tops = r?.top_por_unidades || [];
      this.topXAxis = { categories: tops.map((t: any) => t.producto) };
      const vals = tops.map((t: any) => Number(t.unidades || t.cantidad || 0));

      if (vals.some(v => v > 0)) {
        this.topSeries = [{ name: 'Top por unidades', data: vals }];
        this.hasTopData = vals.length > 0;
        this.hasTopNonZero = vals.some(v => v > 0);
      } else if (this.aggregated && this.aggregated.length > 0) {
        const localTops = [...this.aggregated].sort((a, b) => (b.cantidad_vendida || 0) - (a.cantidad_vendida || 0)).slice(0, 5);
        const localVals = localTops.map(t => Number(t.cantidad_vendida || 0));
        this.topXAxis = { categories: localTops.map(t => t.nombre) };
        this.topSeries = [{ name: 'Top por unidades', data: localVals }];
        this.hasTopData = localVals.length > 0;
        this.hasTopNonZero = localVals.some(v => v > 0);
      }
    });
  }

  // ========== MÉTODOS AUXILIARES ==========

  private async getChartImageDataUrl(id: string): Promise<string | null> {
    try {
      const res = await (ApexCharts as any).exec(id, 'dataURI');
      return (res?.imgURI as string) || (res?.blobURI as string) || null;
    } catch (error) {
      console.error('Error obteniendo imagen del gráfico:', error);
      return null;
    }
  }

  private fmt(d: string): string {
    if (!d) return '';
    const t = new Date(d);
    if (isNaN(t.getTime())) return d;
    return t.toISOString().slice(0, 10);
  }
}