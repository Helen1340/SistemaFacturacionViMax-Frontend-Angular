import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reporte-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-usuarios.html',
  styleUrl: './reporte-usuarios.css'
})
export class ReporteUsuarios implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];
  
  // Propiedades para los filtros
  searchQuery: string = '';
  startDate: string = '';
  endDate: string = '';
  email: string = '';
  role: string = '';
  status: string = '';

  constructor() { }

  ngOnInit(): void {
    this.loadSimulatedData();
    this.applyFilters(); // Muestra todos los datos al cargar la página
  }

  loadSimulatedData(): void {
    // Datos simulados. En un entorno real, estos vendrían de un servicio.
    this.users = [
      {
        name: 'Laura Gómez',
        username: 'laura.admin',
        email: 'laura@empresa.com',
        role: 'Administrador',
        status: 'Activo',
        creationDate: '2025-06-12'
      },
      {
        name: 'Carlos Rodríguez',
        username: 'carlos.fact',
        email: 'carlos@empresa.com',
        role: 'Facturador',
        status: 'Activo',
        creationDate: '2025-06-15'
      },
      {
        name: 'Ana García',
        username: 'ana.revisor',
        email: 'ana@empresa.com',
        role: 'Revisor',
        status: 'Inactivo',
        creationDate: '2025-06-20'
      },
      {
        name: 'Pedro Martínez',
        username: 'pedro.conta',
        email: 'pedro@empresa.com',
        role: 'Contador',
        status: 'Activo',
        creationDate: '2025-07-01'
      },
      {
        name: 'María Fernández',
        username: 'maria.fact',
        email: 'maria@empresa.com',
        role: 'Facturador',
        status: 'Bloqueado',
        creationDate: '2025-07-02'
      },
      {
        name: 'Javier López',
        username: 'javier.admin',
        email: 'javier@empresa.com',
        role: 'Administrador',
        status: 'Activo',
        creationDate: '2025-07-05'
      },
    ];
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      // Filtrar por nombre o nombre de usuario
      const matchesSearch = !this.searchQuery || 
                           user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                           user.username.toLowerCase().includes(this.searchQuery.toLowerCase());

      // Filtrar por rango de fechas de creación
      const userDate = new Date(user.creationDate);
      const start = this.startDate ? new Date(this.startDate + 'T00:00:00') : null;
      const end = this.endDate ? new Date(this.endDate + 'T23:59:59') : null;
      const matchesDateRange = (!start || userDate >= start) && (!end || userDate <= end);
      
      // Filtrar por correo electrónico
      const matchesEmail = !this.email || user.email.toLowerCase().includes(this.email.toLowerCase());

      // Filtrar por rol
      const matchesRole = !this.role || user.role === this.role;

      // Filtrar por estado
      const matchesStatus = !this.status || user.status === this.status;

      return matchesSearch && matchesDateRange && matchesEmail && matchesRole && matchesStatus;
    });
  }

  // Métodos auxiliares
  downloadReport(user: any, format: string): void {
    alert(`Simulando la descarga del reporte para el usuario: ${user.name} en formato ${format}`);
  }

  // Se añade un método para simular el menú desplegable
  toggleMenu(event: Event): void {
    const button = event.currentTarget as HTMLElement;
    const dropdown = button.nextElementSibling as HTMLElement;
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Activo':
        return 'text-green-600';
      case 'Inactivo':
        return 'text-red-600';
      case 'Bloqueado':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  }
}
