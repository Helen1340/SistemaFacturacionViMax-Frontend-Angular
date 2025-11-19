import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  private apiUrl = 'http://localhost/api/digitalCertificates';

  constructor(private http: HttpClient) {}

  getCertificates(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  uploadCertificate(data: any): Observable<any> {
    const fd = new FormData();

    Object.keys(data).forEach(k => {
      if (data[k] !== null && data[k] !== undefined) {
        if (k === 'archivo_certificado' && data[k] instanceof File) {
          fd.append('certificate_file', data[k]);
        } else {
          fd.append(k, data[k]);
        }
      }
    });

    return this.http.post(this.apiUrl, fd);
  }

  updateCertificate(id: number, data: any): Observable<any> {
    const fd = new FormData();

    fd.append('_method', 'PUT');

    Object.keys(data).forEach(k => {
      if (data[k] !== null && data[k] !== undefined) {
        if (k === 'archivo_certificado' && data[k] instanceof File) {
          fd.append('certificate_file', data[k]);
        } else {
          fd.append(k, data[k]);
        }
      }
    });

    return this.http.post(`${this.apiUrl}/${id}`, fd);
  }

  deleteCertificate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  verifyCertificate(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/verify`, {});
  }
}
