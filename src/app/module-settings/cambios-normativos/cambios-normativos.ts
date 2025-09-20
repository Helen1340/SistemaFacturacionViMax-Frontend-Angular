import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Interfaz para los cambios normativos
export interface CambioNormativo {
  id?: number;
  fecha: Date;
  cambioAplicado: string;
  fuente: string;
  estado: 'Correcto' | 'Parcial' | 'Error' | 'Pendiente';
  responsable: string;
}

@Component({
  selector: 'app-cambios-normativos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cambios-normativos.html',
  styleUrl: './cambios-normativos.css'
})
export class CambiosNormativos implements OnInit {

  cambios: CambioNormativo[] = [];
  filteredCambios: CambioNormativo[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Aquí se cargarán los cambios desde la base de datos
    // this.loadCambios();
  }

  // Método para cargar cambios normativos desde la base de datos
  loadCambios() {
    this.isLoading = true;

    // TODO: Implementar llamada al servicio para obtener cambios
    // Ejemplo:
    // this.cambiosService.getCambios().subscribe({
    //   next: (data) => {
    //     this.cambios = data;
    //     this.filteredCambios = [...this.cambios];
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando cambios:', error);
    //     this.isLoading = false;
    //   }
    // });

    this.isLoading = false;
  }

  // Búsqueda
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredCambios = [...this.cambios];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredCambios = this.cambios.filter(cambio =>
      cambio.cambioAplicado.toLowerCase().includes(term) ||
      cambio.fuente.toLowerCase().includes(term) ||
      cambio.responsable.toLowerCase().includes(term) ||
      cambio.estado.toLowerCase().includes(term)
    );
  }

  // Navegación
  navigateConfiguracionActualizaciones() {
    this.router.navigate(['/configuracion-actualizaciones']);
  }

  // Utilidades
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Correcto':
        return 'bg-green-100 text-green-800';
      case 'Parcial':
        return 'bg-yellow-100 text-yellow-800';
      case 'Error':
        return 'bg-red-100 text-red-800';
      case 'Pendiente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  trackByFn(index: number, item: CambioNormativo): number | undefined {
    return item.id;
  }
}
