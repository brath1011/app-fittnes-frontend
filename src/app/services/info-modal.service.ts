import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InfoModalService {
  mostrarTerminos = signal(false);
  mostrarPoliticas = signal(false);
  mostrarDatos = signal(false);

  abrirTerminos() { this.mostrarTerminos.set(true); }
  cerrarTerminos() { this.mostrarTerminos.set(false); }
  
  abrirPoliticas() { this.mostrarPoliticas.set(true); }
  cerrarPoliticas() { this.mostrarPoliticas.set(false); }
  
  abrirDatos() { this.mostrarDatos.set(true); }
  cerrarDatos() { this.mostrarDatos.set(false); }
}
