import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Certificate, CertificateRequest, CertificateService } from './certificate.service';

@Component({
  selector: 'app-certificado-digital',
  imports: [ CommonModule, ReactiveFormsModule, HttpClientModule ],
  templateUrl: './certificado-digital.html',
  styleUrl: './certificado-digital.css'
})
export class CertificadoDigital implements OnInit {
  certificateForm: FormGroup;
  selectedFile: File | null = null;
  fileName: string = '';
  fileSize: string = '';
  showPassword: boolean = false;
  loading: boolean = false;
  certificates: Certificate[] = [];
  editingCertificate: Certificate | null = null;

  tiposFirma = [
    { value: 'persona_natural', label: 'Persona Natural' },
    { value: 'persona_juridica', label: 'Persona Jurídica' },
    { value: 'entidad_publica', label: 'Entidad Pública' }
  ];

  estadosCertificado = [
    { value: 'valido', label: 'Válido' },
    { value: 'invalido', label: 'Inválido' },
    { value: 'revocado', label: 'Revocado' },
    { value: 'bloqueado', label: 'Bloqueado' }
  ];

  constructor(
    private fb: FormBuilder,
    private certificateService: CertificateService
  ) {
    this.certificateForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCertificates();
  }

  createForm(): FormGroup {
    return this.fb.group({
      tipo_firma: ['', [Validators.required]],
      nombre_titular: ['', [Validators.required, Validators.minLength(3)]],
      nit_asociado: ['', [Validators.required, Validators.pattern(/^\d{9}-\d$/)]],
      fecha_emision: ['', [Validators.required]],
      fecha_vencimiento: ['', [Validators.required]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      estado_actual: ['', [Validators.required]],
      activar_notificacion: [false]
    });
  }

  // Cargar lista de certificados
  loadCertificates(): void {
    this.loading = true;
    this.certificateService.getCertificates().subscribe({
      next: (certificates) => {
        this.certificates = certificates;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar certificados:', error);
        this.loading = false;
      }
    });
  }

  // Manejar selección de archivo
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
      if (!file.name.toLowerCase().endsWith('.pfx')) {
        alert('Solo se permiten archivos .pfx');
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no debe superar los 5MB');
        return;
      }

      this.selectedFile = file;
      this.fileName = file.name;
      this.fileSize = this.formatFileSize(file.size);
      
      // Mostrar información del archivo
      const uploadContent = document.getElementById('uploadContent');
      const fileInfo = document.getElementById('fileInfo');
      
      if (uploadContent && fileInfo) {
        uploadContent.classList.add('hidden');
        fileInfo.classList.remove('hidden');
      }
    }
  }

  // Formatear tamaño del archivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Alternar visibilidad de contraseña
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Resetear archivo seleccionado
  resetFile(): void {
    this.selectedFile = null;
    this.fileName = '';
    this.fileSize = '';
    
    const uploadContent = document.getElementById('uploadContent');
    const fileInfo = document.getElementById('fileInfo');
    const fileInput = document.getElementById('certificateFile') as HTMLInputElement;
    
    if (uploadContent && fileInfo && fileInput) {
      uploadContent.classList.remove('hidden');
      fileInfo.classList.add('hidden');
      fileInput.value = '';
    }
  }

  // Cargar certificado (crear o actualizar)
  cargarCertificado(): void {
    if (this.certificateForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (!this.selectedFile && !this.editingCertificate) {
      alert('Debe seleccionar un archivo de certificado');
      return;
    }

    this.loading = true;

    const formData: CertificateRequest = {
      ...this.certificateForm.value,
      archivo_certificado: this.selectedFile!
    };

    const operation = this.editingCertificate 
      ? this.certificateService.updateCertificate(this.editingCertificate.id!, formData)
      : this.certificateService.createCertificate(formData);

    operation.subscribe({
      next: (response) => {
        alert(this.editingCertificate ? 'Certificado actualizado exitosamente' : 'Certificado cargado exitosamente');
        this.resetForm();
        this.loadCertificates();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al procesar el certificado');
        this.loading = false;
      }
    });
  }

  // Eliminar certificado
  eliminarCertificado(id?: number): void {
    const certificateId = id || this.editingCertificate?.id;
    
    if (!certificateId) {
      alert('No hay certificado seleccionado para eliminar');
      return;
    }

    if (confirm('¿Está seguro de que desea eliminar este certificado?')) {
      this.certificateService.deleteCertificate(certificateId).subscribe({
        next: () => {
          alert('Certificado eliminado exitosamente');
          this.resetForm();
          this.loadCertificates();
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Error al eliminar el certificado');
        }
      });
    }
  }

  // Verificar validez
  verificarValidez(id?: number): void {
    const certificateId = id || this.editingCertificate?.id;
    
    if (!certificateId) {
      alert('No hay certificado seleccionado para verificar');
      return;
    }

    this.certificateService.verifyCertificate(certificateId).subscribe({
      next: (response) => {
        alert('Verificación completada: ' + JSON.stringify(response));
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al verificar el certificado');
      }
    });
  }

  // Bloquear firma
  bloquearFirma(id?: number): void {
    const certificateId = id || this.editingCertificate?.id;
    
    if (!certificateId) {
      alert('No hay certificado seleccionado para bloquear');
      return;
    }

    if (confirm('¿Está seguro de que desea bloquear este certificado?')) {
      this.certificateService.blockCertificate(certificateId).subscribe({
        next: () => {
          alert('Certificado bloqueado exitosamente');
          this.loadCertificates();
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Error al bloquear el certificado');
        }
      });
    }
  }

  // Editar certificado
  editarCertificado(certificate: Certificate): void {
    this.editingCertificate = certificate;
    
    this.certificateForm.patchValue({
      nombre_titular: certificate.nombre_certificado,
      contrasena: certificate.contrasena,
      fecha_emision: certificate.fecha_inicio,
      fecha_vencimiento: certificate.fecha_fin,
      estado_actual: certificate.estado
    });
  }

  // Resetear formulario
  resetForm(): void {
    this.certificateForm.reset();
    this.resetFile();
    this.editingCertificate = null;
  }

  // Marcar campos como tocados para mostrar errores
  private markFormGroupTouched(): void {
    Object.keys(this.certificateForm.controls).forEach(key => {
      const control = this.certificateForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Validadores de campo
  isFieldInvalid(fieldName: string): boolean {
    const field = this.certificateForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.certificateForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return `${fieldName} no tiene el formato correcto`;
    }
    return '';
  }
}
