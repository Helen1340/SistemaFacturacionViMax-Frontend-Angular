import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface UserRegistrationData {
  firstName: string;
  email: string;
  password: string;
}

interface CompanyRegistrationData {
  commercialName: string;
  adminUserId: string;
}

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

  notification = { show: false, message: '', type: 'success' as 'success' | 'error' };

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/),
        this.noOnlySpacesValidator   // 👈 evita solo espacios
      ]],
      commercialName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.noSpecialCharactersValidator,
        this.noOnlySpacesValidator   // 👈 evita solo espacios
      ]],
      email: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        Validators.maxLength(100)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
        this.strongPasswordValidator
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // 🔹 Validadores personalizados
  noOnlySpacesValidator(control: AbstractControl) {
    return control.value && control.value.trim() === ''
      ? { onlySpaces: true }
      : null;
  }

  noSpecialCharactersValidator(control: AbstractControl) {
    return control.value && !/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/.test(control.value)
      ? { invalidCharacters: true }
      : null;
  }

  strongPasswordValidator(control: AbstractControl) {
    const value = control.value;
    if (!value) return null;
    const valid = /[0-9]/.test(value) && /[a-z]/.test(value) && /[A-Z]/.test(value) && /[#?!@$%^&*-]/.test(value);
    return valid ? null : { weakPassword: true };
  }

  passwordMatchValidator(group: AbstractControl) {
    const password = group.get('password');
    const confirm = group.get('confirmPassword');
  
    if (password?.value !== confirm?.value) {
      confirm?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirm?.hasError('passwordMismatch')) {
        confirm.setErrors(null);
      }
      return null;
    }
  }

  // 🔹 Utilidades
  togglePasswordVisibility() { this.showPassword = !this.showPassword; }
  toggleConfirmPasswordVisibility() { this.showConfirmPassword = !this.showConfirmPassword; }

  isFieldInvalid(field: string) {
    const control = this.registerForm.get(field);
    return control?.invalid && (control.dirty || control.touched);
  }

  getFieldError(field: string): string {
    const errors = this.registerForm.get(field)?.errors;
    if (!errors) return '';

    const messages: Record<string, string> = {
      required: 'Este campo es obligatorio',
      minlength: 'El valor es demasiado corto',
      maxlength: 'El valor es demasiado largo',
      pattern: field === 'email' ? 'Correo inválido' : 'Formato inválido',
      invalidCharacters: 'El nombre comercial contiene caracteres no válidos',
      onlySpaces: 'No puede contener solo espacios',
      weakPassword: 'Debe incluir mayúsculas, minúsculas, números y símbolos',
      passwordMismatch: 'Las contraseñas no coinciden'
    };

    const errorKey = Object.keys(errors)[0];
    return messages[errorKey] || 'Error en el campo';
  }

  // 🔹 Envío de formulario
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { firstName, email, password, commercialName } = this.registerForm.value;

    const userData: UserRegistrationData = { firstName: firstName.trim(), email: email.trim().toLowerCase(), password };
    this.processRegistration(userData, commercialName.trim());
  }

  private async processRegistration(userData: UserRegistrationData, commercialName: string) {
    try {
      const userResponse = await this.simulateUserRegistration(userData);

      if (!userResponse.success) return this.showNotification('Error al crear el usuario', 'error');

      const companyResponse = await this.simulateCompanyRegistration({
        commercialName,
        adminUserId: userResponse.userId
      });

      if (!companyResponse.success) return this.showNotification('Error al crear la empresa', 'error');

      this.showNotification('Cuenta y empresa creadas exitosamente', 'success');
      setTimeout(() => this.router.navigate(['/configuracion']), 1500);
    } catch {
      this.showNotification('Error inesperado. Intenta nuevamente.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // 🔹 Simulación de servicios (para pruebas)
  private simulateUserRegistration(user: UserRegistrationData): Promise<{ success: boolean; userId: string }> {
    return new Promise(resolve => setTimeout(() =>
      resolve(user.email === 'test@exist.com' ? { success: false, userId: '' } : { success: true, userId: 'user_' + Date.now() })
    , 1000));
  }

  private simulateCompanyRegistration(company: CompanyRegistrationData): Promise<{ success: boolean; companyId: string }> {
    return new Promise(resolve => setTimeout(() =>
      resolve({ success: true, companyId: 'company_' + Date.now() })
    , 1000));
  }

  // 🔹 Notificaciones
  private showNotification(message: string, type: 'success' | 'error') {
    this.notification = { show: true, message, type };
    setTimeout(() => (this.notification.show = false), 3000);
  }

  navigateToLogin() { this.router.navigate(['/login']); }
  navigateToTerms() { this.router.navigate(['/terms-conditions']); }
}
