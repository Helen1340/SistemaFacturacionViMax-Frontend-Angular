import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private apiUrl = 'http://localhost:8000/api'; // Reemplaza esto con la URL de tu API en Laravel

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de documentos recibidos para la empresa actual.
   * @returns Un Observable con el array de documentos.
   */
  getReceivedDocuments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/electronicDocuments`);
  }

  /**
   * Actualiza el estado de un documento recibido (Aceptar o Rechazar).
   * @param id El ID del documento a actualizar.
   * @param status El nuevo estado del documento ('Aceptado', 'Rechazado', etc.).
   * @returns Un Observable con la respuesta de la API.
   */
  updateDocumentStatus(id: number, status: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/received-documents/${id}/status`, { status });
  }

  /**
   * Obtiene la información detallada de un solo documento.
   * @param id El ID del documento a obtener.
   * @returns Un Observable con los detalles del documento.
   */
  getDocumentDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/received-documents/${id}`);
  }

}