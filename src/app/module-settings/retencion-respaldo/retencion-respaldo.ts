import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Policy {
  retentionPeriod: number;
  backupFrequency: string;
  backupLocation: string;
}

@Component({
  selector: 'app-politica-retencion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './retencion-respaldo.html',
  styleUrls: ['./retencion-respaldo.css']  
}) 
export class PoliticaRetencion implements OnInit {

  // Objeto para almacenar la configuración de la política
  policy: Policy = {
    retentionPeriod: 5,
    backupFrequency: 'Semanal',
    backupLocation: ''
  };

  // Variables para el estado del respaldo
  lastBackupDate: Date | null = null;
  nextBackupDate: Date | null = null;
  backupStatus: string = 'Exitoso'; // 'Exitoso' o 'Error'

  constructor() { }

  ngOnInit(): void {
    // Aquí puedes cargar la configuración actual desde una API
    // this.loadPolicy();
    this.updateBackupStatus();
  }

  /**
   * Simula la carga de la política actual desde una API.
   */
  loadPolicy(): void {
    // Simular una llamada a la API y actualizar `this.policy`
    // this.policy = { ...respuestaDesdeAPI };
  }

  /**
   * Simula el guardado de la política en una API.
   */
  savePolicy(): void {
    console.log('Guardando política:', this.policy);
    // Aquí se haría la llamada HTTP para guardar los datos.
    // Ej: this.http.post('api/politica', this.policy).subscribe(...)
    alert('Política guardada con éxito.');
  }

  /**
   * Simula la actualización del estado del último y próximo respaldo.
   */
  updateBackupStatus(): void {
    // En un entorno real, estos datos se obtendrían de una API de logs
    // de respaldo.
    this.lastBackupDate = new Date();
    this.nextBackupDate = new Date();
    this.nextBackupDate.setDate(this.nextBackupDate.getDate() + 7); // Simular el próximo respaldo en 7 días
  }

}