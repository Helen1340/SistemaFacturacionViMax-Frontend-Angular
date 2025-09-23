import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-configuracion',
  imports: [],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class Configuracion {

  constructor( private router: Router ) {}

  // Navegación y utilidades
  navigateParametrosGenerales() {
    this.router.navigate(['/parametros-generales']);
  }

  navigateResolucionFact() {
    this.router.navigate(['/resolucion-facturas']);
  }

  navigateRetencionRespaldo() {
    this.router.navigate(['/retencion-respaldo']);
  }

  navigateNotificaciones() {
    this.router.navigate(['/config-correo']);
  }

  navigateCambios(){
    this.router.navigate(['/cambios-normativos']);
  }

  navigateCertificados() {
    this.router.navigate(['/certificado-digital']);
  }

  navigateImpuestos() {
    this.router.navigate(['/impuestos-retenciones']);
  }

  navigateVideos() {
    this.router.navigate(['/videos']);
  }
}
