import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface Factura {
  numero: string;
  fecha: string;
  estado: string;
  subtotal: number;
  impuestos: number;
  total: number;
  cliente: string;
}

export interface ResumenFacturas {
  totales_por_estado: Record<string, number>;
  valores_por_estado: Record<string, number>;
  ventas_por_mes: Record<string, number>;
  cantidad_por_mes: Record<string, number>;
  top_clientes: { cliente: string; total: number; cantidad: number }[];
}

export interface ProductoItem {
  codigo: string;
  nombre: string;
  unidad: string;
  cantidad_vendida: number;
  subtotal: number;
  impuestos: number;
  total: number;
  precio_promedio: number;
}

export interface ResumenProductos {
  total_por_mes: Record<string, number>;
  unidades_por_mes: Record<string, number>;
  top_por_valor: { producto: string; total: number }[];
  top_por_unidades: { producto: string; unidades: number }[];
}

export interface ServicioItem {
  codigo: string;
  nombre: string;
  unidad: string;
  cantidad_vendida: number;
  subtotal: number;
  impuestos: number;
  total: number;
  precio_promedio: number;
}

export interface ResumenServicios {
  total_por_mes: Record<string, number>;
  unidades_por_mes: Record<string, number>;
  top_por_valor: { servicio: string; total: number }[];
  top_por_unidades: { servicio: string; unidades: number }[];
}

@Injectable({ providedIn: 'root' })
export class ReportServices {
  private baseUrl = 'http://localhost/api/reportes'; // base de reportes

  constructor(private http: HttpClient) {}

  getInvoices(params?: { numero_factura?: string; cliente?: string; desde?: string; hasta?: string; estado?: string }): Observable<Factura[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get<Factura[]>(`${this.baseUrl}/facturas`, { params: httpParams });
  }
  downloadInvoicesCsv(params?: { numero_factura?: string; cliente?: string; desde?: string; hasta?: string; estado?: string }): Observable<Blob> {
    let httpParams = new HttpParams().set('format', 'csv');
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get(`${this.baseUrl}/facturas`, { params: httpParams, responseType: 'blob' });
  }
  getInvoiceSummary(params?: { desde?: string; hasta?: string }): Observable<ResumenFacturas> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get<ResumenFacturas>(`${this.baseUrl}/resumen/facturas`, { params: httpParams });
  }

  getPayments(params?: { cliente?: string; desde?: string; hasta?: string }): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get<any[]>(`${this.baseUrl}/pagos`, { params: httpParams });
  }
  downloadPaymentsCsv(params?: { cliente?: string; desde?: string; hasta?: string }): Observable<Blob> {
    let httpParams = new HttpParams().set('format', 'csv');
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get(`${this.baseUrl}/pagos`, { params: httpParams, responseType: 'blob' });
  }
  getPaymentSummary(params?: { desde?: string; hasta?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get<any>(`${this.baseUrl}/resumen/pagos`, { params: httpParams });
  }

  getUsuarios(params?: { usuario?: string; estado?: string; rol?: string; fecha_inicio?: string; fecha_fin?: string }): Observable<Usuario[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`, { params: httpParams });
  }
  downloadUsuariosCsv(params?: { usuario?: string; estado?: string; rol?: string; fecha_inicio?: string; fecha_fin?: string }): Observable<Blob> {
    let httpParams = new HttpParams().set('format', 'csv');
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get(`${this.baseUrl}/usuarios`, { params: httpParams, responseType: 'blob' });
  }

  getProductos(params?: { texto?: string; estado?: string; desde?: string; hasta?: string; page?: number; per_page?: number }): Observable<{ data: ProductoItem[]; total: number }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http.get<{ data: ProductoItem[]; total: number }>(`${this.baseUrl}/productos`, { params: httpParams });
  }
  downloadProductosCsv(params?: { texto?: string; estado?: string; desde?: string; hasta?: string }): Observable<Blob> {
    let httpParams = new HttpParams().set('format', 'csv');
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get(`${this.baseUrl}/productos`, { params: httpParams, responseType: 'blob' });
  }
  getResumenProductos(params?: { desde?: string; hasta?: string }): Observable<ResumenProductos> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get<ResumenProductos>(`${this.baseUrl}/resumen/productos`, { params: httpParams });
  }

  getServicios(params?: { texto?: string; estado?: string; desde?: string; hasta?: string; page?: number; per_page?: number }): Observable<{ data: ServicioItem[]; total: number }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http.get<{ data: ServicioItem[]; total: number }>(`${this.baseUrl}/servicios`, { params: httpParams });
  }
  downloadServiciosCsv(params?: { texto?: string; estado?: string; desde?: string; hasta?: string }): Observable<Blob> {
    let httpParams = new HttpParams().set('format', 'csv');
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get(`${this.baseUrl}/servicios`, { params: httpParams, responseType: 'blob' });
  }
  getResumenServicios(params?: { desde?: string; hasta?: string }): Observable<ResumenServicios> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get<ResumenServicios>(`${this.baseUrl}/resumen/servicios`, { params: httpParams });
  }
}
