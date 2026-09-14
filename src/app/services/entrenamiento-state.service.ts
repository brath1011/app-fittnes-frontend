import { Injectable, signal } from '@angular/core';
import { Rutina } from '../models/api.models';

type EstadoEntrenamiento = 'PREPARACION' | 'EJECUTANDO' | 'DESCANSO_LADO' | 'DESCANSO_SERIE' | 'COMPLETADO';

export interface SeriesCompletadasMap {
  [ejercicioIdx: number]: boolean[];
}

@Injectable({
  providedIn: 'root'
})
export class EntrenamientoStateService {
  // Global Session State
  rutinaActiva = signal<Rutina | null>(null);
  estado = signal<EstadoEntrenamiento>('PREPARACION');
  
  // Progress State
  ejercicioActualIdx = signal(0);
  serieActual = signal(1);
  ladoActual = signal<'IZQUIERDA' | 'DERECHA' | null>(null);
  seriesCompletadas = signal<SeriesCompletadasMap>({});

  // Global Stopwatch (Time elapsed for workout)
  duracionEntrenamientoSegundos = signal(0);
  private stopwatchInterval: any = null;

  // Individual Series Rest Timer
  timerActivoSerieIdx = signal<number | null>(null);
  tiempoRestanteSerie = signal(0);
  private listTimerInterval: any = null;

  // Global Rest Timer (For Lado or between exercises)
  tiempoRestante = signal(0);
  private timerInterval: any = null;

  iniciarEntrenamiento(rutina: Rutina) {
    if (this.rutinaActiva()?.id !== rutina.id) {
      this.limpiarEstado();
      this.rutinaActiva.set(rutina);
    }
    this.estado.set('EJECUTANDO');
    this.iniciarCronometroGeneral();
  }

  hayEntrenamientoActivo(): boolean {
    return this.rutinaActiva() !== null && this.estado() !== 'COMPLETADO' && this.estado() !== 'PREPARACION';
  }

  marcarSerieCompletada(ejercicioIdx: number, serieIdx: number, completada: boolean) {
    this.seriesCompletadas.update(map => {
      const newMap = { ...map };
      if (!newMap[ejercicioIdx]) {
        newMap[ejercicioIdx] = [];
      }
      newMap[ejercicioIdx][serieIdx] = completada;
      return newMap;
    });
  }

  esSerieCompletada(ejercicioIdx: number, serieIdx: number): boolean {
    const map = this.seriesCompletadas();
    return map[ejercicioIdx] ? !!map[ejercicioIdx][serieIdx] : false;
  }

  getSeriesParaEjercicio(ejercicioIdx: number, totalSeries: number): boolean[] {
    const map = this.seriesCompletadas();
    if (!map[ejercicioIdx] || map[ejercicioIdx].length !== totalSeries) {
       // Initialize if it doesn't match
       const newArr = new Array(totalSeries).fill(false);
       if (map[ejercicioIdx]) {
           // Copy existing completed states up to the new length
           for (let i = 0; i < Math.min(map[ejercicioIdx].length, totalSeries); i++) {
               newArr[i] = map[ejercicioIdx][i];
           }
       }
       return newArr;
    }
    return [...map[ejercicioIdx]];
  }

  inicializarSeries(ejercicioIdx: number, totalSeries: number) {
    this.seriesCompletadas.update(map => {
        const newMap = { ...map };
        if (!newMap[ejercicioIdx] || newMap[ejercicioIdx].length !== totalSeries) {
            newMap[ejercicioIdx] = new Array(totalSeries).fill(false);
        }
        return newMap;
    });
  }

  // --- Global Stopwatch ---
  private iniciarCronometroGeneral() {
    if (!this.stopwatchInterval) {
      this.stopwatchInterval = setInterval(() => {
        this.duracionEntrenamientoSegundos.update(s => s + 1);
      }, 1000);
    }
  }

  detenerCronometroGeneral() {
    if (this.stopwatchInterval) {
      clearInterval(this.stopwatchInterval);
      this.stopwatchInterval = null;
    }
  }

  // --- Series List Timer ---
  iniciarTimerDescansoSerie(sIdx: number, segundos: number, onAlarma: () => void) {
    this.detenerTimerSerie();
    this.timerActivoSerieIdx.set(sIdx);
    this.tiempoRestanteSerie.set(segundos);

    this.listTimerInterval = setInterval(() => {
      this.tiempoRestanteSerie.update(t => {
        if (t <= 1) {
          this.detenerTimerSerie();
          onAlarma();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  detenerTimerSerie() {
    if (this.listTimerInterval) {
      clearInterval(this.listTimerInterval);
      this.listTimerInterval = null;
    }
    this.timerActivoSerieIdx.set(null);
  }

  // --- Global Break Timer ---
  iniciarDescansoGlobal(segundos: number, tipo: 'DESCANSO_LADO' | 'DESCANSO_SERIE', onAlarma: () => void) {
    this.detenerDescansoGlobal();
    this.estado.set(tipo);
    this.tiempoRestante.set(segundos);

    this.timerInterval = setInterval(() => {
      this.tiempoRestante.update(t => {
        if (t <= 1) {
          this.detenerDescansoGlobal();
          this.estado.set('EJECUTANDO');
          onAlarma();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  detenerDescansoGlobal() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // --- Finalization ---
  finalizarEntrenamiento() {
    this.estado.set('COMPLETADO');
    this.detenerCronometroGeneral();
    this.detenerDescansoGlobal();
    this.detenerTimerSerie();
  }

  limpiarEstado() {
    this.detenerCronometroGeneral();
    this.detenerDescansoGlobal();
    this.detenerTimerSerie();
    
    this.rutinaActiva.set(null);
    this.estado.set('PREPARACION');
    this.ejercicioActualIdx.set(0);
    this.serieActual.set(1);
    this.ladoActual.set(null);
    this.seriesCompletadas.set({});
    this.duracionEntrenamientoSegundos.set(0);
    this.tiempoRestante.set(0);
    this.tiempoRestanteSerie.set(0);
  }
}
