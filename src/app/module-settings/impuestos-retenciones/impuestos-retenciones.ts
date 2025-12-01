import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ImpuestosRetencionesService } from './services/impuestos-retenciones.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, firstValueFrom } from 'rxjs';

// Interfaz para impuestos en BD
export interface Impuesto {
  id: number;
  tax_code: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  porcentaje_base: number;
  estado: string;
}

// Interfaz para impuestos predefinidos (catálogo completo)
interface ImpuestoPredefinido {
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  porcentaje: number;
  categoria: string;
  // Propiedades calculadas
  id?: number;
  estado?: string;
  enBaseDatos?: boolean;
}

@Component({
  selector: 'app-impuestos-retenciones',
  templateUrl: './impuestos-retenciones.html',
  styleUrls: ['./impuestos-retenciones.css'],
  imports: [CommonModule, FormsModule]
})
export class ImpuestosRetencionesComponent implements OnInit, OnDestroy {
  // Catálogo completo de impuestos (predefinidos)
  impuestosPredefinidos: ImpuestoPredefinido[] = [];
  
  // Impuestos que están en la base de datos
  impuestosEnBD: Impuesto[] = [];
  
  // Lista combinada para mostrar en la tabla
  impuestosCombinados: ImpuestoPredefinido[] = [];
  impuestosFiltrados: ImpuestoPredefinido[] = [];
  paginatedImpuestos: ImpuestoPredefinido[] = [];
  
  // UI State
  openDropdownId: string | null = null;
  isLoading: boolean = false;
  
  // Filtros
  searchTerm: string = '';
  filterValue: string = '';
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  // Suscripción
  private impuestoCreadoSubscription?: Subscription;

  constructor(
    private impuestosService: ImpuestosRetencionesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarImpuestosPredefinidos();
    this.obtenerImpuestos();
    
    // Suscribirse para recargar cuando se cree/actualice un impuesto
    this.impuestoCreadoSubscription = this.impuestosService.impuestoCreado$.subscribe(() => {
      console.log('🔄 Recargando lista de impuestos...');
      this.obtenerImpuestos();
    });
  }

  ngOnDestroy(): void {
    if (this.impuestoCreadoSubscription) {
      this.impuestoCreadoSubscription.unsubscribe();
    }
  }

