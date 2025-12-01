import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResolutionService } from './services/resolution.Service';

export interface Resolucion {
  id: number;
  prefijo: string;
  numero_resolucion: string;
  clave_tecnica: string; 
  cantidad_disponible: number;
  vigencia_inicio: string;
  vigencia_fin: string;
  desde: number;
  hasta: number;
  tipo: string;
  vigencia: string;
  estado: 'Activa' | 'Inactiva';
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-resoluciones-factura',
  imports: [CommonModule, FormsModule],
  templateUrl: './resoluciones-factura.html',
  styleUrl: './resoluciones-factura.css'
})
export class ResolucionesFactura implements OnInit {
  resoluciones: Resolucion[] = [];
  filteredResoluciones: Resolucion[] = [];
  searchTerm: string = '';
  filterValue: string = '';
  openMenuIndex: number | null = null;
  dropdownTop: number = 0;
  dropdownLeft: number = 0;
  isLoading: boolean = false;
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalResoluciones: number = 0;
  totalPages: number = 0;

  constructor(
    private router: Router,
    private resolutionService: ResolutionService
  ) {}

  ngOnInit() {
    this.loadResoluciones();
    
    // CÓDIGO CORREGIDO PARA CERRAR EL MENÚ DESPLEGABLE
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement; // Definición correcta de target
      
      // Verifica si el menú está abierto Y si el clic NO fue dentro del menú desplegable
      if (this.openMenuIndex !== null && target && !target.closest('.dropdown')) {
          this.openMenuIndex = null;
      }
    });
  }

  loadResoluciones() {
    this.isLoading = true;
    this.resolutionService.list().subscribe({
      next: (data) => {
        const items = Array.isArray(data) ? data : (data?.data || []);
        this.resoluciones = items.map((r: any) => {
          const desde = Number(r.start_number || 0);
          const hasta = Number(r.end_number || 0);
          const cantidad = (hasta >= desde && desde > 0) ? (hasta - desde + 1) : 0;
          const vi = r.validity_start_date ? new Date(r.validity_start_date) : null;
          const vf = r.validity_end_date ? new Date(r.validity_end_date) : null;
          const vigencia = (vi && vf) ? `${vi.toLocaleDateString('es-CO')} - ${vf.toLocaleDateString('es-CO')}` : '';
          return {
            id: r.id,
            prefijo: r.prefix,
            numero_resolucion: r.resolution_number,
            clave_tecnica: '',
            cantidad_disponible: cantidad,
            desde,
            hasta,
            tipo: r.document_type,
            vigencia,
            vigencia_inicio: r.validity_start_date,
            vigencia_fin: r.validity_end_date,
            estado: r.current_status === 'Activo' ? 'Activa' : 'Inactiva',
            created_at: r.created_at,
            updated_at: r.updated_at,
          } as Resolucion;
        });
        this.filteredResoluciones = [...this.resoluciones];
        this.totalResoluciones = this.resoluciones.length;
        this.calculatePagination();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.applyFilters();
  }

  onFilter() {
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = this.resoluciones;

    // Búsqueda por texto
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(resolucion => 
        resolucion.prefijo.toLowerCase().includes(term) ||
        resolucion.numero_resolucion.toLowerCase().includes(term) ||
        resolucion.tipo.toLowerCase().includes(term)
      );
    }

    // Filtro por estado o tipo
    if (this.filterValue) {
      if (this.filterValue === 'activa') {
        filtered = filtered.filter(resolucion => resolucion.estado === 'Activa');
      } else if (this.filterValue === 'inactiva') {
        filtered = filtered.filter(resolucion => resolucion.estado === 'Inactiva');
      } else if (this.filterValue === 'factura') {
        filtered = filtered.filter(resolucion => resolucion.tipo.toLowerCase().includes('factura'));
      } else if (this.filterValue === 'nota') {
        filtered = filtered.filter(resolucion => resolucion.tipo.toLowerCase().includes('nota'));
      }
    }

    this.filteredResoluciones = filtered;
    this.totalResoluciones = filtered.length;
    this.currentPage = 1;
    this.calculatePagination();
  }

  getStatusClass(status: string): string {
    return status === 'Activa' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  toggleMenu(index: number, event: Event): void {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const menuWidth = 192; // w-48 ≈ 192px
    const margin = 6;
    const left = rect.right - menuWidth;
    const top = rect.bottom + margin;
    this.dropdownLeft = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
    this.dropdownTop = Math.max(8, Math.min(top, window.innerHeight - 8));
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  getAvailableActions(estado: string): string[] {
    switch (estado) {
      case 'Activa':
        return ['Editar', 'Desactivar'];
      case 'Inactiva':
        return ['Editar', 'Activar'];
      default:
        return ['Editar'];
    }
  }

  executeAction(action: string, resolucion: Resolucion): void {
    this.openMenuIndex = null;
    switch (action) {
      case 'Editar':
        this.router.navigate(['/editar-resolucion', resolucion.id]);
        break;
      case 'Activar':
        this.actualizarEstado(resolucion, 'Activo');
        break;
      case 'Desactivar':
        this.actualizarEstado(resolucion, 'Inactivo');
        break;
    }
  }

  private actualizarEstado(resolucion: Resolucion, nuevoEstadoApi: 'Activo' | 'Inactivo') {
    const mensaje = nuevoEstadoApi === 'Activo' ? 'activar' : 'desactivar';
    if (!confirm(`¿Estás seguro de que deseas ${mensaje} esta resolución?`)) return;
    this.isLoading = true;
    this.resolutionService.updateJson(resolucion.id, { current_status: nuevoEstadoApi }).subscribe({
      next: () => {
        this.isLoading = false;
        resolucion.estado = nuevoEstadoApi === 'Activo' ? 'Activa' : 'Inactiva';
        alert(`Resolución ${nuevoEstadoApi === 'Activo' ? 'activada' : 'desactivada'} correctamente.`);
      },
      error: () => {
        this.isLoading = false;
        alert('No se pudo actualizar el estado de la resolución.');
      }
    });
  }

  get paginatedResoluciones(): Resolucion[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredResoluciones.slice(startIndex, endIndex);
  }
  
  calculatePagination() {
    this.totalPages = Math.ceil(this.totalResoluciones / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get startItem(): number {
    if (this.totalResoluciones === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalResoluciones);
  }

  navigateToNewResolucion() {
    this.router.navigate(['/nueva-resolucion']);
  }
  
  trackByFn(index: number, resolucion: Resolucion): number {
    return resolucion.id;
  }

  goBack(): void {
    this.router.navigate(['/configuracion']);
  }
}