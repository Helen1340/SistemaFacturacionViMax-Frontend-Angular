import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexPlotOptions, ApexXAxis } from 'ng-apexcharts';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { saveAs } from 'file-saver';
import { ReportServices, ProductoItem, ResumenProductos } from '../services/report.service';

@Component({
  selector: 'app-reporte-productos',
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

  lineSeries: ApexAxisChartSeries = [{ name: 'Total vendido', data: [] }];
  lineChart: ApexChart = { type: 'line', height: 280 };
  lineXAxis: ApexXAxis = { categories: [] };

  topSeries: ApexAxisChartSeries = [{ name: 'Top por valor', data: [] }];
  topChart: ApexChart = { type: 'bar', height: 280 };
  topXAxis: ApexXAxis = { categories: [] };
  topPlotOptions: ApexPlotOptions = { bar: { horizontal: true } };

  constructor(private reports: ReportServices) {}

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
    const params: any = { texto: this.texto || undefined, estado: this.estado || undefined, desde: this.desde || undefined, hasta: this.hasta || undefined, page: 1, per_page: 50 };
    this.reports.getProductos(params).subscribe(({ data }) => {
      this.dataSource.data = data || [];
      if (this.paginator) this.dataSource.paginator = this.paginator;
    });
  }

  private loadResumen(): void {
    const params: any = { desde: this.desde || undefined, hasta: this.hasta || undefined };
    this.reports.getResumenProductos(params).subscribe((r: ResumenProductos) => {
      this.lineXAxis = { categories: Object.keys(r?.total_por_mes || {}) };
      this.lineSeries = [{ name: 'Total vendido', data: Object.values(r?.total_por_mes || {}).map((v: any) => Number(v)) }];
      const tops = r?.top_por_valor || [];
      this.topXAxis = { categories: tops.map((t) => t.producto) };
      this.topSeries = [{ name: 'Top por valor', data: tops.map((t) => Number(t.total || 0)) }];
    });
  }
}