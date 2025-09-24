import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CompanyService {
    private api = 'http://localhost/api/company';

    constructor(private http: HttpClient) {}

    saveCompany(data: any): Observable<any> {
        return this.http.post(this.api, data);
    }
}
