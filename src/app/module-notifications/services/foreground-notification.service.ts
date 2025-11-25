// services/foreground-notification.service.ts
import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class ForegroundNotificationService {

  private channelCreated = false;

  constructor() {
    this.createNotificationChannel();
  }

  // ✅ CREAR CANAL con MÁXIMA PRIORIDAD
  private async createNotificationChannel(): Promise<void> {
    if (this.channelCreated) return;
    
    try {
      await LocalNotifications.createChannel({
        id: 'foreground_channel',
        name: 'Notificaciones en Primer Plano',
        description: 'Notificaciones que se muestran incluso con la app abierta',
        importance: 5, // ✅ MAXIMA IMPORTANCIA
        visibility: 1, // Público
        sound: 'default',
        vibration: true,
      });
      this.channelCreated = true;
      console.log('🎯 Canal de primer plano creado');
    } catch (error) {
      console.log('Canal ya existe');
    }
  }

  // ✅ MÉTODO DEFINITIVO para mostrar notificaciones EN PRIMER PLANO
  async showForegroundNotification(title: string, body: string): Promise<void> {
  try {
    await this.createNotificationChannel();
    
    await LocalNotifications.schedule({
      notifications: [
        {
          id: this.generateUniqueId(),
          title: title,
          body: body,
          schedule: { at: new Date(Date.now() + 100) },
          channelId: 'foreground_channel', // ✅ Esto controla la prioridad
          smallIcon: 'ic_stat_icon_config',
          largeIcon: 'ic_launcher',
          sound: 'default',
          autoCancel: true,
        }
      ]
    });
    
    console.log('🔔 Notificación mostrada en primer plano');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

  // ✅ GENERAR ID ÚNICO
  private generateUniqueId(): number {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  // ✅ FALLBACK por si falla el método principal
  private async fallbackNotification(title: string, body: string): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: this.generateUniqueId(),
            title: title,
            body: body,
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'default',
          }
        ]
      });
    } catch (error) {
      console.error('❌ Fallback también falló:', error);
    }
  }
}