import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../module-home/services/Auth.Service';
import { CompletaRegistroService } from './company.service';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './parametros-generales.html',
  styleUrls: ['./parametros-generales.css']
})
export class ParametrosGenerales implements OnInit {
  form!: FormGroup;
  isLoading = false;
  notification = { show: false, message: '', type: 'success' as 'success' | 'error' };
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private completeService: CompletaRegistroService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      // 🏢 Company info
      business_name: ['', Validators.required],
      nit: ['', Validators.required],
      trade_name: [''],
      address: [''],
      city: [''],
      department: [''],
      country: ['Colombia'],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      tax_regime: [''],
      ciiu_code: [''],
      logo_url: [''],
      legal_representative_name: [''],
      legal_representative_document_type: [''],
      legal_representative_document_number: [''],

      // 👤 User info
      first_name: [''],
      document_type: [''],
      document_number: [''],
      user_address: [''],
      user_country: ['Colombia'],
      description: [''],
      user_email: ['', [Validators.required, Validators.email]],
      user_phone: [''],
      status: ['Active']
    });

    this.loadPreRegistrationData();
  }

  // 🔹 Load data from /me (company + user)
  loadPreRegistrationData() {
    this.authService.me().subscribe({
      next: (userData) => {
        console.log('Data from me():', userData);

        const company = userData?.company;
        const user = userData?.user;

        // Company data
        if (company) {
          this.form.patchValue({
            business_name: company.business_name ?? '',
            nit: company.nit ?? '',
            trade_name: company.trade_name ?? '',
            address: company.address ?? '',
            city: company.city ?? '',
            department: company.department ?? '',
            country: company.country ?? 'Colombia',
            phone: company.phone ?? '',
            email: company.email ?? '',
            tax_regime: company.tax_regime ?? '',
            ciiu_code: company.ciiu_code ?? '',
            logo_url: company.logo_url ?? '',
            legal_representative_name: company.legal_representative_name ?? '',
            legal_representative_document_type: company.legal_representative_document_type ?? '',
            legal_representative_document_number: company.legal_representative_document_number ?? ''
          });

          // Si existe logo_url, mostrar la imagen
          if (company.logo_url) {
            this.imagePreview = company.logo_url;
          }
        }

        // User data
        if (user) {
          this.form.patchValue({
            first_name: user.first_name ?? '',
            document_type: user.document_type ?? '',
            document_number: user.document_number ?? '',
            user_address: user.address ?? '',
            user_country: user.country ?? 'Colombia',
            description: user.description ?? '',
            user_email: user.email ?? '',
            user_phone: user.phone ?? '',
            status: user.status ?? 'Active'
          });
        }
      },
      error: (err) => console.error('❌ Error loading preregistration:', err)
    });
  }

  // 🔹 Handle file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.showNotification('Please select a valid image file', 'error');
        return;
      }

      // Validar tamaño (10MB)
      if (file.size > 10240 * 1024) {
        this.showNotification('Image size must be less than 10MB', 'error');
        return;
      }

      this.selectedFile = file;

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // 🔹 Submit form
  // 🔹 Submit form
onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.isLoading = true;

  // Crear FormData para enviar archivo
  const formData = new FormData();

  // Agregar todos los campos del formulario
  Object.keys(this.form.value).forEach(key => {
    const value = this.form.value[key];
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  // Agregar la imagen si fue seleccionada
  if (this.selectedFile) {
    formData.append('imagen', this.selectedFile, this.selectedFile.name);
    console.log('✅ Imagen agregada a FormData:', this.selectedFile.name, this.selectedFile.type, this.selectedFile.size);
  } else {
    console.log('⚠️ No hay imagen seleccionada');
  }

  // 🔍 Debug: Ver qué se está enviando
  console.log('📤 FormData contents:');
  formData.forEach((value, key) => {
    if (value instanceof File) {
      console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
    } else {
      console.log(`${key}:`, value);
    }
  });

  this.completeService.completeRegistration(formData).subscribe({
    next: (res) => {
      this.showNotification('Registration completed successfully', 'success');
      console.log('✅ Backend response:', res);
      this.isLoading = false;
      setTimeout(() => this.router.navigate(['/configuracion']), 1500);
    },
    error: (err) => {
      console.error('❌ Error completing registration:', err.error);
      const msg = err.error?.message || 'Error completing registration';
      this.showNotification(msg, 'error');
      this.isLoading = false;
    }
  });
}

  private showNotification(message: string, type: 'success' | 'error') {
    this.notification = { show: true, message, type };
    setTimeout(() => (this.notification.show = false), 4000);
  }
}