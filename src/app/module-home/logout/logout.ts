import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/Auth.Service';


@Component({
  selector: 'app-logout',
  template: `<p>Cerrando sesión...</p>`
})
export class LogoutComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.logout().subscribe({
      next: (res) => {
        console.log(res.message);
        this.authService.clearToken();
        this.router.navigate(['/login']); // Ajusta la ruta de tu login
      },
      error: (err) => {
        console.error(err);
        this.authService.clearToken();
        this.router.navigate(['/login']);
      }
    });
  }
}
