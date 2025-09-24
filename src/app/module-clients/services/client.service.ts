import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Cliente } from '../clientes/clientes';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost/api/users';
  
  // Headers por defecto
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
      
      // Mensajes específicos según el código de estado
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar con el servidor. Verifique su conexión.';
          break;
        case 404:
          errorMessage = 'Endpoint no encontrado. Verifique la URL de la API.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        case 422:
          errorMessage = 'Datos de entrada inválidos.';
          break;
      }
    }
    
    console.error('Error en ClientService:', error);
    return throwError(() => errorMessage);
  }

  /**
   * Prueba la conexión con la API
   */
  testApiConnection(): Observable<any> {
    return this.http.get(this.apiUrl, this.httpOptions).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene todos los clientes (usuarios con role_id 2)
   */
  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?role_id=2`, this.httpOptions).pipe(
      retry(2), // Reintenta 2 veces en caso de error
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene todos los usuarios y filtra por role_id 2
   */
  getClientesConFiltro(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, this.httpOptions).pipe(
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene un cliente por ID
   */
  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Crea un nuevo cliente
   */
  createCliente(clienteData: any): Observable<any> {
    // Validar datos antes de enviar
    if (!clienteData || !clienteData.nombre || !clienteData.numero_documento) {
      return throwError(() => 'Datos del cliente incompletos');
    }

    return this.http.post<any>(this.apiUrl, clienteData, this.httpOptions).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Actualiza un cliente existente
   */
  updateCliente(id: number, clienteData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, clienteData, this.httpOptions).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Elimina un cliente
   */
  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Alias para createCliente (mantener compatibilidad)
   */
  addCliente(cliente: Cliente): Observable<Cliente> {
    return this.createCliente(cliente);
  }
}