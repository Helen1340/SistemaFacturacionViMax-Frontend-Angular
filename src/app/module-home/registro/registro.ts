import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {

  constructor( private router: Router ) {}

  navigateInicioSecion() {
    this.router.navigate(['/acceso']);
  }

  navigateIngresar() {
    this.router.navigate(['/facturas-notas']);
  }

}
