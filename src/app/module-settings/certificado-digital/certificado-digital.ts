import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificateService } from './certificate.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-certificado-digital',
  templateUrl: './certificado-digital.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./certificado-digital.css']
})
export class CertificadoDigital implements OnInit {
  certificateForm!: FormGroup;
  certificates: any[] = [];
  editingCertificate: any = null;
  
  selectedFile: File | null = null;
  fileName: string = '';
  fileSize: string = '';
  
  loading: boolean = false;
  isSubmitting: boolean = false;
  submitAttempted: boolean = false;
  
  companyId: number = 0;

  constructor(
    private fb: FormBuilder,
    private certificateService: CertificateService
  ) {
    this.certificateForm = this.fb.group({
      certificate_name: ['', Validators.required],
      certificate_type: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      serial_number: ['', Validators.required],
      issuer: ['', Validators.maxLength(100)],
      signature_type: ['', Validators.required],
      description: [''],
      password: ['', Validators.maxLength(255)]
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.getCompanyFromAuth();
    
    if (!this.companyId || this.companyId === 0) {
      this.getCompanyFromToken();
    }
    
    // Cargar certificados si tenemos company_id válido
    if (this.companyId > 0) {
      this.loadCertificates();
    } else {
      this.loading = false;
    }
  }

  getCompanyFromAuth(): void {
    // 1. Intentar obtener company_id desde 'company' en localStorage
    const companyData = localStorage.getItem('company');
    if (companyData) {
      try {
        const company = JSON.parse(companyData);
        this.companyId = company.id || 0;
        console.log('🏢 Company ID obtenido desde company:', this.companyId);
        if (this.companyId > 0) return;
      } catch (error) {
        console.error('❌ Error parseando company');
      }
    }

    // 2. Si no encontró, intentar desde 'user'
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.companyId = user.company_id || user.empresa_id || 0;
        console.log('🏢 Company ID obtenido desde user:', this.companyId);
        if (this.companyId > 0) return;
      } catch (error) {
        console.error('❌ Error parseando user');
      }
    }

    // 3. Si aún no encontró, intentar desde token
    if (!this.companyId || this.companyId === 0) {
      this.getCompanyFromToken();
    }
  }

