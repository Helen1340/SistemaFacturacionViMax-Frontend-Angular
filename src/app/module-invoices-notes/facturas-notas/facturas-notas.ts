import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, HostListener, OnInit } from '@angular/core';
import { InvoicesNotesService } from '../services/invoices-notes.service';
import { forkJoin } from 'rxjs';

export interface InvoiceNote {
  id: number;
  numero: string;
  cliente: string;
  total: number;
  notas: string;
  dian: string;
  email: string;
  alerta?: string;
  estado: 'Borrador' | 'Emitida' | 'Enviada' | 'Aceptada' | 'Rechazada' | 'Anulada';
}

@Component({
  selector: 'app-facturas-notas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facturas-notas.html',
  styleUrl: './facturas-notas.css'
})
export class FacturasNotas implements OnInit {
  isDropdownOpen: boolean = false;
  openMenuIndex: number | null = null;
  dropdownTop: number = 0;
  dropdownLeft: number = 0;
  isLoading: boolean = false;
  
  // Variables para el mensaje de éxito
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  
  // Variables para alertas personalizadas
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'info' | 'warning' | 'error' = 'success';
  
  // Variables para modal de confirmación
  showConfirmModal: boolean = false;
  confirmMessage: string = '';
  confirmAction: (() => void) | null = null;

  searchTerm: string = '';
  selectedFilter: string = '';
  filterOptions = [
    { value: '', label: 'Todos' },
    { value: 'numero', label: 'No. Factura' },
    { value: 'nombre', label: 'Nombre del Cliente' }
  ];

