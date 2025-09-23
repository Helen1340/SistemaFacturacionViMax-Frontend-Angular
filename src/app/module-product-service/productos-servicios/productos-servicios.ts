import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductosServicioService, ItemTabla } from '../service/productos-servicio.service';

@Component({
  selector: 'app-productos-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-servicios.html',
  styleUrl: './productos-servicios.css'
})
export class ProductosServicios implements OnInit {
  items: ItemTabla[] = [];
  filteredItems: ItemTabla[] = [];
  searchTerm: string = '';
  filterValue: string = '';
  openDropdownId: number | null = null;
  isLoading: boolean = false;
  isDropdownOpen: boolean = false;
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(
    private router: Router,
    private productosServicio: ProductosServicioService
  ) {}

  ngOnInit() {
    this.loadItems();
    document.addEventListener('click', () => this.openDropdownId = null);
  }

  loadItems() {
    this.isLoading = true;
    this.productosServicio.getAllItems().subscribe({
      next: (items) => {
        this.items = items;
        this.filteredItems = [...this.items];
        this.totalItems = this.items.length;
        this.calculatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar items:', error);
        this.items = [];
        this.filteredItems = [];
        this.totalItems = 0;
        this.isLoading = false;
        alert('Error al cargar los ítems. Verifica que la API esté funcionando.');
      }
    });
  }

  // Métodos de acción
  toggleRegisterDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }



  viewItem(item: ItemTabla) {
    this.openDropdownId = null;
    if (item.tipo === 'Producto') {
    this.router.navigate(['/detalles-producto', item.id]);
    } else if (item.tipo === 'Servicio') {
      this.router.navigate(['detalles-servicio', item.id]);
    } else {
    console.warn('Tipo desconocido:', item.tipo);
  }
  }

  editItem(item: ItemTabla) {
  this.openDropdownId = null;

  if (item.tipo === 'Producto') {
    this.router.navigate(['/editar-producto', item.id]);
  } else if (item.tipo === 'Servicio') {
    this.router.navigate(['/editar-servicio', item.id]);
  } else {
    console.warn('Tipo desconocido:', item.tipo);
  }
}

  deleteItem(item: ItemTabla) {
    if (!confirm(`¿Estás seguro de que deseas eliminar ${item.nombre}?`)) {
      return;
    }
    
    this.openDropdownId = null;
    this.productosServicio.deleteItem(item.id, item.tipo).subscribe({
      next: () => {
        alert('Ítem eliminado correctamente');
        this.loadItems();
      },
      error: (error) => {
        console.error('Error al eliminar item:', error);
        alert('Error al eliminar el ítem');
      }
    });
  }

  //navigation
  navigateToRegistrarProducto(){
    this.router.navigate(['/registrar-producto']);
  }

  navigateToRegistrarServicio(){
    this.router.navigate(['/registrar-servicio']);
  }

  // Búsqueda y filtros
  onSearch() {
    this.applyFilters();
  }

  onFilter() {
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = this.items;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.nombre.toLowerCase().includes(term) || 
        (item.descripcion && item.descripcion.toLowerCase().includes(term)) ||
        (item.codigo && item.codigo.toLowerCase().includes(term))
      );
    }

    if (this.filterValue) {
      switch (this.filterValue) {
        case 'producto':
          filtered = filtered.filter(item => item.tipo === 'Producto');
          break;
        case 'servicio':
          filtered = filtered.filter(item => item.tipo === 'Servicio');
          break;
        case 'activo':
          filtered = filtered.filter(item => item.estado === 'Activo');
          break;
        case 'inactivo':
          filtered = filtered.filter(item => item.estado === 'Inactivo');
          break;
      }
    }

    this.filteredItems = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
    this.calculatePagination();
  }
  
  // Lógica de paginación
  get paginatedItems(): ItemTabla[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredItems.slice(startIndex, endIndex);
  }
  
  calculatePagination() {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
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
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  toggleDropdown(event: Event, itemId: number) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === itemId ? null : itemId;
  }

  shouldShowDropdownUp(index: number): boolean {
    const threshold = 3;
    const totalItemsOnPage = this.paginatedItems.length;
    return index >= totalItemsOnPage - threshold;
  }

  trackByFn(index: number, item: ItemTabla): number {
    return item.id;
  }

  // Método para formatear precios
  formatPrice(price: number): string {
    if (!price) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  }
}