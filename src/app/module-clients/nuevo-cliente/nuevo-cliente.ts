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
  contrasena: string;
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
    contrasena: '',
    correo_electronico: '',
    telefono: ''
  };

  // Estados
  isLoading: boolean = false;
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'info';

  // Opciones para selects
  tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'NIT', label: 'NIT' }
  ];

  regimenesTributarios = [
    { value: 'simplificado', label: 'Régimen Simplificado' },
    { value: 'comun', label: 'Régimen Común' },
    { value: 'gran_contribuyente', label: 'Gran Contribuyente' },
    { value: 'autorretenedor', label: 'Autorretenedor' }
  ];


  constructor(
    private router: Router,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    // Inicialización del componente
  }

  // Generar contraseña automáticamente cuando se ingrese el número de documento
  onNumeroDocumentoChange(): void {
    if (this.clienteForm.numero_documento && this.clienteForm.numero_documento.trim() !== '') {
      this.clienteForm.contrasena = this.generarContraseñaEncriptada(this.clienteForm.numero_documento);
    }
  }

  // Generar contraseña encriptada basada en el número de documento
  private generarContraseñaEncriptada(numeroDocumento: string): string {
    // Simular encriptación usando base64 y algunos caracteres especiales
    const timestamp = Date.now().toString();
    const combined = numeroDocumento + timestamp;
    
    // Crear un hash simple simulando encriptación
    let hash = '';
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash += String.fromCharCode((char + 7) % 94 + 33);
    }
    
    // Convertir a base64 para simular encriptación
    return btoa(hash).substring(0, 16);
  }

  // Validación del formulario
  validarFormulario(): boolean {
    const camposObligatorios = [
      'nombre',
      'tipo_documento', 
      'numero_documento',
      'correo_electronico',
      'pais',
      'direccion'
    ];

    for (const campo of camposObligatorios) {
      if (!this.clienteForm[campo as keyof NuevoClienteForm]?.trim()) {
        this.mostrarAlerta(`El campo ${this.getNombreCampo(campo)} es obligatorio`, 'error');
        return false;
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.clienteForm.correo_electronico)) {
      this.mostrarAlerta('El correo electrónico no tiene un formato válido', 'error');
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

    // Generar campos automáticos
    const role_id = 2; // Rol cliente (asumiendo que 2 es el ID del rol cliente)
    const company_id = Math.floor(Math.random() * 50) + 1; // ID aleatorio del 1 al 50
    const estado = 'Activo'; // Estado por defecto

    // Preparar datos para la API
    const clienteData = {
      nombre: this.clienteForm.nombre,
      tipo_documento: this.clienteForm.tipo_documento,
      numero_documento: this.clienteForm.numero_documento,
      direccion: this.clienteForm.direccion,
      pais: this.clienteForm.pais,
      descripcion: this.clienteForm.descripcion,
      contrasena: this.clienteForm.contrasena,
      correo_electronico: this.clienteForm.correo_electronico,
      telefono: this.clienteForm.telefono,
      role_id: role_id,
      company_id: company_id,
      estado: estado
    };

    // Llamar al servicio para crear el cliente
    this.clientService.createCliente(clienteData).subscribe({
      next: (response) => {
        this.isLoading = false;
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
        this.mostrarAlerta('Error al registrar el cliente. Inténtelo de nuevo.', 'error');
      }
    });
  }

  // Cancelar y volver a la lista
  cancelar(): void {
    this.router.navigate(['/clientes']);
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
      contrasena: '',
      correo_electronico: '',
      telefono: ''
    };
  }

  // Mostrar alertas
  mostrarAlerta(mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info'): void {
    this.alertMessage = mensaje;
    this.alertType = tipo;
    this.showAlert = true;

    // Auto-ocultar alerta después de 5 segundos
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
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
