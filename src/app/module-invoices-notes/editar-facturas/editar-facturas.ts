import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { InvoicesNotesService } from '../services/invoices-notes.service';

@Component({
  selector: 'app-editar-factura',
  standalone: true,
  imports: [FormsModule, CommonModule, DecimalPipe],
  templateUrl: './editar-facturas.html',
  styleUrls: ['./editar-facturas.css']
})
export class EditarFactura implements OnInit {
  factura: any = {}; // aquí se cargará la factura seleccionada
  isSidebarOpen: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoicesNotesService: InvoicesNotesService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/facturas-notas']);
      return;
    }
    this.cargarFactura(id);
  }

  private cargarFactura(id: number): void {
    this.isLoading = true;
    this.invoicesNotesService.getInvoiceNoteById(id).subscribe({
      next: (data) => {
        this.factura = this.mapApiToForm(data);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'No se pudo cargar la factura';
      }
    });
  }

  private mapApiToForm(item: any): any {
    const fechaISO: string = item?.fecha_emision ?? '';
    let fechaEmision = '';
    let horaEmision = '';
    if (fechaISO) {
      const date = new Date(fechaISO);
      if (!isNaN(date.getTime())) {
        fechaEmision = date.toISOString().slice(0, 10);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        horaEmision = `${hours}:${minutes}`;
      }
    }

    return {
      id: Number(item?.id ?? 0),
      numero: String(item?.numero_factura ?? ''),
      // Cliente
      cliente: String(item?.user?.nombre ?? ''),
      tipoDocumento: String(item?.user?.tipo_documento ?? ''),
      documento: String(item?.user?.numero_documento ?? ''),
      tipoPersona: String(item?.user?.tipo_persona ?? ''),
      email: String(item?.user?.correo_electronico ?? ''),
      telefono: String(item?.user?.telefono ?? ''),
      pais: String(item?.user?.pais ?? ''),
      direccion: String(item?.user?.direccion ?? ''),
      regimen: String(item?.user?.regimen ?? ''),
      // Factura
      fechaEmision,
      horaEmision,
      medioPago: String(item?.medio_pago ?? ''),
      formaPago: String(item?.forma_pago ?? ''),
      observaciones: String(item?.observacion ?? ''),
      // Item simple (si existiera colección, se puede extender)
      codigo: String(item?.detalle?.codigo ?? ''),
      descripcion: String(item?.detalle?.descripcion ?? ''),
      unidad: String(item?.detalle?.unidad ?? ''),
      cantidad: Number(item?.detalle?.cantidad ?? 0),
      valorUnitario: Number(item?.detalle?.valor_unitario ?? 0),
      exento: String(item?.detalle?.exento ?? 'NO'),
      // Resumen
      subtotal: Number(item?.sub_total ?? 0),
      totalImpuestos: Number(item?.total_impuesto ?? 0),
      descuento: Number(item?.descuento ?? 0),
      total: Number(item?.total_factura ?? 0)
    };
  }

  guardarCambios(): void {
    // Construir payload mínimo para actualización
    const payload = {
      id: this.factura.id,
      observacion: this.factura.observaciones,
      fecha_emision: this.factura.fechaEmision,
      // Si el backend soporta parciales, enviamos lo necesario
    };
    this.invoicesNotesService.updateInvoiceNote(payload).subscribe({
      next: () => {
        this.router.navigate(['/facturas-notas'], {
          queryParams: { mensaje: 'Factura actualizada correctamente' }
        });
      },
      error: () => {
        this.errorMessage = 'No se pudo actualizar la factura';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/facturas-notas']);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
