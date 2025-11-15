import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Ably from 'ably';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private apiUrl = 'http://127.0.0.1:8000/api/notifications'; // URL del backend Laravel
  private ably!: Ably.Realtime;
  private channel!: Ably.RealtimeChannel; // ✅ Cambio 1: RealtimeChannel en lugar de Types.RealtimeChannelCallbacks

  constructor(private http: HttpClient) {}

  // ✅ Inicializa Ably y escucha el canal del usuario
  initRealtime(userId: number, callback: (data: any) => void): void { // ✅ Cambio 2: Agregado void como tipo de retorno
    const ablyKey ='piNYEw.Zy5OQQ:eJNENobDIG0-KQ2Y29nSnmF7KAnJsmu4V5mRs56ZbFE'; // 👈 pon aquí tu clave pública (antes de los ":")
    this.ably = new Ably.Realtime(ablyKey);
    const channelName = `notifications:${userId}`;
    this.channel = this.ably.channels.get(channelName);

    this.channel.subscribe('new_alert', (message) => {
      console.log('📩 Nueva notificación:', message.data);
      callback(message.data);
    });
  }

  disconnect(): void {
    if (this.ably) this.ably.close();
  }

  // ✅ Métodos API REST
  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  markAllAsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-all-read`, {});
  }

  deleteAll(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-all`);
  }
}



