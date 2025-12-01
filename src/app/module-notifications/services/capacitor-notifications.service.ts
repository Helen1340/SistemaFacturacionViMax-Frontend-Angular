import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class CapacitorNotificationsService {

  constructor() { }

  // Solicitar permisos para notificaciones locales
  async requestPermissions(): Promise<boolean> {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  }

  // Mostrar notificación local simple
  async showLocalNotification(title: string, body: string) {
    try {
      const hasPermission = await this.requestPermissions();
      
      if (!hasPermission) {
        console.log('Permisos de notificación no concedidos');
        return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: new Date().getTime(),
            schedule: { at: new Date(Date.now() + 1000) },
          }
        ]
      });

      console.log('Notificación local programada');
    } catch (error) {
      console.error('Error mostrando notificación local:', error);
    }
  }
}