import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Interfaz para un cambio normativo histórico (para la tabla)
export interface CambioNormativo {
  id: number;
  fecha: Date;
  cambio: string; // Descripción del cambio
  fuente: string; // DIAN, Ministerio de Hacienda, etc.
  estado: 'Aplicado' | 'En progreso';
  responsable: string; // Equipo interno o sistema
}

// Interfaz para el estado legal del sistema (para el panel superior)
export interface EstadoNormativo {
  versionLegalActual: string;         // Ej: "Anexo Técnico 1.9 (Res. 000165)"
  fechaUltimaImplementacion: Date;    // Fecha de la última vez que el sistema se actualizó
  // Se mantienen las siguientes propiedades para consistencia con la interfaz original,
  // pero la lógica del HTML ya no las usará de la misma manera:
  hayActualizacionDisponible: boolean; 
  versionNuevaDisponible?: string;    
  descripcionActualizacion?: string;  
}

@Component({
  selector: 'app-cambios-normativos',
  standalone: true,
  // DatePipe se requiere para el formato de fecha en el HTML
  imports: [CommonModule, FormsModule, DatePipe], 
  templateUrl: './cambios-normativos.html',
  styleUrl: './cambios-normativos.css'
})
export class CambiosNormativos implements OnInit {

  // Datos
  estadoActual: EstadoNormativo | null = null; // Para el panel superior
  allNormativeChanges: CambioNormativo[] = []; // Todos los datos
  filteredNormativeChanges: CambioNormativo[] = []; // Datos después de buscar/filtrar
  paginatedNormativeChanges: CambioNormativo[] = []; // Datos de la página actual

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalChanges: number = 0;
  totalPages: number = 0;
  startItem: number = 0;
  endItem: number = 0;

  // Filtros
  searchTerm: string = '';
  // ⭐ AJUSTE CLAVE 1: Inicializar el filtro a 'Aplicado'
  filterValue: string = 'Aplicado'; // Mostrará solo los cambios realizados por defecto

  isLoading: boolean = true;

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    // ⭐ AJUSTE CLAVE 2: Se mantiene el filtro por defecto en 'Aplicado'
    this.loadNormativeChanges();
  }

  // Carga todos los datos (estado global y tabla)
  loadNormativeChanges() {
    this.isLoading = true;
    setTimeout(() => {
      this.allNormativeChanges = this.getMockChanges(); // Carga datos de ejemplo de la tabla
      this.loadEstadoNormativo(); // Carga el estado legal actual
      this.isLoading = false;
      this.applyFiltersAndPaginate();
    }, 800);
  }

  // ⭐ AJUSTE CLAVE 3: Carga el estado legal del sistema (simulado y modificado)
  loadEstadoNormativo() {
    this.estadoActual = {
      // Valor específico solicitado
      versionLegalActual: 'Anexo Técnico 1.9 (Res. 000165)',
      // Fecha específica solicitada
      fechaUltimaImplementacion: new Date('2025-09-25'), 
      // Se fuerza a FALSE para evitar la lógica de la alerta roja (aunque ya se quitó del HTML)
      hayActualizacionDisponible: false, 
      // Se dejan vacíos para consistencia, aunque el panel verde del HTML ya no los usa.
      versionNuevaDisponible: undefined, 
      descripcionActualizacion: undefined 
    };
  }

  // Aplica la búsqueda y el filtro
  applyFiltersAndPaginate() {
    let tempChanges = this.allNormativeChanges;

    // 1. Filtrar por Estado
    // La lógica de filtro permanece. Como filterValue ahora es 'Aplicado' por defecto,
    // la tabla comenzará mostrando solo esos registros.
    if (this.filterValue) {
      tempChanges = tempChanges.filter(c => c.estado === this.filterValue);
    }

    // 2. Filtrar por Término de Búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      tempChanges = tempChanges.filter(c => 
        c.cambio.toLowerCase().includes(term) ||
        c.fuente.toLowerCase().includes(term) ||
        c.responsable.toLowerCase().includes(term)
      );
    }

    this.filteredNormativeChanges = tempChanges;
    this.totalChanges = tempChanges.length;
    this.totalPages = Math.ceil(this.totalChanges / this.itemsPerPage);

    // Mantiene la página actual o ajusta si se queda vacía
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages > 0 ? this.totalPages : 1;
    }
    
    // 3. Aplicar Paginación
    this.paginateChanges();
  }

  paginateChanges() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    this.paginatedNormativeChanges = this.filteredNormativeChanges.slice(startIndex, endIndex);
    
    // Actualizar indicadores de "Mostrando X - Y de Z"
    this.startItem = this.totalChanges > 0 ? startIndex + 1 : 0;
    this.endItem = Math.min(endIndex, this.totalChanges);
  }

  // Eventos de Interfaz
  onSearch() {
    this.currentPage = 1; 
    this.applyFiltersAndPaginate();
  }

  onFilter() {
    this.currentPage = 1; 
    this.applyFiltersAndPaginate();
  }

  // Paginación
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateChanges();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateChanges();
    }
  }
  
  // Datos Mock para simulación (simula los datos que vendrían de la API)
  getMockChanges(): CambioNormativo[] {
    // Se ajusta el primer registro para que la fecha coincida con el mensaje verde
    return [
  
  {
    id: 2,
    fecha: new Date('2025-08-05'),
    cambio: 'Implementación del Documento Soporte con validación previa.',
    fuente: 'Resolución DIAN 000167',
    estado: 'Aplicado',
    responsable: 'Equipo de Desarrollo'
  },
  
  
  {
    id: 3,
    fecha: new Date('2025-09-01'),
    cambio: 'Ajustes técnicos definitivos al Anexo 1.9 de Facturación Electrónica.',
    fuente: 'Resolución DIAN 000165',
    estado: 'Aplicado',
    responsable: 'Sistema'
  },
  {
    id:4,
    fecha: new Date('2025-10-25'),
    cambio: 'Optimización de la firma digital en documentos electrónicos.',
    fuente: 'DIAN',
    estado: 'Aplicado',
    responsable: 'Sistema'
  },
  {
    id: 5,
    fecha: new Date('2025-11-05'),
    cambio: 'Mejoras obligatorias en esquemas XML de Nómina Electrónica.',
    fuente: 'DIAN',
    estado: 'Aplicado',
    responsable: 'Sistema'
  },
  
];

  }

  goBack(): void {
    this.router.navigate(['/configuracion']);
  }
}