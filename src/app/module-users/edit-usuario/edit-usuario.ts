import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, Role } from '../services/user.service';
import { User } from '../usuarios/usuarios';

@Component({
  selector: 'app-edit-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-usuario.html',
  styleUrls: ['./edit-usuario.css']
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
  private usuarioData: User | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRoles();

    this.route.params.subscribe(params => {
      this.usuarioId = +params['id'];
      if (this.usuarioId) {
        this.loadUser();
      } else {
        this.showError('ID de usuario no válido');
        this.router.navigate(['/usuarios']);
      }
    });
  }

  private initializeForm(): void {
    this.usuarioForm = this.fb.group(
      {
        first_name: ['', [Validators.required, Validators.maxLength(100)]],
        document_type: ['', [Validators.required]],
        document_number: ['', [Validators.required, Validators.maxLength(15)]],
        address: ['', [Validators.required, Validators.maxLength(150)]],
        country: ['', [Validators.required, Validators.maxLength(50)]],
        description: ['', [Validators.maxLength(250)]],
        contrasena: [''],
        confirmar_contrasena: [''],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
        phone: ['', [Validators.required, Validators.maxLength(20)]],
        company_id: [2, [Validators.required]],
        role_id: ['', [Validators.required]],
        status_active: [true]
      },
      { validators: this.passwordMatchValidator }
    );

    // Validar contraseña solo si se escribe
    this.usuarioForm.get('contrasena')?.valueChanges.subscribe(value => {
      const control = this.usuarioForm.get('contrasena');
      if (!control) return;

      if (value && value.length > 0) {
        control.setValidators([
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
        ]);
      } else {
        control.clearValidators();
      }
      control.updateValueAndValidity({ emitEvent: false });
    });

  }

  private loadUser(): void {
    this.isLoadingUser = true;
    this.userService.getUserById(this.usuarioId).subscribe({
      next: (usuario) => {
        this.usuarioData = usuario;
        if (!this.usuarioForm) this.initializeForm();

        this.usuarioForm.patchValue({
          first_name: usuario.first_name || '',
          document_type: usuario.document_type || '',
          document_number: usuario.document_number || '',
          address: usuario.address || '',
          country: usuario.country || '',
          description: usuario.description || '',
          email: usuario.email || '',
          phone: usuario.phone || '',
          company_id: usuario.company_id || 2,
          role_id: usuario.role_id || '',
          status_active: usuario.status === 'Active'
        });

        this.isLoadingUser = false;
      },
      error: () => {
        this.showError('Error al cargar los datos del usuario');
        this.isLoadingUser = false;
        this.router.navigate(['/usuarios']);
      }
    });
  }

  private loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.roles = (roles || []).filter(r => !r.role_name.toLowerCase().includes('cliente'));
        this.initializeForm();
      },
      error: () => {
        console.error('Error al cargar roles');
        this.initializeForm();
      }
    });
  }

  private passwordMatchValidator(group: FormGroup) {
    const pass = group.get('contrasena')?.value;
    const confirm = group.get('confirmar_contrasena')?.value;

    if (pass && confirm && pass !== confirm) {
      group.get('confirmar_contrasena')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      Object.values(this.usuarioForm.controls).forEach(ctrl => ctrl.markAsTouched());
      return;
    }

    this.isLoading = true;
    const formValue = this.usuarioForm.value;

    const userData: User = {
      id: this.usuarioId,
      first_name: formValue.first_name,
      document_type: formValue.document_type,
      document_number: formValue.document_number,
      address: formValue.address,
      country: formValue.country,
      description: formValue.description || '',
      email: formValue.email,
      phone: formValue.phone,
      status: formValue.status_active ? 'Active' : 'Inactive',
      company_id: formValue.company_id,
      role_id: formValue.role_id,
      created_at: this.usuarioData?.created_at || '',
      updated_at: new Date().toISOString()
    };

    if (formValue.contrasena && formValue.contrasena.length > 0) {
      userData.password = formValue.contrasena;
    }

    this.userService.updateUser(userData).subscribe({
      next: () => {
        this.showSuccess('¡Usuario actualizado exitosamente!');
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/usuarios']), 2000);
      },
      error: () => {
        this.showError('Error al actualizar el usuario. Intente nuevamente.');
        this.isLoading = false;
      }
    });
  }

  private showSuccess(message: string): void {
    this.showNotification = true;
    this.notificationType = 'success';
    this.notificationMessage = message;
    setTimeout(() => (this.showNotification = false), 2500);
  }

  private showError(message: string): void {
    this.showNotification = true;
    this.notificationType = 'error';
    this.notificationMessage = message;
    setTimeout(() => (this.showNotification = false), 3500);
  }

  onCancel(): void {
    if (this.usuarioForm.dirty && !confirm('¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados.')) {
      return;
    }
    this.router.navigate(['/usuarios']);
  }

  // Para debug opcional
  getFormStatus(): void {
    console.log(this.usuarioForm.value);
    console.log(this.usuarioForm.errors);
  }
}
