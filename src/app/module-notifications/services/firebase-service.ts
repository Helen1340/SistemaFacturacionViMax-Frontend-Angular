// src/app/services/firebase.service.ts
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private messaging: any;
  private apiUrl = environment.apiUrl;

  private vapidKey = 'BEoMuStchY28dADWOzU97hz_EaU7T_w6bWUAiPlz5d-ENum6Ptpwy4cMrLHwwOGgEn4CyrJQnki1fp-iRvOKDrQ';

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private router: Router
  ) {
    const firebaseConfig = {
      apiKey: "AIzaSyDuJH7SNtmi0ZlUA_SjyYhKL7zbKLT-9wY",
      authDomain: "vi-max-ec031.firebaseapp.com",
      projectId: "vi-max-ec031",
      storageBucket: "vi-max-ec031.firebasestorage.app",
      messagingSenderId: "724035536242",
      appId: "1:724035536242:web:5cc0e5da71737ee1f1c9eb"
    };

    const app = initializeApp(firebaseConfig);
    this.messaging = getMessaging(app);
  }

  async init(userId: number): Promise<void> {
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('✅ Permiso de notificaciones concedido');

        const token = await getToken(this.messaging, {
          vapidKey: this.vapidKey
        });

        if (token) {
          console.log('🔑 Token FCM:', token);
          await this.saveToken(userId, token);
          this.listenMessages();
        }
      } else {
        console.log('❌ Permiso de notificaciones denegado');
      }
    } catch (error) {
      console.error('Error inicializando Firebase:', error);
    }
  }

  private async saveToken(userId: number, token: string): Promise<void> {
    try {
      const headers = this.getAuthHeaders();
      await this.http.post(`${this.apiUrl}/fcm-token`, {
        fcm_token: token
      }, headers).toPromise();
      console.log('✅ Token guardado en backend');
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  }

  private listenMessages(): void {
    onMessage(this.messaging, (payload) => {
      console.log('📩 Notificación recibida:', payload);

      const { title, body } = payload.notification || {};
      const data = payload.data;

      if (data?.["action"] === 'logout') {
        this.toastService.error(
          title || 'Cuenta Desactivada',
          body || 'Tu cuenta ha sido desactivada'
        );
        setTimeout(() => this.logout(), 3000);
      } 
      else if (data?.["action"] === 'reload') {
        this.toastService.success(
          title || '¡Cuenta Activada!',
          body || 'Tu cuenta ha sido activada exitosamente'
        );
      } 
      else {
        this.toastService.info(title || 'Notificación', body || '');
      }
    });
  }

  logout(): void {
    const userId = localStorage.getItem('userId');
    const headers = this.getAuthHeaders();
    this.http.delete(`${this.apiUrl}/fcm-token`, headers).subscribe();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const raw = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
    const token = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
    return { headers: new HttpHeaders({ Authorization: token }) };
  }
}