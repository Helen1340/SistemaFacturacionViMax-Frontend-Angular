import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/Auth.Service';
import { FirebaseService } from '../../module-notifications/services/firebase-service';
import { NotificacionesService } from '../../module-notifications/services/notificaciones.service';


@Component({
  selector: 'app-logout',
  template: `<p>Cerrando sesión...</p>`
})
export class Logout implements OnInit {
  constructor(private authService: AuthService, private router: Router, private firebaseService: FirebaseService, private notiService: NotificacionesService) {}

  ngOnInit(): void {
    this.authService.logout().subscribe({
      next: (res) => {
        this.notiService.disconnect();
        this.firebaseService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.notiService.disconnect();
        this.firebaseService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
