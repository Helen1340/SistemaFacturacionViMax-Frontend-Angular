import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // cambia según tu ruta real
  private userKey = 'auth_user';

  constructor(private http: HttpClient) {}

  // 🔹 Registro
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // 🔹 Login
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  // 🔹 Perfil actual (requiere token)
  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  // 🔹 Logout
  logout(): Observable<any> {
    this.clearToken();
    this.clearUser();
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  // 🧠 TOKEN
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  clearToken(): void {
    localStorage.removeItem('token');
  }

  // 🧠 USUARIO ACTUAL
  setUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): any {
    const data = localStorage.getItem(this.userKey);
    return data ? JSON.parse(data) : null;
  }

  clearUser(): void {
    localStorage.removeItem(this.userKey);
  }

  // 🔹 Verifica si hay sesión activa
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
