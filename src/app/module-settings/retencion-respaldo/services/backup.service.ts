import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BackupPayload {
  location: 'local' | 'drive';
  types: string[];
  retention_years?: number;
  frequency: 'Diaria' | 'Semanal' | 'Mensual';
}

export interface BackupItem {
  path: string;
  size: number;
  modified_at: string;
}

@Injectable({ providedIn: 'root' })
export class BackupService {
  private readonly baseUrl = 'http://localhost/api/backups';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  runBackup(payload: BackupPayload): Observable<{ data: { zip_path: string; db_included: boolean } }> {
    return this.http.post<{ data: { zip_path: string; db_included: boolean } }>(`${this.baseUrl}/run`, payload, { headers: this.headers() });
  }

  listBackups(): Observable<{ data: BackupItem[] }> {
    return this.http.get<{ data: BackupItem[] }>(`${this.baseUrl}/list`, { headers: this.headers() });
  }

  downloadBackup(path: string): Observable<HttpResponse<Blob>> {
    const params = new HttpParams().set('path', path);
    return this.http.get(`${this.baseUrl}/download`, { params, responseType: 'blob', observe: 'response' });
  }
}