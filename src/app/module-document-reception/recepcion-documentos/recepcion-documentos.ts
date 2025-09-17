import { Component } from '@angular/core';

@Component({
  selector: 'app-recepcion-documentos',
  imports: [],
  templateUrl: './recepcion-documentos.html',
  styleUrl: './recepcion-documentos.css'
})
export class RecepcionDocumentos {

  /**
   * Alterna la visibilidad del menú desplegable de acciones
   * @param button El botón que activó el menú
   */
  toggleMenu(button: EventTarget | null): void {
    if (button && button instanceof HTMLElement) {
      const dropdown = button.nextElementSibling as HTMLElement;
      if (dropdown) {
        dropdown.classList.toggle('hidden');
      }
    }
  }

}
