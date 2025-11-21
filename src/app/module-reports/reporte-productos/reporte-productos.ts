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
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { ReportServices, ProductoItem, ResumenProductos } from '../services/report.service';
import { InvoiceService, Invoice } from '../../module-invoices-notes/services/invoice.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  ],
  templateUrl: './reporte-productos.html',
})
export class ReporteProductos implements OnInit {
  texto = '';
  estado = '';
  desde = '';
  hasta = '';

  dataSource = new MatTableDataSource<ProductoItem>([]);
  displayedColumns: string[] = ['codigo','nombre','unidad','cantidad_vendida','subtotal','impuestos','total','precio_promedio'];
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

  constructor(private reports: ReportServices, private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.load();
    this.loadResumen();
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

  downloadCsv(): void {
    const params: any = { texto: this.texto || undefined, estado: this.estado || undefined, desde: this.desde || undefined, hasta: this.hasta || undefined };
    this.reports.downloadProductosCsv(params).subscribe((blob) => {
      saveAs(blob, `productos_${new Date().toISOString().slice(0,10)}.csv`);
    });
  }

  private load(): void {
    const estadoMap: Record<string, string> = { emitido: 'issued', anulado: 'cancelled' };
    const filters: any = {
      internal_status: estadoMap[(this.estado || '').toLowerCase()] || undefined,
      date_from: this.fmt(this.desde) || undefined,
      date_to: this.fmt(this.hasta) || undefined,
      per_page: 500,
    };
    this.invoiceService.getInvoices(filters).pipe(catchError(() => of([]))).subscribe((invoices: Invoice[]) => {
      if (!invoices || invoices.length === 0) {
        const params: any = { texto: this.texto || undefined, estado: this.estado || undefined, desde: this.fmt(this.desde) || undefined, hasta: this.fmt(this.hasta) || undefined, page: 1, perPage: 50 };
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
        });
        return;
      }
      const detailRequests = invoices.map((inv: any) => this.invoiceService.getInvoice(inv.id).pipe(catchError(() => of(null))));
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
              grouped.set(key, { ...prev, cantidad_vendida: nc, subtotal: ns, impuestos: ni, total: nt, precio_promedio: nc > 0 ? nt / nc : prev.precio_promedio });
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
      });
    });
  }

  private loadResumen(): void {
    const params: any = { desde: this.fmt(this.desde) || undefined, hasta: this.fmt(this.hasta) || undefined };
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

  downloadChartPng(chartId: string, filename: string): void {
    ApexCharts.exec(chartId, 'dataURI').then((data: any) => {
      const url = data?.imgURI;
      if (!url) return;
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    });
  }

  exportChartsToPDF(): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    ApexCharts.exec('productsTopChart', 'dataURI').then((t: any) => {
      const img2 = t?.imgURI;
      if (img2) {
        doc.text('Top 5 productos', 10, 10);
        doc.addImage(img2, 'PNG', 10, 15, 190, 80);
      }
      doc.save(`graficos_productos_${new Date().toISOString().slice(0,10)}.pdf`);
    });
  }

  private fmt(d: string): string {
    if (!d) return '';
    const t = new Date(d);
    if (isNaN(t.getTime())) return d;
    return t.toISOString().slice(0, 10);
  }
}