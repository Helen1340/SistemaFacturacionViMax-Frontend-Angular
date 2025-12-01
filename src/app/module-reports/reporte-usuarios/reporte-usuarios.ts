import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FileDownloadService } from '../services/file-download.service';
import { PermissionsService } from '../services/permissions.service';

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
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './reporte-usuarios.html',
  styleUrl: './reporte-usuarios.css',
})
export class ReporteUsuarios implements OnInit {
  usuarios: Usuario[] = [];
  dataSource = new MatTableDataSource<Usuario>([]);
  displayedColumns: string[] = ['nombre', 'correo', 'documento', 'rol', 'estado', 'fecha'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filtros
  searchQuery: string = '';
  startDate: string = '';
  endDate: string = '';
  email: string = '';
  role: string = '';
  status: string = '';

  // Opciones para selects
  statusOptions = ['Todos', 'activo', 'inactivo', 'bloqueado'];
  roleOptions = ['Todos', 'admin', 'usuario', 'vendedor', 'contador'];

  loading = false;

  // Gráficos
  roleSeries: ApexAxisChartSeries = [{ name: 'Usuarios', data: [] }];
  roleChart: ApexChart = { type: 'bar', height: 280, id: 'usersRoleChart', toolbar: { show: true } };
  roleXAxis: ApexXAxis = { categories: [] };
  rolePlotOptions: ApexPlotOptions = { bar: { horizontal: false } };

  constructor(
    private reportService: ReportServices,
    private downloadService: FileDownloadService,
    private permissionsService: PermissionsService
  ) { }

  ngOnInit(): void {
    this.getUsuarios();
    this.permissionsService.checkPermissions();
  }

  // ✅ VERIFICAR PERMISOS AL INICIAR
  async checkStoragePermissions(): Promise<void> {
    const hasPermissions = await this.permissionsService.checkPermissions();
    if (!hasPermissions) {
      console.log('⚠️ No hay permisos de almacenamiento');
    }
  }

  getUsuarios(): void {
    const params: any = {
      usuario: this.searchQuery || undefined,
      estado: this.status && this.status !== 'Todos' ? this.status : undefined,
      rol: this.role && this.role !== 'Todos' ? this.role : undefined,
      fecha_inicio: this.startDate || undefined,
      fecha_fin: this.endDate || undefined,
    };

    this.loading = true;
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
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
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
    this.dataSource.data = [...this.usuarios];
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
      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');

      const excelBuffer: any = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'array',
      });

      const data: Blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileUrl = URL.createObjectURL(data);
      const fileName = `Reporte_Usuarios_${Date.now()}.xlsx`;

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
      doc.text('Reporte de Usuarios', 14, 10);

      autoTable(doc, {
        head: [['Nombre', 'Correo', 'Documento', 'Rol', 'Estado', 'Fecha creación']],
        body: this.dataSource.data.map((u) => [
          u.nombre,
          u.correo,
          u.documento,
          u.rol,
          u.estado,
          u.fecha_creacion || 'N/A',
        ]),
      });

