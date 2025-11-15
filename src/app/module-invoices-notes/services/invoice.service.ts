import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Interfaces
export interface Product {
  id: number;
  product_code: string;
  name: string;
  description?: string;
  unit_price: number;
  measurement_unit_id: number;
  status: string;
  measurementUnit?: {
    id: number;
    name: string;
    dian_code: string;
  };
  taxes?: Tax[];
}

export interface Service {
  id: number;
  service_code: string;
  name: string;
  description?: string;
  unit_price: number;
  measurement_unit_id: number;
  status: string;
  measurementUnit?: {
    id: number;
    name: string;
    dian_code: string;
  };
  taxes?: Tax[];
}

export interface Tax {
  id: number;
  name: string;
  percentage: number;
  fixed_value?: number;
  application_type: string;
  status?: string;
  type?: string;
}

export interface Client {
  id: number;
  first_name: string;
  document_type: string;
  document_number: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface InvoiceItem {
  type: 'product' | 'service';
  id: number;
  quantity: number;
  discount?: number;
}

export interface CreateInvoiceRequest {
  buyer_id: number;
  observation?: string;
  payment_means_code?: string;
  payment_means_name?: string;
  items: InvoiceItem[];
}

export interface InvoiceDetailItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  line_extension_amount: number;
  tax_amount?: number;
  total_line_amount: number;
  item_type?: string;
  item?: Product | Service;
}

export interface Company {
  id: number;
  business_name?: string;
  trade_name?: string;
  nit: string;
  address?: string;
  city?: string;
  department?: string;
  country?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
}

export interface User {
  id: number;
  first_name: string;
  company?: Company;
}

export interface Invoice {
  id: number;
  user_id: number;
  buyer_id: number;
  invoice_number: string;
  issue_date: string;
  internal_status: string;
  dian_status: string;
  observation?: string;
  payable_amount: number;
  tax_inclusive_amount: number;
  tax_exclusive_amount: number;
  line_extension_amount: number;
  total_discount?: number;
  uuid?: string;
  user?: User;
  buyer?: Client;
  invoiceDetails?: InvoiceDetailItem[];
}

export interface InvoiceData {
  products: Product[];
  services: Service[];
  clients: Client[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost/api/invoices'; // Ajusta según tu configuración

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los datos necesarios para crear una factura
   */
  getCreateData(): Observable<InvoiceData> {
    return this.http.get<ApiResponse<InvoiceData>>(`${this.apiUrl}/create/data`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener lista de clientes
   */
  getClients(): Observable<Client[]> {
    return this.http.get<ApiResponse<Client[]>>(`${this.apiUrl}/clients`)
      .pipe(map(response => response.data));
  }

  /**
   * Crear una nueva factura
   */
  createInvoice(invoice: CreateInvoiceRequest): Observable<Invoice> {
    return this.http.post<ApiResponse<Invoice>>(`${this.apiUrl}`, invoice)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener todas las facturas
   */
  getInvoices(filters?: {
    dian_status?: string;
    internal_status?: string;
    date_from?: string;
    date_to?: string;
    per_page?: number;
  }): Observable<Invoice[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters]) {
          params = params.set(key, filters[key as keyof typeof filters]!.toString());
        }
      });
    }

    return this.http.get<ApiResponse<Invoice[]>>(`${this.apiUrl}`, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Obtener una factura por ID con todos sus detalles
   */
  getInvoice(id: number): Observable<Invoice> {
    return this.http.get<ApiResponse<Invoice>>(`${this.apiUrl}/${id}?included=invoiceDetails,invoiceDetails.item,invoiceDetails.item.taxes,invoiceDetails.item.measurementUnit,buyer,user,user.company`)
      .pipe(
        map(response => {
          const invoice = response.data || response;
          
          // Normalizar invoiceDetails: puede venir como invoiceDetails o invoice_details
          if (invoice && !invoice.invoiceDetails) {
            // Intentar con snake_case
            if ((invoice as any).invoice_details) {
              invoice.invoiceDetails = (invoice as any).invoice_details;
            }
          }
          
          // Asegurar que invoiceDetails sea un array
          if (invoice && !Array.isArray(invoice.invoiceDetails)) {
            if (invoice.invoiceDetails && typeof invoice.invoiceDetails === 'object') {
              // Si es un objeto, convertirlo a array
              invoice.invoiceDetails = Object.values(invoice.invoiceDetails);
            } else {
              invoice.invoiceDetails = [];
            }
          }
          
          return invoice;
        })
      );
  }

  /**
   * Actualizar una factura (solo en estado borrador)
   */
  updateInvoice(id: number, data: Partial<CreateInvoiceRequest>): Observable<Invoice> {
    return this.http.put<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`, data)
      .pipe(map(response => response.data));
  }

  /**
   * Eliminar una factura (solo en estado borrador)
   */
  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Enviar factura a la DIAN
   */
  sendToDian(id: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/send-dian`, {})
      .pipe(map(response => response.data));
  }

  /**
   * Consultar estado de factura en la DIAN
   */
  checkStatus(id: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}/status`)
      .pipe(map(response => response.data));
  }

  /**
   * Cancelar factura
   */
  cancelInvoice(id: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(map(response => response.data));
  }

  /**
   * Generar código QR de la factura
   */
  generateQR(id: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}/qr`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener estadísticas de facturación
   */
  getStats(dateFrom?: string, dateTo?: string): Observable<any> {
    let params = new HttpParams();
    if (dateFrom) params = params.set('date_from', dateFrom);
    if (dateTo) params = params.set('date_to', dateTo);

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/stats/summary`, { params })
      .pipe(map(response => response.data));
  }
}

