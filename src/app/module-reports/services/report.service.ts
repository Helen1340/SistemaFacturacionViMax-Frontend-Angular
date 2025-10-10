import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  documento: string;
  estado: string;
  fecha_creacion: string | null;
  ultimo_acceso: string | null;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class ReportServices {
  private baseUrl = 'http://localhost/api/reportes'; // base de reportes

  constructor(private http: HttpClient) {}

  // Facturas
  getInvoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/facturas`);
  }

  // Pagos
  getPayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/pagos`);
  }

  // Usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`);
  }
}