  // ==========================================
  // CARGAR CATÁLOGO COMPLETO DE IMPUESTOS
  // ==========================================
  cargarImpuestosPredefinidos(): void {
    this.impuestosPredefinidos = [
      // IVA
      { codigo: 'IVA-001', nombre: 'IVA General 19%', descripcion: 'Impuesto sobre las ventas a la tarifa del 19%', tipo: 'IVA', porcentaje: 19, categoria: 'Nacional' },
      { codigo: 'IVA-002', nombre: 'IVA Reducido 5%', descripcion: 'Impuesto sobre las ventas a la tarifa del 5%', tipo: 'IVA', porcentaje: 5, categoria: 'Nacional' },
      { codigo: 'IVA-003', nombre: 'IVA Exento', descripcion: 'Bienes y servicios exentos de IVA', tipo: 'IVA', porcentaje: 0, categoria: 'Nacional' },
      { codigo: 'IVA-004', nombre: 'IVA Excluido', descripcion: 'Bienes y servicios excluidos de IVA', tipo: 'IVA', porcentaje: 0, categoria: 'Nacional' },
      
      // RETENCIÓN EN LA FUENTE
      { codigo: 'RF-001', nombre: 'ReteFuente Servicios 4%', descripcion: 'Retención sobre pagos por servicios', tipo: 'ReteFuente', porcentaje: 4, categoria: 'Retenciones' },
      { codigo: 'RF-002', nombre: 'ReteFuente Honorarios 11%', descripcion: 'Retención sobre honorarios profesionales', tipo: 'ReteFuente', porcentaje: 11, categoria: 'Retenciones' },
      { codigo: 'RF-003', nombre: 'ReteFuente Arrendamientos 3.5%', descripcion: 'Retención sobre arrendamientos', tipo: 'ReteFuente', porcentaje: 3.5, categoria: 'Retenciones' },
      { codigo: 'RF-004', nombre: 'ReteFuente Compras 2.5%', descripcion: 'Retención sobre compra de bienes', tipo: 'ReteFuente', porcentaje: 2.5, categoria: 'Retenciones' },
      { codigo: 'RF-005', nombre: 'ReteFuente Dividendos 10%', descripcion: 'Retención sobre dividendos y participaciones', tipo: 'ReteFuente', porcentaje: 10, categoria: 'Retenciones' },
      { codigo: 'RF-006', nombre: 'ReteFuente Rendimientos Financieros 7%', descripcion: 'Retención sobre rendimientos financieros', tipo: 'ReteFuente', porcentaje: 7, categoria: 'Retenciones' },
      
      // RETENCIÓN DE IVA
      { codigo: 'RETEIVA-001', nombre: 'Retención IVA 15%', descripcion: 'Retención IVA régimen común', tipo: 'ReteIVA', porcentaje: 15, categoria: 'Retenciones' },
      { codigo: 'RETEIVA-002', nombre: 'Retención IVA 100%', descripcion: 'Retención IVA régimen simplificado', tipo: 'ReteIVA', porcentaje: 100, categoria: 'Retenciones' },
      
      // ICA (Impuesto de Industria y Comercio)
      { codigo: 'ICA-001', nombre: 'ICA Industrial 0.7%', descripcion: 'ICA para actividades industriales', tipo: 'ICA', porcentaje: 0.7, categoria: 'Municipal' },
      { codigo: 'ICA-002', nombre: 'ICA Comercial 0.414%', descripcion: 'ICA para actividades comerciales', tipo: 'ICA', porcentaje: 0.414, categoria: 'Municipal' },
      { codigo: 'ICA-003', nombre: 'ICA Servicios 0.966%', descripcion: 'Impuesto de Industria y Comercio - Servicios', tipo: 'ICA', porcentaje: 0.966, categoria: 'Municipal' },
      { codigo: 'ICA-004', nombre: 'ICA Financiero 0.5%', descripcion: 'ICA para actividades financieras', tipo: 'ICA', porcentaje: 0.5, categoria: 'Municipal' },
      
      // RETENCIÓN DE ICA
      { codigo: 'RETEICA-001', nombre: 'Retención ICA General 0.966%', descripcion: 'Retención ICA para Bogotá', tipo: 'ReteICA', porcentaje: 0.966, categoria: 'Retenciones' },
      { codigo: 'RETEICA-002', nombre: 'Retención ICA Industrial 0.7%', descripcion: 'Retención ICA actividades industriales', tipo: 'ReteICA', porcentaje: 0.7, categoria: 'Retenciones' },
      { codigo: 'RETEICA-003', nombre: 'Retención ICA Comercial 0.414%', descripcion: 'Retención ICA actividades comerciales', tipo: 'ReteICA', porcentaje: 0.414, categoria: 'Retenciones' },
      
      // IMPUESTO AL CONSUMO
      { codigo: 'INC-001', nombre: 'Impuesto Nacional al Consumo 8%', descripcion: 'Impuesto Nacional al Consumo aplicable a restaurantes y bares', tipo: 'INC', porcentaje: 8, categoria: 'Nacional' },
      { codigo: 'INC-002', nombre: 'Impuesto Nacional al Consumo 16%', descripcion: 'Impuesto al consumo de vehículos y telecomunicaciones', tipo: 'INC', porcentaje: 16, categoria: 'Nacional' },
      { codigo: 'INC-003', nombre: 'Impuesto Nacional al Consumo 4%', descripcion: 'Impuesto al consumo de telefonía móvil', tipo: 'INC', porcentaje: 4, categoria: 'Nacional' },
    ];
  }

  // ==========================================
  // OBTENER IMPUESTOS DE LA BASE DE DATOS
  // ==========================================
  obtenerImpuestos(): void {
    this.isLoading = true;
    this.impuestosService.getImpuestos().subscribe({
      next: (response: any) => {
        console.log('✅ Datos recibidos del backend:', response);
        
        // Si viene con paginación de Laravel
        if (response.data) {
          this.impuestosEnBD = response.data;
        } else {
          this.impuestosEnBD = response;
        }
        
        // Combinar impuestos predefinidos con los de BD
        this.combinarImpuestos();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Error obteniendo impuestos:', error);
        this.isLoading = false;
        // Aún así mostrar los predefinidos
        this.combinarImpuestos();
      }
    });
  }

  // ==========================================
  // COMBINAR IMPUESTOS PREDEFINIDOS CON BD
  // ==========================================
  combinarImpuestos(): void {
    this.impuestosCombinados = this.impuestosPredefinidos.map(predefinido => {
      // Buscar si este impuesto existe en la BD (por tax_code)
      const enBD = this.impuestosEnBD.find(
        imp => (imp as any).tax_code === predefinido.codigo
      );

      if (enBD) {
        // Si existe en BD, marcar como activo y agregar el ID
        return {
          ...predefinido,
          id: enBD.id,
          estado: 'Activo',
          enBaseDatos: true
        };
      } else {
        // No existe en BD, marcar como inactivo
        return {
          ...predefinido,
          estado: 'Inactivo',
          enBaseDatos: false
        };
      }
    });

    console.log('Impuestos combinados:', this.impuestosCombinados);
    this.applyFiltersAndPagination();
  }

