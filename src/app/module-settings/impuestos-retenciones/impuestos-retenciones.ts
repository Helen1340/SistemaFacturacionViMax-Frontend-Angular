import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImpuestosRetencionesService, Impuesto } from './services/impuestos-retenciones.service';

@Component({
  selector: 'app-impuestos-retenciones',
  imports: [CommonModule, FormsModule],
  templateUrl: './impuestos-retenciones.html',
  styleUrl: './impuestos-retenciones.css'
})
export class ImpuestosRetenciones implements OnInit {
  
  // Variables para la tabla
  impuestos: Impuesto[] = [];
  filteredImpuestos: Impuesto[] = [];
  paginatedImpuestos: Impuesto[] = [];
  
  // Variables de búsqueda y filtrado
  searchTerm: string = '';
  filterValue: string = '';
  
  // Variables de paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalImpuestos: number = 0;
  totalPages: number = 0;
  startItem: number = 0;
  endItem: number = 0;
  
  // Variables de estado
  isLoading: boolean = false;
  openDropdownId: number | null = null;
  
  constructor(
    private router: Router,
    private impuestosService: ImpuestosRetencionesService
  ) {}
  
  ngOnInit() {
    console.log('Inicializando componente impuestos-retenciones');
    this.loadImpuestos();
  }
  
  // Cargar impuestos desde la API
  loadImpuestos() {
    this.isLoading = true;
    console.log('Cargando impuestos desde la API...');
    
    this.impuestosService.getImpuestos().subscribe({
      next: (response) => {
        console.log('Respuesta de la API:', response);
        if (response && response.success && response.data) {
          this.impuestos = response.data;
          this.filteredImpuestos = [...this.impuestos];
          this.totalImpuestos = this.impuestos.length;
          this.updatePagination();
          console.log('Impuestos cargados desde API:', this.impuestos);
        } else {
          console.log('Respuesta de API inválida, usando datos mock');
          this.loadMockData();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando desde API:', error);
        console.log('Usando datos mock como fallback');
        this.loadMockData();
        this.isLoading = false;
      }
    });
  }

  // Cargar datos mock como fallback
  private loadMockData() {
    this.impuestos = this.impuestosService.getMockImpuestos();
    this.filteredImpuestos = [...this.impuestos];
    this.totalImpuestos = this.impuestos.length;
    this.updatePagination();
    console.log('Datos mock cargados:', this.impuestos);
  }
  
  // Búsqueda
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredImpuestos = [...this.impuestos];
    } else {
      const searchTerm = this.searchTerm.toLowerCase().trim();
      
      this.filteredImpuestos = this.impuestos.filter(impuesto => {
        // Búsqueda por tipo exacto
        if (searchTerm === 'iva') {
          return impuesto.tipo.toLowerCase() === 'iva';
        }
        if (searchTerm === 'ica') {
          return impuesto.tipo.toLowerCase() === 'ica';
        }
        if (searchTerm === 'retefuente' || searchTerm === 'retención' || searchTerm === 'retencion') {
          return impuesto.tipo.toLowerCase() === 'retefuente';
        }
        
        // Búsqueda general (nombre, descripción, tipo)
        return impuesto.nombre.toLowerCase().includes(searchTerm) ||
               impuesto.descripcion.toLowerCase().includes(searchTerm) ||
               impuesto.tipo.toLowerCase().includes(searchTerm);
      });
    }
    
    this.totalImpuestos = this.filteredImpuestos.length;
    this.currentPage = 1;
    this.updatePagination();
    
    console.log('Búsqueda realizada:', {
      termino: this.searchTerm,
      resultados: this.filteredImpuestos.length,
      filtrados: this.filteredImpuestos.map(i => ({ nombre: i.nombre, tipo: i.tipo }))
    });
  }
  
  // Filtrado
  onFilter() {
    if (!this.filterValue) {
      this.filteredImpuestos = [...this.impuestos];
    } else {
      this.filteredImpuestos = this.impuestos.filter(impuesto => {
        if (this.filterValue === 'activo' || this.filterValue === 'inactivo') {
          return impuesto.estado.toLowerCase() === this.filterValue;
        }
        return true;
      });
    }
    this.totalImpuestos = this.filteredImpuestos.length;
    this.currentPage = 1;
    this.updatePagination();
  }
  
  // Paginación
  updatePagination() {
    this.totalPages = Math.ceil(this.totalImpuestos / this.itemsPerPage);
    this.startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    this.endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalImpuestos);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedImpuestos = this.filteredImpuestos.slice(startIndex, endIndex);
    
    console.log('Paginación actualizada:', {
      totalImpuestos: this.totalImpuestos,
      paginatedImpuestos: this.paginatedImpuestos.length,
      currentPage: this.currentPage,
      totalPages: this.totalPages
    });
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
  
  // Dropdown
  toggleDropdown(event: Event, id: number) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }
  
  shouldShowDropdownUp(index: number): boolean {
    return index > this.paginatedImpuestos.length - 3;
  }
  
  // Clases de estilo
  getTipoClass(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'iva':
        return 'bg-blue-100 text-blue-800';
      case 'ica':
        return 'bg-green-100 text-green-800';
      case 'retefuente':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  getStatusClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Acciones
  activarImpuesto(impuesto: Impuesto) {
    console.log('Activando impuesto:', impuesto);
    this.openDropdownId = null;
    
    // Cambio inmediato en la tabla (feedback visual)
    const index = this.impuestos.findIndex(imp => imp.id === impuesto.id);
    if (index !== -1) {
      this.impuestos[index].estado = 'Activo';
      this.filteredImpuestos = [...this.impuestos];
      this.updatePagination();
      console.log('Estado cambiado a Activo en la tabla');
    }
    
    // Actualizar en la API
    this.impuestosService.updateImpuesto(impuesto.id, { estado: 'Activo' }).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Impuesto activado exitosamente en la API');
        }
      },
      error: (error) => {
        console.error('Error activando impuesto en la API:', error);
        console.log('El cambio ya se aplicó localmente');
      }
    });
  }

  desactivarImpuesto(impuesto: Impuesto) {
    console.log('Desactivando impuesto:', impuesto);
    this.openDropdownId = null;
    
    // Cambio inmediato en la tabla (feedback visual)
    const index = this.impuestos.findIndex(imp => imp.id === impuesto.id);
    if (index !== -1) {
      this.impuestos[index].estado = 'Inactivo';
      this.filteredImpuestos = [...this.impuestos];
      this.updatePagination();
      console.log('Estado cambiado a Inactivo en la tabla');
    }
    
    // Actualizar en la API
    this.impuestosService.updateImpuesto(impuesto.id, { estado: 'Inactivo' }).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Impuesto desactivado exitosamente en la API');
        }
      },
      error: (error) => {
        console.error('Error desactivando impuesto en la API:', error);
        console.log('El cambio ya se aplicó localmente');
      }
    });
  }
  
  // Navegación
  navigateToNewImpuestos() {
    this.router.navigate(['/nuevo-impuesto']);
  }
  
  // TrackBy para optimización
  trackByFn(index: number, item: Impuesto): number {
    return item.id;
  }
  
  // Prueba de conexión API
  testApiConnection() {
    console.log('Probando conexión API...');
    // Implementar prueba de conexión
  }
}