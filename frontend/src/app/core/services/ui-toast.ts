import { Injectable, signal } from '@angular/core';

type ToastType = 'success' | 'error' | 'info';

export interface ToastState {
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class UiToast {
  readonly current = signal<ToastState | null>(null);
  private timer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, type: ToastType = 'info', durationMs = 3500): void {
    this.clearTimer();
    this.current.set({ message, type });
    this.timer = setTimeout(() => {
      this.current.set(null);
      this.timer = null;
    }, durationMs);
  }

  clear(): void {
    this.clearTimer();
    this.current.set(null);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
