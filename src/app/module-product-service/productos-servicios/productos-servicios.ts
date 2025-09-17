import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductosServicioService } from '../servicio-product-serv/productos-servicio.service';

// Interfaz unificada para la tabla
export interface ProductoOServicio {
  id?: number;
  referencia?: string;
  nombre: string;
  tipo: 'Producto' | 'Servicio';
  cantidad?: number;
  impuesto?: number;
  precio: number;
  estado: 'Activo' | 'Inactivo';
  showMenu?: boolean;
}

@Component({
  selector: 'app-productos-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './productos-servicios.html',
  styleUrl: './productos-servicios.css'
})
export class ProductosServicios implements OnInit {

  items: ProductoOServicio[] = [];
  filteredItems: ProductoOServicio[] = [];
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
    this.setupClickOutside();
  }

  // Cargar productos y servicios desde la API
  loadItems() {
    this.isLoading = true;
    
    forkJoin({
      productos: this.productosServicio.getProductos(),
      servicios: this.productosServicio.getServicios()
    }).subscribe({
      next: (data) => {
        // Asegurar que las respuestas son arrays antes de usarlas
        const productos = Array.isArray(data.productos) ? data.productos : [];
        const servicios = Array.isArray(data.servicios) ? data.servicios : [];

        // Función auxiliar para asegurar el tipo de 'estado'
        const getEstado = (estado: string | undefined): 'Activo' | 'Inactivo' => {
          return (estado === 'Activo' || estado === 'Inactivo') ? estado : 'Inactivo';
        };

        // Mapeamos los productos a la interfaz unificada
        const mappedProductos: ProductoOServicio[] = productos.map(p => ({
            id: p.id,
            referencia: p.referencia,
            nombre: p.nombre,
            tipo: 'Producto',
            cantidad: p.cantidad,
            impuesto: p.impuesto,
            precio: p.precio,
            estado: getEstado(p.estado),
            showMenu: false
        }));
        
        // Mapeamos los servicios a la interfaz unificada
        const mappedServicios: ProductoOServicio[] = servicios.map(s => ({
            id: s.id,
            referencia: s.referencia,
            nombre: s.nombre,
            tipo: 'Servicio',
            cantidad: undefined,
            impuesto: s.impuesto,
            precio: s.precio,
            estado: getEstado(s.estado),
            showMenu: false
        }));

        this.items = [...mappedProductos, ...mappedServicios];
        this.filteredItems = [...this.items];
        this.totalItems = this.items.length;
        this.calculatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando productos y servicios:', error);
        this.items = [];
        this.filteredItems = [];
        this.totalItems = 0;
        this.isLoading = false;
        alert('Error al cargar los datos. Verifica que la API esté funcionando.');
      }
    });
  }

  // ... después de tus otras propiedades y métodos
shouldShowDropdownUp(index: number): boolean {
  // Define un umbral para mostrar el dropdown hacia arriba
  const threshold = 3; 
  // Usa la longitud de los elementos paginados para saber cuántos elementos se muestran
  const totalItemsOnPage = this.paginatedItems.length;
  // Si el índice del elemento es uno de los últimos 3, se muestra hacia arriba
  return index >= totalItemsOnPage - threshold;
}
// ...

  // Acciones de ítem (producto o servicio)
  viewItem(item: ProductoOServicio) {
    console.log('Ver ítem:', item);
    this.openDropdownId = null;
    this.router.navigate(['/ver-item', item.id]);
  }

  editItem(item: ProductoOServicio) {
    console.log('Editar ítem:', item);
    this.openDropdownId = null;
    this.router.navigate([`/${item.tipo.toLowerCase()}/editar`, item.id]);
  }

  deleteItem(item: ProductoOServicio) {
    if (!confirm(`¿Estás seguro de que deseas ${item.estado === 'Activo' ? 'desactivar' : 'activar'} este ítem?`)) {
      return;
    }
    
    this.openDropdownId = null;
    
    const deleteMethod = item.tipo === 'Producto' ? 
      this.productosServicio.deleteProducto(item.id!) : 
      this.productosServicio.deleteServicio(item.id!);

    deleteMethod.subscribe({
      next: () => {
        alert(`Ítem ${item.estado === 'Activo' ? 'desactivado' : 'activado'} correctamente`);
        this.loadItems();
      },
      error: (error) => {
        alert('Error al cambiar el estado del ítem');
        console.error(error);
      }
    });
  }

  // Búsqueda y filtrado
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
        (item.referencia && item.referencia.toLowerCase().includes(term))
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

  // Manejo de dropdowns
  toggleDropdown(event: Event, itemId: number) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === itemId ? null : itemId;
  }
  
  toggleRegisterDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  private setupClickOutside() {
    document.addEventListener('click', () => {
      this.openDropdownId = null;
    });
  }

  // Paginación
  get paginatedItems(): ProductoOServicio[] {
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

  // Navegación y utilidades
  navigateToNewItem(type: 'producto' | 'servicio') {
    this.router.navigate([`/${type}/nuevo`]);
  }
  
  trackByFn(index: number, item: ProductoOServicio): number | undefined {
    return item.id;
  }
}