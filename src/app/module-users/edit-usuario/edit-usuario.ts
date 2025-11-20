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
    this.initializeForm();
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
        document_type: [''],
        document_number: ['', [Validators.required, Validators.maxLength(50)]],
        address: ['', [Validators.required, Validators.maxLength(150)]],
        country: ['', [Validators.required, Validators.maxLength(100)]],
        description: ['', [Validators.maxLength(250)]],
        contrasena: [''],
        confirmar_contrasena: [''],
        current_password: [''],
        confirm_current_password: [''],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
        phone: ['', [Validators.required, Validators.maxLength(20)]],
        company_id: [null],
        role_id: ['', [Validators.required]],
        status_active: [true]
      },
      { validators: this.passwordMatchValidator }
    );

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
        const data = (usuario as any)?.data ?? usuario;
        this.usuarioData = data;

        const status = (data.status === 'Active' || data.status === 'Activo') ? 'Active' : 'Inactive';
        this.usuarioForm.patchValue({
          first_name: data.first_name || '',
          document_type: data.document_type || '',
          document_number: data.document_number || '',
          address: data.address || '',
          country: data.country || '',
          description: data.description || '',
          email: data.email || '',
          phone: data.phone || '',
          company_id: data.company_id ?? null,
          role_id: (data.role_id !== undefined && data.role_id !== null) ? Number(data.role_id) : '',
          status_active: status === 'Active'
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
      },
      error: () => {
        console.error('Error al cargar roles');
      }
    });
  }

  private passwordMatchValidator(group: FormGroup) {
    const pass = group.get('contrasena')?.value;
    const confirm = group.get('confirmar_contrasena')?.value;
    const curr = group.get('current_password')?.value;
    const currConfirm = group.get('confirm_current_password')?.value;

    let hasError = false;
    const confirmCtrl = group.get('confirmar_contrasena');
    if (pass || confirm) {
      if (pass !== confirm) {
        confirmCtrl?.setErrors({ passwordMismatch: true });
        hasError = true;
      } else {
        if (confirmCtrl?.hasError('passwordMismatch')) confirmCtrl.setErrors(null);
      }
    }

    const confirmCurrCtrl = group.get('confirm_current_password');
    if (curr || currConfirm) {
      if (curr !== currConfirm) {
        confirmCurrCtrl?.setErrors({ passwordMismatch: true });
        hasError = true;
      } else {
        if (confirmCurrCtrl?.hasError('passwordMismatch')) confirmCurrCtrl.setErrors(null);
      }
    }

    return hasError ? { passwordMismatch: true } : null;
  }

  onSubmit(): void {
    if (!this.canSubmit) {
      Object.values(this.usuarioForm.controls).forEach(ctrl => ctrl.markAsTouched());
      return;
    }

    this.isLoading = true;
    const formValue = this.usuarioForm.value;
    const prev = this.usuarioData || ({} as User);
    const status = formValue.status_active ? 'Active' : 'Inactive';
    const prevStatusStr = String(prev.status || '');
    const prevStatus = (prevStatusStr === 'Active' || prevStatusStr === 'Activo') ? 'Active' : 'Inactive';
    const payload: any = {};
    const norm = (v: any) => {
      if (v === null || v === undefined) return null;
      const s = String(v).trim();
      return s.length ? s : null;
    };
    const setIfChanged = (k: string, v: any, old: any) => {
      const nv = norm(v);
      const ov = norm(old);
      if (nv !== ov) payload[k] = nv;
    };
    setIfChanged('first_name', formValue.first_name, prev.first_name);
    const docType = ['NIT', 'CC', 'CE'].includes(formValue.document_type) ? formValue.document_type : null;
    setIfChanged('document_type', docType, prev.document_type);
    setIfChanged('document_number', formValue.document_number, prev.document_number);
    setIfChanged('address', formValue.address, prev.address);
    setIfChanged('country', formValue.country, prev.country);
    setIfChanged('description', formValue.description || '', prev.description);
    setIfChanged('email', formValue.email, prev.email);
    setIfChanged('phone', formValue.phone, prev.phone);
    setIfChanged('role_id', formValue.role_id, prev.role_id);
    if (status !== prevStatus) payload.status = status;
    if (formValue.contrasena && formValue.contrasena.length > 0) {
      payload.password = formValue.contrasena;
    }
    payload.current_password = formValue.current_password;

    this.userService.patchUser(this.usuarioId, payload).subscribe({
      next: () => {
        this.showSuccess('¡Usuario actualizado exitosamente!');
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/usuarios']), 2000);
      },
      error: (err) => {
        let msg = 'Error al actualizar el usuario. Intente nuevamente.';
        const errors = err?.error?.errors;
        if (errors) {
          const list = Object.values(errors).flat().join(' | ');
          msg = list || msg;
        } else if (err?.error?.message) {
          msg = err.error.message;
        }
        this.showError(msg);
        this.isLoading = false;
      }
    });
  }

  private hasEdits(): boolean {
    if (!this.usuarioForm) return false;
    if (this.usuarioForm.dirty) return true;
    const pass = this.usuarioForm.get('contrasena')?.value || '';
    return pass.length > 0;
  }

  get canSubmit(): boolean {
    if (this.isLoading || this.isLoadingUser) return false;
    if (!this.usuarioForm) return false;
    if (!this.hasEdits()) return false;
    const cp = String(this.usuarioForm.get('current_password')?.value || '').trim();
    const cpc = String(this.usuarioForm.get('confirm_current_password')?.value || '').trim();
    if (!cp || !cpc || cp !== cpc) return false;
    return true;
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

}
