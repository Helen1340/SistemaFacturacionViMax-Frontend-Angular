import { Routes } from '@angular/router';
import { ProductosServicios } from './module-product-service/productos-servicios/productos-servicios';

import { RegitrarServicio } from './module-product-service/regitrar-servicio/regitrar-servicio';
import { Clientes } from './module-clients/clientes/clientes';
import { Reportes } from './module-reports/reportes/reportes';
import { Usuarios } from './module-users/usuarios/usuarios';
import { Contingencia } from './module-contingency/contingencia/Contingency/contingencia';
import { FacturaContingencia } from './module-contingency/contingencia/Contingency/Contingency invoices/factura-contingencia';
import { RecepcionDocumentos } from './module-document-reception/recepcion-documentos/recepcion-documentos';
import { Notificaciones } from './module-notifications/notificaciones/notificaciones';
import { Configuracion } from './module-settings/configuracion/configuracion';
import { FacturasNotas } from './module-invoices-notes/facturas-notas/facturas-notas';
import { RegistrarProductoComponent } from './module-product-service/registrar-producto/registrar-producto';

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
import { Acceder } from './module-home/acceder/acceder';
import { Registro } from './module-home/registro/registro';
import { ParametrosGenerales } from './module-settings/parametros-generales/parametros-generales';


















































export const routes: Routes = [



  //ESPACIO PARA LAS RUTAS DE DAVID (MODULE FACTURAS, CLIENTES)

  { path: '', redirectTo: 'facturas-notas', pathMatch: 'full' }, // redirige al inicio
  { path: 'facturas-notas', component: FacturasNotas} ,
  { path: '', redirectTo: '', pathMatch: 'full' }, // redirige al inicio
  { path: 'facturas-notas', component: FacturasNotas} ,  
  {path: `clientes`, component: Clientes},
  // ... otras rutas























  //ESPACIO PARA LAS RUTAS DE HELEN (MODULE PRODUCTOS)
  { path: 'productos-servicios', component: ProductosServicios},
  {path: 'registrar-producto', component: RegistrarProductoComponent},
  {path: 'registrar-servicio',component: RegitrarServicio},

  // ... otras rutas












  //ESPACIO PARA LAS RUTAS DE WILFRAN (MODULE REPORTES, USUARIOS)

  //rutes home
  { path: 'login', component: Acceder },
  { path: 'acceso', component: Acceder },
  { path: 'registro', component: Registro },


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

































//ESPACIO PARA LAS RUTAS DE (MODULE COFIGURACIONES)
  {path: 'configuracion',component:Configuracion},
  {path: 'parametros-generales',component: ParametrosGenerales},
  {path: 'certiifcacido-digital', component: CertificadoDigital},
  {path: 'notificaciones-email',component: NotificacionesEmails},

















];

