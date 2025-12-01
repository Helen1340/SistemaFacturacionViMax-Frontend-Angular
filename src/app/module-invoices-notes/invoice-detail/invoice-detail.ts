import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService, Invoice } from '../services/invoice.service';
import { Html5Qrcode } from 'html5-qrcode';
import { FormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';
import { FileDownloadService } from '../../module-reports/services/file-download.service';
import { PermissionsService } from '../../module-reports/services/permissions.service';

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
  qrData: string = '';

  async generateLocalQR(text: string): Promise<void> {
    const qr = await import('qrcode');
    const fn: any = (qr as any).toDataURL || (qr as any).default?.toDataURL;
    const dataUrl: string = await fn(text, { width: 180 });
    this.qrCodeUrl = dataUrl;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private downloadService: FileDownloadService,
    private permissionsService: PermissionsService
  ) { }

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
        this.setSimulatedQR();
        this.loading = false;
        if (invoice.uuid) {
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
        const text = (
          response?.qr_text ||
          response?.qr_code ||
          response?.cufe ||
          response?.data?.qr_text ||
          response?.data?.qr_code ||
          response?.data?.cufe ||
          ''
        ) as string;
        if (typeof text === 'string' && text.trim().length > 0) {
          this.generateLocalQR(text).then(() => {
            this.qrData = text;
            this.loadingQR = false;
          }).catch(() => {
            this.setSimulatedQR();
            this.loadingQR = false;
          });
        } else {
          this.setSimulatedQR();
          this.loadingQR = false;
        }
      },
      error: (err) => {
        this.setSimulatedQR();
        this.loadingQR = false;
      }
    });
  }

  private async setSimulatedQR(): Promise<void> {
    const num = this.invoice?.invoice_number || '';
    const uuid = this.invoice?.uuid || 'NO-UUID';
    const total = this.invoice?.payable_amount ?? 0;
    const date = this.invoice?.issue_date || '';
    const buyer = this.invoice?.buyer?.document_number || '';
    const text = `DIAN|NUM:${num}|UUID:${uuid}|TOTAL:${total}|CLIENT:${buyer}|DATE:${date}`;
    await this.generateLocalQR(text);
    this.qrData = text;
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
      minute: '2-digit',
      timeZone: 'America/Bogota'
    });
  }

  formatDateShort(date: string): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Bogota'
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

  // ✅ DESCARGAR PDF - Adaptado para Android
  async downloadPDF(): Promise<void> {
    if (!this.invoiceId) return;

    const hasPermissions = await this.permissionsService.requestStoragePermissions();
    if (!hasPermissions) {
      alert('No se pueden descargar archivos sin permisos de almacenamiento');
      return;
    }

    try {
      this.invoiceService.downloadPDFRes(this.invoiceId).subscribe(async (res) => {
        const contentType = res.headers.get('Content-Type') || res.headers.get('content-type') || '';
        const blob = res.body as Blob;

        if (blob && (contentType.includes('application/pdf') || blob.size > 0)) {
          const fileUrl = URL.createObjectURL(blob);
          const fileName = `factura_${this.invoiceId}.pdf`;

          const success = await this.downloadService.download(fileUrl, fileName);

          URL.revokeObjectURL(fileUrl);

          if (success) {
            console.log('✅ PDF descargado exitosamente');
          } else {
            alert('Error al descargar el PDF');
          }
        } else {
          alert('No se pudo descargar el PDF: respuesta inválida.');
        }
      }, (error) => {
        const msg = error.error?.message || error.message || 'Error desconocido al descargar PDF';
        console.error('❌ Error descargando PDF:', error);
        alert(msg);
      });

    } catch (error) {
      console.error('❌ Error en downloadPDF:', error);
      alert('Error al descargar PDF');
    }
  }

  // ✅ DESCARGAR XML - Adaptado para Android
  async downloadXML(): Promise<void> {
    if (!this.invoiceId) return;

    const hasPermissions = await this.permissionsService.requestStoragePermissions();
    if (!hasPermissions) {
      alert('No se pueden descargar archivos sin permisos de almacenamiento');
      return;
    }

    try {
      this.invoiceService.downloadXMLRes(this.invoiceId).subscribe(async (res) => {
        const contentType = res.headers.get('Content-Type') || res.headers.get('content-type') || '';
        const blob = res.body as Blob;

        if (blob && (contentType.includes('application/xml') || contentType.includes('text/xml') || blob.size > 0)) {
          const fileUrl = URL.createObjectURL(blob);
          const fileName = `factura_${this.invoiceId}.xml`;

          const success = await this.downloadService.download(fileUrl, fileName);

          URL.revokeObjectURL(fileUrl);

          if (success) {
            console.log('✅ XML descargado exitosamente');
          } else {
            alert('Error al descargar el XML');
          }
        } else {
          alert('No se pudo descargar el XML: respuesta inválida.');
        }
      }, (error) => {
        const msg = error.error?.message || error.message || 'Error desconocido al descargar XML';
        console.error('❌ Error descargando XML:', error);
        alert(msg);
      });

    } catch (error) {
      console.error('❌ Error en downloadXML:', error);
      alert('Error al descargar XML');
    }
  }

  navigateToNotes(): void {
    if (!this.invoiceId) return;
    this.router.navigate(['/notas-factura', this.invoiceId]);
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

