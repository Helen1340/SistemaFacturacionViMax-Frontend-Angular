import { Component, signal, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { Footer } from './footer/footer';
import { filter } from 'rxjs';
import { ToastComponent } from './module-notifications/toast/toast.component';
import { FirebaseService } from './module-notifications/services/firebase-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, CommonModule, Footer, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  
  protected readonly title = signal('FacturacionAngularPantallas');
  isSidebarOpen = false;
  showLayout = true;

  private hiddenRoutes: string[] = [
    '/inicio', '/login', '/register', '/configuracion',
    '/parametros-generales', '/config-correo', '/eventos',
    '/historial-notificaciones', '/notificaciones-email',
    '/certificado-digital', '/resolucion-facturas',
    '/retencion-respaldo', '/cambios-normativos',
    '/impuestos-retenciones', '/nuevo-impuesto',
    '/nueva-resolucion', '/editar-resolucion'
  ];

  constructor(
    private router: Router,
    private firebaseService: FirebaseService
  ) {

    // Detecta cambio de rutas
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      
      const currentUrl = String(event.urlAfterRedirects).split('?')[0];

      // Soporte para rutas con parámetros como /editar-resolucion/5
      const hide = this.hiddenRoutes.some(r => {
        if (r.includes('/:')) {
          const base = r.split('/:')[0];
          return currentUrl.startsWith(base + '/');
        }
        return currentUrl === r;
      });

      this.showLayout = !hide;
    });
  }

  async ngOnInit() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      await this.firebaseService.init(parseInt(userId));
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
