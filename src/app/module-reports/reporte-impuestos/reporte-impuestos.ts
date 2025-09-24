import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reporte-impuestos',
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-impuestos.html',
  styleUrl: './reporte-impuestos.css'
})
export class ReporteImpuestos implements OnInit {

  taxes: any[] = [];
  filteredTaxes: any[] = [];
  
  // Propiedades para los filtros
  clientSearch: string = '';
  startDate: string = '';
  endDate: string = '';
  taxType: string = '';
  documentType: string = '';
  responsible: string = '';

  constructor() { }

  ngOnInit(): void {
    this.loadSimulatedData();
    this.applyFilters(); // Muestra todos los datos al cargar la página
  }

  loadSimulatedData(): void {
    // Datos simulados, en una aplicación real se obtendrían de un servicio
    this.taxes = [
      {
        date: '2025-07-05',
        documentType: 'Factura electrónica',
        documentNumber: 'FV-00123',
        client: 'Comercial XYZ S.A.S',
        nit: '900123456-7',
        tax: 'IVA',
        value: '$85.000',
        responsible: 'admin_vimax'
      },
      {
        date: '2025-07-06',
        documentType: 'Nota Crédito',
        documentNumber: 'NC-00456',
        client: 'Servicios ABC Ltda',
        nit: '800555333-2',
        tax: 'IVA',
        value: '$-15.000',
        responsible: 'user_juan'
      },
      {
        date: '2025-07-07',
        documentType: 'Factura electrónica',
        documentNumber: 'FV-00124',
        client: 'Manufacturas PQR S.A.',
        nit: '900987654-1',
        tax: 'Retefuente',
        value: '$120.000',
        responsible: 'admin_vimax'
      },
      {
        date: '2025-07-08',
        documentType: 'Factura electrónica',
        documentNumber: 'FV-00125',
        client: 'Distribuidora LMN',
        nit: '860444777-0',
        tax: 'ICA',
        value: '$5.000',
        responsible: 'user_ana'
      },
      {
        date: '2025-07-09',
        documentType: 'Factura electrónica',
        documentNumber: 'FV-00126',
        client: 'Comercial XYZ S.A.S',
        nit: '900123456-7',
        tax: 'Exento',
        value: '$0',
        responsible: 'admin_vimax'
      },
      {
        date: '2025-07-10',
        documentType: 'Nota Débito',
        documentNumber: 'ND-00789',
        client: 'Servicios ABC Ltda',
        nit: '800555333-2',
        tax: 'IVA',
        value: '$20.000',
        responsible: 'user_juan'
      }
    ];
  }

  applyFilters(): void {
    this.filteredTaxes = this.taxes.filter(tax => {
      // Filtrar por nombre de cliente o NIT
      const matchesClient = !this.clientSearch || 
                           tax.client.toLowerCase().includes(this.clientSearch.toLowerCase()) || 
                           tax.nit.includes(this.clientSearch);

      // Filtrar por rango de fechas
      const taxDate = new Date(tax.date);
      const start = this.startDate ? new Date(this.startDate + 'T00:00:00') : null;
      const end = this.endDate ? new Date(this.endDate + 'T23:59:59') : null;
      const matchesDateRange = (!start || taxDate >= start) && (!end || taxDate <= end);

      // Filtrar por tipo de impuesto
      const matchesTaxType = !this.taxType || tax.tax === this.taxType;

      // Filtrar por tipo de documento
      const matchesDocumentType = !this.documentType || this.mapDocumentType(tax.documentType) === this.documentType;

      // Filtrar por responsable
      const matchesResponsible = !this.responsible || tax.responsible.toLowerCase().includes(this.responsible.toLowerCase());

      return matchesClient && matchesDateRange && matchesTaxType && matchesDocumentType && matchesResponsible;
    });
  }

  // Métodos auxiliares
  public mapDocumentType(type: string): string {
    switch (type) {
      case 'Factura electrónica':
        return 'factura';
      case 'Nota Crédito':
        return 'nota_credito';
      case 'Nota Débito':
        return 'nota_debito';
      default:
        return '';
    }
  }

  downloadReport(tax: any): void {
    alert(`Simulando la descarga del reporte para el documento: ${tax.documentNumber}`);
    // Lógica para descargar PDF/Excel
  }

  // Se añade un método para simular el menú desplegable
  toggleMenu(event: Event): void {
    const button = event.currentTarget as HTMLElement;
    const dropdown = button.nextElementSibling as HTMLElement;
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  }
}
