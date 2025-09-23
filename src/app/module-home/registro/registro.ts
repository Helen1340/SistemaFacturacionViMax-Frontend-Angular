import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/Auth.Service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class Registro {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  notification: { show: boolean; message: string; type: 'success' | 'error' } = {
    show: false,
    message: '',
    type: 'success'
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      // Empresa
      businessName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150), this.noOnlySpacesValidator, this.noSpecialCharactersValidator]],
      nit: ['', [Validators.required, Validators.maxLength(50)]],
      companyEmail: ['', [Validators.required, Validators.email, Validators.maxLength(100), this.validEmailValidator]],

      // Admin
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/), this.noOnlySpacesValidator]],
      adminEmail: ['', [Validators.required, Validators.email, Validators.maxLength(150), this.validEmailValidator]],
      documentType: ['', Validators.required],
      documentNumber: ['', [Validators.required, Validators.maxLength(20)]],

      // Contraseñas
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50), this.strongPasswordValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // 🔹 Validadores
  noOnlySpacesValidator(control: AbstractControl): ValidationErrors | null {
    return control.value && control.value.trim() === '' ? { onlySpaces: true } : null;
  }

  noSpecialCharactersValidator(control: AbstractControl): ValidationErrors | null {
    return control.value && !/^[a-zA-ZÀ-ÿ0-9\s\.\-]+$/.test(control.value)
      ? { invalidCharacters: true } : null;
  }

  validEmailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return regex.test(control.value) ? null : { invalidEmail: true };
  }

  strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = control.value;
    const valid = /[0-9]/.test(value) && /[a-z]/.test(value) && /[A-Z]/.test(value) && /[#?!@$%^&*-]/.test(value);
    return valid ? null : { weakPassword: true };
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
  }

  // 🔹 Acciones
  togglePasswordVisibility() { this.showPassword = !this.showPassword; }
  toggleConfirmPasswordVisibility() { this.showConfirmPassword = !this.showConfirmPassword; }

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(field: string): string {
    const control = this.registerForm.get(field);
    if (!control || !control.errors) {
      if (field === 'confirmPassword' && this.registerForm.hasError('passwordMismatch')) {
        return 'Las contraseñas no coinciden';
      }
      return '';
    }

    const messages: Record<string, string> = {
      required: 'Este campo es obligatorio',
      minlength: `Debe tener al menos ${control.getError('minlength')?.requiredLength} caracteres`,
      maxlength: `Debe tener máximo ${control.getError('maxlength')?.requiredLength} caracteres`,
      pattern: 'Formato inválido',
      email: 'Correo inválido',
      onlySpaces: 'No puede contener solo espacios',
      invalidCharacters: 'Contiene caracteres no válidos',
      invalidEmail: 'Correo inválido',
      weakPassword: 'Debe incluir mayúsculas, minúsculas, números y símbolos'
    };

    const firstErrorKey = Object.keys(control.errors)[0];
    return messages[firstErrorKey] || 'Error en el campo';
  }

  // 🔹 Enviar al backend con AuthService
onSubmit() {
  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    return;
  }

  this.isLoading = true;
  const formValue = this.registerForm.value;

    // ✅ Mapeo corregido según AuthController
    const dataToSend = {
      razon_social: formValue.businessName,
      nit: formValue.nit,
      correo_empresa: formValue.companyEmail,     // 🔹 Laravel espera este nombre
      nombre: formValue.firstName,
      correo_electronico: formValue.adminEmail,   // 🔹 login admin
      tipo_documento: formValue.documentType,
      numero_documento: formValue.documentNumber,
      password: formValue.password,
      password_confirmation: formValue.confirmPassword
    };

    this.authService.register(dataToSend).subscribe({
      next: () => {
        this.showNotification('Registro exitoso 🚀', 'success');
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/configuracion']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        let errorMessage = 'Error en el registro';

        if (err.error) {
          if (err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error.errors) {
            const firstField = Object.keys(err.error.errors)[0];
            errorMessage = err.error.errors[firstField][0];
          }
        }

        this.showNotification(errorMessage, 'error');
        this.isLoading = false;
      }
    });
  }

  private showNotification(message: string, type: 'success' | 'error') {
    this.notification = { show: true, message, type };
    setTimeout(() => { this.notification.show = false; }, 4000);
  }

  navigateToLogin() { this.router.navigate(['/login']); }
  navigateToTerms() { this.router.navigate(['/terms-conditions']); }
}
