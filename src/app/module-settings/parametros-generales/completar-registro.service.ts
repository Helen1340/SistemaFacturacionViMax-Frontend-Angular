import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompletarRegistroService {
  private apiUrl = 'http://localhost/api'; // Ajusta si usas /v1

  constructor(private http: HttpClient) {}

  // Obtener empresa asociada al usuario
  getCompany(): Observable<any> {
    return this.http.get(`${this.apiUrl}/empresa`);
  }

  // Guardar datos completos de la empresa
  completarRegistro(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/empresa/completar`, data);
  }
}

