import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, timeout, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InvoicesNotesService {
  // URLs de la API - configura estas según tu servidor
  private baseUrl = 'http://facturacion-vimax-api'; // Cambia por tu URL correcta
  private apiUrl = `${this.baseUrl}/api/electronicInvoices`;
  private notesApiUrl = `${this.baseUrl}/api/creditDebitNotes`;
  private usersApiUrl = `${this.baseUrl}/api/users`;
  private radianEventsApiUrl = `${this.baseUrl}/api/radianEvents`;
  private electronicDocumentsApiUrl = `${this.baseUrl}/api/electronicDocuments`;
  private productsApiUrl = `${this.baseUrl}/api/products`;
  private servicesApiUrl = `${this.baseUrl}/api/services`;
  private measurementUnitsApiUrl = `${this.baseUrl}/api/measurementUnints`;

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

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.productsApiUrl)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  getServices(): Observable<any[]> {
    return this.http.get<any[]>(this.servicesApiUrl)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  // Obtener todas las unidades de medida
  getMeasurementUnits(): Observable<any[]> {
    return this.http.get<any[]>(this.measurementUnitsApiUrl)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  // Método que carga productos, servicios y unidades de medida de una vez (igual que en productos-servicios)
  getAllItemsWithUnits(): Observable<any> {
    const productos$ = this.http.get<any[]>(`${this.productsApiUrl}`);
    const servicios$ = this.http.get<any[]>(`${this.servicesApiUrl}`);
    const measurementUnits$ = this.http.get<any[]>(`${this.measurementUnitsApiUrl}`);

    return forkJoin([productos$, servicios$, measurementUnits$]).pipe(
      map(([productos, servicios, measurementUnits]) => {
        const unitsMap = new Map(measurementUnits.map(unit => [unit.id, unit]));

        // Agregar la unidad de medida a cada producto
        const productosConUnidades = productos.map(p => ({
          ...p,
          measure_unit: p.measurement_unit_id ? unitsMap.get(p.measurement_unit_id)?.codigo_dian : undefined
        }));

        // Agregar la unidad de medida a cada servicio
        const serviciosConUnidades = servicios.map(s => ({
          ...s,
          measure_unit: s.measurement_unit_id ? unitsMap.get(s.measurement_unit_id)?.codigo_dian : undefined
        }));

        return {
          productos: productosConUnidades,
          servicios: serviciosConUnidades,
          measurementUnits: measurementUnits
        };
      }),
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
    console.log('Buscando cliente con:', { nombre, numeroDocumento });
    console.log('URL de búsqueda:', `${this.usersApiUrl}?nombre=${encodeURIComponent(nombre)}&numero_documento=${encodeURIComponent(numeroDocumento)}`);
    
    return this.http.get<any[]>(`${this.usersApiUrl}?nombre=${encodeURIComponent(nombre)}&numero_documento=${encodeURIComponent(numeroDocumento)}`)
      .pipe(
        timeout(10000),
        catchError((error) => {
          console.error('Error en búsqueda por nombre y documento:', error);
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
    console.log('Iniciando búsqueda estricta:', { nombre, numeroDocumento });
    
    // Obtener todos los usuarios y filtrar localmente para mayor control
    return this.http.get<any[]>(this.usersApiUrl)
      .pipe(
        timeout(10000),
        catchError((error) => {
          console.error(' Error al obtener usuarios:', error);
          return this.handleError(error);
        })
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en InvoicesNotesService:', error);
    return throwError(() => error);
  }
}


