import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService } from '../services/client.service';

export interface EditarClienteForm {
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
  selector: 'app-editar-cliente',
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-cliente.html',
  styleUrl: './editar-cliente.css'
})
export class EditarCliente implements OnInit {
  
  // Formulario
  clienteForm: EditarClienteForm = {
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
  isLoadingData: boolean = false;
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'info';
  clienteId: number | null = null;

  // Opciones para selects
  tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'NIT', label: 'NIT' },
    { value: 'PP', label: 'Pasaporte' },
    { value: 'RC', label: 'Registro Civil' }
  ];


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    // Obtener el ID del cliente desde la ruta
    this.clienteId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.clienteId) {
      this.mostrarAlerta('ID de cliente no válido', 'error');
      this.router.navigate(['/clientes']);
      return;
    }
    
    // Cargar datos del cliente
    this.cargarDatosCliente();
  }

  // Generar contraseña automáticamente cuando se ingrese el número de documento
  onNumeroDocumentoChange(): void {
    if (this.clienteForm.document_number && this.clienteForm.document_number.trim() !== '') {
      this.clienteForm.password = this.generarContraseñaEncriptada(this.clienteForm.document_number);
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

  // Cargar datos del cliente para editar
  cargarDatosCliente(): void {
    this.isLoadingData = true;
    this.mostrarAlerta('Cargando datos del cliente...', 'info');

    this.clientService.getClienteById(this.clienteId!).subscribe({
      next: (cliente) => {
        this.isLoadingData = false;
        this.popularFormulario(cliente);
        this.mostrarAlerta('Datos del cliente cargados correctamente', 'success');
      },
      error: (error) => {
        this.isLoadingData = false;
        console.error('Error al cargar cliente:', error);
        this.mostrarAlerta('Error al cargar los datos del cliente', 'error');
        setTimeout(() => {
          this.router.navigate(['/clientes']);
        }, 2000);
      }
    });
  }

  // Popular el formulario con los datos del cliente
  private popularFormulario(cliente: any): void {
    this.clienteForm = {
      first_name: cliente.first_name || cliente.nombre || cliente.name || '',
      document_type: cliente.document_type || cliente.tipo_documento || '',
      document_number: cliente.document_number || cliente.numero_documento || '',
      address: cliente.address || cliente.direccion || '',
      country: cliente.country || cliente.pais || '',
      description: cliente.description || cliente.descripcion || '',
      password: cliente.password || cliente.contrasena || '',
      email: cliente.email || cliente.correo_electronico || '',
      phone: cliente.phone || cliente.telefono || ''
    };
  }

  // Validación del formulario
  validarFormulario(): boolean {
    const camposObligatorios = [
      'first_name',
      'document_type', 
      'document_number',
      'email',
      'country',
      'address'
    ];

    for (const campo of camposObligatorios) {
      if (!this.clienteForm[campo as keyof EditarClienteForm]?.trim()) {
        this.mostrarAlerta(`El campo ${this.getNombreCampo(campo)} es obligatorio`, 'error');
        return false;
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.clienteForm.email)) {
      this.mostrarAlerta('El correo electrónico no tiene un formato válido', 'error');
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
      'country': 'País',
      'address': 'Dirección'
    };
    return nombres[campo] || campo;
  }

  // Actualizar cliente
  actualizarCliente(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isLoading = true;
    this.mostrarAlerta('Actualizando cliente...', 'info');

    // Preparar datos para la API
    const clienteData = {
      first_name: this.clienteForm.first_name,
      document_type: this.clienteForm.document_type,
      document_number: this.clienteForm.document_number,
      address: this.clienteForm.address,
      country: this.clienteForm.country,
      description: this.clienteForm.description,
      password: this.clienteForm.password,
      email: this.clienteForm.email,
      phone: this.clienteForm.phone,
      role_id: 4
    };

    // Llamar al servicio para actualizar el cliente
    this.clientService.updateCliente(this.clienteId!, clienteData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.mostrarAlerta('Cliente actualizado exitosamente', 'success');
        
        // Redirigir a la lista de clientes después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/clientes']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al actualizar cliente:', error);
        this.mostrarAlerta('Error al actualizar el cliente. Inténtelo de nuevo.', 'error');
      }
    });
  }

  // Cancelar y volver a la lista
  cancelar(): void {
    this.router.navigate(['/clientes']);
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