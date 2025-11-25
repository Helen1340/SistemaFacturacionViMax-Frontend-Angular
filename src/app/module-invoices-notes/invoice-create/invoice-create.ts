import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvoiceService, Product, Service, Client, InvoiceItem } from '../services/invoice.service';
import { LocalNotifications } from '@capacitor/local-notifications';

interface SelectedItem {
  type: 'product' | 'service';
  item: Product | Service;
  quantity: number;
  discount: number;
  subtotal: number;
  taxes: number;
  total: number;
}

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invoice-create.html',
  styleUrls: ['./invoice-create.css']
})
export class InvoiceCreate implements OnInit {
  invoiceForm: FormGroup;
  itemsFormArray: FormArray;
  
  products: Product[] = [];
  services: Service[] = [];
  clients: Client[] = [];
  filteredProducts: Product[] = [];
  filteredServices: Service[] = [];
  filteredClients: Client[] = [];
  clientQuery: string = '';
  productQuery: string = '';
  serviceQuery: string = '';
  selectedItems: SelectedItem[] = [];
  
  loading = false;
  loadingData = true;
  error: string | null = null;
  success: string | null = null;
  createdInvoiceId: number | null = null;
  createdInvoiceNumber: string | null = null;
  sendingToDian = false;
  showQR = false;
  qrText = '';
  qrUrl = '';
  
