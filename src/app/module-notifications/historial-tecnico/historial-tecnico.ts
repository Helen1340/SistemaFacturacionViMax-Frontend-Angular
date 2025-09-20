import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Interfaz para el historial técnico
export interface HistorialTecnico {
  id?: number;
  fechaHora: Date;
  tipo: string;
  moduloAfectado: string;
  mensaje: string;
  usuarioAfectado: string;
}

@Component({
  selector: 'app-historial-tecnico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-tecnico.html',
  styleUrl: './historial-tecnico.css'
})
export class HistorialTecnico implements OnInit {

  historial: HistorialTecnico[] = [];
  filteredHistorial: HistorialTecnico[] = [];
  searchTerm: string = '';
  filterValue: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';
  isLoading: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Aquí se cargará el historial técnico desde la base de datos
    // this.loadHistorialTecnico();
  }

  // Método para cargar historial técnico desde la base de datos
  loadHistorialTecnico() {
    this.isLoading = true;

    // TODO: Implementar llamada al servicio para obtener historial técnico
    // Ejemplo:
    // this.historialService.getHistorialTecnico().subscribe({
    //   next: (data) => {
    //     this.historial = data;
    //     this.filteredHistorial = [...this.historial];
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando historial técnico:', error);
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
    let filtered = this.historial;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.tipo.toLowerCase().includes(term) ||
        item.moduloAfectado.toLowerCase().includes(term) ||
        item.mensaje.toLowerCase().includes(term) ||
        item.usuarioAfectado.toLowerCase().includes(term) ||
        item.id?.toString().includes(term)
      );
    }

    if (this.filterValue) {
      switch (this.filterValue) {
        case 'tipo':
          filtered = filtered.filter(item => item.tipo);
          break;
        case 'modulo':
          filtered = filtered.filter(item => item.moduloAfectado);
          break;
        case 'usuario':
          filtered = filtered.filter(item => item.usuarioAfectado);
          break;
      }
    }

    if (this.fechaDesde) {
      const desde = new Date(this.fechaDesde);
      filtered = filtered.filter(item => item.fechaHora >= desde);
    }

    if (this.fechaHasta) {
      const hasta = new Date(this.fechaHasta);
      hasta.setHours(23, 59, 59, 999); // Incluir todo el día
      filtered = filtered.filter(item => item.fechaHora <= hasta);
    }

    this.filteredHistorial = filtered;
  }

  // Navegación de regreso
  volverAtras() {
    this.router.navigate(['/notificaciones']);
  }

  // Utilidades
  getTipoClass(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'rechazo dian':
        return 'bg-red-100 text-red-800';
      case 'aceptado':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  trackByFn(index: number, item: HistorialTecnico): number | undefined {
    return item.id;
  }
}


