import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../services/client.service';

export interface NuevoClienteForm {
  nombre: string;
  tipo_documento: string;
  numero_documento: string;
  direccion: string;
  pais: string;
  descripcion: string;
  password: string; // Cambiado de 'contrasena' a 'password'
  correo_electronico: string;
  telefono: string;
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
    nombre: '',
    tipo_documento: '',
    numero_documento: '',
    direccion: '',
    pais: '',
    descripcion: '',
    password: '',
    correo_electronico: '',
    telefono: ''
  };

  // Estados
  isLoading: boolean = false;
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'info';

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
    if (this.clienteForm.numero_documento && this.clienteForm.numero_documento.trim() !== '') {
      this.clienteForm.password = this.generarContraseñaSegura(this.clienteForm.numero_documento);
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
      'nombre',
      'numero_documento',
      'correo_electronico',
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
    if (this.clienteForm.nombre.trim().length > 100) {
      this.mostrarAlerta('El nombre no puede exceder 100 caracteres', 'error');
      return false;
    }

    // Validar longitud del número de documento (máx 50 caracteres)
    if (this.clienteForm.numero_documento.trim().length > 50) {
      this.mostrarAlerta('El número de documento no puede exceder 50 caracteres', 'error');
      return false;
    }

    // Validar email y su longitud (máx 150 caracteres)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.clienteForm.correo_electronico)) {
      this.mostrarAlerta('El correo electrónico no tiene un formato válido', 'error');
      return false;
    }
    if (this.clienteForm.correo_electronico.length > 150) {
      this.mostrarAlerta('El correo electrónico no puede exceder 150 caracteres', 'error');
      return false;
    }

    // Validar contraseña (mínimo 8 caracteres)
    if (this.clienteForm.password.length < 8) {
      this.mostrarAlerta('La contraseña debe tener al menos 8 caracteres', 'error');
      return false;
    }

    // Validaciones opcionales con longitudes máximas
    if (this.clienteForm.direccion && this.clienteForm.direccion.length > 150) {
      this.mostrarAlerta('La dirección no puede exceder 150 caracteres', 'error');
      return false;
    }

    if (this.clienteForm.pais && this.clienteForm.pais.length > 100) {
      this.mostrarAlerta('El país no puede exceder 100 caracteres', 'error');
      return false;
    }

    if (this.clienteForm.descripcion && this.clienteForm.descripcion.length > 250) {
      this.mostrarAlerta('La descripción no puede exceder 250 caracteres', 'error');
      return false;
    }

    if (this.clienteForm.telefono && this.clienteForm.telefono.length > 20) {
      this.mostrarAlerta('El teléfono no puede exceder 20 caracteres', 'error');
      return false;
    }

    return true;
  }

  // Obtener nombre legible del campo
  private getNombreCampo(campo: string): string {
    const nombres: { [key: string]: string } = {
      'nombre': 'Nombre',
      'tipo_documento': 'Tipo de Documento',
      'numero_documento': 'Número de Documento',
      'correo_electronico': 'Correo Electrónico',
      'password': 'Contraseña',
      'pais': 'País',
      'direccion': 'Dirección'
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
      nombre: this.clienteForm.nombre.trim(),
      numero_documento: this.clienteForm.numero_documento.trim(),
      correo_electronico: this.clienteForm.correo_electronico.trim(),
      password: this.clienteForm.password,
      role_id: 4, // ID del rol cliente según tu especificación
      estado: 'Activo',
      // Campos opcionales solo si tienen valor
      ...(this.clienteForm.tipo_documento && { tipo_documento: this.clienteForm.tipo_documento }),
      ...(this.clienteForm.direccion?.trim() && { direccion: this.clienteForm.direccion.trim() }),
      ...(this.clienteForm.pais?.trim() && { pais: this.clienteForm.pais.trim() }),
      ...(this.clienteForm.descripcion?.trim() && { descripcion: this.clienteForm.descripcion.trim() }),
      ...(this.clienteForm.telefono?.trim() && { telefono: this.clienteForm.telefono.trim() })
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
    if (confirm('¿Está seguro de que desea cancelar? Se perderán los datos ingresados.')) {
      this.router.navigate(['/clientes']);
    }
  }

  // Limpiar formulario
  limpiarFormulario(): void {
    this.clienteForm = {
      nombre: '',
      tipo_documento: '',
      numero_documento: '',
      direccion: '',
      pais: '',
      descripcion: '',
      password: '',
      correo_electronico: '',
      telefono: ''
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
    const baseClasses = 'fixed top-20 right-4 px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in';
    
    switch (this.alertType) {
      case 'success':
        return `${baseClasses} bg-green-50 border border-green-200 text-green-800`;
      case 'error':
        return `${baseClasses} bg-red-50 border border-red-200 text-red-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border border-yellow-200 text-yellow-800`;
      case 'info':
        return `${baseClasses} bg-blue-50 border border-blue-200 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-50 border border-gray-200 text-gray-800`;
    }
  }
}