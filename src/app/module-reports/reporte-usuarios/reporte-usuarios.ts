import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportServices, Usuario } from '../services/report.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexLegend, ApexPlotOptions, ApexTitleSubtitle, ApexXAxis } from 'ng-apexcharts';
import ApexCharts from 'apexcharts';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-reporte-usuarios',
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
  templateUrl: './reporte-usuarios.html',
  styleUrl: './reporte-usuarios.css',
})
export class ReporteUsuarios implements OnInit {
  usuarios: Usuario[] = [];
  dataSource = new MatTableDataSource<Usuario>([]);
  displayedColumns: string[] = ['nombre','correo','documento','rol','estado','fecha'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filtros
  searchQuery: string = '';
  startDate: string = '';
  endDate: string = '';
  email: string = '';
  role: string = '';
  status: string = '';

  constructor(private reportService: ReportServices) {}

  ngOnInit(): void {
    this.getUsuarios();
  }

  getUsuarios(): void {
    const params: any = {
      usuario: this.searchQuery || undefined,
      estado: this.status || undefined,
      rol: this.role || undefined,
      fecha_inicio: this.startDate || undefined,
      fecha_fin: this.endDate || undefined,
    };
    this.reportService.getUsuarios(params).subscribe({
      next: (res: any[]) => {
        this.usuarios = res.map((item: any) => ({
          id: item.id,
          nombre: item.first_name || item.nombre || '',
          correo: item.email || item.correo || '',
          documento: item.document_number || item.documento || '',
          estado: item.status || item.estado || '',
          fecha_creacion: item.created_at || item.createdAt || item.creation_date || item.fecha_creacion || item.fecha || null,
          ultimo_acceso: item.last_access || item.ultimo_acceso || null,
          rol: item.role?.role_name || item.rol || '',
        }));
        this.dataSource.data = [...this.usuarios];
        if (this.paginator) this.dataSource.paginator = this.paginator;
        if (this.sort) this.dataSource.sort = this.sort;
        this.renderUserCharts();
      },
      error: () => {},
    });
  }

  applyFilters(): void {
    this.getUsuarios();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.startDate = '';
    this.endDate = '';
    this.email = '';
    this.role = '';
    this.status = '';
    this.getUsuarios();
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'activo':
        return 'text-green-600';
      case 'inactivo':
        return 'text-gray-500';
      case 'bloqueado':
        return 'text-red-600';
      default:
        return '';
    }
  }

  // Exportar toda la tabla filtrada
  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    XLSX.writeFile(wb, 'usuarios.xlsx');
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ['Nombre', 'Correo', 'Documento', 'Rol', 'Estado', 'Fecha creación'],
      ],
      body: this.dataSource.data.map((u) => [
        u.nombre,
        u.correo,
        u.documento,
        u.rol,
        u.estado,
        u.fecha_creacion || 'N/A',
      ]),
    });
    doc.save('usuarios.pdf');
  }

  // Exportar por usuario desde menú
  downloadReport(user: Usuario, type: 'PDF' | 'Excel'): void {
    if (type === 'Excel') {
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([user]);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Usuario');
      XLSX.writeFile(wb, `usuario_${user.id}.xlsx`);
    } else {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Campo', 'Valor']],
        body: [
          ['Nombre', user.nombre],
          ['Correo', user.correo],
          ['Documento', user.documento],
          ['Rol', user.rol],
          ['Estado', user.estado],
          ['Fecha creación', user.fecha_creacion || 'N/A'],
        ],
      });
      doc.save(`usuario_${user.id}.pdf`);
    }
  }

  downloadCsv(): void {
    const params: any = {
      usuario: this.searchQuery || undefined,
      estado: this.status || undefined,
      rol: this.role || undefined,
      fecha_inicio: this.startDate || undefined,
      fecha_fin: this.endDate || undefined,
    };
    this.reportService.downloadUsuariosCsv(params).subscribe((blob) => {
      saveAs(blob, `usuarios_${new Date().toISOString().slice(0, 10)}.csv`);
    });
  }

  roleSeries: ApexAxisChartSeries = [{ name: 'Usuarios', data: [] }];
  roleChart: ApexChart = { type: 'bar', height: 280, id: 'usersRoleChart', toolbar: { show: true } };
  roleXAxis: ApexXAxis = { categories: [] };
  rolePlotOptions: ApexPlotOptions = { bar: { horizontal: false } };

  private renderUserCharts(): void {
    const byRole: Record<string, number> = {};
    (this.dataSource.data || []).forEach((u) => {
      const r = (u.rol || '').toLowerCase();
      byRole[r] = (byRole[r] || 0) + 1;
    });
    this.roleXAxis = { categories: Object.keys(byRole) };
    this.roleSeries = [{ name: 'Usuarios', data: Object.values(byRole) }];
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
    ApexCharts.exec('usersRoleChart', 'dataURI').then((data: any) => {
      const img = data?.imgURI;
      if (img) {
        doc.text('Usuarios por rol', 10, 10);
        doc.addImage(img, 'PNG', 10, 15, 190, 90);
      }
      doc.save(`graficos_usuarios_${new Date().toISOString().slice(0,10)}.pdf`);
    });
  }

  // Menú acciones
  toggleMenu(event: Event): void {
    const button = event.currentTarget as HTMLElement;
    const dropdown = button.nextElementSibling as HTMLElement;
    dropdown.classList.toggle('hidden');
  }
}
