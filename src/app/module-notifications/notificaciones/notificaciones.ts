import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificacionesService } from '../services/notificaciones.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notificaciones',
   imports: [CommonModule, FormsModule ],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class Notificaciones implements OnInit, OnDestroy {
  notifications: any[] = [];
  paginatedNotifications: any[] = [];
  unreadCount = 0;

  // Filtros y búsqueda
  searchTerm = '';
  filterValue = '';
  fechaDesde: string = '';
  fechaHasta: string = '';

  // Paginación
  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;
  totalPages = 0;
  startItem = 0;
  endItem = 0;

  isLoading = false;
  userId = 1; // 👈 Reemplaza por el ID real del usuario autenticado

  constructor(private notiService: NotificacionesService) {}

  ngOnInit(): void {
    this.loadNotifications();

    // Iniciar Ably (tiempo real)
    this.notiService.initRealtime(this.userId, (data) => {
      this.notifications.unshift(data);
      this.applyFilters();
      this.unreadCount++;
    });
  }

  ngOnDestroy(): void {
    this.notiService.disconnect();
  }

  // 🔄 Cargar desde el backend
  loadNotifications() {
    this.isLoading = true;
    this.notiService.getAll().subscribe({
      next: (data) => {
        this.notifications = data;
        this.applyFilters();
        this.unreadCount = this.notifications.filter(n => n.estado === 'No leído').length;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // 🧠 Filtrar + buscar
  applyFilters() {
    let filtered = [...this.notifications];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(n =>
        n.descripcion?.toLowerCase().includes(term) ||
        n.tipo?.toLowerCase().includes(term)
      );
    }

    if (this.filterValue) {
      filtered = filtered.filter(n => n.tipo === this.filterValue);
    }

    if (this.fechaDesde) {
      filtered = filtered.filter(n => new Date(n.fecha_hora) >= new Date(this.fechaDesde));
    }

    if (this.fechaHasta) {
      filtered = filtered.filter(n => new Date(n.fecha_hora) <= new Date(this.fechaHasta));
    }

    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updatePagination(filtered);
  }

  onSearch() { this.applyFilters(); }
  onFilter() { this.applyFilters(); }

  // 📖 Paginación
  updatePagination(filtered: any[]) {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedNotifications = filtered.slice(start, end);

    this.startItem = start + 1;
    this.endItem = Math.min(end, this.totalItems);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  // 🔘 Acciones
  markAllAsRead() {
    this.notiService.markAllAsRead().subscribe(() => this.loadNotifications());
  }

  deleteAll() {
    if (confirm('¿Seguro que deseas eliminar todas las notificaciones?')) {
      this.notiService.deleteAll().subscribe(() => this.loadNotifications());
    }
  }

  viewNotification(notification: any) {
    alert(`📄 ${notification.descripcion}`);
  }
}