  // ==========================================
  // FILTROS Y PAGINACIÓN
  // ==========================================
  applyFiltersAndPagination(): void {
    let filtrados = [...this.impuestosCombinados];

    // Filtro por búsqueda
    if (this.searchTerm.trim() !== '') {
      const search = this.searchTerm.toLowerCase();
      filtrados = filtrados.filter(i =>
        i.nombre.toLowerCase().includes(search) ||
        i.descripcion.toLowerCase().includes(search) ||
        i.tipo.toLowerCase().includes(search)
      );
    }

    // Filtro por estado
    if (this.filterValue !== '') {
      if (this.filterValue === 'activo') {
        filtrados = filtrados.filter(i => i.estado === 'Activo');
      } else if (this.filterValue === 'inactivo') {
        filtrados = filtrados.filter(i => i.estado === 'Inactivo');
      }
    }

    this.impuestosFiltrados = filtrados;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedImpuestos = this.impuestosFiltrados.slice(start, end);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  onFilter(): void {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  // Getters para paginación
  get totalImpuestos(): number {
    return this.impuestosFiltrados.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalImpuestos / this.itemsPerPage);
  }

  get startItem(): number {
    return this.totalImpuestos === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalImpuestos ? this.totalImpuestos : end;
  }

  // ==========================================
  // MÉTODOS DE UI
  // ==========================================
  toggleDropdown(event: Event, codigo: string): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === codigo ? null : codigo;
  }

  shouldShowDropdownUp(index: number): boolean {
    const totalRows = this.paginatedImpuestos.length;
    return index >= totalRows - 2;
  }

  trackByFn(index: number, item: ImpuestoPredefinido): string {
    return item.codigo;
  }

  getStatusClass(estado: string): string {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'Inactivo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getTipoClass(tipo: string): string {
    const tipoUpper = tipo.toUpperCase();
    if (tipoUpper.includes('IVA')) return 'bg-blue-100 text-blue-800';
    if (tipoUpper.includes('ICA')) return 'bg-purple-100 text-purple-800';
    if (tipoUpper.includes('RETE')) return 'bg-orange-100 text-orange-800';
    if (tipoUpper.includes('INC')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  }

  // ==========================================
  // ACTIVAR IMPUESTO (Crear en BD)
  // ==========================================
  async activarImpuesto(impuesto: ImpuestoPredefinido): Promise<void> {
    this.openDropdownId = null;

    // Siempre crear un nuevo registro en la BD
    const nuevoImpuesto = {
      tax_code: impuesto.codigo,
      name: impuesto.nombre,
      description: impuesto.descripcion,
      type: impuesto.tipo,
      percentage: impuesto.porcentaje,
      fixed_value: 0,
      application_type: 'Porcentaje',
      min_value: 0,
      max_value: 0,
      status: 'Activo'
    };

    try {
      await firstValueFrom(this.impuestosService.createImpuesto(nuevoImpuesto));
      console.log('✅ Impuesto creado y activado en la BD');
      this.impuestosService.notificarImpuestoCreado();
      this.obtenerImpuestos();
    } catch (error: any) {
      console.error('Error creando impuesto:', error);
      
      // Mensaje de error más específico
      if (error.error?.message) {
        alert(`Error: ${error.error.message}`);
      } else {
        alert('Error al crear el impuesto. Por favor intenta nuevamente.');
      }
    }
  }

  // ==========================================
  // DESACTIVAR IMPUESTO (Eliminar de BD)
  // ==========================================
  async desactivarImpuesto(impuesto: ImpuestoPredefinido): Promise<void> {
    this.openDropdownId = null;

    if (!impuesto.enBaseDatos || !impuesto.id) {
      console.warn('El impuesto no está en la base de datos');
      return;
    }

    // Confirmar antes de eliminar
    const confirmar = confirm(`¿Estás seguro de desactivar el impuesto "${impuesto.nombre}"?\n\nEsto lo eliminará de la base de datos.`);
    
    if (!confirmar) {
      return;
    }

    try {
      // Eliminar el registro de la BD usando el método DELETE
      await firstValueFrom(this.impuestosService.deleteImpuesto(impuesto.id));
      console.log('✅ Impuesto eliminado de la BD');
      this.impuestosService.notificarImpuestoCreado();
      this.obtenerImpuestos();
    } catch (error: any) {
      console.error('❌ Error eliminando impuesto:', error);
      
      // Mensaje de error más específico
      if (error.error?.message) {
        alert(`Error: ${error.error.message}`);
      } else {
        alert('Error al desactivar el impuesto. Por favor intenta nuevamente.');
      }
    }
  }

  navigateToNewImpuestos(): void {
    this.router.navigate(['/nuevo-impuesto']);
  }

  goBack(): void {
    this.router.navigate(['/configuracion']);
  }
}