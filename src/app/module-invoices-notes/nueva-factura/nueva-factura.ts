import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nueva-factura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nueva-factura.html',
  styleUrl: './nueva-factura.css'
})
export class NuevaFactura implements AfterViewInit {
  private isValidated: boolean = false;
  // Alertas personalizadas
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'info' | 'warning' | 'error' = 'success';
  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.addEventListener('click', this.toggleSidebar);
    }
  }

  toggleSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (!sidebar || !overlay) {
      return;
    }
    const isHidden = sidebar.classList.contains('-translate-x-full');
    sidebar.classList.toggle('-translate-x-full', !isHidden);
    overlay.classList.toggle('hidden', !isHidden);
  }

  cancelar(): void {
    this.router.navigate(['/facturas-notas']);
  }

  emitirFactura(): void {
    if (!this.isValidated) {
      this.mostrarAlerta('Primero valida la factura y corrige los campos obligatorios.', 'warning');
      return;
    }
    if (!this.validarCampos()) return;
    const nuevaFactura = this.crearFactura('Emitida');
    this.router.navigate(['/facturas-notas'], {
      queryParams: {
        mensaje: 'Factura emitida correctamente',
        nuevaFactura: JSON.stringify(nuevaFactura)
      }
    });
  }

  guardarComoBorrador(): void {
    if (!this.isValidated) {
      this.mostrarAlerta('Primero valida la factura y corrige los campos obligatorios.', 'warning');
      return;
    }
    if (!this.validarCampos()) return;
    const nuevaFactura = this.crearFactura('Borrador');
    this.router.navigate(['/facturas-notas'], {
      queryParams: {
        mensaje: 'Factura guardada como borrador exitosamente',
        nuevaFactura: JSON.stringify(nuevaFactura)
      }
    });
  }

  validarFactura(): void {
    this.isValidated = false;
    if (!this.validarCampos()) return;
    this.isValidated = true;
    this.mostrarAlerta('Factura validada correctamente', 'success');
  }

  private crearFactura(estado: 'Emitida' | 'Borrador') {
    const numeroFactura = this.generarNumeroFactura();

    const nombreCliente = this.obtenerValorInput('input[type="text"]:first-of-type') || 'Cliente sin nombre';
    const email = this.obtenerValorInput('input[type="email"]') || '';
    const observaciones = this.obtenerValorInput('input[type="text"]:last-of-type') || '';
    const cantidad = parseFloat(this.obtenerValorInput('input[type="number"]:first-of-type') || '0');
    const valorUnitario = parseFloat(this.obtenerValorInput('input[type="number"]:last-of-type') || '0');
    const total = cantidad * valorUnitario;

    const descripcion = this.obtenerValorInput('input[type="text"]:nth-of-type(2)') || '';

    return {
      id: Date.now(),
      numero: numeroFactura,
      cliente: nombreCliente,
      total: total,
      notas: observaciones || descripcion,
      dian: estado === 'Emitida' ? 'Pendiente' : '',
      email: email,
      alerta: total > 0 ? '' : 'Revisar total',
      estado: estado
    };
  }

  private generarNumeroFactura(): string {
    const timestamp = Date.now();
    const numero = (timestamp % 10000).toString().padStart(4, '0');
    return `FAC-${numero}`;
  }

  private obtenerValorInput(selector: string): string {
    const input = document.querySelector(selector) as HTMLInputElement;
    return input ? input.value.trim() : '';
  }

  private validarCampos(): boolean {
    const camposObligatorios: { selector: string; nombre: string }[] = [
      { selector: 'input[type="text"]:first-of-type', nombre: 'Nombre / Razón social' },
      { selector: 'input[name="documento"]', nombre: 'No. documento' },
      { selector: 'input[type="email"]', nombre: 'Correo electrónico' },
      { selector: 'input[type="date"]', nombre: 'Fecha de emisión' },
      { selector: 'input[type="time"]', nombre: 'Hora de emisión' },
      { selector: 'input[type="number"]:first-of-type', nombre: 'Cantidad' },
      { selector: 'input[type="number"]:last-of-type', nombre: 'Valor unitario' }
    ];

    for (const campo of camposObligatorios) {
      const valor = this.obtenerValorInput(campo.selector);
      if (!valor) {
        this.mostrarAlerta(`El campo "${campo.nombre}" es obligatorio.`, 'error');
        return false;
      }
    }

    return true;
  }

  // Alertas suaves reutilizables
  private mostrarAlerta(mensaje: string, tipo: 'success' | 'info' | 'warning' | 'error') {
    this.alertMessage = mensaje;
    this.alertType = tipo;
    this.showAlert = true;
    setTimeout(() => { this.showAlert = false; }, 3500);
  }
}
