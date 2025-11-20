// src/app/services/toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: ToastMessage[] = [];
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private idCounter = 0;

  show(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    const toast: ToastMessage = {
      id: this.idCounter++,
      title,
      message,
      type
    };

    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    setTimeout(() => this.remove(toast.id), 5000);
  }

  success(title: string, message: string) {
    this.show(title, message, 'success');
  }

  error(title: string, message: string) {
    this.show(title, message, 'error');
  }

  warning(title: string, message: string) {
    this.show(title, message, 'warning');
  }

  info(title: string, message: string) {
    this.show(title, message, 'info');
  }

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }
}