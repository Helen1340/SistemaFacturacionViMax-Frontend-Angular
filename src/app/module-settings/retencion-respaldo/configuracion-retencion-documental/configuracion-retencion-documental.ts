import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Interfaz para las configuraciones de retención
export interface RetencionConfig {
  id?: number;
  tiempoMinimo: string;
  fechaAplicacion: string;
  tiposDocumentos: {
    XML: boolean;
    PDF: boolean;
    CDR: boolean;
    notas: boolean;
    eventos: boolean;
    respuesta: boolean;
  };
  eliminacionAnticipada: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

@Component({
  selector: 'app-configuracion-retencion-documental',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-retencion-documental.html',
  styleUrl: './configuracion-retencion-documental.css'
})
export class ConfiguracionRetencionDocumental implements OnInit {

  configuraciones: RetencionConfig[] = [];
  isLoading: boolean = false;

  // Formulario
  formData: RetencionConfig = {
    tiempoMinimo: '',
    fechaAplicacion: '',
    tiposDocumentos: {
      XML: false,
      PDF: false,
      CDR: false,
      notas: false,
      eventos: false,
      respuesta: false
    },
    eliminacionAnticipada: false
  };

  constructor(private router: Router) {}

  ngOnInit() {
    // Aquí se cargarán las configuraciones desde la base de datos
    // this.loadConfiguraciones();
  }

  // Método para cargar configuraciones desde la base de datos
  loadConfiguraciones() {
    this.isLoading = true;

    // TODO: Implementar llamada al servicio para obtener configuraciones
    // Ejemplo:
    // this.retencionService.getConfiguraciones().subscribe({
    //   next: (data) => {
    //     this.configuraciones = data;
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando configuraciones:', error);
    //     this.isLoading = false;
    //   }
    // });

    this.isLoading = false;
  }

  // Guardar configuración
  guardarConfiguracion() {
    if (!this.validarFormulario()) {
      return;
    }

    this.isLoading = true;

    // TODO: Implementar llamada al servicio para guardar configuración
    // Ejemplo:
    // this.retencionService.saveConfiguracion(this.formData).subscribe({
    //   next: (response) => {
    //     alert('Configuración guardada correctamente');
    //     this.loadConfiguraciones();
    //     this.limpiarFormulario();
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error guardando configuración:', error);
    //     alert('Error al guardar la configuración');
    //     this.isLoading = false;
    //   }
    // });

    // Simulación temporal
    setTimeout(() => {
      alert('Configuración guardada correctamente');
      this.limpiarFormulario();
      this.isLoading = false;
    }, 1000);
  }

  // Validar formulario
  validarFormulario(): boolean {
    if (!this.formData.tiempoMinimo) {
      alert('Por favor seleccione el tiempo mínimo de retención');
      return false;
    }

    if (!this.formData.fechaAplicacion) {
      alert('Por favor seleccione la fecha de aplicación');
      return false;
    }

    // Verificar que al menos un tipo de documento esté seleccionado
    const tiposSeleccionados = Object.values(this.formData.tiposDocumentos).some(tipo => tipo);
    if (!tiposSeleccionados) {
      alert('Por favor seleccione al menos un tipo de documento');
      return false;
    }

    return true;
  }

  // Limpiar formulario
  limpiarFormulario() {
    this.formData = {
      tiempoMinimo: '',
      fechaAplicacion: '',
      tiposDocumentos: {
        XML: false,
        PDF: false,
        CDR: false,
        notas: false,
        eventos: false,
        respuesta: false
      },
      eliminacionAnticipada: false
    };
  }

  // Navegación
  volverAtras() {
    this.router.navigate(['/retencion-respaldo']);
  }

  // Utilidades
  trackByFn(index: number, item: RetencionConfig): number | undefined {
    return item.id;
  }
}
