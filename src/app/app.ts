import { Component, signal } from '@angular/core';
import {  NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { Footer } from "./footer/footer";
import { filter } from 'rxjs';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, CommonModule,  Footer,  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FacturacionAngularPantallas');

  isSidebarOpen = false;
  showLayout = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const hiddenRoutes = ['/inicio', '/login', '/register', '/configuracion',
                '/parametros-generales', '/config-correo', '/eventos', '/historial-notificaciones',
                '/notificaciones-email', '/certificado-digital', '/resolucion-facturas',
                '/retencion-respaldo', '/cambios-normativos', '/impuestos-retenciones',
                '/nuevo-impuesto', '/nueva-resolucion', '/editar-resolucion/:id',];
        this.showLayout = !hiddenRoutes.includes(event.urlAfterRedirects);
      });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
