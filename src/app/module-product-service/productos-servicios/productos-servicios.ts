import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-productos-servicios',
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './productos-servicios.html',
  styleUrl: './productos-servicios.css'
})
export class ProductosServicios {
  isDropdownOpen = false; // Variable para controlar el estado del dropdown

  constructor() { }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen; // Cambia el valor de la variable a true o false
  }
}