  // Totales calculados
  subtotal = 0;
  totalTaxes = 0;
  totalDiscount = 0;
  total = 0;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private router: Router
  ) {
    this.invoiceForm = this.fb.group({
      buyer_id: ['', Validators.required],
      observation: [''],
      payment_means_code: ['10'],
      payment_means_name: ['Contado'],
      items: this.fb.array([])
    });
    this.itemsFormArray = this.invoiceForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.loadCreateData();
    this.requestNotificationPermissions(); 
  }

  loadCreateData(): void {
    this.loadingData = true;
    this.error = null;
    
    this.invoiceService.getCreateData().subscribe({
      next: (data) => {
        this.products = data.products;
        this.services = data.services;
        this.clients = data.clients;
        this.filteredProducts = [...this.products];
        this.filteredServices = [...this.services];
        this.filteredClients = [...this.clients];
        this.loadingData = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los datos: ' + (err.error?.message || err.message);
        this.loadingData = false;
      }
    });
  }

  onClientQueryChange(query: string): void {
    this.clientQuery = query;
    const q = query.trim().toLowerCase();
    if (!q) {
      this.filteredClients = [...this.clients];
      return;
    }
    this.filteredClients = this.clients.filter(c => {
      const name = (c.first_name || '').toLowerCase();
      const doc = String(c.document_number || '').toLowerCase();
      return name.includes(q) || doc.includes(q);
    });
  }

  onProductQueryChange(query: string): void {
    this.productQuery = query;
    const q = query.trim().toLowerCase();
    if (!q) {
      this.filteredProducts = [...this.products];
      return;
    }
    this.filteredProducts = this.products.filter(p => {
      const code = String(p.product_code || '').toLowerCase();
      const name = String(p.name || '').toLowerCase();
      return code.includes(q) || name.includes(q);
    });
  }

  onServiceQueryChange(query: string): void {
    this.serviceQuery = query;
    const q = query.trim().toLowerCase();
    if (!q) {
      this.filteredServices = [...this.services];
      return;
    }
    this.filteredServices = this.services.filter(s => {
      const code = String(s.service_code || '').toLowerCase();
      const name = String(s.name || '').toLowerCase();
      return code.includes(q) || name.includes(q);
    });
  }

  addItem(type: 'product' | 'service', itemId: number): void {
    const item = type === 'product' 
      ? this.products.find(p => p.id === itemId)
      : this.services.find(s => s.id === itemId);

    if (!item) {
      this.error = 'Item no encontrado';
      return;
    }

    // Verificar si el item ya está agregado
    const existingIndex = this.selectedItems.findIndex(
      si => si.type === type && si.item.id === itemId
    );

    if (existingIndex >= 0) {
      // Si ya existe, aumentar cantidad
      this.selectedItems[existingIndex].quantity += 1;
      this.updateItemTotals(existingIndex);
    } else {
      // Agregar nuevo item
      const selectedItem: SelectedItem = {
        type,
        item,
        quantity: 1,
        discount: 0,
        subtotal: 0, // Se calculará en updateItemTotals
        taxes: 0,
        total: 0
      };
      
      // Calcular totales del item
      this.updateItemTotalsForItem(selectedItem);
      this.selectedItems.push(selectedItem);
      
      // Agregar al FormArray
      const itemFormGroup = this.fb.group({
        type: [type],
        id: [itemId],
        quantity: [1, [Validators.required, Validators.min(1)]],
        discount: [0, [Validators.min(0)]]
      });
      this.itemsFormArray.push(itemFormGroup);
    }

    this.calculateTotals();
  }

  removeItem(index: number): void {
    this.selectedItems.splice(index, 1);
    this.itemsFormArray.removeAt(index);
    this.calculateTotals();
  }

  updateItemQuantity(index: number, quantity: number): void {
    if (quantity < 1 || isNaN(quantity)) {
      // Restaurar valor anterior si es inválido
      const control = this.itemsFormArray.at(index);
      control.patchValue({ quantity: this.selectedItems[index].quantity });
      return;
    }
    
    this.selectedItems[index].quantity = Math.max(1, Math.floor(quantity));
    this.updateItemTotals(index);
    this.calculateTotals();
    
    // Actualizar FormArray
    const control = this.itemsFormArray.at(index);
    control.patchValue({ quantity: this.selectedItems[index].quantity });
  }

  updateItemDiscount(index: number, discount: number): void {
    if (discount < 0 || isNaN(discount)) {
      discount = 0;
    }
    
    const maxDiscount = this.selectedItems[index].item.unit_price * this.selectedItems[index].quantity;
    this.selectedItems[index].discount = Math.min(Math.max(0, discount), maxDiscount);
    this.updateItemTotals(index);
    this.calculateTotals();
    
    // Actualizar FormArray
    const control = this.itemsFormArray.at(index);
    control.patchValue({ discount: this.selectedItems[index].discount });
  }

  updateItemTotals(index: number): void {
    const item = this.selectedItems[index];
    this.updateItemTotalsForItem(item);
  }

  updateItemTotalsForItem(item: SelectedItem): void {
    // 1. Calcular subtotal: (precio unitario * cantidad) - descuento
    const lineSubtotal = (item.item.unit_price * item.quantity) - (item.discount || 0);
    item.subtotal = Math.max(0, Math.round(lineSubtotal * 100) / 100);
    
    // 2. Calcular impuestos sobre el subtotal
    this.calculateItemTaxes(item);
    
    // 3. Calcular total: subtotal + impuestos
    item.total = Math.round((item.subtotal + item.taxes) * 100) / 100;
  }

  calculateItemTaxes(item: SelectedItem): void {
    let taxes = 0;
    
    if (item.item.taxes && item.item.taxes.length > 0) {
      item.item.taxes.forEach(tax => {
        // Saltar impuestos inactivos
        if (tax.status && tax.status !== 'Activo') return;
        
        switch (tax.application_type) {
          case 'Porcentaje':
            if (tax.percentage && tax.percentage > 0) {
              taxes += (item.subtotal * tax.percentage) / 100;
            }
            break;
          case 'ValorFijo':
            // Buscar fixed_value en el objeto tax
            const fixedValue = tax.fixed_value || 0;
            if (fixedValue > 0) {
              taxes += fixedValue;
            }
            break;
          case 'Retencion':
            // Las retenciones son negativas (restan del total)
            if (tax.percentage && tax.percentage > 0) {
              taxes -= (item.subtotal * tax.percentage) / 100;
            }
            break;
        }
      });
    }
    
    // Redondear a 2 decimales
    item.taxes = Math.round(taxes * 100) / 100;
  }

  calculateTotals(): void {
    // Calcular subtotal (suma de todos los subtotales de items)
    this.subtotal = this.selectedItems.reduce((sum, item) => {
      return sum + (item.subtotal || 0);
    }, 0);
    
    // Calcular total de impuestos (puede ser negativo si hay retenciones)
    this.totalTaxes = this.selectedItems.reduce((sum, item) => {
      return sum + (item.taxes || 0);
    }, 0);
    
    // Calcular total de descuentos
    this.totalDiscount = this.selectedItems.reduce((sum, item) => {
      return sum + (item.discount || 0);
    }, 0);
    
    // Calcular total: subtotal + impuestos (los impuestos pueden ser negativos por retenciones)
    this.total = this.subtotal + this.totalTaxes;
    
    // Redondear a 2 decimales
    this.subtotal = Math.round(this.subtotal * 100) / 100;
    this.totalTaxes = Math.round(this.totalTaxes * 100) / 100;
    this.totalDiscount = Math.round(this.totalDiscount * 100) / 100;
    this.total = Math.round(this.total * 100) / 100;
    
    // Asegurar que subtotal y descuentos no sean negativos
    this.subtotal = Math.max(0, this.subtotal);
    this.totalDiscount = Math.max(0, this.totalDiscount);
    
    // El total puede ser negativo si hay muchas retenciones, pero normalmente debería ser positivo
    // No forzamos que sea positivo porque podría ser un caso válido
  }

  onSubmit(): void {
    // Validar formulario
    if (this.invoiceForm.invalid) {
      this.error = 'Por favor complete todos los campos requeridos';
      this.invoiceForm.markAllAsTouched();
      return;
    }

    // Validar que haya items
    if (this.selectedItems.length === 0) {
      this.error = 'Debe agregar al menos un producto o servicio a la factura';
      return;
    }

    // Validar que todos los items tengan cantidad válida
    const invalidItems = this.selectedItems.filter(item => 
      !item.quantity || item.quantity < 1 || isNaN(item.quantity)
    );
    
    if (invalidItems.length > 0) {
      this.error = 'Todos los items deben tener una cantidad válida mayor a 0';
      return;
    }

    // Recalcular todos los totales antes de enviar
    this.selectedItems.forEach((item, index) => {
      this.updateItemTotals(index);
    });
    this.calculateTotals();

    this.loading = true;
    this.error = null;
    this.success = null;

    // Preparar items para el backend
    const items: InvoiceItem[] = this.selectedItems.map(item => ({
      type: item.type,
      id: item.item.id,
      quantity: item.quantity,
      discount: Math.max(0, item.discount || 0)
    }));

    const invoiceData = {
      buyer_id: Number(this.invoiceForm.value.buyer_id),
      observation: this.invoiceForm.value.observation?.trim() || null,
      payment_means_code: this.invoiceForm.value.payment_means_code || '10',
      payment_means_name: this.invoiceForm.value.payment_means_name || 'Contado',
      items
    };

    this.invoiceService.createInvoice(invoiceData).subscribe({
      next: (invoice) => {
        this.success = `Factura ${invoice.invoice_number} creada exitosamente`;
        this.loading = false;
        this.createdInvoiceId = invoice.id; // Guardar el ID de la factura creada
        this.createdInvoiceNumber = invoice.invoice_number || null;
        
        this.showInvoiceCreatedNotification(invoice.invoice_number, this.total);
        // Limpiar mensaje de éxito después de 5 segundos
        setTimeout(() => {
          this.success = null;
        }, 5000);
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'Error desconocido al crear la factura';
        this.error = errorMessage;
        this.loading = false;
      }
    });
  }

  sendToDian(): void {
    if (!this.createdInvoiceId) {
      this.error = 'No hay factura creada para enviar';
      return;
    }

    if (!confirm('¿Está seguro de enviar esta factura a la DIAN?')) {
      return;
    }

    this.sendingToDian = true;
    this.error = null;

    this.invoiceService.sendToDian(this.createdInvoiceId).subscribe({
      next: (response) => {
        this.sendingToDian = false;
        this.success = 'Factura enviada a la DIAN exitosamente. Redirigiendo...';

        this.showLocalNotification('📤 Factura enviada a DIAN', `Factura #${this.createdInvoiceNumber} enviada correctamente`);
        
        // Redirigir a la vista de facturación después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/facturacion']);
        }, 2000);
      },
      error: (err) => {
        this.sendingToDian = false;
        const errorMessage = err.error?.message || err.message || 'Error desconocido';
        this.error = `Error al enviar a la DIAN: ${errorMessage}`;
      }
    });
  }


  resetForm(): void {
    this.invoiceForm.reset({
      payment_means_code: '10',
      payment_means_name: 'Contado'
    });
    this.selectedItems = [];
    this.itemsFormArray.clear();
    this.calculateTotals();
    this.createdInvoiceId = null; // Limpiar el ID de factura creada
    this.success = null;
    this.error = null;
  }

  getClientDisplay(client: Client): string {
    return `${client.first_name} - ${client.document_type} ${client.document_number}`;
  }

  getItemDisplay(item: Product | Service): string {
    if ('product_code' in item) {
      return `${item.product_code} - ${item.name}`;
    } else {
      return `${item.service_code} - ${item.name}`;
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }
   private async requestNotificationPermissions(): Promise<void> {
    try {
      const permissions = await LocalNotifications.requestPermissions();
      if (permissions.display === 'granted') {
        console.log('Permisos para notificaciones concedidos');
      } else {
        console.log('Permisos para notificaciones no concedidos');
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
    }
  }

  // ✅ NUEVO MÉTODO: Mostrar notificación local
  private async showLocalNotification(title: string, body: string): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: new Date().getTime(), // ID único
            schedule: { at: new Date(Date.now() + 1000) }, // 1 segundo después
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null
          }
        ]
      });
      console.log('Notificación local mostrada');
    } catch (error) {
      console.error('Error mostrando notificación local:', error);
    }
  }

  private async showInvoiceCreatedNotification(invoiceNumber: string, total: number): Promise<void> {
    const formattedTotal = this.formatCurrency(total);
    
    await this.showLocalNotification(
      '✅ Factura Creada', 
      `Factura #${invoiceNumber} por ${formattedTotal} creada exitosamente`
    );
  }

}

