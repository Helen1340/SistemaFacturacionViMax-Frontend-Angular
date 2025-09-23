import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvoicesNotesService } from '../services/invoices-notes.service';

@Component({
  selector: 'app-nueva-factura',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-factura.html',
  styleUrl: './nueva-factura.css'
})
export class NuevaFactura implements AfterViewInit, OnDestroy {
  private isValidated: boolean = false;
  
  // Alertas personalizadas
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'info' | 'warning' | 'error' = 'success';
  
  // Datos del cliente
  clienteForm = {
    nombre: '',
    tipoDocumento: '',
    numeroDocumento: '',
    correoElectronico: '',
    pais: '',
    direccion: '',
    telefono: ''
  };
  
  // Estado de carga
  isLoadingCliente: boolean = false;
  
  // Timer para debounce
  private searchTimer: any = null;
  
  constructor(
    private router: Router,
    private invoicesNotesService: InvoicesNotesService
  ) {}

  ngAfterViewInit(): void {
    // Probar conexión con la API al inicializar
    this.probarConexionAPI();
  }

  // Método para probar la conexión con la API
  private probarConexionAPI(): void {
    console.log('🔌 Probando conexión con la API...');
    this.invoicesNotesService.getUsers().subscribe({
      next: (usuarios) => {
        console.log('✅ Conexión exitosa con la API. Usuarios disponibles:', usuarios?.length || 0);
      },
      error: (error) => {
        console.error('❌ Error de conexión con la API:', error);
        this.mostrarAlerta('No se puede conectar con el servidor. Verifique que la API esté ejecutándose.', 'error');
      }
    });
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
    console.log('🔍 Iniciando búsqueda de cliente:', {
      nombre: this.clienteForm.nombre.trim(),
      documento: this.clienteForm.numeroDocumento.trim()
    });
    
    this.invoicesNotesService.searchUsersRobust(
      this.clienteForm.nombre.trim(),
      this.clienteForm.numeroDocumento.trim()
    ).subscribe({
      next: (clientes) => {
        this.isLoadingCliente = false;
        console.log('📋 Resultados de búsqueda:', clientes);
        
        if (clientes && clientes.length > 0) {
          // Buscar SOLO coincidencia exacta de nombre Y documento
          const clienteEncontrado = clientes.find(cliente => {
            const nombreCoincide = cliente.nombre && cliente.nombre.toLowerCase().trim() === this.clienteForm.nombre.toLowerCase().trim();
            const documentoCoincide = cliente.numero_documento && cliente.numero_documento.trim() === this.clienteForm.numeroDocumento.trim();
            return nombreCoincide && documentoCoincide;
          });
          
          if (clienteEncontrado) {
            console.log('✅ Cliente encontrado con coincidencia exacta:', clienteEncontrado);
            this.autocompletarDatosCliente(clienteEncontrado);
            this.mostrarAlerta('Cliente encontrado y datos autocompletados', 'success');
          } else {
            console.log('❌ No se encontró coincidencia exacta de nombre y documento');
            
            // Verificar si existe el nombre pero con diferente documento
            const clienteConMismoNombre = clientes.find(cliente => 
              cliente.nombre && cliente.nombre.toLowerCase().trim() === this.clienteForm.nombre.toLowerCase().trim()
            );
            
            if (clienteConMismoNombre) {
              this.mostrarAlerta(`El nombre "${this.clienteForm.nombre}" existe pero no coincide con el número de documento "${this.clienteForm.numeroDocumento}". Verifique los datos.`, 'warning');
            } else {
              this.mostrarAlerta(`No se encontró un cliente con el nombre "${this.clienteForm.nombre}" y documento "${this.clienteForm.numeroDocumento}". Verifique que los datos sean correctos.`, 'warning');
            }
          }
        } else {
          console.log('❌ No se encontraron clientes');
          this.mostrarAlerta('No se encontró un cliente con esos datos', 'warning');
        }
      },
      error: (error) => {
        this.isLoadingCliente = false;
        console.error('❌ Error al buscar cliente:', error);
        this.mostrarAlerta('Error al buscar el cliente. Verifique la conexión con el servidor.', 'error');
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
    console.log('🧹 Limpiando campos automáticos porque se borró el documento o nombre');
    
    // Limpiar solo los campos que se llenan automáticamente
    // Mantener nombre y documento (que son los que ingresa el usuario)
    this.clienteForm.tipoDocumento = '';
    this.clienteForm.correoElectronico = '';
    this.clienteForm.pais = '';
    this.clienteForm.direccion = '';
    this.clienteForm.telefono = '';
    
    // Mostrar mensaje informativo
    this.mostrarAlerta('Campos automáticos limpiados. Ingrese nombre y número de documento válidos para autocompletar.', 'info');
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

    // Obtener datos del cliente del formulario
    const nombreCliente = this.clienteForm.nombre || this.obtenerValorInput('input[type="text"]:first-of-type') || 'Cliente sin nombre';
    const email = this.clienteForm.correoElectronico || this.obtenerValorInput('input[type="email"]') || '';
    const observaciones = this.obtenerValorInput('input[type="text"]:last-of-type') || '';
    const cantidad = parseFloat(this.obtenerValorInput('input[type="number"]:first-of-type') || '0');
    const valorUnitario = parseFloat(this.obtenerValorInput('input[type="number"]:last-of-type') || '0');
    const total = cantidad * valorUnitario;

    const descripcion = this.obtenerValorInput('input[type="text"]:nth-of-type(2)') || '';

    // Datos completos del cliente para asociar a la factura
    const datosCliente = {
      nombre: this.clienteForm.nombre,
      tipo_documento: this.clienteForm.tipoDocumento,
      numero_documento: this.clienteForm.numeroDocumento,
      correo_electronico: this.clienteForm.correoElectronico,
      pais: this.clienteForm.pais,
      direccion: this.clienteForm.direccion,
      telefono: this.clienteForm.telefono
    };

    return {
      id: Date.now(),
      numero: numeroFactura,
      cliente: nombreCliente,
      cliente_data: datosCliente, // Datos completos del cliente
      total: total,
      notas: observaciones || descripcion,
      dian: estado === 'Emitida' ? 'Pendiente' : '',
      email: email,
      alerta: total > 0 ? '' : 'Revisar total',
      estado: estado,
      fecha_creacion: new Date().toISOString()
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
