import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ImpuestosRetencionesService } from '../services/impuestos-retenciones.service';

// Interface para impuestos de la DIAN
interface ImpuestoDIAN {
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  porcentaje: number;
  categoria: string;
}

@Component({
  selector: 'app-nuevo-impuesto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nuevo-impuesto.html',
  styleUrl: './nuevo-impuesto.css'
})
export class NuevoImpuesto implements OnInit {
  
  // Lista de impuestos de la DIAN
  impuestosDIAN: ImpuestoDIAN[] = [];
  selectedImpuestos: ImpuestoDIAN[] = [];
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private impuestosService: ImpuestosRetencionesService
  ) {}

  ngOnInit() {
    this.loadImpuestosDIAN();
  }

  // Cargar lista de impuestos de la DIAN
  loadImpuestosDIAN() {
    this.impuestosDIAN = [
      // IMPUESTOS NACIONALES
      {
        codigo: 'IVA-001',
        nombre: 'IVA General',
        descripcion: 'Impuesto al Valor Agregado - Tarifa General',
        tipo: 'IVA',
        porcentaje: 19,
        categoria: 'Nacional'
      },
      {
        codigo: 'IVA-002',
        nombre: 'IVA Reducido',
        descripcion: 'Impuesto al Valor Agregado - Tarifa Reducida',
        tipo: 'IVA',
        porcentaje: 5,
        categoria: 'Nacional'
      },
      {
        codigo: 'IVA-003',
        nombre: 'IVA Exento',
        descripcion: 'Impuesto al Valor Agregado - Exento',
        tipo: 'IVA',
        porcentaje: 0,
        categoria: 'Nacional'
      },
      {
        codigo: 'ICA-001',
        nombre: 'ICA General',
        descripcion: 'Impuesto de Industria y Comercio - Tarifa General',
        tipo: 'ICA',
        porcentaje: 1.2,
        categoria: 'Municipal'
      },
      {
        codigo: 'ICA-002',
        nombre: 'ICA Servicios',
        descripcion: 'Impuesto de Industria y Comercio - Servicios',
        tipo: 'ICA',
        porcentaje: 0.96,
        categoria: 'Municipal'
      },
      {
        codigo: 'ICA-003',
        nombre: 'ICA Comercial',
        descripcion: 'Impuesto de Industria y Comercio - Comercial',
        tipo: 'ICA',
        porcentaje: 0.96,
        categoria: 'Municipal'
      },
      {
        codigo: 'ICA-004',
        nombre: 'ICA Industrial',
        descripcion: 'Impuesto de Industria y Comercio - Industrial',
        tipo: 'ICA',
        porcentaje: 0.96,
        categoria: 'Municipal'
      },
      
      // RETENCIONES EN LA FUENTE
      {
        codigo: 'RF-001',
        nombre: 'Retención en la Fuente - Servicios',
        descripcion: 'Retención en la Fuente sobre Pagos por Servicios',
        tipo: 'ReteFuente',
        porcentaje: 3.5,
        categoria: 'Nacional'
      },
      {
        codigo: 'RF-002',
        nombre: 'Retención en la Fuente - Honorarios',
        descripcion: 'Retención en la Fuente sobre Honorarios',
        tipo: 'ReteFuente',
        porcentaje: 11,
        categoria: 'Nacional'
      },
      {
        codigo: 'RF-003',
        nombre: 'Retención en la Fuente - Arrendamientos',
        descripcion: 'Retención en la Fuente sobre Arrendamientos',
        tipo: 'ReteFuente',
        porcentaje: 3.5,
        categoria: 'Nacional'
      },
      {
        codigo: 'RF-004',
        nombre: 'Retención en la Fuente - Dividendos',
        descripcion: 'Retención en la Fuente sobre Dividendos',
        tipo: 'ReteFuente',
        porcentaje: 7.5,
        categoria: 'Nacional'
      },
      {
        codigo: 'RF-005',
        nombre: 'Retención en la Fuente - Intereses',
        descripcion: 'Retención en la Fuente sobre Intereses',
        tipo: 'ReteFuente',
        porcentaje: 4,
        categoria: 'Nacional'
      },
      {
        codigo: 'RF-006',
        nombre: 'Retención en la Fuente - Comisiones',
        descripcion: 'Retención en la Fuente sobre Comisiones',
        tipo: 'ReteFuente',
        porcentaje: 3.5,
        categoria: 'Nacional'
      },
      {
        codigo: 'RF-007',
        nombre: 'Retención en la Fuente - Compra de Bienes',
        descripcion: 'Retención en la Fuente sobre Compra de Bienes',
        tipo: 'ReteFuente',
        porcentaje: 2.5,
        categoria: 'Nacional'
      },
      
      // IMPUESTOS ESPECIALES
      {
        codigo: 'IE-001',
        nombre: 'Impuesto al Consumo - Bebidas Alcohólicas',
        descripcion: 'Impuesto al Consumo sobre Bebidas Alcohólicas',
        tipo: 'ImpuestoEspecial',
        porcentaje: 20,
        categoria: 'Nacional'
      },
      {
        codigo: 'IE-002',
        nombre: 'Impuesto al Consumo - Cigarrillos',
        descripcion: 'Impuesto al Consumo sobre Cigarrillos',
        tipo: 'ImpuestoEspecial',
        porcentaje: 15,
        categoria: 'Nacional'
      },
      {
        codigo: 'IE-003',
        nombre: 'Impuesto al Consumo - Gasolina',
        descripcion: 'Impuesto al Consumo sobre Gasolina',
        tipo: 'ImpuestoEspecial',
        porcentaje: 8,
        categoria: 'Nacional'
      },
      
      // IMPUESTOS MUNICIPALES
      {
        codigo: 'IM-001',
        nombre: 'Impuesto Predial',
        descripcion: 'Impuesto Predial Unificado',
        tipo: 'ImpuestoMunicipal',
        porcentaje: 1.2,
        categoria: 'Municipal'
      },
      {
        codigo: 'IM-002',
        nombre: 'Impuesto de Vehículos',
        descripcion: 'Impuesto de Vehículos Automotores',
        tipo: 'ImpuestoMunicipal',
        porcentaje: 1.5,
        categoria: 'Municipal'
      },
      {
        codigo: 'IM-003',
        nombre: 'Impuesto de Espectáculos Públicos',
        descripcion: 'Impuesto de Espectáculos Públicos',
        tipo: 'ImpuestoMunicipal',
        porcentaje: 10,
        categoria: 'Municipal'
      },
      
      // GRAVÁMENES ADUANEROS
      {
        codigo: 'GA-001',
        nombre: 'Arancel de Importación',
        descripcion: 'Arancel de Importación General',
        tipo: 'GravamenAduanero',
        porcentaje: 15,
        categoria: 'Aduanero'
      },
      {
        codigo: 'GA-002',
        nombre: 'IVA Importación',
        descripcion: 'IVA sobre Importaciones',
        tipo: 'GravamenAduanero',
        porcentaje: 19,
        categoria: 'Aduanero'
      },
      {
        codigo: 'GA-003',
        nombre: 'Impuesto al Consumo - Importaciones',
        descripcion: 'Impuesto al Consumo sobre Importaciones',
        tipo: 'GravamenAduanero',
        porcentaje: 8,
        categoria: 'Aduanero'
      }
    ];
  }

  // Verificar si un impuesto está seleccionado
  isSelected(codigo: string): boolean {
    return this.selectedImpuestos.some(imp => imp.codigo === codigo);
  }

  // Alternar selección de un impuesto
  toggleImpuesto(impuesto: ImpuestoDIAN) {
    const index = this.selectedImpuestos.findIndex(imp => imp.codigo === impuesto.codigo);
    if (index > -1) {
      this.selectedImpuestos.splice(index, 1);
    } else {
      this.selectedImpuestos.push(impuesto);
    }
  }

  // Verificar si todos están seleccionados
  isAllSelected(): boolean {
    return this.selectedImpuestos.length === this.impuestosDIAN.length;
  }

  // Verificar si está en estado indeterminado
  isIndeterminate(): boolean {
    return this.selectedImpuestos.length > 0 && this.selectedImpuestos.length < this.impuestosDIAN.length;
  }

  // Alternar selección de todos
  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedImpuestos = [];
    } else {
      this.selectedImpuestos = [...this.impuestosDIAN];
    }
  }

  // Limpiar selección
  clearSelection() {
    this.selectedImpuestos = [];
  }

  // Agregar impuestos seleccionados
  agregarImpuestos() {
    if (this.selectedImpuestos.length === 0) {
      return;
    }

    this.isLoading = true;
    console.log('Agregando impuestos:', this.selectedImpuestos);

    // Crear cada impuesto en la API
    const promises = this.selectedImpuestos.map(impuesto => {
      const impuestoData = {
        nombre: impuesto.nombre,
        descripcion: impuesto.descripcion,
        tipo: impuesto.tipo,
        porcentaje_base: impuesto.porcentaje,
        estado: 'Activo'
      };

      return this.impuestosService.createImpuesto(impuestoData).toPromise();
    });

    // Ejecutar todas las creaciones
    Promise.all(promises).then(results => {
      console.log('Impuestos creados exitosamente:', results);
      this.isLoading = false;
      
      // Mostrar mensaje de éxito y redirigir
      alert(`Se agregaron ${this.selectedImpuestos.length} impuestos exitosamente`);
      this.router.navigate(['/impuestos-retenciones']);
    }).catch(error => {
      console.error('Error creando impuestos:', error);
      this.isLoading = false;
      alert('Error al crear algunos impuestos. Verifica la conexión.');
    });
  }

  // Volver a la lista
  goBack() {
    this.router.navigate(['/impuestos-retenciones']);
  }

  // TrackBy para optimizar rendimiento
  trackByImpuesto(index: number, impuesto: ImpuestoDIAN): string {
    return impuesto.codigo;
  }
}