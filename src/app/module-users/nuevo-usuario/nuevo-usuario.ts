import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-nuevo-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './nuevo-usuario.html',
  styleUrl: './nuevo-usuario.css',
})
export class NuevoUsuario implements OnInit {
  usuarioForm!: FormGroup;
  roles: any[] = [];
  isLoading = false;

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarRoles();
  }

  initForm() {
    this.usuarioForm = this.fb.group({
      //company_id: [''], // nullable - coincide con API
      role_id: [null, Validators.required], // required en el template, nullable en API
      nombre: ['', [Validators.required, Validators.maxLength(100)]], // ✓ coincide
      tipo_documento: ['', Validators.required], // ✓ required en template, nullable en API pero requerido en UI
      numero_documento: ['', [Validators.required, Validators.maxLength(50)]], // ✓ corregido maxLength
      direccion: ['', [Validators.required, Validators.maxLength(150)]], // ✓ required en template, nullable en API
      pais: ['', Validators.required], // ✓ required en template, nullable en API
      descripcion: ['', Validators.maxLength(250)], // ✓ coincide
      correo_electronico: ['', [Validators.required, Validators.email, Validators.maxLength(150)]], // ✓ coincide
      telefono: ['', [Validators.required, Validators.maxLength(20)]], // ✓ corregido maxLength
      estado_activo: [true], // ✓ para el checkbox del template
      contrasena: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]], // ✓ coincide con template
      confirmar_contrasena: ['', Validators.required], // ✓ coincide con template
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('contrasena')?.value;
    const confirmPass = group.get('confirmar_contrasena')?.value;
    return pass === confirmPass ? null : { passwordMismatch: true };
  }

  cargarRoles() {
    this.userService.getRoles().subscribe({
      next: (res: any[]) => { 
        // filtras todos los que NO tengan id = 4
        this.roles = res.filter(role => role.id !== 4);
      },
      error: (err) => { 
        console.error('Error cargando roles:', err); 
        this.showNotificationMessage('Error cargando roles', 'error');
      }
    });
  }
  

  onSubmit() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      this.showNotificationMessage('Por favor complete todos los campos requeridos', 'error');
      return;
    }

    const formValue = this.usuarioForm.value;
    
    // Mapear los datos según lo que espera la API
    const payload = {
      company_id: formValue.company_id || null,
      role_id: formValue.role_id || null,
      nombre: formValue.nombre,
      tipo_documento: formValue.tipo_documento || null,
      numero_documento: formValue.numero_documento,
      direccion: formValue.direccion || null,
      pais: formValue.pais || null,
      descripcion: formValue.descripcion || null,
      correo_electronico: formValue.correo_electronico,
      telefono: formValue.telefono || null,
      estado: formValue.estado_activo ? 'Activo' : 'Inactivo', // Mapear checkbox a string
      password: formValue.contrasena, // Mapear nombre del campo
      ultimo_acceso: null // Campo que espera la API
    };

    this.isLoading = true;
    this.userService.createUser(payload as any).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showNotificationMessage('Usuario creado correctamente', 'success');
        // Opcional: redirigir después de un delay
        setTimeout(() => {
          this.router.navigate(['/usuarios']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        let errorMessage = 'Error al crear el usuario';
        
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.error?.errors) {
          // Manejar errores de validación de Laravel
          const errors = Object.values(err.error.errors).flat();
          errorMessage = errors.join(', ');
        }
        
        this.showNotificationMessage(errorMessage, 'error');
        console.error('Error API:', err);
      }
    });
  }



  cancelar() {
    this.router.navigate(['/usuarios']);
  }

  showNotificationMessage(message: string, type: 'success' | 'error') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    setTimeout(() => this.showNotification = false, 4000);
  }
}