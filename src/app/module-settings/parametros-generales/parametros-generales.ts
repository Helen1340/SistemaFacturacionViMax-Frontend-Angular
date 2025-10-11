import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../module-home/services/Auth.Service';
import { CompletaRegistroService } from './company.service';

@Component({
  selector: 'app-parametros-generales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './parametros-generales.html',
  styleUrls: ['./parametros-generales.css']
})
export class ParametrosGenerales implements OnInit {
  form!: FormGroup;
  isLoading = false;
  notification = { show: false, message: '', type: 'success' as 'success' | 'error' };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private completaService: CompletaRegistroService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      // 🏢 Datos de la empresa
      razon_social: ['', Validators.required],
      nit: ['', Validators.required],
      nombre_comercial: [''],
      direccion: [''],
      ciudad: [''],
      departamento: [''],
      pais: ['Colombia'],
      telefono: [''],
      correo_electronico: ['', [Validators.required, Validators.email]],
      regimen: [''],
      codigo_ciiu: [''],
      representante_nombre: [''],
      representante_tipo_documento: [''],
      representante_numero_documento: [''],

      // 👤 Datos del usuario (representante o facturador)
      nombre: [''],
      tipo_documento: [''],
      numero_documento: [''],
      direccion_usuario: [''],
      pais_usuario: ['Colombia'],
      descripcion: [''],
      correo_usuario: ['', [Validators.required, Validators.email]],
      telefono_usuario: [''],
      estado: ['Activo']
    });

    this.cargarDatosPreregistro();
  }

  // 🔹 Cargar datos desde /me (empresa + usuario)
  cargarDatosPreregistro() {
    this.authService.me().subscribe({
      next: (userData) => {
        console.log('Datos recibidos de me():', userData);

        const company = userData?.company;
        const user = userData?.user;

        // Cargar empresa
        if (company) {
          this.form.patchValue({
            razon_social: company.razon_social ?? '',
            nit: company.nit ?? '',
            nombre_comercial: company.nombre_comercial ?? '',
            direccion: company.direccion ?? '',
            ciudad: company.ciudad ?? '',
            departamento: company.departamento ?? '',
            pais: company.pais ?? 'Colombia',
            telefono: company.telefono ?? '',
            correo_electronico: company.correo_electronico ?? '',
            regimen: company.regimen ?? '',
            codigo_ciiu: company.codigo_ciiu ?? '',
            representante_nombre: company.representante_nombre ?? '',
            representante_tipo_documento: company.representante_tipo_documento ?? '',
            representante_numero_documento: company.representante_numero_documento ?? ''
          });
        } else {
          console.warn('⚠️ No se encontró información de empresa.');
        }

        // Cargar usuario
        if (user) {
          this.form.patchValue({
            nombre: user.nombre ?? '',
            tipo_documento: user.tipo_documento ?? '',
            numero_documento: user.numero_documento ?? '',
            direccion_usuario: user.direccion ?? '',
            pais_usuario: user.pais ?? 'Colombia',
            descripcion: user.descripcion ?? '',
            correo_usuario: user.correo_electronico ?? '',
            telefono_usuario: user.telefono ?? '',
            estado: user.estado ?? 'Activo'
          });
        } else {
          console.warn('⚠️ No se encontró información de usuario.');
        }
      },
      error: (err) => console.error('❌ Error cargando preregistro:', err)
    });
  }

  // 🔹 Guardar cambios
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.form.value;

    this.completaService.completarRegistro(formData).subscribe({
      next: (res) => {
        this.showNotification('Registro completado correctamente', 'success');
        console.log('✅ Respuesta del backend:', res);
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/facturas-notas']), 1500);
      },
      error: (err) => {
        console.error('❌ Error al completar registro:', err.error);
        console.table(err.error?.errors);
        const msg = err.error?.message || 'Error al completar el registro';
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
