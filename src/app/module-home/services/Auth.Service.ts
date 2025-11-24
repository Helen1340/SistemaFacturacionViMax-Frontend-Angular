import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
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
  private getAuthHeaders(): { headers: HttpHeaders } {
    const raw = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
    const token = raw?.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
    return { headers: new HttpHeaders({ Authorization: token }) };
  }

  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, this.getAuthHeaders());
  }

  // 🔹 Logout
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, this.getAuthHeaders());
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
