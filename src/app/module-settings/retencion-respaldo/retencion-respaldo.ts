import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

export interface RetencionRespaldoPolicy {
  retentionPeriod: number;
  backupFrequency: 'Diaria' | 'Semanal' | 'Mensual' | 'Trimestral';
  backupLocation: 'local' | 'google-drive' | 'dropbox';
  backupTypes: {
    xml: boolean;
    pdf: boolean;
    database: boolean;
  };
}

@Component({
  selector: 'app-retencion-respaldo',
  standalone: true,
  imports: [CommonModule, FormsModule, BrowserModule],
  templateUrl: './retencion-respaldo.html',
  styleUrls: ['./retencion-respaldo.css']
})
export class RetencionRespaldo implements OnInit {
  policy: RetencionRespaldoPolicy = {
    retentionPeriod: 5,
    backupFrequency: 'Semanal',
    backupLocation: 'local',
    backupTypes: {
      xml: true,
      pdf: true,
      database: false
    }
  };

  isLoading = true;
  isSaving = false;
  uploadMessage = '';

  constructor() {}

  ngOnInit() {
    this.loadPolicy();
  }

  loadPolicy() {
    this.isLoading = true;
    setTimeout(() => {
      const savedPolicy = localStorage.getItem('policyBackup');
      if (savedPolicy) {
        this.policy = JSON.parse(savedPolicy);
      }
      this.isLoading = false;
    }, 500);
  }

  savePolicy() {
    if (this.isSaving || this.isLoading) return;

    this.isSaving = true;
    const dataStr = JSON.stringify(this.policy, null, 2);
    localStorage.setItem('policyBackup', dataStr);

    // --- Manejo según la ubicación seleccionada ---
    if (this.policy.backupLocation === 'local') {
      this.downloadBackup(dataStr);
      this.uploadMessage = '✅ Respaldo guardado localmente.';
    } else if (this.policy.backupLocation === 'google-drive') {
      this.simulateGoogleDriveUpload();
    } else if (this.policy.backupLocation === 'dropbox') {
      this.simulateDropboxUpload();
    }

    setTimeout(() => {
      this.isSaving = false;
    }, 800);
  }

  private downloadBackup(data: string) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `politica_respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private simulateGoogleDriveUpload() {
    this.uploadMessage = '📡 Conectando con Google Drive...';
    setTimeout(() => {
      this.uploadMessage = '🔑 Autenticando usuario...';
      setTimeout(() => {
        this.uploadMessage = '☁️ Subiendo archivo a Google Drive...';
        setTimeout(() => {
          this.uploadMessage = '✅ Archivo subido exitosamente a Google Drive.';
        }, 2000);
      }, 1000);
    }, 1000);
  }

  private simulateDropboxUpload() {
    this.uploadMessage = '📡 Conectando con Dropbox...';
    setTimeout(() => {
      this.uploadMessage = '☁️ Subiendo archivo a Dropbox...';
      setTimeout(() => {
        this.uploadMessage = '✅ Archivo subido exitosamente a Dropbox.';
      }, 2000);
    }, 1000);
  }
}
