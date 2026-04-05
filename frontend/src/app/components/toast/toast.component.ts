import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast" *ngIf="toast.message()"
         [style.background]="toast.message()!.color"
         [style.color]="toast.message()!.color === '#4ade80' ? '#0d0d0d' : '#fff'">
      {{ toast.message()!.text }}
    </div>
  `,
  styles: [`
    .toast {
      position:fixed; bottom:2rem; right:2rem;
      font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
      padding:12px 24px; border-radius:14px; z-index:600;
      animation: slideUp .3s ease;
      box-shadow: 0 4px 24px rgba(0,0,0,.4);
    }
    @keyframes slideUp {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0); }
    }
  `]
})
export class ToastComponent {
  constructor(public toast: ToastService) {}
}
