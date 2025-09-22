import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-config-correo',
  imports: [],
  templateUrl: './config-correo.html',
  styleUrl: './config-correo.css'
})
export class ConfigCorreo {
  constructor( private router: Router ) {}

  // Navegación y utilidades
  navigateconfigCorreo() {
    this.router.navigate(['/config-correo']);
  }

  navigateEventos() {
    this.router.navigate(['/eventos']);
  }

  navigateHistorialNotificaciones() {
    this.router.navigate(['/historial-notificaciones']);
  }

  navigatePreferencias() {
    this.router.navigate(['/notificaciones-email']);
  }
}
