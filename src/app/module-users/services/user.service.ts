import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../usuarios/usuarios';

export interface Role {
  id: number;
  role_name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Interface que coincide con lo que espera la API
export interface CreateUserPayload {
  company_id?: number | null;
  role_id?: number | null;
  first_name: string;
  document_type?: 'NIT' | 'CC' | 'CE' | null;
  document_number: string;
  address?: string | null;
  country?: string | null;
  description?: string | null;
  email: string;
  phone?: string | null;
  status?: 'Active' | 'Inactive' | null;
  last_access?: string | null;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost/api/users';
  private rolesUrl = 'http://localhost/api/roles';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.rolesUrl);
  }

  testApiConnection(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Método actualizado con tipado correcto
  createUser(userPayload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(this.apiUrl, userPayload);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Método para activar/desactivar usuario (cambiar estado)
  toggleUserStatus(id: number, newStatus: 'Active' | 'Inactive'): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, {
      status: newStatus
    });
  }

  // Funciones para manejar el nombre comercial temporal en la descripción
  getTempCommercialName(user: User): string | null {
    if (user.description?.startsWith('TEMP_COMMERCIAL_NAME:')) {
      return user.description.replace('TEMP_COMMERCIAL_NAME:', '');
    }
    return null;
  }

  clearTempCommercialName(userId: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}`, {
      description: null
    });
  }

  // Método para verificar si un usuario existe por email
  getUserByEmail(email: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}`);
  }

  // Método para verificar si un documento ya existe
  getUserByDocument(documentNumber: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?document_number=${documentNumber}`);
  }
}