import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AccesibilidadService, IdiomaCode, TamanoFuente } from '../services/accesibilidad.service';
import { AjustesModalService } from '../services/ajustes-modal.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly acc = inject(AccesibilidadService);
  readonly ajustesModal = inject(AjustesModalService);
  private readonly router = inject(Router);

  menuAbierto = signal(false);
  menuIdiomaAbierto = signal(false);
  menuFuenteAbierto = signal(false);
  buscarTermino = signal('');

  buscar(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.buscarTermino.set(value);
    this.router.navigate(['/ejercicios'], { queryParams: { buscar: value || null }, queryParamsHandling: 'merge' });
  }

  toggleMenu(event?: Event): void {
    if (event) event.stopPropagation();
    this.menuIdiomaAbierto.set(false);
    this.menuFuenteAbierto.set(false);
    this.menuAbierto.update(v => !v);
  }

  abrirAjustes(event?: Event): void {
    if (event) event.stopPropagation();
    this.menuAbierto.set(false);
    this.ajustesModal.abrir();
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  toggleMenuIdioma(event?: Event): void {
    if (event) event.stopPropagation();
    this.menuAbierto.set(false);
    this.menuFuenteAbierto.set(false);
    this.menuIdiomaAbierto.update(v => !v);
  }

  toggleMenuFuente(event?: Event): void {
    if (event) event.stopPropagation();
    this.menuAbierto.set(false);
    this.menuIdiomaAbierto.set(false);
    this.menuFuenteAbierto.update(v => !v);
  }

  cambiarIdioma(codigo: IdiomaCode): void {
    this.acc.setIdioma(codigo);
    this.menuIdiomaAbierto.set(false);
  }

  toggleTema(): void {
    this.acc.toggleTema();
  }

  cambiarTamanoFuente(tamano: TamanoFuente): void {
    this.acc.setTamanoFuente(tamano);
    this.menuFuenteAbierto.set(false);
  }

  obtenerTextoTamano(tamano: TamanoFuente): string {
    switch (tamano) {
      case 'pequeno': return 'Pequeño (88%)';
      case 'normal': return 'Normal (100%)';
      case 'grande': return 'Grande (115%)';
      case 'extragrande': return 'Extra Grande (130%)';
      default: return 'Normal (100%)';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-usuario')) {
      this.menuAbierto.set(false);
    }
    if (!target.closest('.dropdown-idioma')) {
      this.menuIdiomaAbierto.set(false);
    }
    if (!target.closest('.dropdown-fuente')) {
      this.menuFuenteAbierto.set(false);
    }
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.menuAbierto.set(false);
    this.router.navigate(['/login']);
  }
}
