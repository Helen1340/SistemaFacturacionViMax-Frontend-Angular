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
  
  // Datos para productos y servicios
  products: any[] = [];
  services: any[] = [];
  
  // Unidades de medida
  measurementUnits: any[] = [];
  
  // Estado de carga para datos adicionales
  isLoadingProducts: boolean = false;
  isLoadingServices: boolean = false;
  isLoadingMeasurementUnits: boolean = false;
  
  // Estado de carga para búsqueda de productos/servicios
  isLoadingProductoServicio: boolean = false;
  
  // Timer para debounce de búsqueda de productos/servicios
  private searchProductoTimer: any = null;
  
  constructor(
    private router: Router,
    private invoicesNotesService: InvoicesNotesService
  ) {}

  ngAfterViewInit(): void {
    // Probar conexión con la API al inicializar
    this.probarConexionAPI();
    // Cargar datos adicionales
    this.cargarDatosAdicionales();
    // Probar URLs
    this.probarURLs();
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
    // Limpiar timers si existen
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    if (this.searchProductoTimer) {
      clearTimeout(this.searchProductoTimer);
    }
  }

  // Método para probar diferentes URLs
  private probarURLs(): void {
    console.log('=== PROBANDO URLs ===');
    console.log('🌐 URL base configurada: http://facturacion-vimax-api');
    console.log('🔗 URLs que se están probando:');
    console.log('- http://facturacion-vimax-api/api/products');
    console.log('- http://facturacion-vimax-api/api/services');
    console.log('⚠️ Si estas URLs no funcionan, necesitas cambiar la URL base en el servicio');
  }

  // Método para cargar datos adicionales (productos, servicios)
  private cargarDatosAdicionales(): void {
    console.log('=== INICIANDO CARGA DE DATOS ADICIONALES ===');
    this.cargarProductos();
    this.cargarServicios();
    this.cargarUnidadesMedida();
  }

  // Cargar productos
  private cargarProductos(): void {
    console.log('=== CARGANDO PRODUCTOS ===');
    console.log('🌐 URL del endpoint: http://facturacion-vimax-api/api/products');
    this.isLoadingProducts = true;
    this.invoicesNotesService.getProducts().subscribe({
      next: (products) => {
        console.log('✅ Respuesta de productos:', products);
        this.products = products || [];
        this.isLoadingProducts = false;
        console.log('📊 Productos cargados:', this.products.length);
        if (this.products.length > 0) {
          console.log('🔍 Estructura del primer producto:', this.products[0]);
          console.log('🔍 Campos esperados: id, measurement_unit_id, codigo_producto, descripcion, precio_unitario');
        } else {
          console.log('⚠️ No se cargaron productos');
        }
      },
      error: (error) => {
        console.error('❌ Error cargando productos:', error);
        console.error('🔍 Detalles del error:', error);
        console.error('🌐 URL que falló: http://facturacion-vimax-api/api/products');
        this.isLoadingProducts = false;
      }
    });
  }

  // Cargar servicios
  private cargarServicios(): void {
    console.log('=== CARGANDO SERVICIOS ===');
    console.log('🌐 URL del endpoint: http://facturacion-vimax-api/api/services');
    this.isLoadingServices = true;
    this.invoicesNotesService.getServices().subscribe({
      next: (services) => {
        console.log('✅ Respuesta de servicios:', services);
        this.services = services || [];
        this.isLoadingServices = false;
        console.log('📊 Servicios cargados:', this.services.length);
        if (this.services.length > 0) {
          console.log('🔍 Estructura del primer servicio:', this.services[0]);
          console.log('🔍 Campos esperados: id, descripcion, codigo_servicio, precio_unitario');
        } else {
          console.log('⚠️ No se cargaron servicios');
        }
      },
      error: (error) => {
        console.error('❌ Error cargando servicios:', error);
        console.error('🔍 Detalles del error:', error);
        console.error('🌐 URL que falló: http://facturacion-vimax-api/api/services');
        this.isLoadingServices = false;
      }
    });
  }

  // Cargar unidades de medida
  private cargarUnidadesMedida(): void {
    console.log('=== CARGANDO UNIDADES DE MEDIDA ===');
    console.log('🌐 URL del endpoint: http://facturacion-vimax-api/api/measurementUnints');
    this.isLoadingMeasurementUnits = true;
    this.invoicesNotesService.getMeasurementUnits().subscribe({
      next: (units) => {
        console.log('✅ Respuesta de unidades de medida:', units);
        this.measurementUnits = units || [];
        this.isLoadingMeasurementUnits = false;
        console.log('📊 Unidades de medida cargadas:', this.measurementUnits.length);
        if (this.measurementUnits.length > 0) {
          console.log('🔍 Estructura de la primera unidad:', this.measurementUnits[0]);
        }
      },
      error: (error) => {
        console.error('❌ Error cargando unidades de medida:', error);
        this.isLoadingMeasurementUnits = false;
      }
    });
  }

  // Método para obtener el nombre de una unidad de medida por ID (igual que en productos-servicios)
  private obtenerNombreUnidadMedida(measurementUnitId: number): string {
    if (!this.measurementUnits || this.measurementUnits.length === 0) {
      console.log('⚠️ No hay unidades de medida cargadas');
      return '';
    }

    const unidad = this.measurementUnits.find(unit => unit.id === measurementUnitId);
    if (unidad) {
      console.log('✅ Unidad encontrada:', unidad);
      // Usar el mismo campo que en productos-servicios: codigo_dian
      const nombre = unidad.codigo_dian || unidad.nombre || unidad.name || '';
      console.log('✅ Nombre de la unidad:', nombre);
      return nombre;
    } else {
      console.log('⚠️ No se encontró unidad con ID:', measurementUnitId);
      return '';
    }
  }

  // Método para autocompletar producto/servicio por código
  onCodigoChange(): void {
    const codigo = this.obtenerValorInput('input[name="codigo"]');
    console.log('🔄 onCodigoChange ejecutado. Código:', codigo);
    
    // Limpiar timer anterior si existe
    if (this.searchProductoTimer) {
      clearTimeout(this.searchProductoTimer);
    }
    
    // Si se borró el código, limpiar campos automáticos
    if (codigo.trim() === '') {
      console.log('Código vacío, limpiando campos...');
      this.limpiarCamposProductoServicio();
      return;
    }
    
    // Solo buscar si el código tiene al menos 2 caracteres
    if (codigo.trim().length >= 2) {
      console.log('Código válido, iniciando búsqueda...');
      // Usar debounce para esperar a que el usuario termine de escribir
      this.searchProductoTimer = setTimeout(() => {
        this.buscarProductoServicio(codigo.trim());
      }, 1500); // Esperar 1.5 segundos después del último cambio
    }
  }

  // Método para buscar producto/servicio cuando se pierde el foco del campo
  onCodigoBlur(): void {
    // Limpiar timer si existe
    if (this.searchProductoTimer) {
      clearTimeout(this.searchProductoTimer);
    }
    
    // Validar que el código tenga al menos 2 caracteres
    const codigo = this.obtenerValorInput('input[name="codigo"]');
    if (codigo && codigo.trim().length >= 2) {
      this.buscarProductoServicio(codigo.trim());
    }
  }

  // Buscar producto o servicio por código
  private buscarProductoServicio(codigo: string): void {
    this.isLoadingProductoServicio = true;
    console.log('🔍 Iniciando búsqueda de producto/servicio por código:', {
      codigo: codigo,
      productosDisponibles: this.products.length,
      serviciosDisponibles: this.services.length
    });

    // Buscar en productos usando el campo correcto de la BD
    const producto = this.products.find(p => {
      const codigoProducto = p.codigo_producto;
      const coincide = codigoProducto && codigoProducto.toString().toLowerCase() === codigo.toLowerCase();
      if (coincide) {
        console.log('✅ Producto encontrado:', {
          id: p.id,
          codigo_producto: p.codigo_producto,
          descripcion: p.descripcion,
          precio_unitario: p.precio_unitario,
          measurement_unit_id: p.measurement_unit_id
        });
      }
      return coincide;
    });

    if (producto) {
      console.log('✅ Producto encontrado con coincidencia exacta de código:', producto);
      console.log('🔗 Relación de unidad de medida:');
      console.log('   - Producto.measurement_unit_id:', producto.measurement_unit_id);
      console.log('   - Se buscará en unidades de medida por measurement_unit_id');
      this.autocompletarProducto(producto);
      this.mostrarAlerta('Producto encontrado y datos autocompletados', 'success');
      this.isLoadingProductoServicio = false;
      return;
    }

    // Buscar en servicios usando el campo correcto de la BD
    const servicio = this.services.find(s => {
      const codigoServicio = s.codigo_servicio;
      const coincide = codigoServicio && codigoServicio.toString().toLowerCase() === codigo.toLowerCase();
      if (coincide) {
        console.log('✅ Servicio encontrado:', {
          id: s.id,
          codigo_servicio: s.codigo_servicio,
          descripcion: s.descripcion,
          precio_unitario: s.precio_unitario
        });
      }
      return coincide;
    });

    if (servicio) {
      console.log('✅ Servicio encontrado con coincidencia exacta de código:', servicio);
      console.log('🔗 Relación de unidad de medida:');
      console.log('   - Servicio.measurement_unit_id:', servicio.measurement_unit_id);
      console.log('   - Se buscará en unidades de medida por measurement_unit_id');
      this.autocompletarServicio(servicio);
      this.mostrarAlerta('Servicio encontrado y datos autocompletados', 'success');
      this.isLoadingProductoServicio = false;
      return;
    }

    // Si no se encuentra nada
    console.log('❌ No se encontró producto o servicio con código:', codigo);
    console.log('🔍 Códigos de productos disponibles:', this.products.map(p => p.codigo_producto));
    console.log('🔍 Códigos de servicios disponibles:', this.services.map(s => s.codigo_servicio));
    this.mostrarAlerta(`No se encontró un producto o servicio con el código "${codigo}". Verifique que el código sea correcto.`, 'warning');
    this.isLoadingProductoServicio = false;
  }

  // Autocompletar datos del producto
  private autocompletarProducto(producto: any): void {
    console.log('🔄 Autocompletando producto:', producto);
    
    // Llenar descripción usando el campo correcto de la BD
    const descripcionInput = document.querySelector('input[name="descripcion"]') as HTMLInputElement;
    if (descripcionInput) {
      descripcionInput.value = producto.descripcion || '';
      console.log('✅ Descripción autocompletada:', producto.descripcion);
    }

    // Llenar valor unitario usando el campo correcto de la BD
    const valorInput = document.querySelector('input[name="valorUnitario"]') as HTMLInputElement;
    if (valorInput) {
      valorInput.value = producto.precio_unitario || '';
      console.log('✅ Valor unitario autocompletado:', producto.precio_unitario);
    }

    // Autocompletar unidad de medida basada en measurement_unit_id
    if (producto.measurement_unit_id) {
      const nombreUnidad = this.obtenerNombreUnidadMedida(producto.measurement_unit_id);
      if (nombreUnidad) {
        const unidadMedidaInput = document.querySelector('input[name="unidadMedida"]') as HTMLInputElement;
        if (unidadMedidaInput) {
          unidadMedidaInput.value = nombreUnidad;
          console.log('✅ Unidad de medida autocompletada:', nombreUnidad);
        } else {
          console.log('⚠️ No se encontró el campo input[name="unidadMedida"] en el HTML');
        }
      } else {
        console.log('⚠️ No se pudo obtener el nombre de la unidad de medida para ID:', producto.measurement_unit_id);
      }
    } else {
      console.log('⚠️ El producto no tiene measurement_unit_id');
    }
  }

  // Autocompletar datos del servicio
  private autocompletarServicio(servicio: any): void {
    console.log('🔄 Autocompletando servicio:', servicio);
    
    // Llenar descripción usando el campo correcto de la BD
    const descripcionInput = document.querySelector('input[name="descripcion"]') as HTMLInputElement;
    if (descripcionInput) {
      descripcionInput.value = servicio.descripcion || '';
      console.log('✅ Descripción autocompletada:', servicio.descripcion);
    }

    // Llenar valor unitario usando el campo correcto de la BD
    const valorInput = document.querySelector('input[name="valorUnitario"]') as HTMLInputElement;
    if (valorInput) {
      valorInput.value = servicio.precio_unitario || '';
      console.log('✅ Valor unitario autocompletado:', servicio.precio_unitario);
    }

    // Autocompletar unidad de medida basada en measurement_unit_id
    if (servicio.measurement_unit_id) {
      const nombreUnidad = this.obtenerNombreUnidadMedida(servicio.measurement_unit_id);
      if (nombreUnidad) {
        const unidadMedidaInput = document.querySelector('input[name="unidadMedida"]') as HTMLInputElement;
        if (unidadMedidaInput) {
          unidadMedidaInput.value = nombreUnidad;
          console.log('✅ Unidad de medida autocompletada:', nombreUnidad);
        } else {
          console.log('⚠️ No se encontró el campo input[name="unidadMedida"] en el HTML');
        }
      } else {
        console.log('⚠️ No se pudo obtener el nombre de la unidad de medida para ID:', servicio.measurement_unit_id);
      }
    } else {
      console.log('⚠️ El servicio no tiene measurement_unit_id');
    }
  }


  // Método para limpiar campos que se llenaron automáticamente
  private limpiarCamposProductoServicio(): void {
    console.log('Limpiando campos automáticos porque se borró el código');
    
    // Limpiar campos automáticos
    const descripcionInput = document.querySelector('input[name="descripcion"]') as HTMLInputElement;
    if (descripcionInput) {
      descripcionInput.value = '';
    }

    const valorInput = document.querySelector('input[name="valorUnitario"]') as HTMLInputElement;
    if (valorInput) {
      valorInput.value = '';
    }

    // Limpiar campo de unidad de medida
    const unidadMedidaInput = document.querySelector('input[name="unidadMedida"]') as HTMLInputElement;
    if (unidadMedidaInput) {
      unidadMedidaInput.value = '';
    }
    
    console.log('Campos automáticos limpiados');
    
    // Mostrar mensaje informativo
    this.mostrarAlerta('Campos automáticos limpiados. Ingrese un código válido para autocompletar.', 'info');
  }

  // Método para buscar cliente cuando se ingresa solo el número de documento
  onClienteChange(): void {
    console.log('🔄 onClienteChange ejecutado. Número de documento:', this.clienteForm.numeroDocumento);
    
    // Limpiar timer anterior si existe
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    
    // Si se borró el número de documento, limpiar campos automáticos
    if (this.clienteForm.numeroDocumento.trim() === '') {
      console.log('Número de documento vacío, limpiando campos...');
      this.limpiarCamposAutomaticos();
      return;
    }
    
    // Solo buscar si el número de documento tiene al menos 5 caracteres
    if (this.clienteForm.numeroDocumento.trim().length >= 5) {
      console.log('Número de documento válido, iniciando búsqueda...');
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
    if (this.clienteForm.numeroDocumento.trim() && 
        this.clienteForm.numeroDocumento.trim().length >= 5) {
      this.buscarCliente();
    }
  }

  // Método para buscar cliente en la API
  private buscarCliente(): void {
    this.isLoadingCliente = true;
    console.log('Iniciando búsqueda de cliente por documento:', {
      documento: this.clienteForm.numeroDocumento.trim()
    });
    
    this.invoicesNotesService.searchUsersRobust(
      '', // No enviar nombre, solo documento
      this.clienteForm.numeroDocumento.trim()
    ).subscribe({
      next: (clientes) => {
        this.isLoadingCliente = false;
        console.log('📋 Resultados de búsqueda:', clientes);
        
        if (clientes && clientes.length > 0) {
          // Buscar SOLO coincidencia exacta de documento
          const clienteEncontrado = clientes.find(cliente => {
            const documentoCoincide = cliente.numero_documento && cliente.numero_documento.trim() === this.clienteForm.numeroDocumento.trim();
            return documentoCoincide;
          });
          
          if (clienteEncontrado) {
            console.log('✅ Cliente encontrado con coincidencia exacta de documento:', clienteEncontrado);
            this.autocompletarDatosCliente(clienteEncontrado);
            this.mostrarAlerta('Cliente encontrado y datos autocompletados', 'success');
          } else {
            console.log('❌ No se encontró coincidencia exacta de documento');
            this.mostrarAlerta(`No se encontró un cliente con el documento "${this.clienteForm.numeroDocumento}". Verifique que el número de documento sea correcto.`, 'warning');
          }
        } else {
          console.log('❌ No se encontraron clientes');
          this.mostrarAlerta('No se encontró un cliente con ese número de documento', 'warning');
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
    // Autocompletar todos los campos con los datos del cliente encontrado
    // Incluyendo el nombre que se llenará automáticamente
    this.clienteForm.nombre = cliente.nombre || '';
    this.clienteForm.tipoDocumento = cliente.tipo_documento || '';
    this.clienteForm.correoElectronico = cliente.correo_electronico || '';
    this.clienteForm.pais = cliente.pais || '';
    this.clienteForm.direccion = cliente.direccion || '';
    this.clienteForm.telefono = cliente.telefono || '';
    
    // Mantener el número de documento que el usuario ingresó
    this.clienteForm.numeroDocumento = this.clienteForm.numeroDocumento;
  }

  // Método para limpiar campos que se llenaron automáticamente
  private limpiarCamposAutomaticos(): void {
    console.log('Limpiando campos automáticos porque se borró el documento');
    console.log('Estado antes de limpiar:', this.clienteForm);
    
    // Limpiar todos los campos automáticos
    this.clienteForm.nombre = '';
    this.clienteForm.tipoDocumento = '';
    this.clienteForm.correoElectronico = '';
    this.clienteForm.pais = '';
    this.clienteForm.direccion = '';
    this.clienteForm.telefono = '';
    
    console.log('📋 Estado después de limpiar:', this.clienteForm);
    
    // Mostrar mensaje informativo
    this.mostrarAlerta('Campos automáticos limpiados. Ingrese un número de documento válido para autocompletar.', 'info');
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

  // Método de prueba para verificar el autocompletado de unidad de medida
  public probarAutocompletadoUnidadMedida(): void {
    console.log('🧪 PROBANDO AUTCOMPLETADO DE UNIDAD DE MEDIDA');
    console.log('📊 Productos disponibles:', this.products.length);
    console.log('📊 Servicios disponibles:', this.services.length);
    console.log('📊 Unidades de medida cargadas:', this.measurementUnits.length);
    
    if (this.products.length > 0) {
      console.log('🔍 Probando con el primer producto:', this.products[0]);
      this.autocompletarProducto(this.products[0]);
    }
    
    if (this.services.length > 0) {
      console.log('🔍 Probando con el primer servicio:', this.services[0]);
      this.autocompletarServicio(this.services[0]);
    }
  }

}
