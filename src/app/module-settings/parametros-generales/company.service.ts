import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../module-home/services/Auth.Service';

@Injectable({
    providedIn: 'root'
})
export class CompletaRegistroService {
    private apiUrl = 'http://127.0.0.1:8000/api';

    constructor(private http: HttpClient, private auth: AuthService) { }

    completeRegistration(formData: FormData): Observable<any> {
        // ✅ Agregar _method para simular PUT en POST
        formData.append('_method', 'PUT');
        
        // ✅ Usar POST en lugar de PUT para soportar archivos
        return this.http.post(`${this.apiUrl}/completeRegistration`, formData);
    }
}