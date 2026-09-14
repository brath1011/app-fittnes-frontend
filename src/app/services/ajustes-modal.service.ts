import { Injectable, signal } from '@angular/core';

export type SubPantallaAjustes = 'PRINCIPAL' | 'IDIOMA' | 'COLOR' | 'COLOR_CUADROS' | 'FUENTE' | 'UNIDADES' | 'DATOS' | 'PASSWORD' | 'TEMA';

@Injectable({
  providedIn: 'root'
})
export class AjustesModalService {
  readonly abierto = signal<boolean>(false);
  readonly subPantalla = signal<SubPantallaAjustes>('PRINCIPAL');

  abrir(sub: SubPantallaAjustes = 'PRINCIPAL'): void {
    this.subPantalla.set(sub);
    this.abierto.set(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  cerrar(): void {
    this.abierto.set(false);
    this.subPantalla.set('PRINCIPAL');
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  irA(sub: SubPantallaAjustes): void {
    this.subPantalla.set(sub);
  }

  volver(): void {
    if (this.subPantalla() !== 'PRINCIPAL') {
      this.subPantalla.set('PRINCIPAL');
    } else {
      this.cerrar();
    }
  }
}
