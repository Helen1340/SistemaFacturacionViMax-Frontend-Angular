// src/app/components/toast/toast.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts$ | async" 
        class="toast"
        [ngClass]="'toast-' + toast.type">
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'warning'">⚠</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" (click)="close(toast.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
      width: 90%;
    }

    .toast {
      display: flex;
      align-items: center;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .toast-success {
      background: #d4edda;
      border-left: 4px solid #28a745;
      color: #155724;
    }

    .toast-error {
      background: #f8d7da;
      border-left: 4px solid #dc3545;
      color: #721c24;
    }

    .toast-warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      color: #856404;
    }

    .toast-info {
      background: #e2e3e5;
      border-left: 4px solid #6c757d;
      color: #383d41;
    }

    .toast-icon {
      font-size: 20px;
      margin-right: 12px;
      font-weight: bold;
    }

    .toast-content {
      flex: 1;
    }

    .toast-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .toast-message {
      font-size: 13px;
      opacity: 0.9;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      opacity: 0.5;
      padding: 0 8px;
    }

    .toast-close:hover {
      opacity: 1;
    }
  `]
})
export class ToastComponent {
    
  toasts$: any;

      constructor(private toastService: ToastService) {
        this.toasts$ = this.toastService.toasts$;        
      }


  close(id: number) {
    this.toastService.remove(id);
  }
}