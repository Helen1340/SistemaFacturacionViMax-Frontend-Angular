import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService } from '../services/client.service';

export interface EditarClienteForm {
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
  selector: 'app-editar-cliente',
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-cliente.html',
  styleUrl: './editar-cliente.css'
})
export class EditarCliente implements OnInit {
  
  // Formulario
  clienteForm: EditarClienteForm = {
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
  isLoadingData: boolean = false;
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'info';
  clienteId: number | null = null;

  // Opciones para selects
  tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'NIT', label: 'NIT' }
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
      nombre: cliente.nombre || cliente.name || '',
      tipo_documento: cliente.tipo_documento || cliente.document_type || '',
      numero_documento: cliente.numero_documento || cliente.document_number || '',
      direccion: cliente.direccion || cliente.address || '',
      pais: cliente.pais || cliente.country || '',
      descripcion: cliente.descripcion || cliente.description || '',
      contrasena: cliente.contrasena || cliente.password || '',
      correo_electronico: cliente.correo_electronico || cliente.email || '',
      telefono: cliente.telefono || cliente.phone || ''
    };
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
      if (!this.clienteForm[campo as keyof EditarClienteForm]?.trim()) {
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

  // Actualizar cliente
  actualizarCliente(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isLoading = true;
    this.mostrarAlerta('Actualizando cliente...', 'info');

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
      telefono: this.clienteForm.telefono
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