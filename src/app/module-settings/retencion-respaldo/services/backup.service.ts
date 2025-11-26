import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

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
  private readonly baseUrl = `${environment.apiUrl}/backups`;
  private readonly TIMEOUT = 30000; // 30 segundos

  constructor(private http: HttpClient) { }

  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  runBackup(payload: BackupPayload): Observable<{ data: { zip_path: string; db_included: boolean } }> {
    return this.http.post<{ data: { zip_path: string; db_included: boolean } }>(
      `${this.baseUrl}/run`,
      payload,
      { headers: this.headers() }
    ).pipe(
      timeout(this.TIMEOUT),
      catchError(this.handleError('runBackup'))
    );
  }

  listBackups(): Observable<{ data: BackupItem[] }> {
    return this.http.get<{ data: BackupItem[] }>(
      `${this.baseUrl}/list`,
      { headers: this.headers() }
    ).pipe(
      timeout(this.TIMEOUT),
      catchError(this.handleError('listBackups'))
    );
  }

  downloadBackup(path: string): Observable<HttpResponse<Blob>> {
    const params = new HttpParams().set('path', path);
    return this.http.get(
      `${this.baseUrl}/download`,
      {
        params,
        responseType: 'blob',
        observe: 'response',
        headers: this.headers()
      }
    ).pipe(
      timeout(this.TIMEOUT),
      catchError(this.handleError('downloadBackup'))
    );
  }

  private handleError(operation = 'operation') {
    return (error: any) => {
      console.error(`${operation} failed:`, error);
      return throwError(() => error);
    };
  }
}