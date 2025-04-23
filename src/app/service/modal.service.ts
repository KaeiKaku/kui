// modal.service.ts
import {
  Injectable,
  Injector,
  ApplicationRef,
  EmbeddedViewRef,
  Type,
  createComponent,
  ComponentRef,
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private currentModalRef: ComponentRef<any> | null = null;
  private backdropElem: HTMLElement | null = null;

  constructor(private appRef: ApplicationRef, private injector: Injector) {}

  open<T>(
    component: Type<T>,
    options: {
      width?: string;
      maxHeight?: string;
      data?: any;
      closeOnBackdropClick?: boolean;
    } = {}
  ): void {
    this.close();

    const componentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
    });

    const instance = componentRef.instance as any;
    instance.close = () => this.close();
    Object.assign(instance, options.data || {});

    this.appRef.attachView(componentRef.hostView);

    const backdrop = document.createElement('div');
    backdrop.classList.add('backdrop-fade-in');
    Object.assign(backdrop.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: '999',
      opacity: '0',
    });

    if (options.closeOnBackdropClick) {
      backdrop.addEventListener('click', () => this.close());
    }

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    domElem.classList.add('modal-fade-in');
    Object.assign(domElem.style, {
      width: options.width || '800px',
      maxHeight: options.maxHeight || 'auto',
      position: 'fixed',
      top: '50%',
      left: '50%',
      zIndex: '1000',
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      padding: '16px',
      borderRadius: '0.5rem',
    });

    document.body.appendChild(backdrop);
    document.body.appendChild(domElem);

    this.backdropElem = backdrop;
    this.currentModalRef = componentRef;
  }

  close(): void {
    if (!this.currentModalRef) return;

    const domElem = (this.currentModalRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    if (domElem) domElem.classList.remove('modal-fade-in');
    if (this.backdropElem)
      this.backdropElem.classList.remove('backdrop-fade-in');

    domElem?.classList.add('modal-fade-out');
    this.backdropElem?.classList.add('backdrop-fade-out');

    setTimeout(() => {
      this.currentModalRef?.destroy();
      this.currentModalRef = null;

      if (this.backdropElem) {
        document.body.removeChild(this.backdropElem);
        this.backdropElem = null;
      }
    }, 300);
  }
}
