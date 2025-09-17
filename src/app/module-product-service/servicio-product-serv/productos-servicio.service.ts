import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { producto } from './Producto.interface';
import { servicio } from './servicio.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductosServicioService {

  private apiURL = 'http://localhost:8000/api' ;
   
  constructor(private http: HttpClient) { }

  // Métodos para Productos
  getProductos(): Observable<producto[]> {
    return this.http.get<producto[]>(`${this.apiURL}/products`);
  }

  getProductoById(id: number): Observable<producto> {
    return this.http.get<producto>(`${this.apiURL}/products/${id}`);
  }

  createProducto(producto: producto): Observable<producto> {
    return this.http.post<producto>(`${this.apiURL}/products`, producto);
  }

  updateProducto(producto: producto): Observable<producto> {
    return this.http.put<producto>(`${this.apiURL}/products/${producto.id}`, producto);
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/products/${id}`);
  }

  // Métodos para Servicios
  getServicios(): Observable<servicio[]> {
    return this.http.get<servicio[]>(`${this.apiURL}/services`);
  }

  getServicioById(id: number): Observable<servicio> {
    return this.http.get<servicio>(`${this.apiURL}/services/${id}`);
  }

  createServicio(servicio: servicio): Observable<servicio> {
    return this.http.post<servicio>(`${this.apiURL}/services`, servicio);
  }

  updateServicio(servicio: servicio): Observable<servicio> {
    return this.http.put<servicio>(`${this.apiURL}/services/${servicio.id}`, servicio);
  }

  deleteServicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/services/${id}`);
  }
}