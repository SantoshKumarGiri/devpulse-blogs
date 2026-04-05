import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  text: string;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  message = signal<ToastMessage | null>(null);

  show(text: string, color: string = '#4ade80') {
    this.message.set({ text, color });
    setTimeout(() => this.message.set(null), 2800);
  }

  success(text: string) { this.show(text, '#4ade80'); }
  error(text: string)   { this.show(text, '#f87171'); }
  info(text: string)    { this.show(text, '#60a5fa'); }
}
