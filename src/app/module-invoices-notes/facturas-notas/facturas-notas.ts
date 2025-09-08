import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-facturas-notas',
  imports: [CommonModule],
  templateUrl: './facturas-notas.html',
  styleUrl: './facturas-notas.css'
})
export class FacturasNotas {
  isDropdownOpen = false; // Variable para controlar el estado del dropdown

  constructor() { }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen; // Cambia el valor de la variable a true o false
  }



}
