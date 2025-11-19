import { Component, OnInit, HostListener } from '@angular/core';
import { InvoiceService } from '../services/invoice.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.css']
})
export class FacturacionComponent implements OnInit {

  openMenuIndex: number | null = null;
  dropdownPosition = { top: 0, left: 0 };

  invoices: any[] = [];
  paginatedInvoices: any[] = [];
  filteredInvoices: any[] = []; // Almacenar facturas filtradas
  alert = { message: '', type: '' };
  searchTerm = '';
  filter = { internal_status: '', dian_status: '', date: '' };
  pageSize = 5;
  currentPage = 1;
  totalPages = 1;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices() {
    this.isLoading = true;
    this.alert = { message: '', type: '' };
    
    const filters: any = {};
    if (this.filter.internal_status) filters.internal_status = this.filter.internal_status;
    if (this.filter.dian_status) filters.dian_status = this.filter.dian_status;
    if (this.filter.date) filters.date_from = this.filter.date;
    
    this.invoiceService.getInvoices(filters).subscribe({
      next: (data) => {
        this.invoices = Array.isArray(data) ? data : [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'Error desconocido';
        this.alert = { message: `Error cargando facturas: ${errorMessage}`, type: 'error' };
        this.invoices = [];
        this.paginatedInvoices = [];
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    this.filteredInvoices = this.invoices.filter((f: any) => {
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm || 
        (f.invoice_number && f.invoice_number.toLowerCase().includes(searchLower)) ||
        (f.buyer?.first_name && f.buyer.first_name.toLowerCase().includes(searchLower)) ||
        (f.user?.company?.business_name && f.user.company.business_name.toLowerCase().includes(searchLower));
      
      const matchesStatus = !this.filter.internal_status || f.internal_status === this.filter.internal_status;
      const matchesDian = !this.filter.dian_status || f.dian_status === this.filter.dian_status;
      const matchesDate = !this.filter.date || (f.issue_date && f.issue_date.startsWith(this.filter.date));
      
      return matchesSearch && matchesStatus && matchesDian && matchesDate;
    });

    this.totalPages = Math.max(1, Math.ceil(this.filteredInvoices.length / this.pageSize));
    this.currentPage = Math.min(Math.max(1, this.currentPage), this.totalPages);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedInvoices = this.filteredInvoices.slice(start, end);
  }

  translateInternalStatus(status: string): string {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'issued': return 'Emitida';
      case 'cancelled': return 'Anulada';
      default: return status;
    }
  }

  translateDianStatus(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'sent': return 'Enviada';
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'error': return 'Error';
      case 'cancelled': return 'Anulada';
      default: return status;
    }
  }

  getBuyerDisplay(factura: any): string {
    return factura?.buyer?.first_name || factura?.user?.company?.business_name || 'N/A';
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  getMaxDisplayed(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredInvoices.length);
  }

  toggleMenu(index: number, event: Event): void {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const dropdownWidth = 192; // w-48 = 192px
    const margin = 8;
    
    // Calcular posición para el dropdown fixed
    let left = rect.right + window.scrollX - dropdownWidth;
    
    // Ajustar si se sale por la derecha
    if (left < window.scrollX + margin) {
      left = rect.left + window.scrollX;
    }
    
    // Ajustar si se sale por la izquierda
    if (left + dropdownWidth > window.innerWidth + window.scrollX - margin) {
      left = window.innerWidth + window.scrollX - dropdownWidth - margin;
    }
    
    this.dropdownPosition = {
      top: rect.bottom + window.scrollY + 4,
      left: left
    };
    
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  navigateToVerDetalles(factura: any) {
    const invoiceId = factura?.id;
    
    if (invoiceId !== undefined && invoiceId !== null) {
      this.openMenuIndex = null; // Cerrar el menú
      this.router.navigate(['/detalle_factura', invoiceId]);
    } else {
      this.alert = { message: 'Error: No se pudo obtener el ID de la factura', type: 'error' };
      this.openMenuIndex = null;
    }
  }

  enviarDian(factura: any) {
    const invoiceId = factura?.id;
    
    if (invoiceId !== undefined && invoiceId !== null) {
      this.openMenuIndex = null;
      this.invoiceService.sendToDian(invoiceId).subscribe({
        next: (response) => {
          this.alert = { 
            message: `Factura ${factura.invoice_number} enviada a la DIAN exitosamente`, 
            type: 'success' 
          };
          this.loadInvoices(); // Recargar lista
        },
        error: (err) => {
          const errorMessage = err.error?.message || err.message || 'Error desconocido';
          this.alert = { message: `Error enviando factura: ${errorMessage}`, type: 'error' };
        }
      });
    } else {
      this.alert = { message: 'Error: No se pudo obtener el ID de la factura', type: 'error' };
    }
  }

  anularFactura(factura: any) {
    const invoiceId = factura?.id;
    
    if (invoiceId !== undefined && invoiceId !== null && confirm(`¿Está seguro de anular la factura ${factura.invoice_number}?`)) {
      this.openMenuIndex = null;
      this.invoiceService.cancelInvoice(invoiceId, 'Anulación desde listado').subscribe({
        next: () => {
          this.alert = { message: `Factura ${factura.invoice_number} anulada correctamente`, type: 'success' };
          this.loadInvoices(); // Recargar lista
        },
        error: (err) => {
          const errorMessage = err.error?.message || err.message || 'Error desconocido';
          this.alert = { message: `Error al anular factura: ${errorMessage}`, type: 'error' };
        }
      });
    } else if (invoiceId === undefined || invoiceId === null) {
      this.alert = { message: 'Error: No se pudo obtener el ID de la factura', type: 'error' };
    }
  }

  crearNotaCredito(factura: any) {
    const invoiceId = factura?.id;
    if (invoiceId !== undefined && invoiceId !== null) {
      this.openMenuIndex = null;
      this.router.navigate(['/notas-factura', invoiceId], { queryParams: { type: 'credit' } });
    } else {
      this.alert = { message: 'Error: No se pudo obtener el ID de la factura', type: 'error' };
    }
  }

  crearNotaDebito(factura: any) {
    const invoiceId = factura?.id;
    if (invoiceId !== undefined && invoiceId !== null) {
      this.openMenuIndex = null;
      this.router.navigate(['/notas-factura', invoiceId], { queryParams: { type: 'debit' } });
    } else {
      this.alert = { message: 'Error: No se pudo obtener el ID de la factura', type: 'error' };
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Cerrar el menú si se hace clic fuera
    if (this.openMenuIndex !== null) {
      const target = event.target as HTMLElement;
      const clickedInsideDropdown = target.closest('.dropdown-menu');
      const clickedOnButton = target.closest('button[type="button"]')?.querySelector('svg');
      
      if (!clickedInsideDropdown && !clickedOnButton) {
        this.openMenuIndex = null;
      }
    }
  }

  navigateToCreateInvoice(): void {
    this.router.navigate(['/crear-factura']);
  }

}
