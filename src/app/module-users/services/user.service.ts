import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../usuarios/usuarios';

export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  created_at: string;
  updated_at: string;
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

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Funciones para manejar el nombre comercial temporal en la descripción

  getTempCommercialName(user: User): string | null {
    if (user.descripcion?.startsWith('TEMP_COMMERCIAL_NAME:')) {
      return user.descripcion.replace('TEMP_COMMERCIAL_NAME:', '');
    }
    return null;
  }

  clearTempCommercialName(userId: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}`, {
      descripcion: null
    });
  }

  // Método para verificar si un usuario existe por email
  getUserByEmail(email: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}`);
  }


  /*
  // En el ngOnInit o donde inicialices el formulario de empresa

  ngOnInit() {
    // Obtener el usuario actual (desde tu servicio de autenticación)
    const currentUser = this.authService.getCurrentUser(); // o como obtengas el usuario actual
    
    if (currentUser) {
      const tempCommercialName = this.userService.getTempCommercialName(currentUser);
      
      if (tempCommercialName) {
        // Pre-llenar el formulario con el nombre comercial
        this.empresaForm.patchValue({
          nombreComercial: tempCommercialName
        });
        
        // Opcional: Mostrar mensaje informativo
        this.showNotification('Se ha cargado el nombre comercial de tu registro', 'info');
      }
    }
    
  }
  */
}