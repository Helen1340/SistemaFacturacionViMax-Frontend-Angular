import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acceder',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './acceder.html',
  styleUrl: './acceder.css'
})
export class Acceder {
  loginForm: FormGroup;
  showPassword: boolean = false;
  isLoading: boolean = false;
  
  notification = {
    show: false,
    message: '',
    type: 'success' // 'success' | 'error'
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Inicialización adicional si es necesaria
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      const loginData = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      // Simular llamada a API
      this.simulateLogin(loginData);
    } else {
      this.markFormGroupTouched();
    }
  }

  private simulateLogin(loginData: any): void {
    // Aquí iría tu llamada real al servicio de autenticación
    setTimeout(() => {
      this.isLoading = false;
      
      // Simulamos una respuesta exitosa
      if (loginData.email && loginData.password) {
        this.showNotification('Inicio de sesión exitoso', 'success');
        
        // Redirigir al dashboard o página principal después del login
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      } else {
        this.showNotification('Credenciales inválidas', 'error');
      }
    }, 2000);
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
    this.notification = {
      show: true,
      message: message,
      type: type
    };

    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
      this.notification.show = false;
    }, 3000);
  }

  // Método para manejar el "Olvidaste tu contraseña"
  onForgotPassword(): void {
    // Aquí puedes implementar la lógica para recuperar contraseña
    this.router.navigate(['/forgot-password']);
    // O mostrar un modal, etc.
  }
}
