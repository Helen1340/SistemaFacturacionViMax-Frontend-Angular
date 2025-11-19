import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {  ItemTable, ProductosServicioService } from '../service/productos-servicio.service';

@Component({
  selector: 'app-products-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-servicios.html',
  styleUrl: './productos-servicios.css'
})
export class ProductosServicios implements OnInit {
  items: ItemTable[] = [];
  filteredItems: ItemTable[] = [];
  searchTerm: string = '';
  filterValue: string = '';
  openDropdownId: number | null = null;
  dropdownTop: number = 0;
  dropdownLeft: number = 0;
  isLoading: boolean = false;
  isDropdownOpen: boolean = false;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(
    private router: Router,
    private productService: ProductosServicioService
  ) {}

  ngOnInit() {
    this.loadItems();
    document.addEventListener('click', () => this.openDropdownId = null);
  }

  loadItems() {
    this.isLoading = true;
    this.productService.getAllItems().subscribe({
      next: (items) => {
        this.items = items;
        this.filteredItems = [...this.items];
        this.totalItems = this.items.length;
        this.calculatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.items = [];
        this.filteredItems = [];
        this.totalItems = 0;
        this.isLoading = false;
        alert('Error loading items. Please verify that the API is running.');
      }
    });
  }

  // Dropdown actions
  toggleRegisterDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // View item details
  viewItem(item: ItemTable) {
    this.openDropdownId = null;
    if (item.type === 'Product') {
      this.router.navigate(['/detalles-producto', item.id]);
    } else if (item.type === 'Service') {
      this.router.navigate(['/detalles-servicio', item.id]);
    } else {
      console.warn('Unknown type:', item.type);
    }
  }

  // Edit item
  editItem(item: ItemTable) {
    this.openDropdownId = null;

    if (item.type === 'Product') {
      this.router.navigate(['/editar-producto', item.id]);
    } else if (item.type === 'Service') {
      this.router.navigate(['/editar-servicio', item.id]);
    } else {
      console.warn('Unknown type:', item.type);
    }
  }

  // Delete item
  deleteItem(item: ItemTable) {
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) {
      return;
    }
    
    this.openDropdownId = null;
    this.productService.deleteItem(item.id, item.type).subscribe({
      next: () => {
        alert('Item deleted successfully');
        this.loadItems();
      },
      error: (error) => {
        console.error('Error deleting item:', error);
        alert('Error deleting the item');
      }
    });
  }

  // Navigation
  navigateToRegisterProduct() {
    this.router.navigate(['/registrar-producto']);
  }

  navigateToRegisterService() {
    this.router.navigate(['/registrar-servicio']);
  }

  // Search & filter
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
        item.name.toLowerCase().includes(term) || 
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.code && item.code.toLowerCase().includes(term))
      );
    }

    if (this.filterValue) {
      switch (this.filterValue) {
        case 'product':
          filtered = filtered.filter(item => item.type === 'Product');
          break;
        case 'service':
          filtered = filtered.filter(item => item.type === 'Service');
          break;
        case 'active':
          filtered = filtered.filter(item => item.status === 'Active');
          break;
        case 'inactive':
          filtered = filtered.filter(item => item.status === 'Inactive');
          break;
      }
    }

    this.filteredItems = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
    this.calculatePagination();
  }
  
  // Pagination logic
  get paginatedItems(): ItemTable[] {
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

  // Dropdown positioning
  toggleDropdown(event: Event, itemId: number) {
    event.stopPropagation();
    
    if (this.openDropdownId === itemId) {
      this.openDropdownId = null;
      return;
    }
    
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const menuWidth = 160;
    const menuHeight = 120;
    
    this.dropdownLeft = rect.right - menuWidth;
    
    let top = rect.bottom + 4;
    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - 4;
    }
    if (top < 8) top = 8;
    if (this.dropdownLeft < 8) this.dropdownLeft = 8;
    else if (this.dropdownLeft + menuWidth > window.innerWidth - 8)
      this.dropdownLeft = window.innerWidth - menuWidth - 8;
    
    this.dropdownTop = top;
    this.openDropdownId = itemId;
  }

  trackByFn(index: number, item: ItemTable): number {
    return item.id;
  }

  // Format price
  formatPrice(price: number): string {
    if (!price) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  }

  translateItemType(type: string): string {
    switch (type) {
      case 'Product': return 'Producto';
      case 'Service': return 'Servicio';
      default: return type;
    }
  }

  translateItemStatus(status: string): string {
    switch (status) {
      case 'Active': return 'Activo';
      case 'Inactive': return 'Inactivo';
      default: return status;
    }
  }
}