  invoices: InvoiceNote[] = [];
  filteredInvoices: InvoiceNote[] = [];

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalInvoices: number = 0;
  totalPages: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoicesNotesService: InvoicesNotesService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  // Cargar facturas desde la API
  loadInvoices() {
    this.isLoading = true;
    console.log('Iniciando carga de facturas...');
    
    forkJoin({
      invoices: this.invoicesNotesService.getInvoicesNotes(),
      users: this.invoicesNotesService.getUsers(),
      radianEvents: this.invoicesNotesService.getRadianEvents(),
      electronicDocuments: this.invoicesNotesService.getElectronicDocuments()
    }).subscribe({
      next: ({ invoices, users, radianEvents, electronicDocuments }) => {
        console.log('Respuesta de facturas:', invoices);
        console.log('Respuesta de usuarios:', users);
        console.log('Respuesta de radian events:', radianEvents);
        console.log('Respuesta de electronic documents:', electronicDocuments);
        
        // Procesar facturas
        const payload: any[] = Array.isArray(invoices)
          ? invoices
          : Array.isArray((invoices as any)?.data)
            ? (invoices as any).data
            : [];

        console.log('Facturas procesadas:', payload.length);

        // Procesar usuarios
        const usersList: any[] = Array.isArray(users)
          ? users
          : Array.isArray((users as any)?.data)
            ? (users as any).data
            : [];

        console.log('Usuarios procesados:', usersList.length);

        // Procesar radian events
        const radianEventsList: any[] = Array.isArray(radianEvents)
          ? radianEvents
          : Array.isArray((radianEvents as any)?.data)
            ? (radianEvents as any).data
            : [];

        console.log('Radian events procesados:', radianEventsList.length);

        // Procesar electronic documents
        const electronicDocumentsList: any[] = Array.isArray(electronicDocuments)
          ? electronicDocuments
          : Array.isArray((electronicDocuments as any)?.data)
            ? (electronicDocuments as any).data
            : [];

        console.log('Electronic documents procesados:', electronicDocumentsList.length);

        // Crear índices de radian events por electronic_document_id
        const radianEventsByDocId: Record<number, any> = {};
        radianEventsList.forEach((event: any) => {
          if (event?.electronic_document_id) {
            const docId = Number(event.electronic_document_id);
            radianEventsByDocId[docId] = event;
          }
        });

        // Crear índices de electronic documents por electronic_invoice_id
        const electronicDocsByInvoice: Record<number, any> = {};
        electronicDocumentsList.forEach((doc: any) => {
          if (doc?.electronic_invoice_id) {
            const invoiceId = Number(doc.electronic_invoice_id);
            electronicDocsByInvoice[invoiceId] = doc;
          }
        });

        // Crear índices de usuarios - SOLO usuarios con rol_id = 4 (cliente)
        const usersByIdNum: Record<number, any> = {};
        const usersByIdStr: Record<string, any> = {};
        usersList.forEach((u: any) => {
          if (!u || u.id === undefined || u.id === null) return;
          
          // Filtrar solo usuarios con rol_id = 4 (rol cliente)
          const rolId = Number(u.rol_id || u.role_id || u.id_rol || 0);
          if (rolId !== 4) {
            console.log(`Usuario ${u.id} (${u.nombre || u.name}) no es cliente (rol_id: ${rolId}), omitiendo...`);
            return;
          }
          
          const idNum = Number(u.id);
          const idStr = String(u.id);
          usersByIdNum[idNum] = u;
          usersByIdStr[idStr] = u;
          console.log(`Usuario cliente ${u.id} (${u.nombre || u.name}) agregado al índice`);
        });

        // Mapear facturas
        const mapped = payload.map((raw, index) => {
          console.log(`Procesando factura ${index + 1}:`, raw);
          const inv = this.mapApiInvoice(raw);
          
          // Buscar usuario relacionado
          const rawId = (raw?.user_id ?? raw?.customer_id ?? raw?.buyer_id ?? raw?.usuario_id);
          const relatedUserIdNum: number | undefined = rawId !== undefined && rawId !== null ? Number(rawId) : undefined;
          const relatedUserIdStr: string | undefined = rawId !== undefined && rawId !== null ? String(rawId) : undefined;
          const relatedUser = (relatedUserIdNum !== undefined ? usersByIdNum[relatedUserIdNum] : undefined)
            || (relatedUserIdStr !== undefined ? usersByIdStr[relatedUserIdStr] : undefined);
          
          if (relatedUser) {
            console.log(`Usuario cliente encontrado para factura ${inv.numero}:`, relatedUser);
            inv.cliente = String(relatedUser.nombre || relatedUser.name || 'Sin nombre');
            inv.email = String(relatedUser.correo_electronico || relatedUser.email || '');
          } else {
            console.log(`No se encontró usuario cliente para factura ${inv.numero}, ID relacionado:`, rawId);
            // Si no se encuentra un usuario cliente, mantener la información original o mostrar mensaje apropiado
            inv.cliente = inv.cliente || 'Cliente no especificado';
            inv.email = inv.email || 'Email no disponible';
          }
          
          // Obtener datos de DIAN y Alerta desde radian_events
          this.getDianDataFromRadianEvents(inv, electronicDocsByInvoice, radianEventsByDocId);
          return inv;
        });

        console.log('Facturas mapeadas:', mapped);
        this.invoices = mapped;
        this.filteredInvoices = [...this.invoices];
        this.totalInvoices = this.invoices.length;
        this.calculatePagination();
        this.isLoading = false;
        
        if (this.invoices.length === 0) {
          this.mostrarAlerta('No se encontraron facturas en la base de datos.', 'info');
        } else {
          this.mostrarAlerta(`${this.invoices.length} facturas cargadas correctamente.`, 'success');
        }
      },
      error: (error) => {
        console.error('Error cargando facturas/notas o usuarios:', error);
        this.invoices = [];
        this.filteredInvoices = [];
        this.totalInvoices = 0;
        this.isLoading = false;
      }
    });
  }

  private getDianDataFromRadianEvents(inv: InvoiceNote, electronicDocsByInvoice: Record<number, any>, radianEventsByDocId: Record<number, any>) {
    // Buscar electronic document relacionado con la factura usando electronic_invoice_id
    const electronicDoc = electronicDocsByInvoice[inv.id];
    
    if (!electronicDoc) {
      console.log(`No se encontró electronic document para factura ${inv.numero} (electronic_invoice_id: ${inv.id})`);
      // Asignar valores por defecto para evitar campos vacíos
      inv.dian = 'Pendiente';
      inv.alerta = 'Sin evento';
      return;
    }

    // Buscar radian event relacionado con el electronic document
    const radianEvent = radianEventsByDocId[electronicDoc.id];
    
    if (!radianEvent) {
      console.log(`No se encontró radian event para electronic document ${electronicDoc.id}`);
      // Asignar valores por defecto para evitar campos vacíos
      inv.dian = 'Pendiente';
      inv.alerta = 'Sin evento';
      return;
    }

    // Obtener datos de radian event
    const estadoDian = radianEvent.estado_dian;
    const tipoEvento = radianEvent.tipo_evento;

    console.log(`Datos DIAN para factura ${inv.numero}:`, {
      estado_dian: estadoDian,
      tipo_evento: tipoEvento,
      electronic_doc_id: electronicDoc.id,
      radian_event_id: radianEvent.id
    });

    // Asignar datos a la factura - siempre asignar valores, nunca vacíos
    inv.dian = estadoDian || 'Pendiente';
    inv.alerta = tipoEvento || 'Sin evento';
  }

