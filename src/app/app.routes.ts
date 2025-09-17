import { Routes } from '@angular/router';
import { ProductosServicios } from './module-product-service/productos-servicios/productos-servicios';

import { RegitrarServicio } from './module-product-service/regitrar-servicio/regitrar-servicio';
import { Clientes } from './module-clients/clientes/clientes';
import { Reportes } from './module-reports/reportes/reportes';
import { Usuarios } from './module-users/usuarios/usuarios';
import { Contingencia } from './module-contingency/contingencia/contingencia';
import { RecepcionDocumentos } from './module-document-reception/recepcion-documentos/recepcion-documentos';
import { Notificaciones } from './module-notifications/notificaciones/notificaciones';
import { Configuracion } from './module-settings/configuracion/configuracion';
import { FacturasNotas } from './module-invoices-notes/facturas-notas/facturas-notas';
import { RegistrarProductoComponent } from './module-product-service/registrar-producto/registrar-producto';
















































export const routes: Routes = [



  //ESPACIO PARA LAS RUTAS DE DAVID (MODULE FACTURAS, CLIENTES)
  { path: '', redirectTo: 'facturas-notas', pathMatch: 'full' }, // redirige al inicio
  { path: 'facturas-notas', component: FacturasNotas} ,  
  {path: `clientes`, component: Clientes},
  // ... otras rutas
     























  //ESPACIO PARA LAS RUTAS DE HELEN (MODULE PRODUCTOS)
  { path: 'productos-servicios', component: ProductosServicios},
  {path: 'registrar-producto', component: RegistrarProductoComponent},
  {path: 'registrar-servicio',component: RegitrarServicio},
  
  // ... otras rutas
     
  












  //ESPACIO PARA LAS RUTAS DE WILFRAN (MODULE REPORTES, USUARIOS)
  {path: 'reportes',component: Reportes},
  {path: 'usuarios',component: Usuarios},






































  //ESPACIO PARA LAS RUTAS DE CARLOS (MODULE CONTINGENCIA, RECEPCION_DOCUMENTOS, NOTIFICACIONES)
{path: 'contingencia',component: Contingencia},
{path: 'recepción-documentos',component: RecepcionDocumentos},
{path: 'notificaciones',component: Notificaciones},

































//ESPACIO PARA LAS RUTAS DE (MODULE COFIGURACIONES)
{path: 'configuración',component:Configuracion},















];

