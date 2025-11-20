import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  private apiUrl = 'http://localhost/api/digitalCertificates';
  private userUrl = 'http://localhost/api/user';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const raw = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
    const token = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
    return { headers: new HttpHeaders({ Authorization: token }) };
  }

  getCertificates(): Observable<any> {
    return this.http.get(this.apiUrl, this.getAuthHeaders());
  }

  uploadCertificate(data: any): Observable<any> {
    const fd = new FormData();

    Object.keys(data).forEach(k => {
      const v = data[k];
      if (v === null || v === undefined) return;
      if (k === 'archivo_certificado' && v instanceof File) {
        fd.append('certificate_file', v);
        return;
      }
      if (k === 'company_id') return;
      fd.append(k, v);
    });

    return this.http.post(this.apiUrl, fd, this.getAuthHeaders());
  }

  updateCertificate(id: number, data: any): Observable<any> {
    const fd = new FormData();

    Object.keys(data).forEach(k => {
      const v = data[k];
      if (v === null || v === undefined) return;
      if (k === 'archivo_certificado' && v instanceof File) {
        fd.append('certificate_file', v);
        return;
      }
      fd.append(k, v);
    });
    return this.http.put(`${this.apiUrl}/${id}`, fd, this.getAuthHeaders());
  }

  deleteCertificate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  verifyCertificate(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/verify`, {}, this.getAuthHeaders());
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(this.userUrl, this.getAuthHeaders());
  }
}
