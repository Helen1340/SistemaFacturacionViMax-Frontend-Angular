import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type NoteType = 'credit' | 'debit';

export interface CreditDebitNote {
  id: number;
  electronic_invoice_id: number;
  reason: string;
  note_type: NoteType;
  note_number: string;
  status: 'accepted' | 'rejected' | 'pending';
  issue_date: string;
  total_amount: number;
}

export interface ApiResult<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface CreateNotePayload {
  reason: string;
  note_type: NoteType;
  total_amount: number;
  status?: 'accepted' | 'rejected' | 'pending';
  issue_date?: string;
}

@Injectable({ providedIn: 'root' })
export class NoteService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getByInvoice(invoiceId: number): Observable<CreditDebitNote[]> {
    return this.http
      .get<ApiResult<CreditDebitNote[]>>(`${this.baseUrl}/invoices/${invoiceId}/notes`)
      .pipe(map(r => r.data || []));
  }

  create(invoiceId: number, payload: CreateNotePayload): Observable<ApiResult<CreditDebitNote>> {
    return this.http.post<ApiResult<CreditDebitNote>>(
      `${this.baseUrl}/invoices/${invoiceId}/notes`,
      payload
    );
  }

  annul(invoiceId: number, reason: string): Observable<ApiResult<CreditDebitNote | undefined>> {
    return this.http.post<ApiResult<CreditDebitNote | undefined>>(
      `${this.baseUrl}/invoices/${invoiceId}/notes/annul`,
      { reason }
    );
  }

  downloadPDF(noteId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/notes/${noteId}/download/pdf`, { responseType: 'blob' });
  }

  downloadXML(noteId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/notes/${noteId}/download/xml`, { responseType: 'blob' });
  }

}