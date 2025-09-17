import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, Role } from '../services/user.service';
import { User } from '../usuarios/usuarios';

@Component({
  selector: 'app-nuevo-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './nuevo-usuario.html',
  styleUrl: './nuevo-usuario.css'
})
export class NuevoUsuario implements OnInit {
  usuarioForm!: FormGroup;
  isLoading = false;
  showNotification = false;
  notificationType: 'success' | 'error' = 'success';
  notificationMessage = '';

  roles: Role[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  private initializeForm(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      tipo_documento: ['', [Validators.required]],
      numero_documento: ['', [Validators.required, Validators.maxLength(15)]],
      direccion: ['', [Validators.required, Validators.maxLength(150)]],
      pais: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(250)]],
      contrasena: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirmar_contrasena: ['', [Validators.required]],
      correo_electronico: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      telefono: ['', [Validators.required, Validators.maxLength(20)]],
      company_id: [2, [Validators.required]],
      role_id: ['', [Validators.required]],
      estado_activo: [true]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup): any {
    const password = group.get('contrasena');
    const confirmPassword = group.get('confirmar_contrasena');
    
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      delete confirmPassword.errors?.['passwordMismatch'];
      confirmPassword.updateValueAndValidity();
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      this.isLoading = true;
      const formValue = this.usuarioForm.value;
      
      const userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'ultimo_acceso' | 'remember_token'> = {
        nombre: formValue.nombre,
        tipo_documento: formValue.tipo_documento,
        numero_documento: formValue.numero_documento,
        direccion: formValue.direccion,
        pais: formValue.pais,
        descripcion: formValue.descripcion || '',
        contrasena: formValue.contrasena,
        correo_electronico: formValue.correo_electronico,
        telefono: formValue.telefono,
        estado: formValue.estado_activo ? 'Activo' : 'Inactivo',
        company_id: formValue.company_id,
        role_id: formValue.role_id
      };

      this.userService.createUser(userData as any).subscribe({
        next: () => {
          this.showNotification = true;
          this.notificationType = 'success';
          this.notificationMessage = '¡Usuario creado exitosamente!';
          this.resetForm();
          this.isLoading = false;
          setTimeout(() => this.router.navigate(['/usuarios']), 2000);
        },
        error: (error) => {
          this.showNotification = true;
          this.notificationType = 'error';
          this.notificationMessage = this.getErrorMessage(error.status);
          this.isLoading = false;
        }
      });
    } else {
      Object.keys(this.usuarioForm.controls).forEach(key => {
        this.usuarioForm.get(key)?.markAsTouched();
      });
    }
  }

  private getErrorMessage(status: number): string {
    const messages: { [key: number]: string } = {
      422: 'Datos inválidos. Verifique la información ingresada.',
      409: 'Ya existe un usuario con este documento o correo.',
      0: 'Error de conexión. Verifique que el servidor esté ejecutándose.'
    };
    return messages[status] || 'Error al crear el usuario. Intente nuevamente.';
  }

  private resetForm(): void {
    this.usuarioForm.reset();
    this.usuarioForm.patchValue({ 
      estado_activo: true,
      company_id: 2
    });
  }

  cancelar(): void {
    this.router.navigate(['/usuarios']);
  }

  private loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        // Filtrar roles de cliente/clientes para el módulo de usuarios
        this.roles = (roles || []).filter(role => 
          !role.nombre.toLowerCase().includes('cliente')
        );
        // Inicializar formulario después de cargar roles
        this.initializeForm();
      },
      error: () => {
        console.log('Fallo la carga de roles,');
        // Inicializar formulario después de cargar roles
        this.initializeForm();
      }
    });
  }

  testConnection(): void {
    this.userService.testApiConnection().subscribe({
      next: () => {
        this.showNotification = true;
        this.notificationType = 'success';
        this.notificationMessage = 'Conexión con la API exitosa';
        setTimeout(() => this.showNotification = false, 4000);
      },
      error: () => {
        this.showNotification = true;
        this.notificationType = 'error';
        this.notificationMessage = 'Error de conexión con la API';
        setTimeout(() => this.showNotification = false, 4000);
      }
    });
  }
}