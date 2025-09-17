import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nueva-nota',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nueva-nota.html',
  styleUrl: './nueva-nota.css'
})
export class NuevaNotaComponent {
  isSidebarOpen: boolean = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  visualizarNota(): void {
    this.showNotification('Vista previa generada');
  }

  firmarYEnviar(): void {
    this.showNotification('Nota firmada y enviada a la DIAN');
  }

  descargarDocumentos(): void {
    this.showNotification('Descarga iniciada');
  }

  cancelar(): void {
    history.back();
  }

  private showNotification(message: string): void {
    const notif = document.getElementById('notificacion');
    const msg = document.getElementById('mensaje');
    if (!notif || !msg) return;
    msg.textContent = message;
    notif.classList.remove('hidden');
    setTimeout(() => notif.classList.add('hidden'), 3000);
  }
}

// Nota: eliminada clase duplicada incompatible que causaba el error de plantilla
