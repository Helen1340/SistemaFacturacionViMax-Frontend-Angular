import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reportes',
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

  navigateReportImpuestos() {
    this.router.navigate(['/reporte-impuestos']);
  }

  navigateReportPagos() {
    this.router.navigate(['/reporte-pagos']);
  }

  navigateReportUsers() {
    this.router.navigate(['reporte-usuarios']);
  }
}
