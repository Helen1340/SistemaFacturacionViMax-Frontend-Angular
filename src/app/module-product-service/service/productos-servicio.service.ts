import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

// Interfaz para el objeto unificado que se mostrará en la tabla
export interface ItemTabla {
  id: number;
  referencia: string;
  nombre: string;
  descripcion: string;
  tipo: 'Producto' | 'Servicio';
  precio_unitario: number;
  estado: 'Activo' | 'Inactivo';
  cantidad: number; // Propiedad agregada
  impuesto: number; // Propiedad agregada
  showMenu?: boolean;
}

// Interfaces de las APIs individuales (agregado cantidad e impuesto)
interface Producto {
  id: number;
  referencia: string;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  estado: string;
  cantidad: number;
  impuesto: number;
}

interface Servicio {
  id: number;
  referencia: string;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  estado: string;
  cantidad: number;
  impuesto: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosServicioService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getAllItems(): Observable<ItemTabla[]> {
    const productos$ = this.http.get<Producto[]>(`${this.apiUrl}/products`);
    const servicios$ = this.http.get<Servicio[]>(`${this.apiUrl}/services`);

    return forkJoin([productos$, servicios$]).pipe(
      map(([productos, servicios]) => {
        const itemsProductos: ItemTabla[] = productos.map(p => ({
          id: p.id,
          referencia: p.referencia,
          nombre: p.nombre,
          descripcion: p.descripcion,
          tipo: 'Producto',
          precio_unitario: p.precio_unitario,
          estado: p.estado as 'Activo' | 'Inactivo',
          cantidad: p.cantidad,
          impuesto: p.impuesto,
        }));

        const itemsServicios: ItemTabla[] = servicios.map(s => ({
          id: s.id,
          referencia: s.referencia,
          nombre: s.nombre,
          descripcion: s.descripcion,
          tipo: 'Servicio',
          precio_unitario: s.precio_unitario,
          estado: s.estado as 'Activo' | 'Inactivo',
          cantidad: s.cantidad,
          impuesto: s.impuesto,
        }));

        return [...itemsProductos, ...itemsServicios];
      })
    );
  }

  deleteItem(id: number, tipo: 'Producto' | 'Servicio'): Observable<any> {
    const url = tipo === 'Producto' ? `${this.apiUrl}/products/${id}` : `${this.apiUrl}/services/${id}`;
    return this.http.delete(url);
  }

  getItemById(id: number, tipo: 'Producto' | 'Servicio'): Observable<ItemTabla> {
    const url = tipo === 'Producto' ? `${this.apiUrl}/products/${id}` : `${this.apiUrl}/services/${id}`;
    return this.http.get<ItemTabla>(url);
  }

  createItem(item: ItemTabla): Observable<ItemTabla> {
    const url = item.tipo === 'Producto' ? `${this.apiUrl}/products` : `${this.apiUrl}/services`;
    return this.http.post<ItemTabla>(url, item);
  }

  updateItem(id: number, item: ItemTabla): Observable<ItemTabla> {
    const url = item.tipo === 'Producto' ? `${this.apiUrl}/products/${id}` : `${this.apiUrl}/services/${id}`;
    return this.http.put<ItemTabla>(url, item);
  }
}