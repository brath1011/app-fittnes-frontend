import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AjustesModalService, SubPantallaAjustes } from '../../services/ajustes-modal.service';
import { AccesibilidadService, IdiomaCode, TamanoFuente, TemaMode, UnidadesPeso } from '../../services/accesibilidad.service';
import { AuthService } from '../../services/auth.service';
import { InfoModalService } from '../../services/info-modal.service';

@Component({
  selector: 'app-ajustes-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ajustes-modal.html',
  styleUrl: './ajustes-modal.scss'
})
export class AjustesModalComponent {
  readonly modal = inject(AjustesModalService);
  readonly acc = inject(AccesibilidadService);
  readonly auth = inject(AuthService);
  readonly infoModal = inject(InfoModalService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  mensajeExito = signal('');
  mensajeError = signal('');

  perfilForm = this.fb.group({
    nombre: [this.auth.usuario()?.nombre || '', Validators.required],
    genero: [this.auth.usuario()?.genero || 'HOMBRE']
  });

  passwordForm = this.fb.group({
    passwordActual: ['', Validators.required],
    nuevaPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  get tituloSubPantalla(): string {
    switch (this.modal.subPantalla()) {
      case 'IDIOMA': return this.acc.t('ajustes.idioma');
      case 'COLOR': return this.acc.t('ajustes.colorAcento');
      case 'COLOR_CUADROS': return this.acc.t('ajustes.colorCuadros');
      case 'FUENTE': return this.acc.t('ajustes.fuente');
      case 'UNIDADES': return this.acc.t('ajustes.unidades');
      case 'DATOS': return this.acc.t('ajustes.datos');
      case 'PASSWORD': return this.acc.t('ajustes.seguridad');
      case 'TEMA': return this.acc.t('ajustes.tema');
      default: return this.acc.t('ajustes.titulo');
    }
  }

  get nombreIdiomaActual(): string {
    const id = this.acc.idiomasDisponibles.find(i => i.codigo === this.acc.idiomaActual());
    return id ? `${id.bandera} ${id.nombre}` : 'Español';
  }

  get nombreColorActual(): string {
    const col = this.acc.coloresAcento.find(c => c.id === this.acc.colorAcento());
    return col ? col.nombre : 'Predeterminado';
  }

  get nombreColorCuadrosActual(): string {
    const col = this.acc.coloresCuadros.find(c => c.id === this.acc.colorCuadros());
    return col ? col.nombre : 'Por Defecto';
  }

  get hexColorActual(): string {
    const col = this.acc.coloresAcento.find(c => c.id === this.acc.colorAcento());
    return col ? col.colorHex : '#007aff';
  }

  get nombreTamanoActual(): string {
    const t = this.acc.tamanoFuente();
    if (t === 'pequeno') return 'Pequeño (88%)';
    if (t === 'grande') return 'Grande (115%)';
    if (t === 'extragrande') return 'Extra Grande (130%)';
    return 'Normal (100%)';
  }

  irA(sub: SubPantallaAjustes): void {
    if (sub === 'DATOS') {
      this.perfilForm.patchValue({
        nombre: this.auth.usuario()?.nombre || '',
        genero: this.auth.usuario()?.genero || 'HOMBRE'
      });
    }
    this.mensajeExito.set('');
    this.mensajeError.set('');
    this.modal.irA(sub);
  }

  volver(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');
    this.modal.volver();
  }

  cerrar(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');
    this.modal.cerrar();
  }

  seleccionarIdioma(codigo: IdiomaCode): void {
    this.acc.setIdioma(codigo);
    this.mostrarAviso('Idioma actualizado');
  }

  seleccionarTema(tema: TemaMode): void {
    this.acc.setTema(tema);
    this.mostrarAviso(tema === 'dark' ? 'Modo Oscuro activado' : 'Modo Claro activado');
  }

  seleccionarColor(colorId: string): void {
    this.acc.setColorAcento(colorId);
    this.mostrarAviso('Color de resaltado aplicado');
  }

  seleccionarColorCuadros(colorId: string): void {
    this.acc.setColorCuadros(colorId);
    this.mostrarAviso('Color de cuadros aplicado');
  }

  seleccionarFuente(tamano: TamanoFuente): void {
    this.acc.setTamanoFuente(tamano);
    this.mostrarAviso('Tamaño de fuente actualizado');
  }

  seleccionarUnidad(unidad: UnidadesPeso): void {
    this.acc.setUnidadPeso(unidad);
    this.mostrarAviso(`Unidades cambiadas a ${unidad.toUpperCase()}`);
  }

  abrirSuscripcion(): void {
    this.cerrar();
    this.router.navigate(['/pagos']);
  }

  abrirTerminos(): void {
    this.infoModal.abrirTerminos();
  }

  abrirPoliticas(): void {
    this.infoModal.abrirPoliticas();
  }

  guardarDatos(): void {
    if (this.perfilForm.invalid) return;
    const nombre = this.perfilForm.value.nombre || '';
    const genero = (this.perfilForm.value.genero as 'HOMBRE' | 'MUJER') || 'HOMBRE';

    this.auth.actualizarPerfil(nombre, genero).subscribe({
      next: () => {
        this.mostrarAviso('Datos de cuenta actualizados con éxito.');
        setTimeout(() => this.modal.irA('PRINCIPAL'), 1200);
      },
      error: () => {
        this.mensajeError.set('No se pudo guardar la información.');
      }
    });
  }

  seleccionarGeneroForm(gen: 'HOMBRE' | 'MUJER'): void {
    this.perfilForm.patchValue({ genero: gen });
  }

  guardarPassword(): void {
    if (this.passwordForm.invalid) return;
    this.mostrarAviso('Contraseña actualizada correctamente.');
    this.passwordForm.reset();
    setTimeout(() => this.modal.irA('PRINCIPAL'), 1200);
  }

  cerrarSesion(): void {
    this.cerrar();
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private mostrarAviso(msg: string): void {
    this.mensajeExito.set(msg);
    setTimeout(() => this.mensajeExito.set(''), 3000);
  }
}
