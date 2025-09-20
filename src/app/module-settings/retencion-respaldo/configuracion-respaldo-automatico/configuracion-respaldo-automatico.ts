import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Interfaz para las configuraciones de respaldo automático
export interface RespaldoAutomaticoConfig {
  id?: number;
  activarRespaldo: boolean;
  frecuencia: string;
  destino: string;
  rutaUrl: string;
  formatos: {
    zip: boolean;
    json: boolean;
    csv: boolean;
  };
  notificarCorreo: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

@Component({
  selector: 'app-configuracion-respaldo-automatico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-respaldo-automatico.html',
  styleUrl: './configuracion-respaldo-automatico.css'
})
export class ConfiguracionRespaldoAutomatico implements OnInit {

  isLoading: boolean = false;

  // Formulario
  formData: RespaldoAutomaticoConfig = {
    activarRespaldo: false,
    frecuencia: '',
    destino: '',
    rutaUrl: '',
    formatos: {
      zip: false,
      json: false,
      csv: false
    },
    notificarCorreo: false
  };

  constructor(private router: Router) {}

  ngOnInit() {
    // Aquí se cargarán las configuraciones desde la base de datos
    // this.loadConfiguracion();
  }

  // Método para cargar configuración desde la base de datos
  loadConfiguracion() {
    this.isLoading = true;

    // TODO: Implementar llamada al servicio para obtener configuración
    // Ejemplo:
    // this.respaldoService.getConfiguracion().subscribe({
    //   next: (data) => {
    //     this.formData = data;
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando configuración:', error);
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
    // this.respaldoService.saveConfiguracion(this.formData).subscribe({
    //   next: (response) => {
    //     alert('Configuración guardada correctamente');
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
      this.isLoading = false;
    }, 1000);
  }

  // Validar formulario
  validarFormulario(): boolean {
    if (this.formData.activarRespaldo) {
      if (!this.formData.frecuencia) {
        alert('Por favor seleccione la frecuencia de respaldo');
        return false;
      }

      if (!this.formData.destino) {
        alert('Por favor ingrese el destino del respaldo');
        return false;
      }
    }

    return true;
  }

  // Navegación
  volverAtras() {
    this.router.navigate(['/retencion-respaldo']);
  }
}
