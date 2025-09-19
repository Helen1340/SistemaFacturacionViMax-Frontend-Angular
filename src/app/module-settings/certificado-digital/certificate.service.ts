import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Certificate {
  id?: number;
  company_id?: number;
  nombre_certificado: string;
  ruta_certificado?: string;
  numero_serial?: string;
  contrasena: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  entidad_emisora?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CertificateRequest {
  tipo_firma: string;
  nombre_titular: string;
  nit_asociado: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  archivo_certificado: File;
  contrasena: string;
  estado_actual: string;
  activar_notificacion: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private apiUrl = 'http://localhost/api/digitalCertificates'; // Cambia por tu URL de API
  private http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json'
    });
  }

  // Obtener todos los certificados
  getCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.apiUrl}/certificates`, {
      headers: this.getHeaders()
    });
  }

  // Obtener un certificado por ID
  getCertificate(id: number): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.apiUrl}/certificates/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Crear un nuevo certificado
  createCertificate(certificateData: CertificateRequest): Observable<any> {
    const formData = new FormData();
    
    formData.append('tipo_firma', certificateData.tipo_firma);
    formData.append('nombre_titular', certificateData.nombre_titular);
    formData.append('nit_asociado', certificateData.nit_asociado);
    formData.append('fecha_emision', certificateData.fecha_emision);
    formData.append('fecha_vencimiento', certificateData.fecha_vencimiento);
    formData.append('archivo_certificado', certificateData.archivo_certificado);
    formData.append('contrasena', certificateData.contrasena);
    formData.append('estado_actual', certificateData.estado_actual);
    formData.append('activar_notificacion', certificateData.activar_notificacion.toString());

    return this.http.post(`${this.apiUrl}/certificates`, formData);
  }

  // Actualizar certificado
  updateCertificate(id: number, certificateData: any): Observable<any> {
    const formData = new FormData();
    
    // Agregar todos los campos al FormData
    Object.keys(certificateData).forEach(key => {
      const value = certificateData[key];
      if (value !== undefined && value !== null) {
        if (key === 'archivo_certificado' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'activar_notificacion') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    formData.append('_method', 'PUT');

    return this.http.post(`${this.apiUrl}/certificates/${id}`, formData);
  }

  // Eliminar certificado
  deleteCertificate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/certificates/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Verificar validez del certificado
  verifyCertificate(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/certificates/${id}/verify`, {}, {
      headers: this.getHeaders()
    });
  }

  // Bloquear certificado
  blockCertificate(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/certificates/${id}/block`, {}, {
      headers: this.getHeaders()
    });
  }

  // Desbloquear certificado
  unblockCertificate(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/certificates/${id}/unblock`, {}, {
      headers: this.getHeaders()
    });
  }
}