import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs'; // 👈 Importamos Subject

@Injectable({
  providedIn: 'root'
})
export class ImpuestosRetencionesService {

  private apiUrl = 'http://localhost:8000/api/taxes'; // AsegÃºrate que coincida con tus rutas Laravel

  // 🌟 AÃ±adimos el Subject y el Observable pÃºblico
  private impuestoCreadoSource = new Subject<void>();
  impuestoCreado$ = this.impuestoCreadoSource.asObservable();

  constructor(private http: HttpClient) {}

  // 🌟 MÃ©todo para emitir la notificaciÃ³n
  notificarImpuestoCreado(): void {
    this.impuestoCreadoSource.next();
  }

  // Crear un nuevo impuesto
  createImpuesto(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Obtener lista
  getImpuestos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Actualizar un impuesto (activar/desactivar)
  updateImpuesto(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  // Eliminar un impuesto
  deleteImpuesto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

}