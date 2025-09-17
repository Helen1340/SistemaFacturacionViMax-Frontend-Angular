import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';




interface ContingenciaData {
  id: number;
  estado: string;
  ultimoIntento: string;
  facturasContingencia: string;
  facturasReenviadas: string;
}

@Component({
  selector: 'app-contingencia',
  imports: [CommonModule],
  templateUrl: './contingencia.html',
  styleUrl: './contingencia.css'
})
export class Contingencia implements OnInit {

  contingenciaData: ContingenciaData[] = [];
  isContingenciaActiva: boolean = false;
  showNotification: boolean = false;
  notificationType: 'success' | 'error' = 'success';
  notificationMessage: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadContingenciaData();
  }

  /**
   * Carga los datos de contingencia
   */
  loadContingenciaData(): void {
    // Datos de ejemplo - en una aplicación real vendrían de un servicio
    this.contingenciaData = [
      {
        id: 1,
        estado: '',
        ultimoIntento: '',
        facturasContingencia: '',
        facturasReenviadas: ''
      }
    ];
  }

  /**
   * Activa el modo de contingencia
   */
  activarContingencia(): void {
    if (confirm('¿Está seguro de que desea activar el modo de contingencia?')) {
      this.isContingenciaActiva = true;

      // Aquí se implementaría la lógica para activar contingencia
      console.log('Contingencia activada');

      // Mostrar mensaje de confirmación
      this.showNotificationMessage('Modo de contingencia activado. Se habilitó la emisión temporal local.', 'success');

      // Actualizar los datos
      this.loadContingenciaData();
    }
  }

  /**
   * Desactiva el modo de contingencia
   */
  desactivarContingencia(): void {
    if (confirm('¿Está seguro de que desea desactivar el modo de contingencia?')) {
      this.isContingenciaActiva = false;

      // Aquí se implementaría la lógica para desactivar contingencia
      console.log('Contingencia desactivada');

      // Mostrar mensaje de confirmación
      this.showNotificationMessage('Modo de contingencia desactivado.', 'success');

      // Actualizar los datos
      this.loadContingenciaData();
    }
  }

  /**
   * Muestra las facturas en contingencia
   */
  verFacturasContingencia(): void {
    this.router.navigate(['/facturas-contingencia']);
  }

  /**
   * Muestra los detalles de una factura específica
   * @param facturaId ID de la factura
   */
  verFactura(facturaId: number): void {
    // Aquí se implementaría la navegación a los detalles de la factura
    console.log(`Viendo factura con ID: ${facturaId}`);

    // Por ahora mostramos un mensaje
    alert(`Mostrando detalles de la factura ${facturaId}...`);
  }

  /**
   * Reenvía las facturas pendientes
   */
  reenviarFacturas(): void {
    if (confirm('¿Desea reenviar todas las facturas pendientes?')) {
      // Aquí se implementaría la lógica para reenviar facturas
      console.log('Reenviando facturas pendientes...');

      // Mostrar mensaje de confirmación
      this.showNotificationMessage('Facturas reenviadas correctamente.', 'success');

      // Actualizar los datos
      this.loadContingenciaData();
    }
  }

  /**
   * Obtiene el estado de conexión actual
   */
  getEstadoConexion(): string {
    // Aquí se implementaría la lógica para verificar el estado de conexión
    return this.isContingenciaActiva ? 'Desconectado' : 'Conectado';
  }

  /**
   * Obtiene la fecha y hora del último intento fallido
   */
  getUltimoIntentoFallido(): string {
    // Aquí se implementaría la lógica para obtener el último intento fallido
    const now = new Date();
    return now.toLocaleString('es-ES');
  }

  /**
   * Prueba la conexión con la DIAN
   */
  testConnection(): void {
    // Simular prueba de conexión
    console.log('Probando conexión con DIAN...');

    // Simular resultado aleatorio
    const isConnected = Math.random() > 0.5;

    if (isConnected) {
      this.showNotificationMessage('Conexión exitosa con DIAN', 'success');
    } else {
      this.showNotificationMessage('Error de conexión con DIAN', 'error');
    }
  }

  /**
   * Cancela la operación actual
   */
  cancelar(): void {
    // Aquí se implementaría la lógica para cancelar
    console.log('Operación cancelada');
    this.showNotificationMessage('Operación cancelada', 'success');
  }

  /**
   * Muestra una notificación
   * @param message Mensaje a mostrar
   * @param type Tipo de notificación
   */
  showNotificationMessage(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }




  /**
   * TrackBy function para optimizar el rendimiento de *ngFor
   * @param index Índice del elemento
   * @param item Elemento de la lista
   * @returns Identificador único del elemento
   */
  trackByFn(index: number, item: ContingenciaData): number {
    return item.id;
  }

}
