import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResolutionService {
  private apiUrl = `${environment.apiUrl}/dianNumberings`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const raw = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
    const token = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
    return { headers: new HttpHeaders({ Authorization: token }) };
  }

  // ==============================
  // MANEJO DE ERRORES CENTRALIZADO (ACTUALIZADO)
  // ==============================
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido al procesar la solicitud.';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de la red
      errorMessage = `Error de red: ${error.error.message}`;
    } else {
      // El backend devolvió un código de respuesta no exitoso.
      console.error(`❌ Error del servidor (${error.status}):`, error);
      
      if (error.status === 422) {
        // Manejo de errores de validación de Laravel (Unprocessable Content)
        const validationErrors = error.error?.errors;
        
        if (validationErrors) {
          console.error('Detalles de validación (422):', validationErrors);
          
          // Formateamos los mensajes de error de validación
          let errorMessages: string[] = [];
          Object.values(validationErrors).forEach((messages: any) => {
            if (Array.isArray(messages)) {
              errorMessages = errorMessages.concat(messages);
            }
          });

          // Mostramos la lista de errores (incluyendo el de company_id si persiste)
          errorMessage = `Error de validación (422): ${errorMessages.join(' | ')}`;
        } else {
           errorMessage = `Error de validación (422): ${error.error.message || 'Verifica los campos enviados.'}`;
        }
      } else {
         const backendMessage = (error.error && (error.error.message || error.message)) || '';
         errorMessage = backendMessage
           ? `Error del servidor (${error.status}): ${backendMessage}`
           : `Error del servidor (${error.status}): ${error.statusText || 'Error al comunicarse con la API.'}`;
      }
    }

    // Devolvemos un error para que sea atrapado por el componente
    return throwError(() => new Error(errorMessage));
  }

  // Crear resolución - multipart
  createResolution(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, this.getAuthHeaders()).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Crear resolución - JSON
  createResolutionJson(body: any): Observable<any> {
    return this.http.post(this.apiUrl, body, this.getAuthHeaders()).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Listar
  list(): Observable<any> {
    return this.http.get(this.apiUrl, this.getAuthHeaders()).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Obtener por ID
  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, this.getAuthHeaders()).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Actualizar - multipart
  updateMultipart(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData, this.getAuthHeaders()).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Actualizar - JSON
  updateJson(id: number, body: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, body, this.getAuthHeaders()).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Eliminar
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders()).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}