      const pdfBlob = doc.output('blob');
      const fileUrl = URL.createObjectURL(pdfBlob);
      const fileName = `Reporte_Usuarios_${Date.now()}.pdf`;

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
        usuario: this.searchQuery || undefined,
        estado: this.status && this.status !== 'Todos' ? this.status : undefined,
        rol: this.role && this.role !== 'Todos' ? this.role : undefined,
        fecha_inicio: this.startDate || undefined,
        fecha_fin: this.endDate || undefined,
      };

      this.reportService.downloadUsuariosCsv(params).subscribe(async (blob) => {
        const fileUrl = URL.createObjectURL(blob);
        const fileName = `usuarios_${new Date().toISOString().slice(0, 10)}.csv`;

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

  // ✅ EXPORTAR REPORTE INDIVIDUAL - Adaptado
  async downloadReport(user: Usuario, type: 'PDF' | 'Excel'): Promise<void> {
    const hasPermissions = await this.permissionsService.requestStoragePermissions();
    if (!hasPermissions) {
      alert('No se pueden descargar archivos sin permisos de almacenamiento');
      return;
    }

    try {
      if (type === 'Excel') {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([user]);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Usuario');

        const excelBuffer: any = XLSX.write(wb, {
          bookType: 'xlsx',
          type: 'array',
        });

        const data: Blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const fileUrl = URL.createObjectURL(data);
        const fileName = `usuario_${user.id}.xlsx`;

        const success = await this.downloadService.download(fileUrl, fileName);
        URL.revokeObjectURL(fileUrl);

        if (success) {
          console.log('✅ Reporte individual Excel exportado exitosamente');
        }

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

        const pdfBlob = doc.output('blob');
        const fileUrl = URL.createObjectURL(pdfBlob);
        const fileName = `usuario_${user.id}.pdf`;

        const success = await this.downloadService.download(fileUrl, fileName);
        URL.revokeObjectURL(fileUrl);

        if (success) {
          console.log('✅ Reporte individual PDF exportado exitosamente');
        }
      }
    } catch (error) {
      console.error('❌ Error exportando reporte individual:', error);
      alert('Error al exportar reporte individual');
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

      y = await addImg('usersRoleChart', 'Usuarios por Rol');

      const pdfBlob = doc.output('blob');
      const fileUrl = URL.createObjectURL(pdfBlob);
      const fileName = `graficos_usuarios_${new Date().toISOString().slice(0, 10)}.pdf`;

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
      const title = 'Reporte Completo de Usuarios';
      doc.setFontSize(16);
      doc.text(title, 10, y);
      y += 8;

      // Agregar gráfico
      const chartImg = await this.getChartImageDataUrl('usersRoleChart');
      if (chartImg) {
        doc.setFontSize(12);
        doc.text('Distribución de Usuarios por Rol', 10, y);
        y += 5;
        doc.addImage(chartImg, 'PNG', 10, y, 190, 80);
        y += 85;
      }

      // Agregar tabla de datos
      doc.setFontSize(12);
      doc.text('Resumen por Rol', 10, y);
      y += 5;

      const byRole = this.getUsersByRole();
      const roleHeader = [['Rol', 'Cantidad']];
      const roleBody = Object.keys(byRole).map(rol => [rol, String(byRole[rol])]);

      autoTable(doc, { startY: y, head: roleHeader, body: roleBody });
      const afterRole = (doc as any).lastAutoTable.finalY || y + 10;

      // Agregar tabla de usuarios
      doc.setFontSize(12);
      doc.text('Lista de Usuarios', 10, afterRole + 6);

      autoTable(doc, {
        startY: afterRole + 12,
        head: [['Nombre', 'Correo', 'Documento', 'Rol', 'Estado']],
        body: this.dataSource.data.map((u) => [
          u.nombre,
          u.correo,
          u.documento,
          u.rol,
          u.estado,
        ]),
      });

      const pdfBlob = doc.output('blob');
      const fileUrl = URL.createObjectURL(pdfBlob);
      const fileName = `reporte_completo_usuarios_${new Date().toISOString().slice(0, 10)}.pdf`;

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

  // ========== MÉTODOS AUXILIARES ==========

  private renderUserCharts(): void {
    const byRole: Record<string, number> = {};
    (this.dataSource.data || []).forEach((u) => {
      const r = (u.rol || '').toLowerCase();
      byRole[r] = (byRole[r] || 0) + 1;
    });
    this.roleXAxis = { categories: Object.keys(byRole) };
    this.roleSeries = [{ name: 'Usuarios', data: Object.values(byRole) }];
  }

  private getUsersByRole(): Record<string, number> {
    const byRole: Record<string, number> = {};
    (this.dataSource.data || []).forEach((u) => {
      const r = (u.rol || 'Sin rol');
      byRole[r] = (byRole[r] || 0) + 1;
    });
    return byRole;
  }

  private async getChartImageDataUrl(id: string): Promise<string | null> {
    try {
      const res = await (ApexCharts as any).exec(id, 'dataURI');
      return (res?.imgURI as string) || (res?.blobURI as string) || null;
    } catch (error) {
      console.error('Error obteniendo imagen del gráfico:', error);
      return null;
    }
  }

  // Menú acciones
  toggleMenu(event: Event): void {
    const button = event.currentTarget as HTMLElement;
    const dropdown = button.nextElementSibling as HTMLElement;
    dropdown.classList.toggle('hidden');
  }
}