  // Adaptar respuesta API -> modelo de vista según migración de Laravel
  private mapApiInvoice(item: any): InvoiceNote {
    console.log('Mapeando factura:', item);
    
    const id: number = Number(item?.id ?? 0);
    const numero: string = String(item?.numero_factura ?? item?.numero ?? item?.invoice_number ?? `FAC-${id}`);
    const total: number = Number(item?.total_factura ?? item?.total ?? item?.amount ?? 0);
    const observacion: string = String(item?.observacion ?? item?.observations ?? item?.notes ?? '');
    const estadoInterno: string = String(item?.estado_interno ?? item?.status ?? item?.estado ?? 'borrador');

    // Mapear estado_interno -> etiqueta visible
    const estado: InvoiceNote['estado'] =
      estadoInterno.toLowerCase() === 'borrador' ? 'Borrador'
      : estadoInterno.toLowerCase() === 'anulada' ? 'Anulada'
      : estadoInterno.toLowerCase() === 'emitida' ? 'Emitida'
      : estadoInterno.toLowerCase() === 'enviada' ? 'Enviada'
      : estadoInterno.toLowerCase() === 'aceptada' ? 'Aceptada'
      : estadoInterno.toLowerCase() === 'rechazada' ? 'Rechazada'
      : 'Borrador'; // Default

    // Si la API incluye relación user, preferimos su nombre/email
    const cliente: string = (item?.user?.nombre)
      ? String(item.user.nombre)
      : (item?.user?.name)
      ? String(item.user.name)
      : (item?.customer_name)
      ? String(item.customer_name)
      : (item?.user_id ? `Usuario #${item.user_id}` : 'Cliente no especificado');
    
    const email: string = String(item?.user?.correo_electronico ?? item?.user?.email ?? item?.customer_email ?? '');

    // La API no define campos para DIAN/alerta; dejamos vacíos
    const dian: string = '';
    const alerta: string = '';
    const notas: string = observacion;

    const mappedInvoice = { id, numero, cliente, total, estado, dian, email, alerta, notas } as InvoiceNote;
    console.log('Factura mapeada:', mappedInvoice);
    
    return mappedInvoice;
  }


  crearFactura(): void {
    this.router.navigate(['/nueva-factura']);
  }

  crearNota(): void {
    this.router.navigate(['/nueva-nota']);
  }

