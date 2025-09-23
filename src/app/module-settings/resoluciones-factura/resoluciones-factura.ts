import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface Resolucion {
  id: number;
  prefijo: string;
  numero_resolucion: string;
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
    private router: Router
  ) {}

  ngOnInit() {
    this.loadResoluciones();
    document.addEventListener('click', () => this.openMenuIndex = null);
  }

  loadResoluciones() {
    this.isLoading = true;
    // Datos de ejemplo - aquí deberías conectar con tu servicio
    this.resoluciones = [
      {
        id: 1,
        prefijo: 'FE',
        numero_resolucion: '187600019283',
        desde: 1001,
        hasta: 2000,
        tipo: 'Factura EL',
        vigencia: '01/01/2025 - 31/12/2025',
        estado: 'Activa',
        created_at: '2025-01-01',
        updated_at: '2025-01-01'
      }
    ];
    this.filteredResoluciones = [...this.resoluciones];
    this.totalResoluciones = this.resoluciones.length;
    this.calculatePagination();
    this.isLoading = false;
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
        this.activarResolucion(resolucion);
        break;
      case 'Desactivar':
        this.desactivarResolucion(resolucion);
        break;
    }
  }

  activarResolucion(resolucion: Resolucion) {
    if (!confirm(`¿Estás seguro de que deseas activar esta resolución?`)) {
      return;
    }
    // Implementar lógica de activación
    console.log('Activando resolución:', resolucion.id);
    // Actualizar el estado en la lista
    resolucion.estado = 'Activa';
  }

  desactivarResolucion(resolucion: Resolucion) {
    if (!confirm(`¿Estás seguro de que deseas desactivar esta resolución?`)) {
      return;
    }
    // Implementar lógica de desactivación
    console.log('Desactivando resolución:', resolucion.id);
    // Actualizar el estado en la lista
    resolucion.estado = 'Inactiva';
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
}
