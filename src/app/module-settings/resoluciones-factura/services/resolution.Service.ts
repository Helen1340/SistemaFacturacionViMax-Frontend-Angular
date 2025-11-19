import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ResolutionService {
  // 👉 URL DE LA API: Asegúrate de que esta URL sea correcta y tu servidor backend esté corriendo.
  private apiUrl = 'http://localhost/api/dianNumberings'; 

  constructor(private http: HttpClient) {}

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
         // Otros errores de HTTP (500, 404, etc.)
         errorMessage = `Error del servidor (${error.status}): ${error.statusText || 'Error al comunicarse con la API.'}`;
      }
    }

    // Devolvemos un error para que sea atrapado por el componente
    return throwError(() => new Error(errorMessage));
  }

  // ==============================
  // MÉTODO PARA CREAR RESOLUCIÓN
  // ==============================
  createResolution(formData: FormData): Observable<any> {
    // Nota: Cuando se envía FormData, NO es necesario establecer el Content-Type. 
    // Angular y el navegador lo manejan automáticamente como 'multipart/form-data'.
    return this.http.post(this.apiUrl, formData).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Si tienes otros métodos, añádelos aquí
}