import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService, Invoice } from '../services/invoice.service';
import { Html5Qrcode } from 'html5-qrcode';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-detail.html',
  styleUrls: ['./invoice-detail.css']
})
export class InvoiceDetail implements OnInit, OnDestroy {
  invoice: Invoice | null = null;
  loading = true;
  error: string | null = null;
  invoiceId: number | null = null;
  qrCodeUrl: string | null = null;
  loadingQR = false;
  showQRScanner = false;
  scanResult: string | null = null;
  html5QrCode: Html5Qrcode | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.invoiceId = +id;
        this.loadInvoice(this.invoiceId);
      } else {
        this.error = 'ID de factura no proporcionado';
        this.loading = false;
      }
    });
  }

  loadInvoice(id: number): void {
    this.loading = true;
    this.error = null;
    
    this.invoiceService.getInvoice(id).subscribe({
      next: (invoice) => {
        // Asegurar que invoiceDetails sea un array
        if (invoice && !Array.isArray(invoice.invoiceDetails)) {
          invoice.invoiceDetails = invoice.invoiceDetails ? [invoice.invoiceDetails] : [];
        }
        
        this.invoice = invoice;
        this.loading = false;
        // Cargar QR si la factura ya fue enviada a DIAN y tiene UUID
        if (invoice.uuid && (invoice.dian_status === 'accepted' || invoice.dian_status === 'pending')) {
          this.loadQRCode(id);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar la factura';
        this.loading = false;
      }
    });
  }

  loadQRCode(id: number): void {
    this.loadingQR = true;
    this.invoiceService.generateQR(id).subscribe({
      next: (response) => {
        // Laravel devuelve: { qr_url: "...", cufe: "..." }
        if (response?.qr_url) {
          this.qrCodeUrl = response.qr_url;
        } else if (response?.data?.qr_url) {
          this.qrCodeUrl = response.data.qr_url;
        }
        this.loadingQR = false;
      },
      error: (err) => {
        // No mostrar error al usuario si el QR no está disponible
        this.loadingQR = false;
      }
    });
  }

  sendToDian(): void {
    if (!this.invoiceId) return;
    
    if (confirm('¿Está seguro de enviar esta factura a la DIAN?')) {
      this.invoiceService.sendToDian(this.invoiceId).subscribe({
        next: () => {
          alert('Factura enviada a la DIAN exitosamente');
          this.loadInvoice(this.invoiceId!);
        },
        error: (err) => {
          alert('Error al enviar a la DIAN: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  cancelInvoice(): void {
    if (!this.invoiceId) return;
    
    if (confirm('¿Está seguro de anular esta factura?')) {
      this.invoiceService.cancelInvoice(this.invoiceId).subscribe({
        next: () => {
          alert('Factura anulada exitosamente');
          this.loadInvoice(this.invoiceId!);
        },
        error: (err) => {
          alert('Error al anular la factura: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/facturacion']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateShort(date: string): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  getCompanyLogo(): string {
    if (this.invoice?.user?.company?.logo_url) {
      return this.invoice.user.company.logo_url;
    }
    return ''; // Puedes poner una imagen por defecto
  }

  getCompanyName(): string {
    return this.invoice?.user?.company?.business_name || 
           this.invoice?.user?.company?.trade_name || 
           'Empresa';
  }

  getCompanyNit(): string {
    return this.invoice?.user?.company?.nit || '';
  }

  getCompanyAddress(): string {
    const company = this.invoice?.user?.company;
    if (!company) return '';
    
    const parts = [
      company.address,
      company.city,
      company.department,
      company.country
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  downloadPDF(): void {
    if (!this.invoiceId) return;
    window.open(`http://localhost/api/invoices/${this.invoiceId}/download/pdf`, '_blank');
  }

  downloadXML(): void {
    if (!this.invoiceId) return;
    window.open(`http://localhost/api/invoices/${this.invoiceId}/download/xml`, '_blank');
  }

  getStatusBadgeClass(status: string, type: 'internal' | 'dian'): string {
    if (type === 'internal') {
      return status === 'draft' 
        ? 'bg-gray-200 text-gray-800' 
        : status === 'issued' 
        ? 'bg-blue-100 text-blue-700' 
        : 'bg-red-100 text-red-700';
    } else {
      return status === 'pending'
        ? 'bg-yellow-100 text-yellow-700'
        : status === 'accepted'
        ? 'bg-green-100 text-green-700'
        : status === 'rejected'
        ? 'bg-red-100 text-red-700'
        : 'bg-gray-100 text-gray-700';
    }
  }

  getItemCode(item: any): string {
    if (!item) return '-';
    return (item as any).product_code || (item as any).service_code || '-';
  }

  getItemType(detail: any): string {
    if (!detail.item_type) return 'Servicio';
    return detail.item_type.includes('Product') ? 'Producto' : 'Servicio';
  }

  toggleQRScanner(): void {
    this.showQRScanner = !this.showQRScanner;
    if (this.showQRScanner) {
      this.startQRScanner();
    } else {
      this.stopQRScanner();
    }
  }

  closeQRScanner(): void {
    this.showQRScanner = false;
    this.stopQRScanner();
    this.scanResult = null;
  }

  async startQRScanner(): Promise<void> {
    try {
      this.html5QrCode = new Html5Qrcode("qr-reader");
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await this.html5QrCode.start(
        { facingMode: "environment" }, // Usar cámara trasera
        config,
        (decodedText, decodedResult) => {
          // QR code escaneado exitosamente
          this.scanResult = decodedText;
          this.html5QrCode?.stop();
          this.showQRScanner = false;
          
          // Opcional: validar si el QR corresponde a esta factura
          if (this.invoice?.uuid && decodedText.includes(this.invoice.uuid)) {
            alert('✅ El código QR corresponde a esta factura');
          } else {
            alert('⚠️ El código QR no corresponde a esta factura');
          }
        },
        (errorMessage) => {
          // Ignorar errores de escaneo continuo
        }
      );
    } catch (err) {
      alert('Error al iniciar el escáner. Asegúrate de permitir el acceso a la cámara.');
      this.showQRScanner = false;
    }
  }

  stopQRScanner(): void {
    if (this.html5QrCode) {
      this.html5QrCode.stop().then(() => {
        this.html5QrCode?.clear();
        this.html5QrCode = null;
      }).catch(() => {
        // Ignorar errores al detener el escáner
      });
    }
  }

  ngOnDestroy(): void {
    this.stopQRScanner();
  }
}

