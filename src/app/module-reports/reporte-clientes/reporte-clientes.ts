import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reporte-clientes',
  imports: [ CommonModule, FormsModule],
  templateUrl: './reporte-clientes.html',
  styleUrl: './reporte-clientes.css'
})
export class ReporteClientes implements OnInit {

  customers: any[] = [];
  filteredCustomers: any[] = [];
  
  // Filter properties
  searchQuery: string = '';
  startDate: string = '';
  endDate: string = '';
  documentType: string = '';
  regimen: string = '';
  status: string = '';

  constructor() { }

  ngOnInit(): void {
    this.loadSimulatedData();
    this.applyFilters(); // Apply initial filters to show all data
  }

  loadSimulatedData(): void {
    // Simulated data, in a real app this would come from a service
    this.customers = [
      {
        name: 'Comercial XYZ S.A.S',
        docType: 'NIT',
        nit: '900123456-7',
        email: 'ventas@xyz.com',
        address: 'Calle 123 #45-67',
        regimen: 'comun',
        status: 'activo'
      },
      {
        name: 'Juan Pérez',
        docType: 'CC',
        nit: '1012345678',
        email: 'juan.perez@email.com',
        address: 'Carrera 50 #10-20',
        regimen: 'simplificado',
        status: 'activo'
      },
      {
        name: 'Distribuidora GHI Ltda.',
        docType: 'NIT',
        nit: '860987654-3',
        email: 'info@ghi.com',
        address: 'Avenida 80 #30-50',
        regimen: 'comun',
        status: 'inactivo'
      },
      {
        name: 'Ana García',
        docType: 'CE',
        nit: '900888777-1',
        email: 'ana.garcia@email.com',
        address: 'Transversal 15 #25-35',
        regimen: 'especial',
        status: 'activo'
      },
      {
        name: 'Empresa de Software ABC',
        docType: 'NIT',
        nit: '901234567-8',
        email: 'contacto@abcsoft.com',
        address: 'Calle 45 #98-76',
        regimen: 'comun',
        status: 'activo'
      },
      {
        name: 'Carlos Rodríguez',
        docType: 'CC',
        nit: '1023456789',
        email: 'carlos@email.com',
        address: 'Avenida Siempre Viva 742',
        regimen: 'simplificado',
        status: 'inactivo'
      },
    ];
  }

  applyFilters(): void {
    this.filteredCustomers = this.customers.filter(customer => {
      const matchesSearch = !this.searchQuery || 
                            customer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                            customer.nit.includes(this.searchQuery);

      const matchesDocumentType = !this.documentType || customer.docType === this.documentType;

      const matchesRegimen = !this.regimen || this.mapRegimen(customer.regimen) === this.regimen;

      const matchesStatus = !this.status || this.mapStatus(customer.status) === this.status;
      
      const matchesDateRange = true;

      return matchesSearch && matchesDocumentType && matchesRegimen && matchesStatus && matchesDateRange;
    });
  }

  downloadReport(customer: any): void {
    alert(`Descargando reporte para el cliente: ${customer.name}`);
    
  }

  private mapRegimen(regimen: string): string {
    switch (regimen) {
      case 'comun': return 'comun';
      case 'simplificado': return 'simplificado';
      case 'especial': return 'especial';
      default: return '';
    }
  }

  // Helper method to map data to display text for status
  private mapStatus(status: string): string {
    switch (status) {
      case 'activo': return 'activo';
      case 'inactivo': return 'inactivo';
      default: return '';
    }
  }

  public getDocumentTypeText(docType: string): string {
    switch (docType) {
      case 'CC': return 'Cédula de Ciudadanía';
      case 'NIT': return 'NIT';
      case 'CE': return 'Cédula de Extranjería';
      case 'TI': return 'Tarjeta de Identidad';
      default: return docType;
    }
  }
}
