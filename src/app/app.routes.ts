import { Routes } from '@angular/router';
import { Clientes } from './module-clients/clientes/clientes';
import { NuevoCliente } from './module-clients/nuevo-cliente/nuevo-cliente';
import { EditarCliente } from './module-clients/editar-cliente/editar-cliente';
import { Reportes } from './module-reports/reportes/reportes';
import { Usuarios } from './module-users/usuarios/usuarios';
import { Contingencia } from './module-contingency/contingencia/Contingency/contingencia';
import { FacturaContingencia } from './module-contingency/contingencia/Contingency/Contingency invoices/factura-contingencia';
import { RecepcionDocumentos } from './module-document-reception/recepcion-documentos/recepcion-documentos';
import { Notificaciones } from './module-notifications/notificaciones/notificaciones';
import { Configuracion } from './module-settings/configuracion/configuracion';
import { ImpuestosRetenciones } from './module-settings/impuestos-retenciones/impuestos-retenciones';
import { NuevoImpuesto } from './module-settings/impuestos-retenciones/nuevo-impuesto/nuevo-impuesto';

import { FacturasNotas } from './module-invoices-notes/facturas-notas/facturas-notas';
import { NuevaFactura } from './module-invoices-notes/nueva-factura/nueva-factura';
import { EditarFactura } from './module-invoices-notes/editar-facturas/editar-facturas';
import { NuevaNotaComponent } from './module-invoices-notes/nueva-nota/nueva-nota';
import { DetalleFacturas } from './module-invoices-notes/detalle-facturas/detalle-facturas';
import { NuevoUsuario } from './module-users/nuevo-usuario/nuevo-usuario';
import { EditUsuario } from './module-users/edit-usuario/edit-usuario';
import { VerUsuario } from './module-users/ver-usuario/ver-usuario';
import { ReporteFacturas } from './module-reports/reporte-facturas/reporte-facturas';
import { ReportePagos } from './module-reports/reporte-pagos/reporte-pagos';
import { ReporteClientes } from './module-reports/reporte-clientes/reporte-clientes';
import { ReporteUsuarios } from './module-reports/reporte-usuarios/reporte-usuarios';
import { ReporteImpuestos } from './module-reports/reporte-impuestos/reporte-impuestos';
import { CertificadoDigital } from './module-settings/certificado-digital/certificado-digital';
import { NotificacionesEmails } from './module-settings/notificaciones-emails/notificaciones-emails';
import { RetencionRespaldo } from './module-settings/retencion-respaldo/retencion-respaldo';
import { ConfiguracionRetencionDocumental } from './module-settings/retencion-respaldo/configuracion-retencion-documental/configuracion-retencion-documental';
import { ConfiguracionRespaldoAutomatico } from './module-settings/retencion-respaldo/configuracion-respaldo-automatico/configuracion-respaldo-automatico';
import { CambiosNormativos } from './module-settings/cambios-normativos/cambios-normativos';
import { Acceder } from './module-home/acceder/acceder';
import { ParametrosGenerales } from './module-settings/parametros-generales/parametros-generales';
import { HistorialTecnico } from './module-notifications/historial-tecnico/historial-tecnico';
import { DestinatariosEventos } from './module-settings/notificaciones-emails/destinatarios-eventos/destinatarios-eventos';
import { HistorialNotify } from './module-settings/notificaciones-emails/historial-notify/historial-notify';
import { ConfigCorreo } from './module-settings/notificaciones-emails/config-correo/config-correo';


import { Registro } from './module-home/registro/registro';
import { ProductosServicios } from './module-product-service/productos-servicios/productos-servicios';
import { RegistrarProductoComponent } from './module-product-service/registrar-producto/registrar-producto';
import { RegitrarServicio } from './module-product-service/regitrar-servicio/regitrar-servicio';
import { EditarProducto } from './module-product-service/editar-item/editar-producto';
import { EditarServicio } from './module-product-service/editar-servicio/editar-servicio';
import { DetallesProducto } from './module-product-service/detalles-producto/detalles-producto';
import { DetallesServicio } from './module-product-service/detalles-servicio/detalles-servicio';
















































