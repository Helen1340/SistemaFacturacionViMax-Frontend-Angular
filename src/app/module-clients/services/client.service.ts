import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../clientes/clientes';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://facturacion-vimax-api/api/users';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los clientes (usuarios con rol ID 4)
   */
  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?role=4&include=nombre,tipo_documento,numero_documento,pais,correo_electronico`);
  }

  /**
   * Obtiene todos los usuarios y filtra del lado del cliente por rol ID 4
   */
  getClientesConFiltro(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?include=nombre,tipo_documento,numero_documento,pais,correo_electronico,rol_id,rol,role_id,role`);
  }

  /**
   * Obtiene un cliente por ID
   */
  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  /**
   * Agrega un nuevo cliente
   */
  addCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  /**
   * Crea un nuevo cliente (alias para addCliente)
   */
  createCliente(clienteData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, clienteData);
  }

  /**
   * Actualiza un cliente existente
   */
  updateCliente(id: number, clienteData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, clienteData);
  }

  /**
   * Elimina un cliente
   */
  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Prueba la conexión con la API
   */
  testApiConnection(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
