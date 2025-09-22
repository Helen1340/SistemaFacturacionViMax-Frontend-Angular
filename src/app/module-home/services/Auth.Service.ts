import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: {
    id: number;
    nombre: string;
    correo_electronico: string;
    company_id: number;
    role_id: number;
    numero_documento: string;
  };
  company: {
    id: number;
    razon_social: string;
    nit: string;
    correo_electronico: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api';
  private authToken = new BehaviorSubject<string | null>(null);
  private isLoggedIn = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    this.checkToken();
  }

  // Comprueba el token al iniciar la aplicación
  private checkToken() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.authToken.next(token);
      this.isLoggedIn.next(true);
    }
  }

  // 🟢 Método de registro
  // Envía todos los datos de la empresa y el usuario como lo pide tu API
  register(registerData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData).pipe(
      tap(response => {
        this.setToken(response.access_token);
      })
    );
  }

  // 🟢 Método de inicio de sesión
  // Envía solo el correo y la contraseña
  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.access_token);
      })
    );
  }

  // 🟢 Método para cerrar sesión
  logout(): void {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    this.http.post(`${this.apiUrl}/logout`, null, { headers }).subscribe({
      next: () => {
        this.removeToken();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
        // En caso de error, igual cierra la sesión localmente
        this.removeToken();
        this.router.navigate(['/login']);
      }
    });
  }

  // Devuelve el token actual
  getToken(): string | null {
    return this.authToken.getValue();
  }

  // Devuelve si el usuario está autenticado
  get isAuthenticated(): Observable<boolean> {
    return this.isLoggedIn.asObservable();
  }

  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.authToken.next(token);
    this.isLoggedIn.next(true);
  }

  private removeToken(): void {
    localStorage.removeItem('auth_token');
    this.authToken.next(null);
    this.isLoggedIn.next(false);
  }
}