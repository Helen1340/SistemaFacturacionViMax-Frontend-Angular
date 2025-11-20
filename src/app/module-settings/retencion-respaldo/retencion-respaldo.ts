import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';
import { BackupService, BackupItem, BackupPayload } from './services/backup.service';

export interface RetencionRespaldoPolicy {
  retentionPeriod: number;
  backupFrequency: 'Diaria' | 'Semanal' | 'Mensual' | 'Trimestral';
  backupLocation: 'local' | 'google-drive';
  backupTypes: {
    xml: boolean;
    pdf: boolean;
    database: boolean;
  };
}

@Component({
  selector: 'app-retencion-respaldo',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  errorMessage = '';
  items: BackupItem[] = [];
  zipPath: string | null = null;
  lastDbIncluded: boolean | null = null;

  private normalizePath(p: string): string {
    const s = (p || '').replace(/\\/g, '/');
    const withLead = s.startsWith('/') ? s : `/${s}`;
    return withLead.replace(/\/\.\//g, '/').replace(/\/\.\.\//g, '/').replace(/\/+/g, '/');
  }

  constructor(private backupService: BackupService) {}

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
      this.listBackups();
    }, 500);
  }

  savePolicy() {
    if (this.isSaving || this.isLoading) return;

    this.isSaving = true;
    const dataStr = JSON.stringify(this.policy, null, 2);
    localStorage.setItem('policyBackup', dataStr);

    // --- Manejo según la ubicación seleccionada ---
    if (this.policy.backupLocation === 'local') {
      this.downloadLocalBackup(dataStr);
      this.uploadMessage = ' Respaldo guardado localmente.';
    } else if (this.policy.backupLocation === 'google-drive') {
      this.simulateGoogleDriveUpload();
    }

    setTimeout(() => {
      this.isSaving = false;
    }, 800);
  }

  private buildPayload(): BackupPayload {
    const types: string[] = [];
    if (this.policy.backupTypes.xml) types.push('xml');
    if (this.policy.backupTypes.pdf) types.push('pdf');
    if (this.policy.backupTypes.database) types.push('db');
    const location = this.policy.backupLocation === 'local' ? 'local' : 'drive';
    const freq = this.policy.backupFrequency === 'Trimestral' ? 'Mensual' : this.policy.backupFrequency;
    const payload: BackupPayload = {
      location,
      types,
      frequency: freq as BackupPayload['frequency']
    };
    if (this.policy.retentionPeriod) payload.retention_years = this.policy.retentionPeriod;
    return payload;
  }

  runBackup() {
    this.uploadMessage = '';
    this.errorMessage = '';
    const payload = this.buildPayload();
    this.isSaving = true;
    this.backupService.runBackup(payload).subscribe({
      next: (res) => {
        const raw = res?.data?.zip_path || '';
        this.zipPath = raw ? this.normalizePath(raw) : null;
        this.lastDbIncluded = res?.data?.db_included ?? null;
        this.uploadMessage = 'Respaldo generado';
        this.isSaving = false;
        this.listBackups();
      },
      error: (err) => {
        this.isSaving = false;
        if (err.status === 401) this.errorMessage = 'Sesión no válida o falta company_id';
        else if (err.status === 403) this.errorMessage = 'Acceso denegado';
        else this.errorMessage = 'Error generando respaldo';
      }
    });
  }

  listBackups() {
    this.backupService.listBackups().subscribe({
      next: ({ data }) => {
        this.items = (data || []).map(i => ({ ...i, path: this.normalizePath(i.path) }));
      },
      error: (err) => {
        if (err.status === 401) this.errorMessage = 'Sesión no válida o falta company_id';
        else this.errorMessage = 'Error listando respaldos';
      }
    });
  }

  downloadBackup(path?: string) {
    const p = path || this.zipPath || '';
    if (!p) return;
    this.errorMessage = '';
    const safe = this.normalizePath(p);
    this.backupService.downloadBackup(safe).subscribe({
      next: (response) => {
        const cd = response.headers.get('content-disposition') || '';
        const m = /filename="?([^";]+)"?/i.exec(cd);
        const filename = (m && m[1]) ? m[1] : 'backup.zip';
        saveAs(response.body!, filename);
      },
      error: (err) => {
        if (err.status === 401) this.errorMessage = 'Sesión no válida o falta company_id';
        else if (err.status === 403) this.errorMessage = 'Ruta inválida';
        else if (err.status === 404) this.errorMessage = 'Archivo no encontrado';
        else this.errorMessage = 'Error descargando respaldo';
      }
    });
  }

  private downloadLocalBackup(data: string) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `politica_respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private simulateGoogleDriveUpload() {
    this.uploadMessage = ' Conectando con Google Drive...';
    setTimeout(() => {
      this.uploadMessage = ' Autenticando usuario...';
      setTimeout(() => {
        this.uploadMessage = ' Subiendo archivo a Google Drive...';
        setTimeout(() => {
          this.uploadMessage = ' Archivo subido exitosamente a Google Drive.';
        }, 2000);
      }, 1000);
    }, 1000);
  }

  
}
