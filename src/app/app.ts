
import { Component } from '@angular/core';
import {  NavigationEnd, Router, RouterOutlet } from '@angular/router';

// src/app/app.ts
import { Component, signal, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { Footer } from "./footer/footer";
import { filter } from 'rxjs';
import { ToastComponent } from './module-notifications/toast/toast.component';
import { FirebaseService } from './module-notifications/services/firebase-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, CommonModule, Footer,ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
}


export class App implements OnInit {
  protected readonly title = signal('FacturacionAngularPantallas');
  isSidebarOpen = false;
  showLayout = true;

  constructor(
    private router: Router,
    private firebaseService: FirebaseService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const hiddenRoutes = ['/inicio', '/login', '/register', '/configuracion',
                '/parametros-generales', '/config-correo', '/eventos', '/historial-notificaciones',
                '/notificaciones-email', '/certificado-digital', '/resolucion-facturas',
                '/retencion-respaldo', '/cambios-normativos', '/impuestos-retenciones',
                '/nuevo-impuesto', '/nueva-resolucion', '/editar-resolucion/:id'];
        const url = String(event.urlAfterRedirects || '').split('?')[0];
        const isHidden = hiddenRoutes.some(r => {
          if (r.includes('/:')) {
            const base = r.split('/:')[0];
            return url.startsWith(base + '/');
          }
          return url === r;
        });
        this.showLayout = !isHidden;

        const hiddenRoutes = [
          '/inicio', '/login', '/register', '/configuracion',
          '/parametros-generales', '/config-correo', '/eventos',
          '/historial-notificaciones', '/notificaciones-email',
          '/certificado-digital', '/resolucion-facturas',
          '/retencion-respaldo', '/cambios-normativos',
          '/impuestos-retenciones', '/nuevo-impuesto',
          '/nueva-resolucion', '/editar-resolucion/:id'
        ];
        this.showLayout = !hiddenRoutes.includes(event.urlAfterRedirects);

      });
  }

  async ngOnInit() {
    // 🔥 Inicializar Firebase cuando el usuario esté logueado
    const userId = localStorage.getItem('userId');
    if (userId) {
      await this.firebaseService.init(parseInt(userId));
    }
    }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}