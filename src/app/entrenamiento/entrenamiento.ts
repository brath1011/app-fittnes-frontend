import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RutinaService } from '../services/rutina.service';
import { ProgresoService } from '../services/progreso.service';
import { AuthService } from '../services/auth.service';
import { Rutina, RutinaEjercicio } from '../models/api.models';
import { EntrenamientoStateService } from '../services/entrenamiento-state.service';
import { FormsModule } from '@angular/forms';
import { obtenerIndicacionesCientificas, obtenerEjemploAyuda } from '../utils/biomecanica-cues';

type EstadoEntrenamiento = 'PREPARACION' | 'EJECUTANDO' | 'DESCANSO_LADO' | 'DESCANSO_SERIE' | 'COMPLETADO';

@Component({
  selector: 'app-entrenamiento',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './entrenamiento.html',
  styleUrl: './entrenamiento.scss'
})
export class EntrenamientoComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rutinaService = inject(RutinaService);
  private readonly progresoService = inject(ProgresoService);
  readonly auth = inject(AuthService);
  readonly stateService = inject(EntrenamientoStateService);

  cargando = signal(true);
  error = signal(false);

  // Computed properties from state
  rutina = computed(() => this.stateService.rutinaActiva());
  estado = computed(() => this.stateService.estado());
  ejercicioActualIdx = computed(() => this.stateService.ejercicioActualIdx());
  serieActual = computed(() => this.stateService.serieActual());
  ladoActual = computed(() => this.stateService.ladoActual());
  duracionEntrenamientoSegundos = computed(() => this.stateService.duracionEntrenamientoSegundos());
  tiempoRestante = computed(() => this.stateService.tiempoRestante());
  
  timerActivoSerieIdx = computed(() => this.stateService.timerActivoSerieIdx());
  tiempoRestanteSerie = computed(() => this.stateService.tiempoRestanteSerie());

  // Estadísticas finales locales
  duracionFinalMinutos = signal(0);
  caloriasQuemadas = signal(0);

  diaParam = signal<string | null>(null);

  // Computed properties
  ejercicios = computed(() => {
    const r = this.rutina();
    if (!r || !r.ejercicios) return [];
    const dia = this.diaParam();
    if (dia) {
      const filtered = r.ejercicios.filter(e => !e.dia || e.dia.toUpperCase() === dia.toUpperCase());
      return filtered.length > 0 ? filtered : r.ejercicios;
    }
    return r.ejercicios;
  });

  ejercicioActual = computed<RutinaEjercicio | null>(() => {
    const list = this.ejercicios();
    const idx = this.ejercicioActualIdx();
    return list[idx] || null;
  });

  esUltimaSerie = computed(() => {
    const ej = this.ejercicioActual();
    return ej ? this.serieActual() === ej.series : false;
  });

  esUltimoEjercicio = computed(() => {
    return this.ejercicioActualIdx() === this.ejercicios().length - 1;
  });

  indicacionesBiomecanicas = computed(() => {
    const ej = this.ejercicioActual();
    if (!ej) return '';
    return obtenerIndicacionesCientificas(ej.ejercicio.grupoMuscular, ej.ejercicio.nombre);
  });

  ejemploPractico = computed(() => {
    const ej = this.ejercicioActual();
    if (!ej) return '';
    return obtenerEjemploAyuda(ej.ejercicio.grupoMuscular, ej.ejercicio.nombre);
  });

  seleccionarEjercicio(idx: number): void {
    this.stateService.detenerTimerSerie();
    this.stateService.ejercicioActualIdx.set(idx);
    this.stateService.serieActual.set(1);
    const ej = this.ejercicioActual();
    if (ej?.esUnilateral) {
      this.stateService.ladoActual.set('IZQUIERDA');
    } else {
      this.stateService.ladoActual.set(null);
    }
  }

  pasarSiguienteEjercicio(): void {
    this.stateService.detenerTimerSerie();
    if (this.esUltimoEjercicio()) {
      this.finalizarEntrenamiento();
    } else {
      this.stateService.ejercicioActualIdx.update(idx => idx + 1);
      this.stateService.serieActual.set(1);
      const ej = this.ejercicioActual();
      if (ej?.esUnilateral) this.stateService.ladoActual.set('IZQUIERDA');
      else this.stateService.ladoActual.set(null);
    }
  }

  ngOnInit(): void {
    const diaQuery = this.route.snapshot.queryParamMap.get('dia');
    if (diaQuery) {
      this.diaParam.set(diaQuery.toUpperCase());
    }

    const id = parseInt(this.route.snapshot.paramMap.get('id') || '', 10);
    if (isNaN(id)) {
      this.error.set(true);
      this.cargando.set(false);
      return;
    }

    this.rutinaService.obtenerPorId(id).subscribe({
      next: (data) => {
        // If no active session or active session is different routine, just set it (will stay PREPARACION)
        // If there IS an active session for THIS routine, it will automatically resume from the service
        if (!this.stateService.hayEntrenamientoActivo() || this.stateService.rutinaActiva()?.id !== id) {
            this.stateService.rutinaActiva.set(data);
            this.stateService.estado.set('PREPARACION');
        }
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    // DO NOT clear intervals on destroy, let them run in the background service!
  }

  iniciarEntrenamiento(): void {
    const data = this.rutina();
    if (data) {
      this.stateService.iniciarEntrenamiento(data);
      const ej = this.ejercicioActual();
      if (ej?.esUnilateral) {
        this.stateService.ladoActual.set('IZQUIERDA');
      } else {
        this.stateService.ladoActual.set(null);
      }
    }
  }

  completarSerie(): void {
    const ej = this.ejercicioActual();
    if (!ej) return;

    if (ej.esUnilateral && this.ladoActual() === 'IZQUIERDA') {
      this.stateService.ladoActual.set('DERECHA');
      if (ej.descansoLadoSegundos > 0) {
        this.iniciarDescanso(ej.descansoLadoSegundos, 'DESCANSO_LADO');
      }
    } else {
      if (ej.esUnilateral) {
        this.stateService.ladoActual.set('IZQUIERDA');
      }

      if (this.esUltimaSerie()) {
        if (this.esUltimoEjercicio()) {
          this.finalizarEntrenamiento();
        } else {
          this.stateService.ejercicioActualIdx.update(idx => idx + 1);
          this.stateService.serieActual.set(1);
          const nextEj = this.ejercicioActual();
          if (nextEj?.esUnilateral) this.stateService.ladoActual.set('IZQUIERDA');
          else this.stateService.ladoActual.set(null);

          this.iniciarDescanso(ej.descansoSeriesSegundos, 'DESCANSO_SERIE');
        }
      } else {
        this.stateService.serieActual.update(s => s + 1);
        this.iniciarDescanso(ej.descansoSeriesSegundos, 'DESCANSO_SERIE');
      }
    }
  }

  iniciarDescanso(segundos: number, tipo: 'DESCANSO_LADO' | 'DESCANSO_SERIE'): void {
    this.stateService.iniciarDescansoGlobal(segundos, tipo, () => {
      this.reproducirSonidoAlarma();
    });
  }

  saltarDescanso(): void {
    this.stateService.detenerDescansoGlobal();
    this.stateService.estado.set('EJECUTANDO');
  }

  finalizarEntrenamiento(): void {
    const totalSegundos = this.duracionEntrenamientoSegundos();
    this.stateService.finalizarEntrenamiento();

    const minutos = Math.max(1, Math.round(totalSegundos / 60));
    this.duracionFinalMinutos.set(minutos);

    const kcal = minutos * 7;
    this.caloriasQuemadas.set(kcal);

    const rutinaId = this.rutina()?.id || null;
    this.progresoService.registrarEntrenamiento(rutinaId, minutos, kcal).subscribe({
      next: () => {
        this.stateService.limpiarEstado(); // Reset state after saving
      },
      error: (err) => console.error('Error al registrar entrenamiento', err)
    });
  }

  private reproducirSonidoAlarma(): void {
    try {
      // Emitir un pitido de la web audio API para avisar
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = 880; // La nota A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

      oscillator.start();
      setTimeout(() => oscillator.stop(), 300);
    } catch (e) {
      console.log('Audio Context no soportado o bloqueado por navegador', e);
    }
  }

  formatearTiempo(segundos: number): string {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Nuevos Métodos para Series por Fila
  toggleSerieCompletada(idx: number): void {
    const ej = this.ejercicioActual();
    if (!ej) return;

    const sIdx = idx;
    const estabaCompletada = this.stateService.esSerieCompletada(this.ejercicioActualIdx(), sIdx);
    this.stateService.marcarSerieCompletada(this.ejercicioActualIdx(), sIdx, !estabaCompletada);

    if (!estabaCompletada) {
      this.iniciarTimerDescansoSerie(sIdx, ej.descansoSeriesSegundos || 60);
    } else {
      if (this.timerActivoSerieIdx() === sIdx) {
        this.stateService.detenerTimerSerie();
      }
    }
  }

  iniciarTimerDescansoSerie(sIdx: number, segundos: number): void {
    this.stateService.iniciarTimerDescansoSerie(sIdx, segundos, () => {
      this.reproducirSonidoAlarma();
    });
  }
  
  toggleTimerDescansoSerie(sIdx: number, segundos: number): void {
    if (this.timerActivoSerieIdx() === sIdx) {
        this.stateService.detenerTimerSerie();
    } else {
        this.iniciarTimerDescansoSerie(sIdx, segundos);
    }
  }

  obtenerArrayDeSeries(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  esSerieCompletada(idx: number): boolean {
    return this.stateService.esSerieCompletada(this.ejercicioActualIdx(), idx);
  }
}
