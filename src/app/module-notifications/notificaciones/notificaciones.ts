import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Interfaz para las notificaciones
export interface Notificacion {
  id?: number;
  fechaHora: Date;
  tipoNotificacion: string;
  descripcion: string;
  estado: 'Leída' | 'No leída' | 'Archivada';
  accion?: string;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css'
})
export class Notificaciones implements OnInit {

  notificaciones: Notificacion[] = [];
  filteredNotificaciones: Notificacion[] = [];
  searchTerm: string = '';
  filterValue: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';
  isLoading: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Aquí se cargarán las notificaciones desde la base de datos
    // this.loadNotificaciones();
  }

  // Método para cargar notificaciones desde la base de datos
  loadNotificaciones() {
    this.isLoading = true;

    // TODO: Implementar llamada al servicio para obtener notificaciones
    // Ejemplo:
    // this.notificacionesService.getNotificaciones().subscribe({
    //   next: (data) => {
    //     this.notificaciones = data;
    //     this.filteredNotificaciones = [...this.notificaciones];
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando notificaciones:', error);
    //     this.isLoading = false;
    //   }
    // });

    this.isLoading = false;
  }

  // Búsqueda
  onSearch() {
    this.applyFilters();
  }

  // Filtro
  onFilter() {
    this.applyFilters();
  }

  // Aplicar filtros
  private applyFilters() {
    let filtered = this.notificaciones;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(notif =>
        notif.tipoNotificacion.toLowerCase().includes(term) ||
        notif.descripcion.toLowerCase().includes(term)
      );
    }

    if (this.filterValue) {
      filtered = filtered.filter(notif => notif.tipoNotificacion === this.filterValue);
    }

    if (this.fechaDesde) {
      const desde = new Date(this.fechaDesde);
      filtered = filtered.filter(notif => notif.fechaHora >= desde);
    }

    if (this.fechaHasta) {
      const hasta = new Date(this.fechaHasta);
      hasta.setHours(23, 59, 59, 999); // Incluir todo el día
      filtered = filtered.filter(notif => notif.fechaHora <= hasta);
    }

    this.filteredNotificaciones = filtered;
  }

  // Navegación
  navigateHistorialTecnico() {
    this.router.navigate(['/historial-tecnico']);
  }

  // Utilidades
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Leída':
        return 'bg-green-100 text-green-800';
      case 'No leída':
        return 'bg-red-100 text-red-800';
      case 'Archivada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  trackByFn(index: number, item: Notificacion): number | undefined {
    return item.id;
  }
}