  /**
   * Intentar obtener company_id del token JWT
   */
  getCompanyFromToken(): void {
    const raw = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!raw) return;
    const t = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
    const parts = t.split('.');
    if (parts.length !== 3) return;
    let b = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    b += '==='.slice((b.length + 3) % 4);
    let payload: any = null;
    try {
      payload = JSON.parse(atob(b));
    } catch {
      return;
    }
    this.companyId = payload.company_id || payload.empresa_id || payload.companyId || 0;
  }

  /**
   * Inicializar formulario
   */
  initForm(): void {
    this.certificateForm = this.fb.group({
      certificate_name: ['', Validators.required],
      certificate_type: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      serial_number: ['', Validators.required],
      issuer: ['', Validators.maxLength(100)],
      signature_type: ['', Validators.required],
      description: [''],
      password: ['', Validators.maxLength(255)]
    });
  }

  /**
   * Cargar lista de certificados
   */
  loadCertificates(): void {
    this.loading = true;
    
    this.certificateService.getCertificates().subscribe({
      next: (response: any) => {
        console.log('✅ Certificados recibidos:', response);
        this.certificates = response || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando certificados:', error);
        this.loading = false;
        // No mostrar alert, solo log
      }
    });
  }

  /**
   * Evento de selección de archivo
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pfx')) {
        alert('Solo se permiten archivos .pfx');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no debe superar los 5MB');
        return;
      }

      this.selectedFile = file;
      this.fileName = file.name;
      this.fileSize = this.formatFileSize(file.size);
    }
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Quitar archivo seleccionado
   */
  resetFile(): void {
    this.selectedFile = null;
    this.fileName = '';
    this.fileSize = '';
  }

  /**
   * Validar campo del formulario
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.certificateForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.submitAttempted));
  }

  /**
   * Cargar nuevo certificado
   */
  cargarCertificado(): void {
    this.submitAttempted = true;

    // Verificar formulario válido
    if (this.certificateForm.invalid) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.isDateRangeInvalid()) {
      alert('La fecha de vencimiento debe ser posterior a la fecha de emisión');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.certificateForm.value;

    const payload: any = {
      signature_type: formValue.signature_type,
      certificate_name: formValue.certificate_name,
      certificate_type: formValue.certificate_type,
      serial_number: formValue.serial_number,
      issuer: formValue.issuer || '',
      description: formValue.description || '',
      start_date: formValue.start_date,
      end_date: formValue.end_date,
      password: formValue.password || '',
      archivo_certificado: this.selectedFile
    };

    console.log('📤 Enviando payload:', payload);

    this.certificateService.uploadCertificate(payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        console.log('✅ Certificado guardado:', response);
        alert('Certificado cargado correctamente');
        this.resetForm();
        this.loadCertificates();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('❌ Error al cargar certificado:', error);
        console.error('❌ Detalles del error:', error.error);
        alert(error.error?.message || 'Ocurrió un error al cargar el certificado');
      }
    });
  }

  /**
   * Actualizar certificado existente
   */
  actualizarCertificado(): void {
    this.submitAttempted = true;

    // Verificar formulario válido
    if (this.certificateForm.invalid) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.isDateRangeInvalid()) {
      alert('La fecha de vencimiento debe ser posterior a la fecha de emisión');
      return;
    }

    if (!this.editingCertificate || !this.editingCertificate.id) {
      return;
    }

    this.isSubmitting = true;

    const formValue = this.certificateForm.value;

    const payload: any = {
      signature_type: formValue.signature_type,
      certificate_name: formValue.certificate_name,
      certificate_type: formValue.certificate_type,
      serial_number: formValue.serial_number,
      issuer: formValue.issuer || '',
      description: formValue.description || '',
      start_date: formValue.start_date,
      end_date: formValue.end_date,
      password: formValue.password || '',
      company_id: this.companyId
    };

    if (this.selectedFile) {
      payload.archivo_certificado = this.selectedFile;
    }

    console.log('📤 Actualizando certificado:', payload);

    this.certificateService.updateCertificate(this.editingCertificate.id, payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('✅ Certificado actualizado:', response);
        alert('Certificado actualizado correctamente');
        this.resetForm();
        this.loadCertificates();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('❌ Error al actualizar certificado:', error);
        console.error('❌ Detalles del error:', error.error);
        alert(error.error?.message || 'Ocurrió un error al actualizar el certificado');
      }
    });
  }

  /**
   * Preparar formulario para editar certificado
   */
  editarCertificado(cert: any): void {
    this.editingCertificate = cert;
    
    this.certificateForm.patchValue({
      certificate_name: cert.nombre_certificado,
      certificate_type: cert.certificate_type || 'Producción',
      start_date: cert.fecha_emision,
      end_date: cert.fecha_vencimiento,
      serial_number: cert.numero_serial,
      issuer: cert.entidad_emisora,
      signature_type: cert.signature_type || 'digital',
      description: cert.descripcion || ''
    });

    this.selectedFile = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Verificar validez del certificado
   */
  verificarValidez(cert: any): void {
    if (!cert.id) return;

    alert('Verificando certificado...');

    this.certificateService.verifyCertificate(cert.id).subscribe({
      next: (response) => {
        const estado = cert.estado_actual;
        alert(`Estado del Certificado:\n\nNombre: ${cert.nombre_certificado}\nEstado: ${estado}\nVálido hasta: ${new Date(cert.fecha_vencimiento).toLocaleDateString('es-CO')}`);
      },
      error: (error) => {
        console.error('Error verificando certificado:', error);
        alert('No se pudo verificar el certificado');
      }
    });
  }

  /**
   * Eliminar certificado
   */
  eliminarCertificado(id: number | undefined): void {
    if (!id) return;

    if (!confirm('¿Deseas eliminar este certificado? Esta acción no se puede deshacer.')) {
      return;
    }

    this.certificateService.deleteCertificate(id).subscribe({
      next: (response) => {
        alert('Certificado eliminado correctamente');
        this.loadCertificates();
      },
      error: (error) => {
        console.error('Error eliminando certificado:', error);
        alert('Ocurrió un error al eliminar el certificado');
      }
    });
  }

  /**
   * Resetear formulario
   */
  resetForm(): void {
    this.certificateForm.reset();
    this.editingCertificate = null;
    this.selectedFile = null;
    this.fileName = '';
    this.fileSize = '';
    this.submitAttempted = false;
  }

  isDateRangeInvalid(): boolean {
    const s = this.certificateForm.get('start_date')?.value;
    const e = this.certificateForm.get('end_date')?.value;
    if (!s || !e) return false;
    return new Date(e) < new Date(s);
  }

  
}