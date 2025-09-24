import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reporte-pagos',
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-pagos.html',
  styleUrl: './reporte-pagos.css'
})
export class ReportePagos implements OnInit {
 payments: any[] = [];
  filteredPayments: any[] = [];
  
  // Propiedades para los filtros
  invoiceNumber: string = '';
  startDate: string = '';
  endDate: string = '';
  clientSearch: string = '';
  paymentMethod: string = '';
  associatedInvoice: string = '';

  constructor() { }

  ngOnInit(): void {
    this.loadSimulatedData();
    this.applyFilters(); // Muestra todos los datos al cargar la página
  }

  loadSimulatedData(): void {
    // Datos simulados. En un entorno real, estos vendrían de un servicio.
    this.payments = [
      {
        date: '2025-07-05',
        client: 'Juan Pérez',
        nit: '900123456-7',
        invoiceNumber: 'FAC-00123',
        value: '$350.000',
        method: 'Transferencia',
        status: 'Completo',
        responsible: 'admin_vimax'
      },
      {
        date: '2025-07-06',
        client: 'Comercial XYZ S.A.S',
        nit: '800555333-2',
        invoiceNumber: 'FAC-00124',
        value: '$150.000',
        method: 'Efectivo',
        status: 'Pendiente',
        responsible: 'user_juan'
      },
      {
        date: '2025-07-07',
        client: 'Manufacturas PQR',
        nit: '900987654-1',
        invoiceNumber: 'FAC-00125',
        value: '$50.000',
        method: 'Tarjeta',
        status: 'Rechazado',
        responsible: 'admin_vimax'
      },
      {
        date: '2025-07-08',
        client: 'Juan Pérez',
        nit: '900123456-7',
        invoiceNumber: 'FAC-00126',
        value: '$200.000',
        method: 'Transferencia',
        status: 'Completo',
        responsible: 'user_ana'
      },
      {
        date: '2025-07-09',
        client: 'Servicios ABC Ltda.',
        nit: '860444777-0',
        invoiceNumber: 'FAC-00127',
        value: '$100.000',
        method: 'Efectivo',
        status: 'Completo',
        responsible: 'admin_vimax'
      }
    ];
  }

  applyFilters(): void {
    this.filteredPayments = this.payments.filter(payment => {
      // Filtrar por número de factura
      const matchesInvoiceNumber = !this.invoiceNumber || payment.invoiceNumber.toLowerCase().includes(this.invoiceNumber.toLowerCase());

      // Filtrar por cliente
      const matchesClient = !this.clientSearch || 
                           payment.client.toLowerCase().includes(this.clientSearch.toLowerCase()) || 
                           payment.nit.includes(this.clientSearch);

      // Filtrar por rango de fechas
      const paymentDate = new Date(payment.date);
      const start = this.startDate ? new Date(this.startDate + 'T00:00:00') : null;
      const end = this.endDate ? new Date(this.endDate + 'T23:59:59') : null;
      const matchesDateRange = (!start || paymentDate >= start) && (!end || paymentDate <= end);
      
      // Filtrar por método de pago
      const matchesPaymentMethod = !this.paymentMethod || payment.method === this.paymentMethod;

      // Filtrar por número de factura asociada (se asume que es el mismo invoiceNumber)
      const matchesAssociatedInvoice = !this.associatedInvoice || payment.invoiceNumber.toLowerCase().includes(this.associatedInvoice.toLowerCase());

      return matchesInvoiceNumber && matchesClient && matchesDateRange && matchesPaymentMethod && matchesAssociatedInvoice;
    });
  }

  downloadReport(payment: any): void {
    alert(`Simulando la descarga del reporte para el pago de la factura: ${payment.invoiceNumber}`);
    // Aquí iría la lógica para generar y descargar el archivo real
  }

  // Se añade un método para simular el menú desplegable
  toggleMenu(event: Event): void {
    const button = event.currentTarget as HTMLElement;
    const dropdown = button.nextElementSibling as HTMLElement;
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Completo':
        return 'text-green-600';
      case 'Pendiente':
        return 'text-yellow-600';
      case 'Rechazado':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
}
