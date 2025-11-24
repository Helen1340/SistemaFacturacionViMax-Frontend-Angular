import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ItemTable {
  id: number;
  code?: string;
  name: string;
  description: string;
  type: 'Product' | 'Service';
  unit_price: number;
  status: 'Active' | 'Inactive';
  quantity?: number;
  tax?: string;
  measure_unit?: string;
  showMenu?: boolean;
}

interface Product {
  id: number;
  measurement_unit_id: number;
  standard_code?: string;
  product_code: string;
  name: string;
  description?: string;
  unit_price: number;
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}

interface Service {
  id: number;
  measurement_unit_id: number;
  service_code: string;
  name: string;
  description?: string;
  unit_price: number;
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Tax {
  id: number;
  tax_code: string;
  name: string;
  description?: string;
  type: string;
  percentage?: number;
  fixed_value?: number;
  application_type: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface MeasurementUnit {
  id: number;
  name: string;
  status: string;
  dian_code: string;
  description: string;
  application_type: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosServicioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ✅ Combina productos y servicios en una sola lista
  getAllItems(): Observable<ItemTable[]> {
    const products$ = this.http.get<Product[]>(`${this.apiUrl}/products`);
    const services$ = this.http.get<Service[]>(`${this.apiUrl}/services`);
    const taxes$ = this.http.get<Tax[]>(`${this.apiUrl}/taxes`);
    const measurementUnits$ = this.http.get<MeasurementUnit[]>(`${this.apiUrl}/measurementUnits`);

    return forkJoin([products$, services$, taxes$, measurementUnits$]).pipe(
      map(([products, services, taxes, measurementUnits]) => {
        const unitsMap = new Map(measurementUnits.map(unit => [unit.id, unit]));

        const productItems: ItemTable[] = products.map(p => ({
          id: p.id,
          code: p.product_code || p.standard_code,
          name: p.name,
          description: p.description || '',
          type: 'Product',
          unit_price: p.unit_price,
          status: p.status as 'Active' | 'Inactive',
          measure_unit: p.measurement_unit_id ? unitsMap.get(p.measurement_unit_id)?.dian_code : undefined
        }));

        const serviceItems: ItemTable[] = services.map(s => ({
          id: s.id,
          code: s.service_code,
          name: s.name,
          description: s.description || '',
          type: 'Service',
          unit_price: s.unit_price,
          status: s.status as 'Active' | 'Inactive',
          measure_unit: s.measurement_unit_id ? unitsMap.get(s.measurement_unit_id)?.dian_code : undefined
        }));

        return [...productItems, ...serviceItems];
      })
    );
  }

  // ✅ Eliminar producto o servicio según el tipo
  deleteItem(id: number, type: 'Product' | 'Service'): Observable<any> {
    const url = type === 'Product' ? `${this.apiUrl}/products/${id}` : `${this.apiUrl}/services/${id}`;
    return this.http.delete(url);
  }

  // ✅ Obtener todas las unidades de medida
  getMeasurementUnits(): Observable<MeasurementUnit[]> {
    return this.http.get<MeasurementUnit[]>(`${this.apiUrl}/measurementUnits`);
  }

  // ✅ Obtener todos los impuestos
  getTaxes(): Observable<Tax[]> {
    return this.http.get<Tax[]>(`${this.apiUrl}/taxes`);
  }

  // ✅ Obtener impuestos activos
  getActiveTaxes(): Observable<Tax[]> {
    return this.http.get<Tax[]>(`${this.apiUrl}/taxes`).pipe(
      map(taxes => taxes.filter(tax => tax.status === 'Activo'))
    );
  }

  // ✅ Sincronizar impuestos de un producto
  syncProductTaxes(productId: number, taxIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/products/${productId}/sync-taxes`, { tax_ids: taxIds });
  }

  // ✅ Sincronizar impuestos de un servicio
  syncServiceTaxes(serviceId: number, taxIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/services/${serviceId}/sync-taxes`, { tax_ids: taxIds });
  }

  // ✅ Obtener un solo producto o servicio
  getItemById(id: number, type: 'Product' | 'Service'): Observable<ItemTable> {
    const url = type === 'Product' ? `${this.apiUrl}/products/${id}` : `${this.apiUrl}/services/${id}`;
    return this.http.get<ItemTable>(url);
  }

  // ✅ Crear producto o servicio
  createItem(item: ItemTable): Observable<ItemTable> {
    const url = item.type === 'Product' ? `${this.apiUrl}/products` : `${this.apiUrl}/services`;
    return this.http.post<ItemTable>(url, item);
  }

  // ✅ Actualizar producto o servicio
  updateItem(id: number, item: ItemTable): Observable<ItemTable> {
    const url = item.type === 'Product' ? `${this.apiUrl}/products/${id}` : `${this.apiUrl}/services/${id}`;
    return this.http.put<ItemTable>(url, item);
  }

  // ✅ Métodos específicos para productos
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  createProduct(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, data);
  }

  // ✅ Crear producto con impuestos
  createProductWithTaxes(productData: Partial<Product>, taxIds: number[]): Observable<Product> {
    return new Observable(observer => {
      this.createProduct(productData).subscribe({
        next: (product) => {
          if (taxIds.length > 0) {
            this.syncProductTaxes(product.id, taxIds).subscribe({
              next: () => observer.next(product),
              error: (err) => observer.error(err)
            });
          } else {
            observer.next(product);
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}?included=taxes`);
  }

  updateProduct(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/products/${id}`, data);
  }

  // ✅ Métodos específicos para servicios
  createService(data: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(`${this.apiUrl}/services`, data);
  }

  // ✅ Crear servicio con impuestos
  createServiceWithTaxes(serviceData: Partial<Service>, taxIds: number[]): Observable<Service> {
    return new Observable(observer => {
      this.createService(serviceData).subscribe({
        next: (service) => {
          if (taxIds.length > 0) {
            this.syncServiceTaxes(service.id, taxIds).subscribe({
              next: () => observer.next(service),
              error: (err) => observer.error(err)
            });
          } else {
            observer.next(service);
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getServiceById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/services/${id}?included=taxes`);
  }

  updateService(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/services/${id}`, data);
  }

  // ✅ Actualización parcial (PATCH)
  updateServicePatch(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/services/${id}`, data);
  }
}
