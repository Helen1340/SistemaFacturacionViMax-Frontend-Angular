import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Ajusta según la URL base de tu API Laravel
const API_URL = 'http://localhost/api';

export interface NotificationPreference {
    notify_invoice_accepted: boolean;
    notify_invoice_rejected: boolean;
    notify_invoice_canceled: boolean;
}

export interface NotificationLog {
    id: number;
    invoice_id: number;
    event: string;
    status: string;
    error_message?: string;
    created_at: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    constructor(private http: HttpClient) {}

    // Obtener preferencias del usuario
    getPreferences(): Observable<NotificationPreference> {
        return this.http.get<NotificationPreference>(`${API_URL}/notifications/preferences`);
    }

    // Actualizar preferencias
    updatePreferences(preferences: NotificationPreference): Observable<any> {
        return this.http.put(`${API_URL}/notifications/preferences`, preferences);
    }

    // Obtener historial de notificaciones
    getLogs(): Observable<NotificationLog[]> {
        return this.http.get<NotificationLog[]>(`${API_URL}/notifications/logs`);
    }
}
