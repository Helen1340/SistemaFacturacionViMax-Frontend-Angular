import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes {
constructor(
    private router: Router
  ) {}

  // Navegación y utilidades
  navigateReportClientes() {
    this.router.navigate(['/reporte-clientes']);
  }

  navigateReportFacturas() {
    this.router.navigate(['/reportes-facturas']);
  }

  navigateReportUsers() {
    this.router.navigate(['reporte-usuarios']);
  }

  navigateReportProductos() {
    this.router.navigate(['reporte-productos']);
  }

  navigateReportServicios() {
    this.router.navigate(['reporte-servicios']);
  }
}
