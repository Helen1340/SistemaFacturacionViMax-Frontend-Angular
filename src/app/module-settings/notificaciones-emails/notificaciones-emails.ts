import { Component } from '@angular/core';
import { NotificationService } from './services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface NotificationPreference {
  notify_invoice_accepted: boolean;
  notify_invoice_rejected: boolean;
  notify_invoice_canceled: boolean;
}

@Component({
  selector: 'app-notificaciones-emails',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './notificaciones-emails.html',
  styleUrl: './notificaciones-emails.css'
})
export class NotificacionesEmails {
  preferences: NotificationPreference  = {
    notify_invoice_accepted: true,
    notify_invoice_rejected: true,
    notify_invoice_canceled: true
  };

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getPreferences().subscribe(data => {
      this.preferences = data;
    });
  }

  savePreferences() {
    this.notificationService.updatePreferences(this.preferences).subscribe(() => {
      alert('Preferencias guardadas');
    });
  }
}
