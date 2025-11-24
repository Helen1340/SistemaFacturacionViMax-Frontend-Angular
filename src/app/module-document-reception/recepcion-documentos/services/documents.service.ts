import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ElectronicDocument {
  id: number;
  electronic_invoice_id: number;
  dian_numbering_id: number;
  credit_debit_note_id?: number | null;
  cufe: string;
  cude: string;
  xml_document: string;
  dian_status: string;
  validation_date?: string | null;
  digital_signature?: string | null;
  document_hash?: string | null;
  description?: string | null;
  environment: 'Pruebas' | 'Producción' | 'Produccion';
  document_type: string;
  qr_code?: string | null;
  cdr?: string | null;
  emission_mode: 'normal' | 'en contingencia';
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const raw = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
    const token = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
    return { headers: new HttpHeaders({ Authorization: token }) };
  }

  /**
   * Obtiene la lista de documentos recibidos para la empresa actual.
   * @returns Un Observable con el array de documentos.
   */
  getReceivedDocuments(): Observable<ElectronicDocument[]> {
    return this.http.get<ElectronicDocument[]>(`${this.apiUrl}/electronicDocuments`, this.getAuthHeaders());
  }

  /**
   * Actualiza el estado de un documento recibido (Aceptar o Rechazar).
   * @param id El ID del documento a actualizar.
   * @param status El nuevo estado del documento ('Aceptado', 'Rechazado', etc.).
   * @returns Un Observable con la respuesta de la API.
   */
  // No hay endpoint de estado en el controlador compartido; mantenemos solo detalle

  /**
   * Obtiene la información detallada de un solo documento.
   * @param id El ID del documento a obtener.
   * @returns Un Observable con los detalles del documento.
   */
  getDocumentDetails(id: number): Observable<ElectronicDocument> {
    return this.http.get<ElectronicDocument>(`${this.apiUrl}/electronicDocuments/${id}`, this.getAuthHeaders());
  }

}