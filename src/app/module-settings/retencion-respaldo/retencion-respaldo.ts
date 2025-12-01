import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';
import { BackupService, BackupItem, BackupPayload } from './services/backup.service';
import { Router } from '@angular/router';

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

  // Nueva propiedad para controlar el estado del servicio
  isBackupServiceAvailable = true;

  constructor(private backupService: BackupService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPolicy();
    this.checkBackupServiceAvailability();
  }

  // ✅ VERIFICAR DISPONIBILIDAD DEL SERVICIO
  checkBackupServiceAvailability() {
    this.backupService.listBackups().subscribe({
      next: () => {
        this.isBackupServiceAvailable = true;
      },
      error: (err) => {
        if (err.status === 500 && err.error?.message?.includes('ZipArchive')) {
          this.isBackupServiceAvailable = false;
          this.errorMessage = '⚠️ El servicio de respaldos no está disponible temporalmente. Se está trabajando en la solución.';
        }
      }
    });
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
    this.errorMessage = '';
    this.uploadMessage = '';

    const dataStr = JSON.stringify(this.policy, null, 2);
    localStorage.setItem('policyBackup', dataStr);

    // Solo guardar localmente
    this.downloadLocalBackup(dataStr);
    this.uploadMessage = '✅ Política de respaldo guardada localmente.';

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
    
    if (this.policy.retentionPeriod) {
      payload.retention_years = this.policy.retentionPeriod;
    }
    
    return payload;
  }

  // ✅ MÉTODO RUNBACKUP CON MANEJO ESPECÍFICO DE ZIPARCHIVE
  runBackup() {
    // Verificar disponibilidad antes de ejecutar
    if (!this.isBackupServiceAvailable) {
      this.errorMessage = '❌ El servicio de respaldos no está disponible. El servidor necesita instalar la extensión ZipArchive de PHP.';
      return;
    }

    this.uploadMessage = '';
    this.errorMessage = '';
    this.isSaving = true;

    // Validar tipos de backup seleccionados
    const selectedTypes = Object.values(this.policy.backupTypes).filter(Boolean);
    if (selectedTypes.length === 0) {
      this.errorMessage = 'Selecciona al menos un tipo de archivo para respaldar';
      this.isSaving = false;
      return;
    }

    const payload = this.buildPayload();
    
    console.log('Ejecutando backup con payload:', payload);

    this.backupService.runBackup(payload).subscribe({
      next: (res) => {
        console.log('Respuesta del backup:', res);
        
        if (res?.data?.zip_path) {
          const raw = res.data.zip_path;
          this.zipPath = raw ? this.normalizePath(raw) : null;
          this.lastDbIncluded = res.data.db_included ?? null;
          this.uploadMessage = '✅ Respaldo generado exitosamente';
        } else {
          this.uploadMessage = '⚠️ Respuesta del servidor incompleta';
        }
        
        this.isSaving = false;
        this.listBackups();
      },
      error: (err) => {
        console.error('Error en backup:', err);
        this.isSaving = false;
        
        // ✅ MANEJO ESPECÍFICO DEL ERROR ZIPARCHIVE
        if (err.status === 500 && err.error?.message?.includes('ZipArchive')) {
          this.isBackupServiceAvailable = false;
          this.errorMessage = '❌ Error del servidor: La extensión ZipArchive de PHP no está instalada. Contacta al administrador del sistema.';
          console.error('PROBLEMA DEL SERVIDOR:', err.error);
        } else if (err.status === 401) {
          this.errorMessage = '❌ Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (err.status === 403) {
          this.errorMessage = '❌ No tienes permisos para ejecutar respaldos.';
        } else if (err.status === 500) {
          this.errorMessage = '❌ Error interno del servidor. El servicio de respaldos no está disponible.';
        } else if (err.status === 0) {
          this.errorMessage = '❌ No se puede conectar al servidor. Verifica tu conexión a internet.';
        } else {
          this.errorMessage = `❌ Error generando respaldo: ${err.message || 'Error desconocido'}`;
        }
        
        this.listBackups();
      }
    });
  }

  // ✅ MÉTODO LISTBACKUPS MEJORADO
  listBackups() {
    this.errorMessage = '';
    
    this.backupService.listBackups().subscribe({
      next: ({ data }) => {
        this.items = (data || []).map(i => ({ 
          ...i, 
          path: this.normalizePath(i.path) 
        }));
        
        if (this.items.length === 0) {
          this.uploadMessage = 'No hay respaldos disponibles';
        }
      },
      error: (err) => {
        console.error('Error listando backups:', err);
        
        if (err.status === 500 && err.error?.message?.includes('ZipArchive')) {
          this.isBackupServiceAvailable = false;
          this.errorMessage = 'Servicio de respaldos no disponible - ZipArchive faltante';
          this.items = [];
        } else if (err.status === 401) {
          this.errorMessage = 'Sesión no válida';
        } else if (err.status === 500) {
          this.errorMessage = 'Servicio de respaldos no disponible';
          this.items = [];
        } else {
          this.errorMessage = 'Error al cargar la lista de respaldos';
        }
      }
    });
  }

  downloadBackup(path?: string) {
    const p = path || this.zipPath || '';
    if (!p) {
      this.errorMessage = 'No hay ruta de respaldo disponible';
      return;
    }
    
    this.errorMessage = '';
    const safe = this.normalizePath(p);
    
    this.backupService.downloadBackup(safe).subscribe({
      next: (response) => {
        const cd = response.headers.get('content-disposition') || '';
        const m = /filename="?([^";]+)"?/i.exec(cd);
        const filename = (m && m[1]) ? m[1] : 'backup.zip';
        saveAs(response.body!, filename);
        this.uploadMessage = '✅ Descarga iniciada';
      },
      error: (err) => {
        console.error('Error descargando backup:', err);
        
        if (err.status === 500 && err.error?.message?.includes('ZipArchive')) {
          this.errorMessage = 'No se puede descargar - ZipArchive no disponible en el servidor';
        } else if (err.status === 401) {
          this.errorMessage = 'Sesión expirada';
        } else if (err.status === 403) {
          this.errorMessage = 'No tienes permisos para descargar este archivo';
        } else if (err.status === 404) {
          this.errorMessage = 'Archivo de respaldo no encontrado';
        } else if (err.status === 500) {
          this.errorMessage = 'Error del servidor al descargar el respaldo';
        } else {
          this.errorMessage = 'Error descargando respaldo';
        }
      }
    });
  }

  private normalizePath(p: string): string {
    const s = (p || '').replace(/\\/g, '/');
    const withLead = s.startsWith('/') ? s : `/${s}`;
    return withLead.replace(/\/\.\//g, '/').replace(/\/\.\.\//g, '/').replace(/\/+/g, '/');
  }

  private downloadLocalBackup(data: string) {
    try {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `politica_respaldo_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando política local:', error);
      this.errorMessage = 'Error al descargar la política local';
    }
  }

  // ✅ MÉTODO PARA MOSTRAR INFORMACIÓN AL USUARIO
  showServiceStatus() {
    if (!this.isBackupServiceAvailable) {
      alert(`🚫 Servicio de Respaldo No Disponible

Problema: La extensión ZipArchive de PHP no está instalada en el servidor.

Qué significa:
- No se pueden generar nuevos respaldos automáticos
- No se pueden descargar respaldos existentes
- El servicio está temporalmente deshabilitado

Solución:
Contacta al administrador del sistema para que instale la extensión ZipArchive.`);
    } else {
      alert('✅ El servicio de respaldos está funcionando correctamente.');
    }
  }

  // ✅ MÉTODO PARA SIMULAR BACKUP LOCAL (SOLUCIÓN TEMPORAL)
  simulateLocalBackup() {
    if (!this.isBackupServiceAvailable) {
      this.isSaving = true;
      this.uploadMessage = '⏳ Simulando respaldo local...';
      
      setTimeout(() => {
        this.uploadMessage = '✅ Respaldo simulado localmente (modo demo)';
        this.isSaving = false;
        
        // Agregar un item simulado a la lista
        this.items.unshift({
          path: `/backups/simulated_backup_${Date.now()}.zip`,
          size: 1024 * 1024, // 1MB simulado
          modified_at: new Date().toISOString()
        });
      }, 2000);
    }
  }

  retryConnection() {
    this.errorMessage = '';
    this.uploadMessage = 'Reintentando conexión...';
    this.checkBackupServiceAvailability();
    this.listBackups();
  }

  clearMessages() {
    this.errorMessage = '';
    this.uploadMessage = '';
  }

  goBack(): void {
    this.router.navigate(['/configuracion']);
  }
}