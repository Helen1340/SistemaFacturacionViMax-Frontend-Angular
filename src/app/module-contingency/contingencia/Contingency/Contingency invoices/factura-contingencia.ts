import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

interface ContingencyInvoice {
  id: number;
  number: string;
  client: string;
  date: Date;
  value: number;
  status: 'pending' | 'sent' | 'failed';
  lastAttempt: Date;
  dianResult?: string;
}

@Component({
  selector: 'app-factura-contingencia',
  imports: [CommonModule, FormsModule],
  templateUrl: './factura-contingencia.html',
  styleUrl: './factura-contingencia.css'
})
export class FacturaContingencia implements OnInit {

  invoices: ContingencyInvoice[] = [];
  filteredInvoices: ContingencyInvoice[] = [];

  // Filters
  selectedFilter: string = 'all';
  dateFrom: string = '';
  dateTo: string = '';
  searchTerm: string = '';
  dateFromDisplay: string = '';
  dateToDisplay: string = '';

  // Summary counts
  pendingCount: number = 0;
  sentCount: number = 0;
  failedCount: number = 0;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Dropdown menu
  openDropdownIndex: number = -1;

  constructor(private location: Location) { }

  ngOnInit(): void {
    this.loadInvoices();
    this.setDefaultDates();
  }

  /**
   * Carga las facturas en contingencia
   */
  loadInvoices(): void {
    // Los datos vendrán de la base de datos
    this.invoices = [];

    this.applyFilter();
    this.updateSummaryCounts();
  }

  /**
   * Establece las fechas por defecto (últimos 30 días)
   */
  setDefaultDates(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.dateTo = today.toISOString().split('T')[0];
    this.dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
  }

  /**
   * Aplica los filtros a las facturas
   */
  applyFilter(): void {
    let filtered = [...this.invoices];

    // Filtrar por término de búsqueda
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(invoice =>
        invoice.number.toLowerCase().includes(searchLower) ||
        invoice.client.toLowerCase().includes(searchLower) ||
        invoice.dianResult?.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por estado
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === this.selectedFilter);
    }