  toggleDropdown(event?: Event): void {
    event?.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleMenu(index: number, event: Event): void {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const menuWidth = 160; // w-40 ≈ 160px
    const margin = 6;
    const left = rect.right - menuWidth;
    const top = rect.bottom + margin;
    this.dropdownLeft = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
    this.dropdownTop = Math.max(8, Math.min(top, window.innerHeight - 8));
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  closeAllMenus(): void {
    this.isDropdownOpen = false;
    this.openMenuIndex = null;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.invoices.filter((inv) => {
      const term = this.searchTerm?.toLowerCase() ?? '';
      const matchesSearch = !term ||
        inv.numero.toLowerCase().includes(term) ||
        inv.cliente.toLowerCase().includes(term);

      const matchesFilter = !this.selectedFilter || this.applyFilterCondition(inv);
      return matchesSearch && matchesFilter;
    });
    this.filteredInvoices = filtered;
    this.totalInvoices = filtered.length;
    this.currentPage = 1;
    this.calculatePagination();
  }

  private applyFilterCondition(inv: { numero: string; cliente: string; }): boolean {
    switch (this.selectedFilter) {
      case 'numero':
        return this.searchTerm ? inv.numero.toLowerCase().includes(this.searchTerm.toLowerCase()) : true;
      case 'nombre':
        return this.searchTerm ? inv.cliente.toLowerCase().includes(this.searchTerm.toLowerCase()) : true;
      default:
        return true;
    }
  }

  // Método para obtener clases CSS de estado
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Borrador':
        return 'bg-gray-100 text-gray-800';
      case 'Emitida':
        return 'bg-yellow-100 text-yellow-800';
      case 'Enviada':
        return 'bg-blue-100 text-blue-800';
      case 'Aceptada':
        return 'bg-green-100 text-green-800';
      case 'Rechazada':
        return 'bg-red-100 text-red-800';
      case 'Anulada':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Métodos para acciones basadas en estado
  getAvailableActions(estado: string): string[] {
    switch (estado) {
      case 'Borrador':
        return ['Ver Detalles', 'Editar', 'Emitir'];
      case 'Emitida':
        return ['Ver Detalles'];
      case 'Enviada':
        return ['Ver Detalles'];
      case 'Aceptada':
        return ['Ver Detalles'];
      case 'Rechazada':
        return ['Ver Detalles'];
      case 'Anulada':
        return ['Ver Detalles'];
      default:
        return ['Ver Detalles'];
    }
  }

  executeAction(action: string, invoice: any): void {
    switch (action) {
      case 'Ver Detalles':
        this.router.navigate(['/detalle-facturas', invoice.id]);
        break;
      case 'Editar':
        this.router.navigate(['/editar-facturas', invoice.id]);
        break;
      case 'Emitir':
        this.emitirFactura(invoice);
        break;
      case 'Firmar y Enviar a DIAN':
        this.firmarYEnviar(invoice);
        break;
      case 'Anular':
        this.anularFactura(invoice);
        break;
      case 'Reintentar Envío':
        this.reintentarEnvio(invoice);
        break;
      case 'Editar y Reenviar':
        this.editarYReenviar(invoice);
        break;
    }
    this.closeAllMenus();
  }


  private emitirFactura(invoice: any): void {
    invoice.estado = 'Emitida';
    invoice.dian = 'Pendiente';
    this.applyFilters();
    this.mostrarAlerta(`Factura ${invoice.numero} emitida exitosamente`, 'success');
  }

  private firmarYEnviar(invoice: any): void {
    invoice.estado = 'Enviada';
    invoice.dian = 'Pendiente';
    this.applyFilters();
    this.mostrarAlerta(`Factura ${invoice.numero} firmada y enviada a la DIAN`, 'info');
  }

  private anularFactura(invoice: any): void {
    this.mostrarConfirmacion(
      `¿Está seguro de anular la factura ${invoice.numero}?`,
      () => {
        invoice.estado = 'Anulada';
        this.applyFilters();
        this.mostrarAlerta(`Factura ${invoice.numero} anulada`, 'warning');
      }
    );
  }

  private reintentarEnvio(invoice: any): void {
    invoice.dian = 'Pendiente';
    this.applyFilters();
    this.mostrarAlerta(`Reintentando envío de factura ${invoice.numero} a la DIAN`, 'info');
  }

  private editarYReenviar(invoice: any): void {
    invoice.estado = 'Borrador';
    this.applyFilters();
    this.mostrarAlerta(`Factura ${invoice.numero} lista para editar y reenviar`, 'info');
  }

  // Método para obtener clases CSS de alertas
  getAlertClasses(): string {
    switch (this.alertType) {
      case 'success':
        return 'bg-green-50 border border-green-200 text-green-800';
      case 'info':
        return 'bg-blue-50 border border-blue-200 text-blue-800';
      case 'warning':
        return 'bg-yellow-50 border border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border border-gray-200 text-gray-800';
    }
  }

  // Método para mostrar modal de confirmación
  private mostrarConfirmacion(mensaje: string, accion: () => void): void {
    this.confirmMessage = mensaje;
    this.confirmAction = accion;
    this.showConfirmModal = true;
  }

  // Métodos para manejar confirmación
  confirmarAccion(): void {
    if (this.confirmAction) {
      this.confirmAction();
      this.confirmAction = null;
    }
    this.showConfirmModal = false;
  }

  cancelarAccion(): void {
    this.confirmAction = null;
    this.showConfirmModal = false;
  }

  // Método para mostrar alertas personalizadas
  private mostrarAlerta(mensaje: string, tipo: 'success' | 'info' | 'warning' | 'error'): void {
    this.alertMessage = mensaje;
    this.alertType = tipo;
    this.showAlert = true;
    
    // Ocultar alerta después de 4 segundos
    setTimeout(() => {
      this.showAlert = false;
    }, 4000);
  }



  // Paginación
  get paginatedInvoices(): InvoiceNote[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredInvoices.slice(startIndex, endIndex);
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.totalInvoices / this.itemsPerPage);
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
    if (this.totalInvoices === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalInvoices);
  }

  trackByFn(index: number, invoice: InvoiceNote): number {
    return invoice.id;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(_event: Event): void {
    this.closeAllMenus();
  }
}
