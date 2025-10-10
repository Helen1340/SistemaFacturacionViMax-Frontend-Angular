import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportServices, Usuario } from '../services/report.service';

@Component({
  selector: 'app-reporte-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-usuarios.html',
  styleUrl: './reporte-usuarios.css',
})
export class ReporteUsuarios implements OnInit {
  usuarios: Usuario[] = [];
  filteredUsers: Usuario[] = [];

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
    this.reportService.getUsuarios().subscribe({
      next: (res) => {
        this.usuarios = res;
        this.filteredUsers = [...this.usuarios];
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
      },
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.usuarios.filter((user) => {
      // Búsqueda por nombre o documento
      const matchesSearch =
        !this.searchQuery ||
        user.nombre?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.documento?.toString().includes(this.searchQuery);

      // Búsqueda por correo
      const matchesEmail =
        !this.email ||
        user.correo?.toLowerCase().includes(this.email.toLowerCase());

      // Filtro por rol
      const matchesRole =
        !this.role || user.rol?.toLowerCase() === this.role.toLowerCase();

      // Filtro por estado
      const matchesStatus =
        !this.status ||
        user.estado?.toLowerCase() === this.status.toLowerCase();

      // Manejo seguro de fechas
      let matchesDate = true;

      if (this.startDate) {
        const inicio = new Date(this.startDate);
        matchesDate =
          matchesDate &&
          !!user.fecha_creacion &&
          new Date(user.fecha_creacion) >= inicio;
      }

      if (this.endDate) {
        const fin = new Date(this.endDate);
        matchesDate =
          matchesDate &&
          !!user.fecha_creacion &&
          new Date(user.fecha_creacion) <= fin;
      }

      return (
        matchesSearch &&
        matchesEmail &&
        matchesRole &&
        matchesStatus &&
        matchesDate
      );
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.startDate = '';
    this.endDate = '';
    this.email = '';
    this.role = '';
    this.status = '';
    this.filteredUsers = [...this.usuarios];
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
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredUsers);
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
      body: this.filteredUsers.map((u) => [
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

  // Menú acciones
  toggleMenu(event: Event): void {
    const button = event.currentTarget as HTMLElement;
    const dropdown = button.nextElementSibling as HTMLElement;
    dropdown.classList.toggle('hidden');
  }
}
