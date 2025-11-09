import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../services/client.service';

export interface NuevoClienteForm {
  first_name: string;
  document_type: string;
  document_number: string;
  address: string;
  country: string;
  description: string;
  password: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-nuevo-cliente',
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-cliente.html',
  styleUrl: './nuevo-cliente.css'
})
export class NuevoCliente implements OnInit {
  
  // Formulario
  clienteForm: NuevoClienteForm = {
    first_name: '',
    document_type: '',
    document_number: '',
    address: '',
    country: '',
    description: '',
    password: '',
    email: '',
    phone: ''
  };

  // Estados
  isLoading: boolean = false;
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'info';
  showCancelConfirm: boolean = false;

  // Opciones para selects - Solo los tipos validados por la API
  tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'NIT', label: 'NIT' }
  ];

  constructor(
    private router: Router,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    // Probar conexión con la API al inicializar
    this.testApiConnection();
  }

  /**
   * Probar conexión con la API
   */
  private testApiConnection(): void {
    this.clientService.testApiConnection().subscribe({
      next: (response) => {
        console.log('Conexión con API exitosa:', response);
      },
      error: (error) => {
        console.error('Error de conexión con API:', error);
        this.mostrarAlerta('Error de conexión con el servidor', 'error');
      }
    });
  }

  // Generar contraseña automáticamente cuando se ingrese el número de documento
  onNumeroDocumentoChange(): void {
    if (this.clienteForm.document_number && this.clienteForm.document_number.trim() !== '') {
      this.clienteForm.password = this.generarContraseñaSegura(this.clienteForm.document_number);
    } else {
      this.clienteForm.password = '';
    }
  }

  // Generar contraseña segura basada en el número de documento
  private generarContraseñaSegura(numeroDocumento: string): string {
    try {
      // Generar una contraseña más segura que cumpla con el mínimo de 8 caracteres
      const timestamp = Date.now().toString();
      const randomPart = Math.random().toString(36).substring(2, 6);
      const docPart = numeroDocumento.substring(-4); // Últimos 4 dígitos del documento
      
      // Combinar partes y asegurar al menos 8 caracteres
      const password = `${docPart}${randomPart}${timestamp.slice(-2)}`;
      
      return password.length >= 8 ? password : password + '123';
    } catch (error) {
      console.error('Error generando contraseña:', error);
      return numeroDocumento + '12345678'; // Fallback que garantiza 8+ caracteres
    }
  }

  // Validación del formulario según las reglas de la API
  validarFormulario(): boolean {
    // Campos obligatorios según la validación de la API
    const camposObligatorios = [
      'first_name',
      'document_number',
      'email',
      'password'
    ];

    for (const campo of camposObligatorios) {
      const valor = this.clienteForm[campo as keyof NuevoClienteForm];
      if (!valor || valor.toString().trim() === '') {
        this.mostrarAlerta(`El campo ${this.getNombreCampo(campo)} es obligatorio`, 'error');
        return false;
      }
    }

    // Validar longitud del nombre (máx 100 caracteres)
    if (this.clienteForm.first_name.trim().length > 100) {
      this.mostrarAlerta('El nombre no puede exceder 100 caracteres', 'error');
      return false;
    }

    // Validar longitud del número de documento (máx 50 caracteres)
    if (this.clienteForm.document_number.trim().length > 50) {
      this.mostrarAlerta('El número de documento no puede exceder 50 caracteres', 'error');
      return false;
    }

    // Validar email y su longitud (máx 150 caracteres)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.clienteForm.email)) {
      this.mostrarAlerta('El correo electrónico no tiene un formato válido', 'error');
      return false;
    }
    if (this.clienteForm.email.length > 150) {
      this.mostrarAlerta('El correo electrónico no puede exceder 150 caracteres', 'error');
      return false;
    }

    // Validar contraseña (mínimo 8 caracteres)
    if (this.clienteForm.password.length < 8) {
      this.mostrarAlerta('La contraseña debe tener al menos 8 caracteres', 'error');
      return false;
    }

    // Validaciones opcionales con longitudes máximas
    if (this.clienteForm.address && this.clienteForm.address.length > 150) {
      this.mostrarAlerta('La dirección no puede exceder 150 caracteres', 'error');
      return false;
    }

    if (this.clienteForm.country && this.clienteForm.country.length > 100) {
      this.mostrarAlerta('El país no puede exceder 100 caracteres', 'error');
      return false;
    }

    if (this.clienteForm.description && this.clienteForm.description.length > 250) {
      this.mostrarAlerta('La descripción no puede exceder 250 caracteres', 'error');
      return false;
    }

    if (this.clienteForm.phone && this.clienteForm.phone.length > 20) {
      this.mostrarAlerta('El teléfono no puede exceder 20 caracteres', 'error');
      return false;
    }

    return true;
  }

  // Obtener nombre legible del campo
  private getNombreCampo(campo: string): string {
    const nombres: { [key: string]: string } = {
      'first_name': 'Nombre',
      'document_type': 'Tipo de Documento',
      'document_number': 'Número de Documento',
      'email': 'Correo Electrónico',
      'password': 'Contraseña',
      'country': 'País',
      'address': 'Dirección'
    };
    return nombres[campo] || campo;
  }

  // Registrar cliente
  registrarCliente(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isLoading = true;
    this.mostrarAlerta('Registrando cliente...', 'info');

    // Preparar datos para la API según la validación requerida
    const clienteData = {
      first_name: this.clienteForm.first_name.trim(),
      document_number: this.clienteForm.document_number.trim(),
      email: this.clienteForm.email.trim(),
      password: this.clienteForm.password,
      role_id: 4,
      status: 'Active',
      ...(this.clienteForm.document_type && { document_type: this.clienteForm.document_type }),
      ...(this.clienteForm.address?.trim() && { address: this.clienteForm.address.trim() }),
      ...(this.clienteForm.country?.trim() && { country: this.clienteForm.country.trim() }),
      ...(this.clienteForm.description?.trim() && { description: this.clienteForm.description.trim() }),
      ...(this.clienteForm.phone?.trim() && { phone: this.clienteForm.phone.trim() })
    };

    console.log('Datos a enviar:', clienteData); // Para depuración

    // Llamar al servicio para crear el cliente
    this.clientService.createCliente(clienteData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Cliente creado exitosamente:', response);
        this.mostrarAlerta('Cliente registrado exitosamente', 'success');
        this.limpiarFormulario();
        
        // Redirigir a la lista de clientes después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/clientes']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al registrar cliente:', error);
        
        // Mostrar error específico
        let mensajeError = 'Error al registrar el cliente. Inténtelo de nuevo.';
        
        // Manejar errores específicos de validación
        if (error.includes('422')) {
          mensajeError = 'Datos inválidos. Verifique que el número de documento y correo no estén ya registrados.';
        } else if (error.includes('unique')) {
          mensajeError = 'El número de documento o correo electrónico ya están registrados.';
        }
        
        this.mostrarAlerta(mensajeError, 'error');
      }
    });
  }

  // Cancelar y volver a la lista
  cancelar(): void {
    this.showCancelConfirm = true;
  }

  confirmarCancelar(): void {
    this.showCancelConfirm = false;
    this.router.navigate(['/clientes']);
  }

  cerrarConfirmarCancelar(): void {
    this.showCancelConfirm = false;
  }

  // Limpiar formulario
  limpiarFormulario(): void {
    this.clienteForm = {
      first_name: '',
      document_type: '',
      document_number: '',
      address: '',
      country: '',
      description: '',
      password: '',
      email: '',
      phone: ''
    };
  }

  // Mostrar alertas
  mostrarAlerta(mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info'): void {
    this.alertMessage = mensaje;
    this.alertType = tipo;
    this.showAlert = true;

    // Auto-ocultar alerta después de 5 segundos (excepto errores)
    const timeout = tipo === 'error' ? 8000 : 5000;
    setTimeout(() => {
      this.showAlert = false;
    }, timeout);
  }

  // Cerrar alerta manualmente
  cerrarAlerta(): void {
    this.showAlert = false;
  }

  // Obtener clases CSS para las alertas
  getAlertClasses(): string {
    const baseClasses = 'fixed top-20 right-4 px-6 py-4 rounded-xl shadow-md z-50 animate-fade-in border';
    
    switch (this.alertType) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-100 text-green-700`;
      case 'error':
        return `${baseClasses} bg-rose-50 border-rose-100 text-rose-700`;
      case 'warning':
        return `${baseClasses} bg-amber-50 border-amber-100 text-amber-700`;
      case 'info':
        return `${baseClasses} bg-sky-50 border-sky-100 text-sky-700`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-100 text-gray-700`;
    }
  }
}