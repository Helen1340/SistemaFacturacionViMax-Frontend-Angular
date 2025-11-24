import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as Ably from 'ably';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private apiBase = environment.apiUrl;
  private ably!: Ably.Realtime;
  private channel!: Ably.RealtimeChannel; // ✅ Cambio 1: RealtimeChannel en lugar de Types.RealtimeChannelCallbacks

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const raw = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
    const token = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
    return { headers: new HttpHeaders({ Authorization: token }) };
  }

  // ✅ Inicializa Ably y escucha el canal del usuario
  initRealtime(userId: number, callback: (data: any) => void): void {
    this.ably = new Ably.Realtime({
      authUrl: `${this.apiBase}/ably/auth`,
      authHeaders: this.getAuthHeaders().headers as any
    });
    const channelName = `notifications:${userId}`;
    this.channel = this.ably.channels.get(channelName);
    this.channel.subscribe('new_alert', (message) => {
      callback(message.data);
    });
  }

  disconnect(): void {
    try { if (this.channel) this.channel.unsubscribe(); } catch {}
    try { if (this.ably) this.ably.close(); } catch {}
  }

  // ✅ Métodos API REST
  getAll(companyId?: number, filter?: { type?: string; from?: string; to?: string; limit?: number }): Observable<any> {
    let params = new HttpParams();
    if (companyId && companyId > 0) params = params.set('company_id', String(companyId));
    if (filter?.type) params = params.set('type', filter.type);
    if (filter?.from) params = params.set('from', filter.from);
    if (filter?.to) params = params.set('to', filter.to);
    if (filter?.limit) params = params.set('limit', String(filter.limit));
    const options = { ...this.getAuthHeaders(), params };
    return this.http.get(this.apiUrl, options);
  }

  markAllAsRead(): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/mark-all-read`, {}, this.getAuthHeaders())
      .pipe(catchError(() => this.http.post(`${this.apiUrl}/read-all`, {}, this.getAuthHeaders())));
  }

  deleteAll(): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/delete-all`, this.getAuthHeaders())
      .pipe(catchError(() => this.http.delete(`${this.apiUrl}`, this.getAuthHeaders())));
  }

  getLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/logs`, this.getAuthHeaders());
  }

  markAsRead(id: string | number, table_source: string): Observable<any> {
    const params = new HttpParams().set('table_source', table_source);
    const options = { ...this.getAuthHeaders(), params } as any;
    return this.http.patch(`${this.apiUrl}/${id}`, {}, options);
  }
}



