import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reporte-facturas',
  imports: [ CommonModule, FormsModule],
  templateUrl: './reporte-facturas.html',
  styleUrl: './reporte-facturas.css'
})
export class ReporteFacturas implements OnInit {
  invoices: any[] = [];
  filteredInvoices: any[] = [];
  
  // Propiedades para los filtros
  invoiceNumber: string = '';
  status: string = 'Todos';
  startDate: string = '';
  endDate: string = '';
  clientName: string = '';
  responsible: string = '';
  documentType: string = '';

  constructor() { }

  ngOnInit(): void {
    this.loadSimulatedData();
    this.applyFilters(); // Muestra todos los datos al cargar la página
  }

  loadSimulatedData(): void {
    // Datos simulados. En un entorno real, estos vendrían de un servicio.
    this.invoices = [
      {
        date: '2025-07-01',
        documentType: 'Factura Electrónica',
        invoiceNumber: 'FV-00123',
        client: 'Comercial XYZ S.A.S',
        nit: '900123456-7',
        responsible: 'admin_vimax',
        totalValue: '$450.000',
        status: 'Aceptada'
      },
      {
        date: '2025-07-02',
        documentType: 'Nota Crédito',
        invoiceNumber: 'NC-00456',
        client: 'Servicios ABC Ltda',
        nit: '800555333-2',
        responsible: 'user_juan',
        totalValue: '$-50.000',
        status: 'Emitida'
      },
      {
        date: '2025-07-03',
        documentType: 'Factura Electrónica',
        invoiceNumber: 'FV-00124',
        client: 'Manufacturas PQR S.A.',
        nit: '900987654-1',
        responsible: 'admin_vimax',
        totalValue: '$1.200.000',
        status: 'Pendiente'
      },
      {
        date: '2025-07-04',
        documentType: 'Factura Electrónica',
        invoiceNumber: 'FV-00125',
        client: 'Distribuidora LMN',
        nit: '860444777-0',
        responsible: 'user_ana',
        totalValue: '$75.000',
        status: 'Rechazada'
      },
      {
        date: '2025-07-05',
        documentType: 'Nota Débito',
        invoiceNumber: 'ND-00789',
        client: 'Comercial XYZ S.A.S',
        nit: '900123456-7',
        responsible: 'user_juan',
        totalValue: '$15.000',
        status: 'Aceptada'
      },
      {
        date: '2025-07-06',
        documentType: 'Factura Electrónica',
        invoiceNumber: 'FV-00126',
        client: 'Industrias GHI',
        nit: '890111222-3',
        responsible: 'admin_vimax',
        totalValue: '$875.500',
        status: 'Aceptada'
      },
      {
        date: '2025-07-07',
        documentType: 'Nota Crédito',
        invoiceNumber: 'NC-00457',
        client: 'Servicios ABC Ltda',
        nit: '800555333-2',
        responsible: 'user_ana',
        totalValue: '$-25.000',
        status: 'Emitida'
      },
      {
        date: '2025-07-08',
        documentType: 'Factura de ajuste',
        invoiceNumber: 'FA-00101',
        client: 'Comercial XYZ S.A.S',
        nit: '900123456-7',
        responsible: 'user_juan',
        totalValue: '$10.000',
        status: 'Aceptada'
      }
    ];
  }

  applyFilters(): void {
    this.filteredInvoices = this.invoices.filter(invoice => {
      // Filtrar por número de factura
      const matchesInvoiceNumber = !this.invoiceNumber || invoice.invoiceNumber.toLowerCase().includes(this.invoiceNumber.toLowerCase());

      // Filtrar por estado
      const matchesStatus = this.status === 'Todos' || invoice.status === this.status;

      // Filtrar por cliente
      const matchesClient = !this.clientName || invoice.client.toLowerCase().includes(this.clientName.toLowerCase());

      // Filtrar por responsable
      const matchesResponsible = !this.responsible || invoice.responsible.toLowerCase().includes(this.responsible.toLowerCase());

      // Filtrar por tipo de documento
      const matchesDocumentType = !this.documentType || this.mapDocumentType(invoice.documentType) === this.documentType;
      
      // Filtrar por rango de fechas
      const invoiceDate = new Date(invoice.date);
      const start = this.startDate ? new Date(this.startDate + 'T00:00:00') : null;
      const end = this.endDate ? new Date(this.endDate + 'T23:59:59') : null;
      const matchesDateRange = (!start || invoiceDate >= start) && (!end || invoiceDate <= end);

      return matchesInvoiceNumber && matchesStatus && matchesClient && matchesResponsible && matchesDocumentType && matchesDateRange;
    });
  }

  downloadReport(invoice: any): void {
    alert(`Simulando la descarga del reporte para la factura: ${invoice.invoiceNumber}`);
  }

  private mapDocumentType(type: string): string {
    switch (type) {
      case 'Factura Electrónica':
        return 'factura';
      case 'Nota Crédito':
        return 'nota_credito';
      case 'Nota Débito':
        return 'nota_debito';
      case 'Factura de ajuste':
        return 'ajuste';
      default:
        return '';
    }
  }
}
