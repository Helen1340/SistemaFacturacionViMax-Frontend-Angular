import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../module-home/services/Auth.Service';

@Injectable({
    providedIn: 'root'
})
export class CompletaRegistroService {
    private apiUrl = 'http://localhost/api';

    constructor(private http: HttpClient, private auth: AuthService) { }

    completarRegistro(data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/completar-registro`, data);
    }

}
