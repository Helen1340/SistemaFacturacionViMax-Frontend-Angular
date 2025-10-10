import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// Interface para los impuestos (campos en español)
export interface Impuesto {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  porcentaje_base: number;
  estado: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

// Interface para la respuesta de la API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

// Interface para filtros
export interface ImpuestoFilters {
  search?: string;
  tipo?: string;
  estado?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImpuestosRetencionesService {
  
  private baseUrl = 'http://localhost/api/taxes'; // Cambiar por tu URL de API
  private impuestosSubject = new BehaviorSubject<Impuesto[]>([]);
  public impuestos$ = this.impuestosSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Obtener todos los impuestos
  getImpuestos(filters?: ImpuestoFilters): Observable<ApiResponse<Impuesto[]>> {
    let url = this.baseUrl;
    const params = new URLSearchParams();

    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log('Haciendo petición a:', url);

    return this.http.get<ApiResponse<Impuesto[]>>(url).pipe(
      map(response => {
        console.log('Respuesta recibida del servidor:', response);
        
        // Si la respuesta no tiene la estructura esperada, intentar adaptarla
        if (!response.success && Array.isArray(response)) {
          // Si la respuesta es directamente un array
          const adaptedResponse: ApiResponse<Impuesto[]> = {
            success: true,
            data: response as Impuesto[],
            message: 'Datos obtenidos correctamente'
          };
          this.impuestosSubject.next(adaptedResponse.data);
          return adaptedResponse;
        }
        
        // Si la respuesta tiene la estructura correcta
        if (response.success && response.data) {
          this.impuestosSubject.next(response.data);
          return response;
        }
        
        // Si no hay datos, devolver array vacío
        const emptyResponse: ApiResponse<Impuesto[]> = {
          success: true,
          data: [],
          message: 'No hay datos disponibles'
        };
        this.impuestosSubject.next([]);
        return emptyResponse;
      }),
      catchError(this.handleError)
    );
  }

  // Obtener un impuesto por ID
  getImpuestoById(id: number): Observable<ApiResponse<Impuesto>> {
    return this.http.get<ApiResponse<Impuesto>>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Crear nuevo impuesto
  createImpuesto(impuesto: Omit<Impuesto, 'id'>): Observable<ApiResponse<Impuesto>> {
    return this.http.post<ApiResponse<Impuesto>>(this.baseUrl, impuesto).pipe(
      map(response => {
        // Actualizar la lista local
        const currentImpuestos = this.impuestosSubject.value;
        this.impuestosSubject.next([...currentImpuestos, response.data]);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // Actualizar impuesto
  updateImpuesto(id: number, impuesto: Partial<Impuesto>): Observable<ApiResponse<Impuesto>> {
    return this.http.put<ApiResponse<Impuesto>>(`${this.baseUrl}/${id}`, impuesto).pipe(
      map(response => {
        // Actualizar la lista local
        const currentImpuestos = this.impuestosSubject.value;
        const index = currentImpuestos.findIndex(imp => imp.id === id);
        if (index !== -1) {
          currentImpuestos[index] = { ...currentImpuestos[index], ...response.data };
          this.impuestosSubject.next([...currentImpuestos]);
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // Eliminar impuesto
  deleteImpuesto(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (response.success) {
          // Remover de la lista local
          const currentImpuestos = this.impuestosSubject.value;
          const filteredImpuestos = currentImpuestos.filter(imp => imp.id !== id);
          this.impuestosSubject.next(filteredImpuestos);
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // Cambiar estado del impuesto (Activar/Desactivar)
  toggleImpuestoStatus(id: number): Observable<ApiResponse<Impuesto>> {
    return this.http.patch<ApiResponse<Impuesto>>(`${this.baseUrl}/${id}/toggle-status`, {}).pipe(
      map(response => {
        // Actualizar la lista local
        const currentImpuestos = this.impuestosSubject.value;
        const index = currentImpuestos.findIndex(imp => imp.id === id);
        if (index !== -1) {
          currentImpuestos[index] = response.data;
          this.impuestosSubject.next([...currentImpuestos]);
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // Obtener tipos de impuestos disponibles
  getTiposImpuestos(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/tipos`).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener estadísticas de impuestos
  getImpuestosStats(): Observable<{
    total: number;
    activos: number;
    inactivos: number;
    por_tipo: { [key: string]: number };
  }> {
    return this.http.get<{
      total: number;
      activos: number;
      inactivos: number;
      por_tipo: { [key: string]: number };
    }>(`${this.baseUrl}/stats`).pipe(
      catchError(this.handleError)
    );
  }

  // Buscar impuestos
  searchImpuestos(term: string): Observable<Impuesto[]> {
    return this.http.get<Impuesto[]>(`${this.baseUrl}/search?q=${encodeURIComponent(term)}`).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener impuestos paginados
  getImpuestosPaginated(page: number = 1, limit: number = 10, filters?: ImpuestoFilters): Observable<{
    data: Impuesto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.estado) params.append('estado', filters.estado);
    }

    return this.http.get<{
      data: Impuesto[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${this.baseUrl}/paginated?${params.toString()}`).pipe(
      catchError(this.handleError)
    );
  }

  // Método para datos de prueba (cuando no hay API disponible)
  getMockImpuestos(): Impuesto[] {
    return [
      {
        id: 1,
        nombre: 'IVA',
        descripcion: 'Impuesto al Valor Agregado',
        tipo: 'IVA',
        porcentaje_base: 19,
        estado: 'Activo',
        fecha_creacion: '2024-01-15',
        fecha_actualizacion: '2024-01-15'
      },
      {
        id: 2,
        nombre: 'IVA',
        descripcion: 'Impuesto al Valor Agregado - Servicios',
        tipo: 'IVA',
        porcentaje_base: 19,
        estado: 'Activo',
        fecha_creacion: '2024-01-15',
        fecha_actualizacion: '2024-01-15'
      },
      {
        id: 3,
        nombre: 'IVA',
        descripcion: 'Impuesto al Valor Agregado - Productos',
        tipo: 'IVA',
        porcentaje_base: 19,
        estado: 'Activo',
        fecha_creacion: '2024-01-15',
        fecha_actualizacion: '2024-01-15'
      },
      {
        id: 4,
        nombre: 'IVA',
        descripcion: 'Impuesto al Valor Agregado - Importaciones',
        tipo: 'IVA',
        porcentaje_base: 19,
        estado: 'Inactivo',
        fecha_creacion: '2024-01-15',
        fecha_actualizacion: '2024-01-15'
      },
      {
        id: 5,
        nombre: 'ICA',
        descripcion: 'Impuesto de Industria y Comercio',
        tipo: 'ICA',
        porcentaje_base: 1.2,
        estado: 'Activo',
        fecha_creacion: '2024-01-15',
        fecha_actualizacion: '2024-01-15'
      },
      {
        id: 6,
        nombre: 'Retención en la Fuente',
        descripcion: 'Retención sobre pagos a terceros',
        tipo: 'ReteFuente',
        porcentaje_base: 3.5,
        estado: 'Activo',
        fecha_creacion: '2024-01-15',
        fecha_actualizacion: '2024-01-15'
      }
    ];
  }

  // Manejo de errores
  private handleError = (error: any): Observable<any> => {
    console.error('Error en ImpuestosRetencionesService:', error);
    
    // Detectar tipo de error
    if (error.status === 0) {
      console.log('Error de conexión - Servidor no disponible');
    } else if (error.status === 404) {
      console.log('Error 404 - Endpoint no encontrado');
    } else if (error.status === 500) {
      console.log('Error 500 - Error interno del servidor');
    } else if (error.status === 401) {
      console.log('Error 401 - No autorizado');
    } else if (error.status === 403) {
      console.log('Error 403 - Acceso prohibido');
    }
    
    // En caso de cualquier error, devolver datos mock
    console.log('Usando datos mock debido a error');
    const mockData = this.getMockImpuestos();
    this.impuestosSubject.next(mockData);
    return of({
      success: true,
      data: mockData,
      message: 'Datos de prueba cargados debido a error de conexión'
    });
  };

  // Limpiar datos
  clearData(): void {
    this.impuestosSubject.next([]);
  }
}
