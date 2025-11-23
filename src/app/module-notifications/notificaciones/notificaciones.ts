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
  
  limitValue: number = 100;

  // Paginación
  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;
  totalPages = 0;
  startItem = 0;
  endItem = 0;

  isLoading = false;
  userId = 0;

  constructor(private notiService: NotificacionesService) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('userId')) || 0;
    this.loadNotifications();

    if (this.userId > 0) {
      this.notiService.initRealtime(this.userId, (data) => {
        this.addRealtime(data);
      });
    }
  }

  ngOnDestroy(): void {
    this.notiService.disconnect();
  }

  // 🔄 Cargar desde el backend
  loadNotifications() {
    this.isLoading = true;
    const userRaw = localStorage.getItem('auth_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const companyId = user?.company?.id || user?.company_id || 0;
    const type = this.filterValue || '';
    const from = this.fechaDesde || '';
    const to = this.fechaHasta || '';
    const limit = Number(this.limitValue) || 100;
    this.notiService.getAll(companyId, { type, from, to, limit }).subscribe({
      next: (data) => {
        const arr = Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []);
        this.notifications = this.normalize(arr || []);
        this.applyFilters();
        this.unreadCount = this.notifications.filter(n => n.estado === 'No leído').length;
        this.isLoading = false;
      },
      error: () => {
        this.notiService.getLogs().subscribe({
          next: (logs) => {
            const mapped = Array.isArray(logs) ? logs.map(l => ({
              id: l.id,
              fecha_hora: l.created_at,
              tipo: l.event,
              descripcion: l.error_message || l.message || '',
              estado: l.status
            })) : [];
            this.notifications = this.normalize(mapped);
            this.applyFilters();
            this.unreadCount = this.notifications.filter(n => n.estado === 'No leído').length;
            this.isLoading = false;
          },
          error: () => {
            this.notifications = [];
            this.applyFilters();
            this.unreadCount = 0;
            this.isLoading = false;
          }
        });
      }
    });
  }

  // 🧠 Filtrar + buscar
  applyFilters() {
    const base = Array.isArray(this.notifications) ? this.notifications : [];
    let filtered = [...base];

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

  onSearch() { this.loadNotifications(); }
  onFilter() { this.loadNotifications(); }

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
      this.notiService.deleteAll().subscribe({
        next: () => this.loadNotifications(),
        error: () => this.loadNotifications()
      });
    }
  }

  viewNotification(notification: any) {
    const id = notification.resource_id || notification.id;
    const table = notification.table_source || '';
    if (id && table) {
      this.notiService.markAsRead(id, table).subscribe({
        next: () => {
          this.notifications = this.notifications.map(n => {
            if ((n.resource_id === notification.resource_id && n.table_source === notification.table_source) || n.id === notification.id) {
              return { ...n, estado: 'Leído' };
            }
            return n;
          });
          this.applyFilters();
          this.unreadCount = this.notifications.filter(n => n.estado === 'No leído').length;
        },
        error: () => {}
      });
    }
  }

  private normalize(items: any[]): any[] {
    return (items || []).map(it => ({
      id: it.id ?? it.notification_id ?? 0,
      fecha_hora: it.fecha_hora ?? it.created_at ?? it.date ?? '',
      tipo: it.tipo ?? it.type ?? it.subject ?? '',
      descripcion: it.descripcion ?? it.body ?? it.message ?? '',
      estado: it.estado ?? it.status ?? ((it.read || it.is_read) ? 'Leído' : 'No leído'),
      resource_id: it.resource_id ?? it.resourceId ?? undefined,
      table_source: it.table_source ?? it.source ?? ''
    }));
  }

  private addRealtime(data: any) {
    const n = this.normalize([data])[0];
    const exists = this.notifications.some(it =>
      (it.id && n.id && it.id === n.id) ||
      (it.table_source === n.table_source && it.resource_id === n.resource_id && it.fecha_hora === n.fecha_hora)
    );
    if (!exists) {
      this.notifications.unshift(n);
      this.applyFilters();
      this.unreadCount++;
      this.refreshFromServer();
    }
  }

  private refreshFromServer() {
    const userRaw = localStorage.getItem('auth_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const companyId = user?.company?.id || user?.company_id || 0;
    const type = this.filterValue || '';
    const from = this.fechaDesde || '';
    const to = this.fechaHasta || '';
    const limit = Number(this.limitValue) || 100;
    this.notiService.getAll(companyId, { type, from, to, limit }).subscribe({
      next: (data) => {
        const arr = Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []);
        this.notifications = this.normalize(arr || []);
        this.applyFilters();
        this.unreadCount = this.notifications.filter(n => n.estado === 'No leído').length;
      }
    });
  }

  refresh() {
    this.loadNotifications();
  }
}
