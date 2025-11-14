import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../services/client.service';

export interface NuevoClienteForm {
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
  selector: 'app-nuevo-cliente',
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-cliente.html',
  styleUrls: ['./nuevo-cliente.css']
})
export class NuevoCliente implements OnInit {

  clienteForm: NuevoClienteForm = {
    first_name: '',
    document_type: 'CC',
    document_number: '',
    email: '',
    status: 'Active'
  };

  isLoading = false;
  showAlert = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'info';
  showCancelConfirm = false;

  tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'NIT', label: 'NIT' }
  ];

  estados = [
    { value: 'Active', label: 'Activo' },
    { value: 'Inactive', label: 'Inactivo' }
  ];

  constructor(private router: Router, private clientService: ClientService) {}

  ngOnInit(): void {
    // Inicializaciones si son necesarias
  }

  /** Genera password por defecto basado en documento */
  private generarPasswordDefecto(doc: string): string {
    const base = doc.slice(-4);
    return `${base}kqb256`; // 🔒 mismo patrón usado en tu backend
  }

  /** Validaciones básicas */
  validarFormulario(): boolean {
    const f = this.clienteForm;

    if (!f.first_name.trim()) return this.error('El nombre es obligatorio');
    if (!f.document_number.trim()) return this.error('El número de documento es obligatorio');
    if (!f.email.trim()) return this.error('El correo electrónico es obligatorio');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(f.email)) return this.error('El correo electrónico no es válido');

    return true;
  }

  /** Registro */
  registrarCliente(): void {
    if (!this.validarFormulario()) return;

    this.isLoading = true;
    this.mostrarAlerta('Registrando cliente...', 'info');

    const clienteData = {
      first_name: this.clienteForm.first_name.trim(),
      document_type: this.clienteForm.document_type || 'CC',
      document_number: this.clienteForm.document_number.trim(),
      email: this.clienteForm.email.trim(),
      password: this.generarPasswordDefecto(this.clienteForm.document_number.trim()),
      role_id: 4,
      status: this.clienteForm.status || 'Active',
      ...(this.clienteForm.address && { address: this.clienteForm.address.trim() }),
      ...(this.clienteForm.country && { country: this.clienteForm.country.trim() }),
      ...(this.clienteForm.description && { description: this.clienteForm.description.trim() }),
      ...(this.clienteForm.phone && { phone: this.clienteForm.phone.trim() })
    };

    this.clientService.createCliente(clienteData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Cliente creado:', response);
        this.mostrarAlerta('Cliente registrado exitosamente', 'success');
        this.limpiarFormulario();
        setTimeout(() => this.router.navigate(['/clientes']), 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al registrar:', error);
        this.mostrarAlerta(error, 'error');
      }
    });
  }

  /** Limpiar formulario */
  limpiarFormulario(): void {
    this.clienteForm = {
      first_name: '',
      document_type: 'CC',
      document_number: '',
      email: '',
      status: 'Active'
    };
  }

  /** Mostrar alerta */
  mostrarAlerta(msg: string, tipo: 'success' | 'error' | 'warning' | 'info'): void {
    this.alertMessage = msg;
    this.alertType = tipo;
    this.showAlert = true;
    setTimeout(() => (this.showAlert = false), tipo === 'error' ? 7000 : 4000);
  }

  private error(msg: string): boolean {
    this.mostrarAlerta(msg, 'error');
    return false;
  }

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

  getAlertClasses(): string {
    const base = 'fixed top-20 right-4 px-6 py-4 rounded-xl shadow-md z-50 animate-fade-in border';
    switch (this.alertType) {
      case 'success': return `${base} bg-green-50 border-green-100 text-green-700`;
      case 'error': return `${base} bg-rose-50 border-rose-100 text-rose-700`;
      case 'warning': return `${base} bg-amber-50 border-amber-100 text-amber-700`;
      default: return `${base} bg-sky-50 border-sky-100 text-sky-700`;
    }
  }
}