export const routes: Routes = [



  //ESPACIO PARA LAS RUTAS DE DAVID (MODULE FACTURAS, CLIENTES)
  
  { path: '', redirectTo: 'facturas-notas', pathMatch: 'full' },
  { path: 'facturas-notas', component: FacturasNotas },
  { path: 'clientes', component: Clientes },
  { path: 'nueva-factura', component: NuevaFactura },
  { path: 'nueva-nota', component: NuevaNotaComponent },
  { path: 'editar-facturas/:id', component: EditarFactura },
  { path: 'detalle-facturas/:id', component: DetalleFacturas },
  { path: 'nuevo-cliente', component: NuevoCliente },
  { path: 'editar-cliente/:id', component: EditarCliente },
  // ... otras rutas
























  //ESPACIO PARA LAS RUTAS DE HELEN (MODULE PRODUCTOS)
  { path: 'productos-servicios', component: ProductosServicios},
  { path: 'registrar-producto', component: RegistrarProductoComponent},
  { path: 'registrar-servicio', component: RegitrarServicio},

  {path: 'editar-producto/:id', component: EditarProducto},
  {path: 'editar-servicio/:id', component: EditarServicio},

  {path: 'detalles-producto/:id', component: DetallesProducto},
  {path: 'detalles-servicio/:id', component: DetallesServicio},
  

  // ... otras rutas












  //ESPACIO PARA LAS RUTAS DE WILFRAN (MODULE REPORTES, USUARIOS)

  //rutes home
  { path: 'login', component: Acceder },
  { path: 'acceso', component: Acceder },
  { path: 'register', component: Registro },


  {path: 'reportes',component: Reportes},
  {path: 'usuarios',component: Usuarios},
  {path: 'nuevo-usuario', component: NuevoUsuario},
  {path: 'editar-usuario/:id', component: EditUsuario},
  {path: 'ver-usuario/:id', component: VerUsuario},

  {path: 'reportes-facturas', component: ReporteFacturas},
  {path: 'reporte-pagos', component: ReportePagos},
  {path: 'reporte-clientes', component: ReporteClientes },
  {path: 'reporte-usuarios', component: ReporteUsuarios},
  {path: 'reporte-impuestos', component: ReporteImpuestos},






































  //ESPACIO PARA LAS RUTAS DE CARLOS (MODULE CONTINGENCIA, RECEPCION_DOCUMENTOS, NOTIFICACIONES)
{path: 'contingencia',component: Contingencia},
{path: 'facturas-contingencia',component: FacturaContingencia},
{path: 'recepción-documentos',component: RecepcionDocumentos},
{path: 'notificaciones',component: Notificaciones},
{path: 'historial-tecnico',component: HistorialTecnico},

































//ESPACIO PARA LAS RUTAS DE (MODULE COFIGURACIONES)
  {path: 'configuracion',component:Configuracion},
  {path: 'parametros-generales',component: ParametrosGenerales},
  {path: 'certificado-digital', component: CertificadoDigital},
  {path: 'notificaciones-email',component: NotificacionesEmails},
  {path: 'retencion-respaldo', component: RetencionRespaldo},
  {path: 'configuracion-retencion-documental', component: ConfiguracionRetencionDocumental},
  {path: 'configuracion-respaldo-automatico', component: ConfiguracionRespaldoAutomatico},
  {path: 'cambios-normativos', component: CambiosNormativos},
  {path: 'impuestos-retenciones',component: ImpuestosRetenciones},
  {path: 'nuevo-impuesto',component: NuevoImpuesto},

  //notificaciones 
  {path: 'notificaciones-email',component: NotificacionesEmails},
  {path: 'config-correo',component: ConfigCorreo},
  {path: 'eventos',component: DestinatariosEventos},
  {path: 'historial-notificaciones',component: HistorialNotify},

















];

