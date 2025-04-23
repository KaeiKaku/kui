import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastEl: HTMLElement | null = null;
  private timeoutId: any;

  show(message: string, duration: number = 2000) {
    if (this.toastEl) {
      this.destroy();
    }

    const toast = document.createElement('div');
    toast.innerText = message;
    toast.className = 'custom-toast';
    document.body.appendChild(toast);

    void toast.offsetWidth;
    toast.classList.add('show');

    this.toastEl = toast;

    this.timeoutId = setTimeout(() => {
      this.destroy();
    }, duration);
  }

  private destroy() {
    if (this.toastEl) {
      this.toastEl.classList.remove('show');
      this.toastEl.classList.add('hide');

      this.toastEl.addEventListener(
        'transitionend',
        () => {
          this.toastEl?.remove();
          this.toastEl = null;
        },
        { once: true }
      );

      clearTimeout(this.timeoutId);
    }
  }
}
