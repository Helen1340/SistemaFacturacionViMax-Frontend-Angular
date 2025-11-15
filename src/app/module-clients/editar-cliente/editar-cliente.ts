import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService } from '../services/client.service';

export interface EditarClienteForm {
  first_name: string;
  document_type: string;
  document_number: string;
  address?: string;
  country?: string;
  description?: string;
  email: string;
  phone?: string;
  status?: string;
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
    document_type: 'CC',
    document_number: '',
    email: '',
    status: 'Active'
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

  estados = [
    { value: 'Active', label: 'Activo' },
    { value: 'Inactive', label: 'Inactivo' }
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
      first_name: cliente.first_name || '',
      document_type: cliente.document_type || 'CC',
      document_number: cliente.document_number || '',
      address: cliente.address || '',
      country: cliente.country || '',
      description: cliente.description || '',
      email: cliente.email || '',
      phone: cliente.phone || '',
      status: cliente.status || 'Active'
    };
  }

  // Validación del formulario
  validarFormulario(): boolean {
    if (!this.clienteForm.first_name?.trim()) {
      this.mostrarAlerta('El nombre es obligatorio', 'error');
      return false;
    }

    if (!this.clienteForm.document_number?.trim()) {
      this.mostrarAlerta('El número de documento es obligatorio', 'error');
      return false;
    }

    if (!this.clienteForm.email?.trim()) {
      this.mostrarAlerta('El correo electrónico es obligatorio', 'error');
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.clienteForm.email)) {
      this.mostrarAlerta('El correo electrónico no tiene un formato válido', 'error');
      return false;
    }

    return true;
  }

  // Actualizar cliente
  actualizarCliente(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isLoading = true;
    this.mostrarAlerta('Actualizando cliente...', 'info');

    // Preparar datos para la API - SOLO campos que pueden cambiar
    const clienteData: any = {
      first_name: this.clienteForm.first_name.trim(),
      document_type: this.clienteForm.document_type,
      document_number: this.clienteForm.document_number.trim(),
      email: this.clienteForm.email.trim(),
      status: this.clienteForm.status,
      ...(this.clienteForm.address && { address: this.clienteForm.address.trim() }),
      ...(this.clienteForm.country && { country: this.clienteForm.country.trim() }),
      ...(this.clienteForm.description && { description: this.clienteForm.description.trim() }),
      ...(this.clienteForm.phone && { phone: this.clienteForm.phone.trim() })
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
        
        let errorMsg = 'Error al actualizar el cliente';
        if (error.includes('Datos inválidos o repetidos')) {
          errorMsg = 'El número de documento o email ya existen en el sistema';
        } else if (error.includes('No se puede conectar')) {
          errorMsg = 'Error de conexión con el servidor';
        }
        
        this.mostrarAlerta(errorMsg, 'error');
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