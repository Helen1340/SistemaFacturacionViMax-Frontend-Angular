import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Interfaz para el historial de respaldos
export interface BackupHistory {
  id?: number;
  fecha: Date;
  tipoRespaldo: string;
  frecuencia: string;
  destino: string;
  estado: 'Completado' | 'En Proceso' | 'Error' | 'Pendiente';
  generadoPor: string;
}

@Component({
  selector: 'app-retencion-respaldo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './retencion-respaldo.html',
  styleUrl: './retencion-respaldo.css'
})
export class RetencionRespaldo implements OnInit {

  backupHistory: BackupHistory[] = [];
  isLoading: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Aquí se cargarán los datos desde la base de datos
    // this.loadBackupHistory();
  }

  // Método para cargar historial de respaldos desde la base de datos
  loadBackupHistory() {
    this.isLoading = true;

    // TODO: Implementar llamada al servicio para obtener datos de la base de datos
    // Ejemplo:
    // this.backupService.getBackupHistory().subscribe({
    //   next: (data) => {
    //     this.backupHistory = data;
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando historial:', error);
    //     this.isLoading = false;
    //   }
    // });

    this.isLoading = false;
  }

  // Navegación
  navigateRetencionDocumental() {
    this.router.navigate(['/configuracion-retencion-documental']);
  }

  navigateRespaldoAutomatico() {
    this.router.navigate(['/configuracion-respaldo-automatico']);
  }

  // Utilidades
  getStatusClass(estado: string): string {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'En Proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'Error':
        return 'bg-red-100 text-red-800';
      case 'Pendiente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  trackByFn(index: number, item: BackupHistory): number | undefined {
    return item.id;
  }
}
