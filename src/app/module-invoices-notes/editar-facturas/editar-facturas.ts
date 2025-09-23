import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class EditarFactura implements OnInit, OnDestroy {
  factura: any = {}; // aquí se cargará la factura seleccionada
  isLoading: boolean = false;
  errorMessage: string = '';

  // Datos del cliente para edición
  clienteForm = {
    nombre: '',
    tipoDocumento: '',
    numeroDocumento: '',
    correoElectronico: '',
    pais: '',
    direccion: '',
    telefono: ''
  };
  
  // Estado de carga para búsqueda de cliente
  isLoadingCliente: boolean = false;
  
  // Timer para debounce
  private searchTimer: any = null;

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
    
    // Usar exactamente la misma lógica que detalle-facturas.ts
    this.invoicesNotesService.getInvoiceNoteById(id).subscribe({
      next: (data) => {
        this.factura = this.mapApiToForm(data);
        
        // Cargar información completa del cliente si existe user_id (igual que detalle-facturas.ts)
        if (data?.user_id) {
          this.loadClientInfo(data.user_id);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'No se pudo cargar la factura';
      }
    });
  }

  // Método copiado exactamente de detalle-facturas.ts
  private loadClientInfo(userId: number) {
    this.invoicesNotesService.getUserById(userId).subscribe({
      next: (user) => {
        this.popularFormularioCliente({ user: user });
      },
      error: (error) => {
        // No redirigir, solo mostrar error en consola para no interrumpir la experiencia
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
      // Cliente - inicializar vacío, se llenará con loadClientInfo
      cliente: '',
      tipoDocumento: '',
      documento: '',
      email: '',
      telefono: '',
      pais: '',
      direccion: '',
      // Datos del cliente para edición
      cliente_data: {
        nombre: '',
        tipo_documento: '',
        numero_documento: '',
        correo_electronico: '',
        pais: '',
        direccion: '',
        telefono: ''
      },
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
    // Construir payload con datos del cliente actualizados
    const payload = {
      id: this.factura.id,
      observacion: this.factura.observaciones,
      fecha_emision: this.factura.fechaEmision,
      // Incluir datos del cliente actualizados
      cliente_data: {
        nombre: this.clienteForm.nombre,
        tipo_documento: this.clienteForm.tipoDocumento,
        numero_documento: this.clienteForm.numeroDocumento,
        correo_electronico: this.clienteForm.correoElectronico,
        pais: this.clienteForm.pais,
        direccion: this.clienteForm.direccion,
        telefono: this.clienteForm.telefono
      }
    };
    
    console.log('💾 Guardando cambios de factura con datos del cliente:', payload);
    
    this.invoicesNotesService.updateInvoiceNote(payload).subscribe({
      next: () => {
        console.log('✅ Factura actualizada exitosamente');
        this.router.navigate(['/facturas-notas'], {
          queryParams: { mensaje: 'Factura actualizada correctamente' }
        });
      },
      error: (error) => {
        console.error('❌ Error al actualizar factura:', error);
        this.errorMessage = 'No se pudo actualizar la factura';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/facturas-notas']);
  }

  ngOnDestroy(): void {
    // Limpiar timer si existe
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }

  // Método para buscar cliente cuando se ingresa nombre y documento
  onClienteChange(): void {
    // Limpiar timer anterior si existe
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    
    // Si se borró el número de documento o el nombre, limpiar campos automáticos
    if (this.clienteForm.numeroDocumento.trim() === '' || this.clienteForm.nombre.trim() === '') {
      this.limpiarCamposAutomaticos();
      return;
    }
    
    // Solo buscar si ambos campos tienen al menos 3 caracteres
    if (this.clienteForm.nombre.trim().length >= 3 && this.clienteForm.numeroDocumento.trim().length >= 3) {
      // Usar debounce para esperar a que el usuario termine de escribir
      this.searchTimer = setTimeout(() => {
        this.buscarCliente();
      }, 1500); // Esperar 1.5 segundos después del último cambio
    }
  }

  // Método para buscar cliente cuando se pierde el foco del campo
  onDocumentoBlur(): void {
    // Limpiar timer si existe
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    
    // Validar que el número de documento tenga al menos 5 dígitos
    if (this.clienteForm.nombre.trim() && 
        this.clienteForm.numeroDocumento.trim() && 
        this.clienteForm.numeroDocumento.trim().length >= 5) {
      this.buscarCliente();
    }
  }

  // Método para buscar cliente en la API
  private buscarCliente(): void {
    this.isLoadingCliente = true;
    
    this.invoicesNotesService.searchUsersRobust(
      this.clienteForm.nombre.trim(),
      this.clienteForm.numeroDocumento.trim()
    ).subscribe({
      next: (clientes) => {
        this.isLoadingCliente = false;
        
        if (clientes && clientes.length > 0) {
          // Buscar SOLO coincidencia exacta de nombre Y documento
          const clienteEncontrado = clientes.find(cliente => {
            const nombreCoincide = cliente.nombre && cliente.nombre.toLowerCase().trim() === this.clienteForm.nombre.toLowerCase().trim();
            const documentoCoincide = cliente.numero_documento && cliente.numero_documento.trim() === this.clienteForm.numeroDocumento.trim();
            return nombreCoincide && documentoCoincide;
          });
          
          if (clienteEncontrado) {
            // Solo autocompletar si se encuentra un cliente existente
            this.autocompletarDatosCliente(clienteEncontrado);
          }
        }
      },
      error: (error) => {
        this.isLoadingCliente = false;
      }
    });
  }

  // Método para autocompletar los datos del cliente
  private autocompletarDatosCliente(cliente: any): void {
    // Solo autocompletar campos que están vacíos o que el usuario no ha modificado
    // Preservar nombre y documento que el usuario ingresó
    const nombreUsuario = this.clienteForm.nombre;
    const documentoUsuario = this.clienteForm.numeroDocumento;
    
    // Solo llenar campos que están vacíos
    if (!this.clienteForm.tipoDocumento) {
      this.clienteForm.tipoDocumento = cliente.tipo_documento || '';
    }
    
    if (!this.clienteForm.correoElectronico) {
      this.clienteForm.correoElectronico = cliente.correo_electronico || '';
    }
    
    if (!this.clienteForm.pais) {
      this.clienteForm.pais = cliente.pais || '';
    }
    
    if (!this.clienteForm.direccion) {
      this.clienteForm.direccion = cliente.direccion || '';
    }
    
    if (!this.clienteForm.telefono) {
      this.clienteForm.telefono = cliente.telefono || '';
    }
    
    // Mantener los valores que el usuario ingresó
    this.clienteForm.nombre = nombreUsuario;
    this.clienteForm.numeroDocumento = documentoUsuario;
  }

  // Método para limpiar campos que se llenaron automáticamente
  private limpiarCamposAutomaticos(): void {
    // Limpiar solo los campos que se llenan automáticamente
    // Mantener nombre y documento (que son los que ingresa el usuario)
    this.clienteForm.tipoDocumento = '';
    this.clienteForm.correoElectronico = '';
    this.clienteForm.pais = '';
    this.clienteForm.direccion = '';
    this.clienteForm.telefono = '';
  }

  // Popular el formulario con los datos del cliente (copiado exactamente de detalle-facturas.ts)
  private popularFormularioCliente(data: any): void {
    // Los datos del cliente están en data.user (como se ve en detalle-facturas.ts)
    const cliente = data?.user;
    
    // Mapear datos del cliente a clienteForm (para funcionalidad de búsqueda)
    this.clienteForm = {
      nombre: String(cliente?.nombre ?? ''),
      tipoDocumento: String(cliente?.tipo_documento ?? ''),
      numeroDocumento: String(cliente?.numero_documento ?? ''),
      correoElectronico: String(cliente?.correo_electronico ?? ''),
      pais: String(cliente?.pais ?? ''),
      direccion: String(cliente?.direccion ?? ''),
      telefono: String(cliente?.telefono ?? '')
    };
    
    // También mapear a los campos directos de factura (para el formulario)
    this.factura.cliente = String(cliente?.nombre ?? '');
    this.factura.tipoDocumento = String(cliente?.tipo_documento ?? '');
    this.factura.documento = String(cliente?.numero_documento ?? '');
    this.factura.email = String(cliente?.correo_electronico ?? '');
    this.factura.telefono = String(cliente?.telefono ?? '');
    this.factura.pais = String(cliente?.pais ?? '');
    this.factura.direccion = String(cliente?.direccion ?? '');
    
    // Actualizar cliente_data también
    this.factura.cliente_data = {
      nombre: String(cliente?.nombre ?? ''),
      tipo_documento: String(cliente?.tipo_documento ?? ''),
      numero_documento: String(cliente?.numero_documento ?? ''),
      correo_electronico: String(cliente?.correo_electronico ?? ''),
      pais: String(cliente?.pais ?? ''),
      direccion: String(cliente?.direccion ?? ''),
      telefono: String(cliente?.telefono ?? '')
    };
  }





}
