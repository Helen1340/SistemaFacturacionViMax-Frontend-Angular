import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

export interface ItemTabla {
  id: number;
  codigo?: string;
  nombre: string;
  descripcion: string;
  tipo: 'Producto' | 'Servicio';
  precio_unitario: number;
  estado: 'Activo' | 'Inactivo';
  cantidad?: number;
  impuesto?: string;
  measure_unit?: string;
  showMenu?: boolean;
}

interface Producto {
  id: number;
  codigo_estandar?: string;
  codigo_producto?: string;
  nombre: string;
  descripcion: string;
  precio_unitario: string;
  estado: string;
  measurement_unit_id?: number;
}

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  codigo_servicio?: string;
  precio_unitario: string;
  estado: string;
  measurement_unit_id?: number;
}

interface Tax {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  porcentaje_base: string;
  estado: string;
  created_at?: string;
  updated_at?: string;
}

interface MeasurementUnit {
  id: number;
  nombre: string;
  estado: string;
  codigo_dian: string;
  descripcion: string;
  tipo_aplicacion: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosServicioService {
  private apiUrl = 'http://localhost/api';

  constructor(private http: HttpClient) {}

  getAllItems(): Observable<ItemTabla[]> {
    const productos$ = this.http.get<Producto[]>(`${this.apiUrl}/products`);
    const servicios$ = this.http.get<Servicio[]>(`${this.apiUrl}/services`);
    const taxes$ = this.http.get<Tax[]>(`${this.apiUrl}/taxes`);
    const measurementUnits$ = this.http.get<MeasurementUnit[]>(`${this.apiUrl}/measurementUnints`);

    return forkJoin([productos$, servicios$, taxes$, measurementUnits$]).pipe(
      map(([productos, servicios, taxes, measurementUnits]) => {
        const unitsMap = new Map(measurementUnits.map(unit => [unit.id, unit]));

        const itemsProductos: ItemTabla[] = productos.map(p => ({
          id: p.id,
          codigo: p.codigo_producto || p.codigo_estandar,
          nombre: p.nombre,
          descripcion: p.descripcion,
          tipo: 'Producto',
          precio_unitario: parseFloat(p.precio_unitario),
          estado: p.estado as 'Activo' | 'Inactivo',
          measure_unit: p.measurement_unit_id ? unitsMap.get(p.measurement_unit_id)?.codigo_dian : undefined
        }));

        const itemsServicios: ItemTabla[] = servicios.map(s => ({
          id: s.id,
          codigo: s.codigo_servicio,
          nombre: s.nombre,
          descripcion: s.descripcion,
          precio_unitario: parseFloat(s.precio_unitario),
          tipo: 'Servicio',
          estado: s.estado as 'Activo' | 'Inactivo',
          measure_unit: s.measurement_unit_id ? unitsMap.get(s.measurement_unit_id)?.codigo_dian : undefined
        }));

        return [...itemsProductos, ...itemsServicios];
      })
    );
  }

  deleteItem(id: number, tipo: 'Producto' | 'Servicio'): Observable<any> {
    const url = tipo === 'Producto' ? `${this.apiUrl}/products/${id}` : `${this.apiUrl}/services/${id}`;
    return this.http.delete(url);
  }

  getMeasurementUnits(): Observable<MeasurementUnit[]> {
    return this.http.get<MeasurementUnit[]>(`${this.apiUrl}/measurementUnints`);
  }

  getTaxes(): Observable<Tax[]> {
    return this.http.get<Tax[]>(`${this.apiUrl}/taxes`);
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

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/products`);
  }

  createProducto(data: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/products`, data);
  }

  getProductById(id: number): Observable<Producto> {
  return this.http.get<Producto>(`${this.apiUrl}/products/${id}`);
}


  updateProduct(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/products/${id}`, data);
  }


  createtServicio(data: Partial<Servicio>): Observable<Servicio> {
    return this.http.post<Servicio>(`${this.apiUrl}/services`, data);
  }

  getServiceById(id: number) {
    return this.http.get(`${this.apiUrl}/services/${id}`);
  }

  updateService(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/services/${id}`, data);
  }
}
