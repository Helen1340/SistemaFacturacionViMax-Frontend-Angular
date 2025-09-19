import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoicesNotesService } from '../services/invoices-notes.service';

interface InvoiceDetailView {
  id: number;
  numero: string;
  fechaEmision: string;
  horaEmision: string;
  estadoInterno?: string;
  clienteNombre: string;
  clienteTipoDocumento: string;
  clienteNumeroDocumento: string;
  clienteCorreo: string;
  clientePais?: string;
  clienteDireccion?: string;
  clienteTelefono?: string;
  clienteRol?: string;
  subtotal: number;
  totalImpuesto: number;
  totalFactura: number;
  observacion?: string;
  notaAsociada?: string;
}

@Component({
  selector: 'app-detalle-facturas',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './detalle-facturas.html',
  styleUrl: './detalle-facturas.css'
})
export class DetalleFacturas implements OnInit {
  isLoading: boolean = false;
  isLoadingClient: boolean = false;
  isLoadingNote: boolean = false;
  invoice: InvoiceDetailView | null = null;
  clientInfo: any | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoicesNotesService: InvoicesNotesService
  ) { }

  ngOnInit(): void {
    this.loadInvoice();
  }

  private loadInvoice() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/facturas-notas']);
      return;
    }
    this.isLoading = true;
    this.invoicesNotesService.getInvoiceNoteById(id).subscribe({
      next: (data) => {
        this.invoice = this.mapApiToView(data);
        this.isLoading = false;
        // Cargar información completa del cliente si existe user_id
        if (data?.user_id) {
          this.loadClientInfo(data.user_id);
        }
        // Cargar nota asociada si existe relación
        const noteId = this.extractAssociatedNoteId(data);
        if (noteId) {
          this.loadAssociatedNote(noteId);
        } else if (this.invoice?.id) {
          // Si la factura no trae id de nota, buscar notas relacionadas a esta factura
          this.findNoteByInvoiceId(this.invoice.id);
        }
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/facturas-notas']);
      }
    });
  }

  private extractAssociatedNoteId(raw: any): number | null {
    const candidates = [raw?.credit_debit_note_id, raw?.nota_asociada, raw?.notaAsociada, raw?.note_id, raw?.nota_id];
    for (const c of candidates) {
      if (c === undefined || c === null) continue;
      const n = Number(c);
      if (!isNaN(n) && n > 0) return n;
    }
    return null;
  }
  private loadAssociatedNote(noteId: number) {
    this.isLoadingNote = true;
    this.invoicesNotesService.getCreditDebitNoteById(noteId).subscribe({
      next: (note) => {
        if (this.invoice) {
          this.invoice.notaAsociada = String(note?.tipo_documento ?? this.invoice.notaAsociada ?? '');
        }
        this.isLoadingNote = false;
      },
      error: (_e) => {
        // Silencioso si falla; mantener UI limpia
        this.isLoadingNote = false;
      }
    });
  }

  // Busca la nota cuya relación apunte a la factura actual (por id o número)
  private findNoteByInvoiceId(invoiceId: number) {
    this.isLoadingNote = true;
    this.invoicesNotesService.getCreditDebitNotes().subscribe({
      next: (notes) => {
        const list = Array.isArray(notes) ? notes : Array.isArray((notes as any)?.data) ? (notes as any).data : [];
        const match = list.find((n: any) => {
          const candidates = [n?.electronic_invoice_id, n?.invoice_id, n?.factura_id, n?.invoiceId, n?.facturaId];
          for (const cand of candidates) {
            if (cand !== undefined && cand !== null && Number(cand) === invoiceId) return true;
          }
          return false;
        });
        if (match && this.invoice) {
          this.invoice.notaAsociada = String(match?.tipo_documento ?? this.invoice.notaAsociada ?? '');
        }
        this.isLoadingNote = false;
      },
      error: () => {
        this.isLoadingNote = false;
      }
    });
  }

  private loadClientInfo(userId: number) {
    this.isLoadingClient = true;
    this.invoicesNotesService.getUserById(userId).subscribe({
      next: (user) => {
        this.clientInfo = user;
        this.isLoadingClient = false;
        // Actualizar la información del cliente en la factura si es necesario
        if (this.invoice && user) {
          this.updateInvoiceWithClientInfo(user);
        }
      },
      error: (error) => {
        console.error('Error cargando información del cliente:', error);
        this.isLoadingClient = false;
        // No redirigir, solo mostrar error en consola para no interrumpir la experiencia
      }
    });
  }

  private updateInvoiceWithClientInfo(user: any) {
    if (!this.invoice) return;
    
    this.invoice.clienteNombre = user.nombre || user.name;
    this.invoice.clienteTipoDocumento = user.tipo_documento || user.document_type;
    this.invoice.clienteNumeroDocumento = user.numero_documento || user.document_number;
    this.invoice.clienteCorreo = user.correo_electronico || user.email;
    this.invoice.clientePais = user.pais || user.country;
    this.invoice.clienteDireccion = user.direccion || user.address;
    this.invoice.clienteTelefono = user.telefono || user.phone;
  }


  private mapApiToView(item: any): InvoiceDetailView {
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
      fechaEmision,
      horaEmision,
      estadoInterno: String(item?.estado_interno ?? ''),
      clienteNombre: String(item?.user?.nombre ?? `Usuario #${item?.user_id ?? ''}`),
      clienteTipoDocumento: String(item?.user?.tipo_documento ?? ''),
      clienteNumeroDocumento: String(item?.user?.numero_documento ?? ''),
      clienteCorreo: String(item?.user?.correo_electronico ?? ''),
      clientePais: String(item?.user?.pais ?? ''),
      clienteDireccion: String(item?.user?.direccion ?? ''),
      clienteTelefono: String(item?.user?.telefono ?? ''),
      subtotal: Number(item?.sub_total ?? 0),
      totalImpuesto: Number(item?.total_impuesto ?? 0),
      totalFactura: Number(item?.total_factura ?? 0),
      observacion: String(item?.observacion ?? ''),
      notaAsociada: String(item?.nota_asociada ?? item?.notaAsociada ?? '')
    };
  }


  goBack(): void {
    this.router.navigate(['/facturas-notas']);
  }

  editInvoice(): void {
    if (this.invoice?.id) {
      this.router.navigate(['/editar-facturas', this.invoice.id]);
    }
  }
}


