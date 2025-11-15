import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Cliente } from '../clientes/clientes';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiUrl = 'http://localhost/api/users';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar con el servidor.';
          break;
        case 404:
          errorMessage = 'API no encontrada.';
          break;
        case 422:
          errorMessage = 'Datos inválidos o repetidos.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
      }
    }

    console.error('Error en ClientService:', error);
    return throwError(() => errorMessage);
  }

  /** Obtener clientes (role_id=4) */
  getClientes(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}?role_id=4`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError.bind(this)));
  }

  /** Obtener cliente por ID */
  getClienteById(id: number): Observable<Cliente> {
    return this.http
      .get<Cliente>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /** Crear cliente (con role_id=4 fijo) */
  createCliente(clienteData: any): Observable<any> {
    const data = {
      ...clienteData,
      role_id: 4, // 🔒 Rol fijo (Cliente)
    };

    return this.http
      .post<any>(this.apiUrl, data, this.httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /** Actualizar cliente */
  updateCliente(id: number, clienteData: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, clienteData, this.httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /** Eliminar cliente */
  deleteCliente(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Obtiene todos los usuarios y filtra por role_id 2
   */
  getClientesConFiltro(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError.bind(this)));
  }
}
