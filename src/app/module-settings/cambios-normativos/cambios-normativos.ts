import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para definir la estructura de un cambio normativo.
interface NormativeChange {
  id: number;
  fecha: Date;
  cambio: string;
  fuente: string;
  estado: 'Aplicado' | 'En progreso';
  responsable: string;
}

@Component({
  selector: 'app-cambios-normativos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cambios-normativos.html',
  styleUrls: ['./cambios-normativos.css'] 
})
export class CambiosNormativos implements OnInit {

  // Variables para la lógica de la pantalla
  searchTerm: string = '';
  filterValue: string = ''; // Nueva variable para el filtro por estado
  isLoading: boolean = false;
  
  private allChanges: NormativeChange[] = []; // Almacena todos los cambios.
  filteredChanges: NormativeChange[] = [];   // Almacena los cambios después de aplicar filtros.

  // Variables de paginación
  paginatedNormativeChanges: NormativeChange[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalChanges: number = 0;
  totalPages: number = 0;
  startItem: number = 0;
  endItem: number = 0;

  constructor() { }

  ngOnInit(): void {
    this.loadNormativeChanges();
  }

  /**
   * Carga los cambios normativos, simulando una llamada a una API.
   */
  loadNormativeChanges(): void {
    this.isLoading = true;
    const mockData: NormativeChange[] = [
      { id: 1, fecha: new Date('2025-01-15'), cambio: 'Implementación del Anexo Técnico de Factura Electrónica 2.1.', fuente: 'Resolución DIAN 000042', estado: 'Aplicado', responsable: 'Área de Desarrollo' },
      { id: 2, fecha: new Date('2025-03-20'), cambio: 'Actualización en el manejo de retenciones de IVA y ICA.', fuente: 'Circular 005 del Ministerio de Hacienda', estado: 'Aplicado', responsable: 'Equipo Contable' },
      { id: 3, fecha: new Date('2025-05-10'), cambio: 'Nuevo formato para Notas Crédito que anulan facturas de exportación.', fuente: 'Decreto 1234 de la DIAN', estado: 'En progreso', responsable: 'Área de Desarrollo' },
      { id: 4, fecha: new Date('2025-07-01'), cambio: 'Revisión del código de impuestos para servicios de tecnología.', fuente: 'Resolución 000088 de la DIAN', estado: 'Aplicado', responsable: 'Área de Desarrollo' },
      { id: 5, fecha: new Date('2025-08-05'), cambio: 'Modificación en los tiempos de respuesta para validación de facturas.', fuente: 'Comunicado oficial DIAN', estado: 'Aplicado', responsable: 'Equipo de Soporte' },
      { id: 6, fecha: new Date('2025-09-01'), cambio: 'Cambio en el esquema de numeración de documentos.', fuente: 'Resolución 000095 de la DIAN', estado: 'Aplicado', responsable: 'Área de Desarrollo' },
      { id: 7, fecha: new Date('2025-09-15'), cambio: 'Actualización de la tabla de tarifas de retención en la fuente.', fuente: 'Decreto 2025 del Gobierno Nacional', estado: 'Aplicado', responsable: 'Equipo Contable' },
      { id: 8, fecha: new Date('2025-10-01'), cambio: 'Nuevo requisito para la inclusión de QR en facturas de contingencia.', fuente: 'Resolución 000101 de la DIAN', estado: 'En progreso', responsable: 'Área de Desarrollo' },
      { id: 9, fecha: new Date('2025-10-10'), cambio: 'Ajuste en la validación de clientes con NIT no registrado.', fuente: 'Comunicado oficial DIAN', estado: 'Aplicado', responsable: 'Equipo de Soporte' },
      { id: 10, fecha: new Date('2025-11-05'), cambio: 'Nuevo tipo de documento para operaciones con zonas francas.', fuente: 'Decreto 3456 del Ministerio de Comercio', estado: 'En progreso', responsable: 'Área de Desarrollo' },
      { id: 11, fecha: new Date('2025-12-01'), cambio: 'Actualización en el formato del XML para la factura de exportación.', fuente: 'Resolución 000110 de la DIAN', estado: 'Aplicado', responsable: 'Área de Desarrollo' },
      { id: 12, fecha: new Date('2026-01-01'), cambio: 'Nuevo modelo de liquidación para impuestos indirectos.', fuente: 'Ley 987 de 2025', estado: 'En progreso', responsable: 'Equipo Contable' },
    ];
    
    this.allChanges = mockData;
    this.applySearchAndPagination();
    this.isLoading = false;
  }

  /**
   * Método que se ejecuta al buscar. Resetea la página y aplica el filtro.
   */
  onSearch(): void {
    this.currentPage = 1;
    this.applySearchAndPagination();
  }

  /**
   * Método que se ejecuta al cambiar el filtro de estado. Resetea la página y aplica el filtro.
   */
  onFilter(): void {
    this.currentPage = 1;
    this.applySearchAndPagination();
  }
  
  /**
   * Aplica tanto el filtro de búsqueda como el de estado y actualiza la paginación.
   */
  applySearchAndPagination(): void {
    let tempChanges = [...this.allChanges];

    // 1. Filtrar por término de búsqueda (si existe)
    if (this.searchTerm) {
      const lowerCaseSearch = this.searchTerm.toLowerCase();
      tempChanges = tempChanges.filter(change => 
        change.cambio.toLowerCase().includes(lowerCaseSearch) ||
        change.fuente.toLowerCase().includes(lowerCaseSearch) ||
        change.responsable.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // 2. Filtrar por estado (si se ha seleccionado un valor)
    if (this.filterValue) {
      tempChanges = tempChanges.filter(change => change.estado === this.filterValue);
    }

    this.filteredChanges = tempChanges;

    // 3. Aplicar paginación a los resultados finales
    this.totalChanges = this.filteredChanges.length;
    this.totalPages = Math.ceil(this.totalChanges / this.itemsPerPage);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.totalChanges);
    
    this.paginatedNormativeChanges = this.filteredChanges.slice(startIndex, endIndex);
    
    // 4. Actualizar valores de visualización de ítems
    this.startItem = startIndex + 1;
    this.endItem = endIndex;
  }

  /**
   * Avanza a la siguiente página.
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applySearchAndPagination();
    }
  }

  /**
   * Regresa a la página anterior.
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applySearchAndPagination();
    }
  }
}