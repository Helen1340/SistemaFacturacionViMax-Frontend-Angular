import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InvoicesNotesService {
  // URLs de la API - configura estas según tu servidor
  private baseUrl = 'http://localhost'; // Cambia por tu URL correcta
  private apiUrl = `${this.baseUrl}/api/electronicInvoices`;
  private notesApiUrl = `${this.baseUrl}/api/creditDebitNotes`;
  private usersApiUrl = `${this.baseUrl}/api/users`;
  private radianEventsApiUrl = `${this.baseUrl}/api/radianEvents`;
  private electronicDocumentsApiUrl = `${this.baseUrl}/api/electronicDocuments`;

  constructor(private http: HttpClient) {}

  getInvoicesNotes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl)
      .pipe(
        timeout(10000), // 10 segundos de timeout
        catchError(this.handleError)
      );
  }

  testApiConnection(): Observable<any> {
    return this.http.get(this.apiUrl)
      .pipe(
        timeout(5000), // 5 segundos de timeout para prueba rápida
        catchError(this.handleError)
      );
  }

  // Método para probar diferentes URLs de la API
  testMultipleEndpoints(): Observable<any> {
    const endpoints = [
      this.apiUrl,
      `${this.baseUrl}/api/electronic-invoices`,
      `${this.baseUrl}/api/invoices`,
      `${this.baseUrl}/api/facturas`,
      `${this.baseUrl}/api/facturas-notas`,
      `${this.baseUrl}/api/electronicInvoices`,
      `${this.baseUrl}/electronicInvoices`,
      `${this.baseUrl}/api/`,
      this.baseUrl
    ];

    // Probar el primer endpoint
    return this.http.get(endpoints[0])
      .pipe(
        timeout(3000),
        catchError((error) => {
          console.log(`Endpoint ${endpoints[0]} falló:`, error);
          // Si falla, probar el siguiente
          return this.http.get(endpoints[1])
            .pipe(
              timeout(3000),
              catchError((error2) => {
                console.log(`Endpoint ${endpoints[1]} falló:`, error2);
                return throwError(() => new Error('Todos los endpoints probados fallaron'));
              })
            );
        })
      );
  }

  // Método para obtener información de diagnóstico
  getDiagnosticInfo(): any {
    return {
      baseUrl: this.baseUrl,
      apiUrl: this.apiUrl,
      notesApiUrl: this.notesApiUrl,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
  }

  getInvoiceNoteById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createInvoiceNote(invoiceNote: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, invoiceNote);
  }

  updateInvoiceNote(invoiceNote: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${invoiceNote.id}`, invoiceNote);
  }

  deleteInvoiceNote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Notas crédito/débito
  getCreditDebitNotes(): Observable<any[]> {
    return this.http.get<any[]>(this.notesApiUrl);
  }

  getCreditDebitNoteById(id: number): Observable<any> {
    return this.http.get<any>(`${this.notesApiUrl}/${id}`);
  }

  // Métodos para Radian Events
  getRadianEvents(): Observable<any[]> {
    return this.http.get<any[]>(this.radianEventsApiUrl)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  getRadianEventById(id: number): Observable<any> {
    return this.http.get<any>(`${this.radianEventsApiUrl}/${id}`)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  // Métodos para Electronic Documents
  getElectronicDocuments(): Observable<any[]> {
    return this.http.get<any[]>(this.electronicDocumentsApiUrl)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  getElectronicDocumentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.electronicDocumentsApiUrl}/${id}`)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  // Método para obtener usuarios
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.usersApiUrl)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  // Método para obtener un usuario específico por ID
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.usersApiUrl}/${id}`)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  // Método para buscar usuarios por nombre y número de documento
  searchUsersByNameAndDocument(nombre: string, numeroDocumento: string): Observable<any[]> {
    console.log('🔍 Buscando cliente con:', { nombre, numeroDocumento });
    console.log('🔗 URL de búsqueda:', `${this.usersApiUrl}?nombre=${encodeURIComponent(nombre)}&numero_documento=${encodeURIComponent(numeroDocumento)}`);
    
    return this.http.get<any[]>(`${this.usersApiUrl}?nombre=${encodeURIComponent(nombre)}&numero_documento=${encodeURIComponent(numeroDocumento)}`)
      .pipe(
        timeout(10000),
        catchError((error) => {
          console.error('❌ Error en búsqueda por nombre y documento:', error);
          return this.handleError(error);
        })
      );
  }

  // Método para buscar usuarios por nombre
  searchUsersByName(nombre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.usersApiUrl}?nombre=${encodeURIComponent(nombre)}`)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  // Método para buscar usuarios por número de documento
  searchUsersByDocument(numeroDocumento: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.usersApiUrl}?numero_documento=${encodeURIComponent(numeroDocumento)}`)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  // Método de búsqueda estricta que solo busca coincidencias exactas
  searchUsersRobust(nombre: string, numeroDocumento: string): Observable<any[]> {
    console.log('🔍 Iniciando búsqueda estricta:', { nombre, numeroDocumento });
    
    // Obtener todos los usuarios y filtrar localmente para mayor control
    return this.http.get<any[]>(this.usersApiUrl)
      .pipe(
        timeout(10000),
        catchError((error) => {
          console.error('❌ Error al obtener usuarios:', error);
          return this.handleError(error);
        })
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar con el servidor. Verifica que la API esté ejecutándose.';
          break;
        case 404:
          errorMessage = 'Endpoint no encontrado. Verifica la URL de la API.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        case 503:
          errorMessage = 'Servicio no disponible. El servidor puede estar en mantenimiento.';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('Error en InvoicesNotesService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}