    // Filtrar por rango de fechas
    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      filtered = filtered.filter(invoice => invoice.date >= fromDate);
    }

    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      toDate.setHours(23, 59, 59, 999); // Incluir todo el día
      filtered = filtered.filter(invoice => invoice.date <= toDate);
    }

    this.filteredInvoices = filtered;
    this.currentPage = 1;
    this.calculatePagination();

    console.log('Filtros aplicados:', {
      searchTerm: this.searchTerm,
      selectedFilter: this.selectedFilter,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      filteredCount: filtered.length,
      totalCount: this.invoices.length
    });
  }

  /**
   * Busca facturas con los filtros aplicados
   */
  searchInvoices(): void {
    this.applyFilter();
    console.log('Buscando facturas con filtros:', {
      filter: this.selectedFilter,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    });
  }

  /**
   * Actualiza los contadores del resumen
   */
  updateSummaryCounts(): void {
    this.pendingCount = this.invoices.filter(inv => inv.status === 'pending').length;
    this.sentCount = this.invoices.filter(inv => inv.status === 'sent').length;
    this.failedCount = this.invoices.filter(inv => inv.status === 'failed').length;
  }

  /**
   * Obtiene el texto del estado
   */
  getStatusText(status: string): string {
    const statusMap = {
      'pending': 'Pendiente',
      'sent': 'Enviada',
      'failed': 'Fallida'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  }

  /**
   * Ve los detalles de una factura
   */
  viewInvoice(invoiceId: number): void {
    console.log('Viendo factura:', invoiceId);
    // Aquí se implementaría la navegación a los detalles de la factura
    alert(`Mostrando detalles de la factura ${invoiceId}`);
  }

  /**
   * Reenvía una factura específica
   */
  resendInvoice(invoiceId: number): void {
    if (confirm('¿Desea reenviar esta factura?')) {
      console.log('Reenviando factura:', invoiceId);
      // Aquí se implementaría la lógica para reenviar la factura
      alert(`Factura ${invoiceId} reenviada correctamente`);
      this.loadInvoices(); // Recargar datos
    }
  }

  /**
   * Reenvía todas las facturas pendientes
   */
  resendAll(): void {
    const pendingInvoices = this.invoices.filter(inv => inv.status === 'pending');
    if (pendingInvoices.length === 0) {
      alert('No hay facturas pendientes para reenviar');
      return;
    }

    if (confirm(`¿Desea reenviar ${pendingInvoices.length} facturas pendientes?`)) {
      console.log('Reenviando todas las facturas pendientes');
      // Aquí se implementaría la lógica para reenviar todas las facturas
      alert(`${pendingInvoices.length} facturas reenviadas correctamente`);
      this.loadInvoices(); // Recargar datos
    }
  }

  /**
   * Elimina una factura
   */
  deleteInvoice(invoiceId: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta factura? Esta acción no se puede deshacer.')) {
      console.log('Eliminando factura:', invoiceId);
      // Aquí se implementaría la lógica para eliminar la factura
      this.invoices = this.invoices.filter(inv => inv.id !== invoiceId);
      this.applyFilter();
      this.updateSummaryCounts();
      alert('Factura eliminada correctamente');
    }
  }

  /**
   * Exporta las facturas a un archivo
   */
  exportInvoices(): void {
    console.log('Exportando facturas');
    // Aquí se implementaría la lógica para exportar las facturas
    alert('Exportando facturas...');
  }

  /**
   * Calcula la paginación
   */
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredInvoices.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  /**
   * Va a la página anterior
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  /**
   * Va a la página siguiente
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  /**
   * Regresa a la pantalla anterior
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Parsea la fecha desde el input de texto
   */
  parseDateFrom(): void {
    if (this.dateFromDisplay) {
      const parts = this.dateFromDisplay.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        this.dateFrom = date.toISOString().split('T')[0];
        this.applyFilter();
      }
    }
  }

  /**
   * Parsea la fecha hasta el input de texto
   */
  parseDateTo(): void {
    if (this.dateToDisplay) {
      const parts = this.dateToDisplay.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        this.dateTo = date.toISOString().split('T')[0];
        this.applyFilter();
      }
    }
  }

  /**
   * Alterna el menú desplegable para una fila específica
   * @param index Índice de la fila
   */
  toggleDropdown(index: number): void {
    this.openDropdownIndex = this.openDropdownIndex === index ? -1 : index;
  }

  /**
   * Cierra el menú desplegable
   */
  closeDropdown(): void {
    this.openDropdownIndex = -1;
  }

  /**
   * Descarga el archivo XML de la factura
   * @param invoice Factura de contingencia
   */
  downloadXML(invoice: ContingencyInvoice): void {
    console.log('Descargando XML para factura:', invoice.number);
    // Aquí se implementaría la lógica para descargar el XML
    alert(`Descargando XML de la factura ${invoice.number}...`);
    this.closeDropdown();
  }

  /**
   * Descarga el archivo PDF de la factura
   * @param invoice Factura de contingencia
   */
  downloadPDF(invoice: ContingencyInvoice): void {
    console.log('Descargando PDF para factura:', invoice.number);
    // Aquí se implementaría la lógica para descargar el PDF
    alert(`Descargando PDF de la factura ${invoice.number}...`);
    this.closeDropdown();
  }

  /**
   * Descarga el archivo CDR de la factura
   * @param invoice Factura de contingencia
   */
  downloadCDR(invoice: ContingencyInvoice): void {
    console.log('Descargando CDR para factura:', invoice.number);
    // Aquí se implementaría la lógica para descargar el CDR
    alert(`Descargando CDR de la factura ${invoice.number}...`);
    this.closeDropdown();
  }
}
