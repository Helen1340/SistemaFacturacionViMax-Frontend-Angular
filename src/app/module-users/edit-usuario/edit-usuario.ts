import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, Role } from '../services/user.service';
import { User } from '../usuarios/usuarios';

@Component({
  selector: 'app-edit-usuario',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-usuario.html',
  styleUrl: './edit-usuario.css'
})
export class EditUsuario implements OnInit {
  usuarioForm!: FormGroup;
  isLoading = false;
  isLoadingUser = false;
  showNotification = false;
  notificationType: 'success' | 'error' = 'success';
  notificationMessage = '';
  usuarioId!: number;

  roles: Role[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.route.params.subscribe(params => {
      this.usuarioId = +params['id'];
      if (this.usuarioId) {
        this.loadUser();
      } else {
        this.showNotification = true;
        this.notificationType = 'error';
        this.notificationMessage = 'ID de usuario no válido';
        this.router.navigate(['/usuarios']);
      }
    });
  }

  private initializeForm(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      tipo_documento: ['', [Validators.required]],
      numero_documento: ['', [Validators.required, Validators.maxLength(15)]],
      direccion: ['', [Validators.required, Validators.maxLength(150)]],
      pais: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(250)]],
      contrasena: [''],
      confirmar_contrasena: [''],
      correo_electronico: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      telefono: ['', [Validators.required, Validators.maxLength(20)]],
      company_id: [2, [Validators.required]],
      role_id: ['', [Validators.required]],
      estado_activo: [true]
    }, { validators: this.passwordMatchValidator });

    // Validación condicional para contraseña
    this.usuarioForm.get('contrasena')?.valueChanges.subscribe(value => {
      const control = this.usuarioForm.get('contrasena');
      if (value && value.length > 0) {
        control?.setValidators([Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]);
      } else {
        control?.clearValidators();
      }
      control?.updateValueAndValidity();
    });
  }

  private usuarioData: User | null = null;

  private loadUser(): void {
    this.isLoadingUser = true;
    this.userService.getUserById(this.usuarioId).subscribe({
      next: (usuario) => {
        this.usuarioData = usuario;
        this.usuarioForm.patchValue({
          nombre: usuario.nombre,
          tipo_documento: usuario.tipo_documento,
          numero_documento: usuario.numero_documento,
          direccion: usuario.direccion,
          pais: usuario.pais,
          descripcion: usuario.descripcion || '',
          correo_electronico: usuario.correo_electronico,
          telefono: usuario.telefono,
          company_id: usuario.company_id,
          role_id: usuario.role_id,
          estado_activo: usuario.estado === 'Activo'
        });
        this.isLoadingUser = false;
      },
      error: () => {
        this.showNotification = true;
        this.notificationType = 'error';
        this.notificationMessage = 'Error al cargar los datos del usuario';
        this.isLoadingUser = false;
        this.router.navigate(['/usuarios']);
      }
    });
  }

  private passwordMatchValidator(group: FormGroup): any {
    const password = group.get('contrasena');
    const confirmPassword = group.get('confirmar_contrasena');
    
    if (password?.value && password.value.length > 0) {
      if (password.value !== confirmPassword?.value) {
        confirmPassword?.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }
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
      
      const userData: User = {
        id: this.usuarioId,
        nombre: formValue.nombre,
        tipo_documento: formValue.tipo_documento,
        numero_documento: formValue.numero_documento,
        direccion: formValue.direccion,
        pais: formValue.pais,
        descripcion: formValue.descripcion || '',
        correo_electronico: formValue.correo_electronico,
        telefono: formValue.telefono,
        estado: formValue.estado_activo ? 'Activo' : 'Inactivo',
        company_id: formValue.company_id,
        role_id: formValue.role_id,
        created_at: this.usuarioData?.created_at || '',
        updated_at: new Date().toISOString()
      };

      if (formValue.contrasena && formValue.contrasena.length > 0) {
        userData.contrasena = formValue.contrasena;
      }

      this.userService.updateUser(userData).subscribe({
        next: () => {
          this.showNotification = true;
          this.notificationType = 'success';
          this.notificationMessage = '¡Usuario actualizado exitosamente!';
          this.isLoading = false;
          setTimeout(() => this.router.navigate(['/usuarios']), 2000);
        },
        error: () => {
          this.showNotification = true;
          this.notificationType = 'error';
          this.notificationMessage = 'Error al actualizar el usuario. Intente nuevamente.';
          this.isLoading = false;
        }
      });
    } else {
      Object.keys(this.usuarioForm.controls).forEach(key => {
        this.usuarioForm.get(key)?.markAsTouched();
      });
    }
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
        console.log('Fallo la carga de roles, ');
        // Inicializar formulario después de cargar roles
        this.initializeForm();
      }
    });
  }

  onCancel(): void {
    if (this.usuarioForm.dirty && !confirm('¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados.')) {
      return;
    }
    this.router.navigate(['/usuarios']);
  }
}