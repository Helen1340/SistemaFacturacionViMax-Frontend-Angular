import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Interfaz que define la estructura de una notificación
interface Notification {
  id: number;
  fecha_hora: string;
  tipo: 'factura' | 'nota_credito' | 'nota_debito' | 'sistema';
  descripcion: string;
  estado: 'Leído' | 'No Leído';
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class Notificaciones implements OnInit {

  // Estado de la búsqueda y filtro
  searchTerm: string = '';
  filterValue: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';
  isLoading: boolean = false;

  // Array que contendrá todas las notificaciones
  private allNotifications: Notification[] = [];
  
  // Paginación
  paginatedNotifications: Notification[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  startItem: number = 0;
  endItem: number = 0;

  // Contador de notificaciones no leídas
  unreadCount: number = 0;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  /**
   * Carga las notificaciones. En un caso real, esto haría una llamada a una API.
   * Por ahora, usa datos de ejemplo.
   */
  loadNotifications(): void {
    this.isLoading = true;
    // Datos de ejemplo para simular una carga de notificaciones
    this.allNotifications = [
      { id: 1, fecha_hora: '2025-09-22T10:00:00Z', tipo: 'factura', descripcion: 'Factura F001-123 ha sido validada por la DIAN.', estado: 'No Leído' },
      { id: 2, fecha_hora: '2025-09-21T15:30:00Z', tipo: 'sistema', descripcion: 'Actualización del sistema completada.', estado: 'Leído' },
      { id: 3, fecha_hora: '2025-09-21T09:15:00Z', tipo: 'nota_credito', descripcion: 'Nota de Crédito NC002-456 ha sido emitida.', estado: 'No Leído' },
      { id: 4, fecha_hora: '2025-09-20T18:45:00Z', tipo: 'factura', descripcion: 'Recepción de la factura F001-789 pendiente de aceptación.', estado: 'No Leído' },
      { id: 5, fecha_hora: '2025-09-19T11:00:00Z', tipo: 'nota_debito', descripcion: 'Nota de Débito ND003-101 ha sido validada por la DIAN.', estado: 'Leído' },
      { id: 6, fecha_hora: '2025-09-18T14:20:00Z', tipo: 'sistema', descripcion: 'Nuevo usuario registrado con éxito.', estado: 'Leído' },
      { id: 7, fecha_hora: '2025-09-17T08:00:00Z', tipo: 'factura', descripcion: 'Factura F001-124 ha sido validada por la DIAN.', estado: 'No Leído' },
      { id: 8, fecha_hora: '2025-09-16T10:00:00Z', tipo: 'nota_credito', descripcion: 'Nota de Crédito NC002-457 ha sido emitida.', estado: 'No Leído' },
      { id: 9, fecha_hora: '2025-09-15T12:00:00Z', tipo: 'factura', descripcion: 'Recepción de la factura F001-790 pendiente de aceptación.', estado: 'Leído' },
      { id: 10, fecha_hora: '2025-09-14T14:00:00Z', tipo: 'sistema', descripcion: 'Actualización de seguridad aplicada.', estado: 'No Leído' },
      { id: 11, fecha_hora: '2025-09-13T16:00:00Z', tipo: 'factura', descripcion: 'Factura F001-125 ha sido validada por la DIAN.', estado: 'Leído' },
      { id: 12, fecha_hora: '2025-09-12T18:00:00Z', tipo: 'nota_debito', descripcion: 'Nota de Débito ND003-102 ha sido validada por la DIAN.', estado: 'No Leído' },
      
    ];
    this.updateNotifications();
    this.isLoading = false;
  }

  // --- Lógica de búsqueda y filtro ---
  onSearch(): void {
    this.currentPage = 1;
    this.updateNotifications();
  }

  onFilter(): void {
    this.currentPage = 1;
    this.updateNotifications();
  }

  /**
   * Aplica los filtros y la paginación a las notificaciones.
   */
  updateNotifications(): void {
    let filtered = this.allNotifications;

    // 1. Filtrado por término de búsqueda
    if (this.searchTerm) {
      filtered = filtered.filter(n => 
        n.tipo.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        n.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // 2. Filtrado por tipo de notificación
    if (this.filterValue) {
      filtered = filtered.filter(n => 
        n.tipo.toLowerCase() === this.filterValue.toLowerCase()
      );
    }

    // 3. Filtrado por rango de fechas
    if (this.fechaDesde && this.fechaHasta) {
      const start = new Date(this.fechaDesde);
      const end = new Date(this.fechaHasta);
      filtered = filtered.filter(n => {
        const notifDate = new Date(n.fecha_hora);
        return notifDate >= start && notifDate <= end;
      });
    }

    // 4. Actualización de la paginación
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.totalItems);
    this.paginatedNotifications = filtered.slice(startIndex, endIndex);

    this.startItem = this.totalItems > 0 ? startIndex + 1 : 0;
    this.endItem = endIndex;
    
    // 5. Actualización del contador de notificaciones no leídas
    this.updateUnreadCount();
  }

  // --- Lógica de paginación ---
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateNotifications();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateNotifications();
    }
  }

  // --- Lógica de acciones ---
  /**
   * Actualiza el contador de notificaciones no leídas.
   */
  updateUnreadCount(): void {
    this.unreadCount = this.allNotifications.filter(n => n.estado === 'No Leído').length;
  }

  /**
   * Marca una notificación específica como leída.
   * @param notification La notificación a marcar.
   */
  markAsRead(notification: Notification): void {
    const notif = this.allNotifications.find(n => n.id === notification.id);
    if (notif) {
      notif.estado = 'Leído';
    }
    this.updateNotifications();
  }

  /**
   * Marca todas las notificaciones como leídas.
   */
  markAllAsRead(): void {
    this.allNotifications.forEach(n => n.estado = 'Leído');
    this.updateNotifications();
  }

  /**
   * Elimina una notificación específica.
   * @param notification La notificación a eliminar.
   */
  deleteNotification(notification: Notification): void {
    this.allNotifications = this.allNotifications.filter(n => n.id !== notification.id);
    this.updateNotifications();
  }

  /**
   * Elimina todas las notificaciones.
   */
  deleteAll(): void {
    this.allNotifications = [];
    this.updateNotifications();
  }

  /**
   * Muestra el detalle de una notificación.
   * @param notification La notificación seleccionada.
   */
  viewNotification(notification: Notification): void {
    this.markAsRead(notification);
    console.log('Detalle de la notificación:', notification);
    alert(`Tipo: ${notification.tipo}\nDescripción: ${notification.descripcion}\nEstado: ${notification.estado}`);
  }

  /**
   * Navega a la ruta del historial técnico.
   */
  navigateHistorialTecnico(): void {
    this.router.navigate(['/historial-tecnico']);
  }
}