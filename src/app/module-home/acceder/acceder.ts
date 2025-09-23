import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/Auth.Service';

@Component({
  selector: 'app-acceder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './acceder.html',
  styleUrls: ['./acceder.css']
})
export class Acceder {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;

  notification = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      correo_electronico: ['', [Validators.required, Validators.email]], // 👈 coincide con el backend
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;

    const loginData = {
      correo_electronico: this.loginForm.get('correo_electronico')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(loginData).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res && res.access_token) {
          // ✅ Guardar token en localStorage con AuthService
          this.authService.setToken(res.access_token);

          this.showNotification('Inicio de sesión exitoso 🚀', 'success');

          // ✅ Redirigir a facturas-notas
          this.router.navigate(['/facturas-notas']);
        } else {
          this.showNotification('Error: no se recibió el token', 'error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error en login:', err);

        let errorMessage = 'Error en inicio de sesión';
        if (err.error) {
          if (err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error.errors) {
            const firstField = Object.keys(err.error.errors)[0];
            errorMessage = err.error.errors[firstField][0];
          }
        }

        this.showNotification(errorMessage, 'error');
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/registro']);
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = { show: true, message, type };

    setTimeout(() => {
      this.notification.show = false;
    }, 3000);
  }

  onForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
