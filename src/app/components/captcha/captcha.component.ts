import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';

declare var grecaptcha: any;

// Clave de sitio reCAPTCHA v2 Checkbox (utpshop-v2-checkbox)
const RECAPTCHA_SITE_KEY = '6Lek2XotAAAAAIuXr1RB2JGd06mOKGBkouZni51w';

@Component({
  selector: 'app-captcha',
  standalone: true,
  template: `<div #captchaContainer class="captcha-container"></div>`,
  styles: [`
    .captcha-container {
      margin: 15px 0;
      display: flex;
      justify-content: center;
    }
  `]
})
export class CaptchaComponent implements OnInit, OnDestroy {
  @ViewChild('captchaContainer', { static: true }) captchaContainer!: ElementRef;
  @Output() token = new EventEmitter<string>();

  private widgetId: number | null = null;

  ngOnInit() {
    this.inicializarCaptcha();
  }

  ngOnDestroy() {
    if (this.widgetId !== null && typeof grecaptcha !== 'undefined') {
      try {
        // reCAPTCHA cleanup
      } catch (e) {}
    }
  }

  private inicializarCaptcha() {
    const doRender = () => {
      try {
        this.widgetId = (grecaptcha as any).enterprise.render(this.captchaContainer.nativeElement, {
          'sitekey': RECAPTCHA_SITE_KEY,
          'callback': (responseToken: string) => {
            this.token.emit(responseToken);
          },
          'expired-callback': () => {
            this.token.emit('');
          }
        });
      } catch (error) {
        console.error('Error al renderizar reCAPTCHA:', error);
      }
    };

    if (typeof (window as any).grecaptcha !== 'undefined' &&
        typeof (window as any).grecaptcha.enterprise !== 'undefined') {
      (window as any).grecaptcha.enterprise.ready(doRender);
    } else {
      // Script aún no cargó, reintenta en 300ms
      setTimeout(() => this.inicializarCaptcha(), 300);
    }
  }

  reset() {
    if (this.widgetId !== null && typeof grecaptcha !== 'undefined' && typeof grecaptcha.enterprise !== 'undefined') {
      grecaptcha.enterprise.reset(this.widgetId);
      this.token.emit('');
    }
  }
}
