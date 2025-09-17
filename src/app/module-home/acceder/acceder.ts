import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acceder',
  imports: [],
  templateUrl: './acceder.html',
  styleUrl: './acceder.css'
})
export class Acceder {

  constructor( private router: Router ) {}

  navigateFacturasinicio() {
    this.router.navigate(['/facturas-notas']);
  }

}
