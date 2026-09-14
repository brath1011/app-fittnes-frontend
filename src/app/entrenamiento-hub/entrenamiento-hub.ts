import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RutinaService, RutinaRequest } from '../services/rutina.service';
import { EjercicioService } from '../services/ejercicio.service';
import { Rutina, Ejercicio } from '../models/api.models';
import { AuthService } from '../services/auth.service';
import { EntrenamientoStateService } from '../services/entrenamiento-state.service';
import { AccesibilidadService } from '../services/accesibilidad.service';

export interface EjercicioEnRutinaItem {
  ejercicio: Ejercicio;
  series: number;
  repeticiones: number;
  esUnilateral: boolean;
  descansoLadoSegundos: number;
  descansoSeriesSegundos: number;
  pesoKg: number;
}

export interface EjercicioMemoriaConfig {
  series: number;
  repeticiones: number;
  esUnilateral: boolean;
  descansoLadoSegundos: number;
  descansoSeriesSegundos: number;
  pesoKg: number;
}

export interface AnalisisMusculoItem {
  grupoMuscular: string;
  grupoPrincipal: string;
  icono: string;
  seriesTotales: number;
  ejerciciosCount: number;
  ejerciciosNombres: string[];
  minOptimo: number;
  maxOptimo: number;
  limiteExcesivo: number;
  estado: 'OPTIMO' | 'EXCESIVO' | 'MANTENIMIENTO' | 'SIN_DATOS';
  mensaje: string;
  porcentajeBarra: number;
}

@Component({
  selector: 'app-entrenamiento-hub',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './entrenamiento-hub.html',
  styleUrl: './entrenamiento-hub.scss'
})
export class EntrenamientoHubComponent implements OnInit {
  private readonly rutinaService = inject(RutinaService);
  private readonly ejercicioService = inject(EjercicioService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly acc = inject(AccesibilidadService);
  readonly stateService = inject(EntrenamientoStateService);

  // Estados de datos
  rutinas = signal<Rutina[]>([]);
  ejerciciosDisponibles = signal<Ejercicio[]>([]);
  cargando = signal<boolean>(true);
  error = signal<boolean>(false);

  // Días y selección actual en el Hub
  diasSemanaList = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  
  obtenerDiaActualSemana(): string {
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const hoy = new Date().getDay();
    return dias[hoy];
  }

  obtenerNombreDiaEspanol(dia: string): string {
    switch ((dia || '').toUpperCase()) {
      case 'LUNES': return 'Lunes';
      case 'MARTES': return 'Martes';
      case 'MIERCOLES': return 'Miércoles';
      case 'JUEVES': return 'Jueves';
      case 'VIERNES': return 'Viernes';
      case 'SABADO': return 'Sábado';
      case 'DOMINGO': return 'Domingo';
      default: return dia;
    }
  }

  diaHoy = signal<string>(this.obtenerDiaActualSemana());
  diaSeleccionadoHub = signal<string>(this.obtenerDiaActualSemana());
  rutinaSeleccionadaHubId = signal<number | null>(null);

  // Rutina seleccionada o activa para el Hub
  rutinaActivaHub = computed(() => {
    const list = this.rutinas();
    if (list.length === 0) return null;
    
    const idSel = this.rutinaSeleccionadaHubId();
    if (idSel !== null) {
      const found = list.find(r => r.id === idSel);
      if (found) return found;
    }

    const dia = this.diaSeleccionadoHub();
    const paraDia = list.find(r => r.diasSemana && r.diasSemana.split(',').map(d => d.trim().toUpperCase()).includes(dia));
    if (paraDia) return paraDia;

    return list[0];
  });

  // Ejercicios asignados al día seleccionado
  ejerciciosDiaSeleccionado = computed(() => {
    const r = this.rutinaActivaHub();
    if (!r || !r.ejercicios) return [];
    const dia = this.diaSeleccionadoHub();
    const diasAsignados = r.diasSemana ? r.diasSemana.split(',').map(d => d.trim().toUpperCase()) : [];
    const esActivo = diasAsignados.includes(dia);

    if (!esActivo) return [];

    return r.ejercicios.filter(e => {
      if (e.dia) return e.dia.toUpperCase() === dia;
      return diasAsignados.length > 0 && diasAsignados[0] === dia;
    });
  });

  esDiaEntrenamientoActivo = computed(() => {
    const r = this.rutinaActivaHub();
    if (!r) return false;
    const dia = this.diaSeleccionadoHub();
    const diasAsignados = r.diasSemana ? r.diasSemana.split(',').map(d => d.trim().toUpperCase()) : [];
    return diasAsignados.includes(dia);
  });

  // Resumen de la sesión del día seleccionado
  resumenDiaSeleccionado = computed(() => {
    const ejs = this.ejerciciosDiaSeleccionado();
    const totalSeries = ejs.reduce((acc, e) => acc + (e.series || 0), 0);
    const totalReps = ejs.reduce((acc, e) => acc + (e.series * (e.repeticiones || 10)), 0);
    const tiempoEstimadoMin = Math.round(totalSeries * 2.2); // ~2.2 min por serie incluyendo descansos
    return {
      cantidadEjercicios: ejs.length,
      totalSeries,
      totalReps,
      tiempoEstimadoMin
    };
  });

  // Análisis Científico de Series Semanales por Grupo Muscular
  analisisVolumenSemanal = computed<AnalisisMusculoItem[]>(() => {
    const r = this.rutinaActivaHub();
    if (!r || !r.ejercicios || r.ejercicios.length === 0) return [];

    const estandares: { [key: string]: { min: number; max: number; maxRecuperable: number; icono: string; grupoPrincipal: string } } = {
      // Pecho
      'PECHO SUPERIOR': { min: 4, max: 10, maxRecuperable: 12, icono: '🛡️', grupoPrincipal: 'PECHO' },
      'PECHO MEDIO/TOTAL': { min: 8, max: 14, maxRecuperable: 18, icono: '🛡️', grupoPrincipal: 'PECHO' },
      'PECHO INFERIOR': { min: 3, max: 8, maxRecuperable: 10, icono: '🛡️', grupoPrincipal: 'PECHO' },
      
      // Espalda
      'DORSALES': { min: 8, max: 14, maxRecuperable: 18, icono: '🦅', grupoPrincipal: 'ESPALDA' },
      'TRAPECIOS': { min: 4, max: 10, maxRecuperable: 14, icono: '🦅', grupoPrincipal: 'ESPALDA' },
      'LUMBARES': { min: 3, max: 8, maxRecuperable: 10, icono: '🦅', grupoPrincipal: 'ESPALDA' },
      
      // Piernas
      'CUÁDRICEPS': { min: 8, max: 14, maxRecuperable: 18, icono: '🦵', grupoPrincipal: 'PIERNAS' },
      'ISQUIOTIBIALES (FEMORALES)': { min: 6, max: 12, maxRecuperable: 16, icono: '🦵', grupoPrincipal: 'PIERNAS' },
      'GLÚTEOS': { min: 4, max: 12, maxRecuperable: 16, icono: '🍑', grupoPrincipal: 'PIERNAS' },
      'GEMELOS (PANTORRILLAS)': { min: 6, max: 12, maxRecuperable: 16, icono: '🦵', grupoPrincipal: 'PIERNAS' },
      
      // Hombros
      'DELTOIDES ANTERIOR': { min: 4, max: 8, maxRecuperable: 12, icono: '🎯', grupoPrincipal: 'HOMBROS' },
      'DELTOIDES MEDIO': { min: 6, max: 12, maxRecuperable: 16, icono: '🎯', grupoPrincipal: 'HOMBROS' },
      'DELTOIDES POSTERIOR': { min: 6, max: 12, maxRecuperable: 16, icono: '🎯', grupoPrincipal: 'HOMBROS' },
      
      // Brazos
      'BÍCEPS': { min: 8, max: 14, maxRecuperable: 18, icono: '💪', grupoPrincipal: 'BRAZOS' },
      'TRÍCEPS': { min: 8, max: 14, maxRecuperable: 18, icono: '💪', grupoPrincipal: 'BRAZOS' },
      'ANTEBRAZO (Y BRAQUIORRADIAL)': { min: 4, max: 10, maxRecuperable: 14, icono: '🦾', grupoPrincipal: 'BRAZOS' },
      
      // Otros
      'ABDOMEN': { min: 8, max: 14, maxRecuperable: 16, icono: '🧱', grupoPrincipal: 'ABDOMEN' },
      'CARDIO': { min: 3, max: 8, maxRecuperable: 10, icono: '🏃', grupoPrincipal: 'CARDIO' }
    };

    const determinarSubMusculo = (ej: any): string => {
      const nom = (ej.nombre || '').toUpperCase();
      const sub = (ej.subcategoria || '').toUpperCase();
      const grupo = (ej.grupoMuscular || '').toUpperCase();

      if (grupo === 'BRAZOS') {
        if (nom.includes('BICEP') || nom.includes('BÍCEP') || nom.includes('CURL') || sub.includes('BICEP')) return 'BÍCEPS';
        if (nom.includes('TRICEP') || nom.includes('TRÍCEP') || nom.includes('FRANCES') || nom.includes('COPA') || sub.includes('TRICEP')) return 'TRÍCEPS';
        if (nom.includes('ANTEBRAZO') || nom.includes('BRAQUIORRADIAL') || nom.includes('MARTILLO') || sub.includes('ANTEBRAZO')) return 'ANTEBRAZO (Y BRAQUIORRADIAL)';
        return 'BÍCEPS'; // fallback
      }
      if (grupo === 'PECHO') {
        if (nom.includes('INCLINAD') || nom.includes('SUPERIOR') || sub.includes('SUPERIOR')) return 'PECHO SUPERIOR';
        if (nom.includes('DECLINAD') || nom.includes('INFERIOR') || sub.includes('INFERIOR')) return 'PECHO INFERIOR';
        return 'PECHO MEDIO/TOTAL';
      }
      if (grupo === 'PIERNAS') {
        if (nom.includes('ISQUIO') || nom.includes('FEMORAL') || nom.includes('CURL DE PIERNA') || sub.includes('ISQUIO')) return 'ISQUIOTIBIALES (FEMORALES)';
        if (nom.includes('GLUTE') || nom.includes('HIP THRUST') || nom.includes('GLÚTE') || sub.includes('GLUTE')) return 'GLÚTEOS';
        if (nom.includes('GEMELO') || nom.includes('PANTORRILLA') || nom.includes('TALON') || sub.includes('GEMELO')) return 'GEMELOS (PANTORRILLAS)';
        return 'CUÁDRICEPS';
      }
      if (grupo === 'HOMBROS') {
        if (nom.includes('LATERAL') || sub.includes('MEDIO')) return 'DELTOIDES MEDIO';
        if (nom.includes('POSTERIOR') || nom.includes('PÁJARO') || sub.includes('POSTERIOR')) return 'DELTOIDES POSTERIOR';
        if (nom.includes('FRONTAL') || nom.includes('ANTERIOR') || nom.includes('MILITAR') || sub.includes('ANTERIOR')) return 'DELTOIDES ANTERIOR';
        return 'DELTOIDES MEDIO';
      }
      if (grupo === 'ESPALDA') {
        if (nom.includes('TRAPECIO') || nom.includes('ENCOGIMIENTO') || sub.includes('TRAPECIO')) return 'TRAPECIOS';
        if (nom.includes('LUMBAR') || nom.includes('HIPEREXTENSI') || nom.includes('PESO MUERTO') || sub.includes('LUMBAR')) return 'LUMBARES';
        return 'DORSALES';
      }
      return grupo; // fallback para Abdomen y Cardio
    };

    const acumulador: { [key: string]: { series: number; ejercicios: Set<string> } } = {};

    r.ejercicios.forEach(re => {
      const subMusculo = determinarSubMusculo(re.ejercicio);
      if (!acumulador[subMusculo]) {
        acumulador[subMusculo] = { series: 0, ejercicios: new Set() };
      }
      acumulador[subMusculo].series += (re.series || 0);
      if (re.ejercicio?.nombre) {
        acumulador[subMusculo].ejercicios.add(re.ejercicio.nombre);
      }
    });

    const resultado: AnalisisMusculoItem[] = [];

    Object.keys(acumulador).forEach(subMusculo => {
      const data = acumulador[subMusculo];
      const regla = estandares[subMusculo] || { min: 8, max: 14, maxRecuperable: 18, icono: '⚡', grupoPrincipal: 'OTROS' };
      const series = data.series;
      const nombres = Array.from(data.ejercicios);

      let estado: 'OPTIMO' | 'EXCESIVO' | 'MANTENIMIENTO' | 'SIN_DATOS' = 'OPTIMO';
      let mensaje = '';

      if (series > regla.maxRecuperable) {
        estado = 'EXCESIVO';
        mensaje = `⚠️ Volumen Excesivo (${series} series semanales). Supera el límite de recuperación científica para este músculo específico (${regla.max} series). Se recomienda reducir series para evitar fatiga acumulada del SNC y estancamiento.`;
      } else if (series >= regla.min && series <= regla.max) {
        estado = 'OPTIMO';
        mensaje = `✅ Volumen Óptimo de Hipertrofia (${series} series semanales). Estímulo ideal y balance perfecto de recuperación para esta zona (Rango comprobado: ${regla.min} - ${regla.max} series).`;
      } else {
        estado = 'MANTENIMIENTO';
        mensaje = `ℹ️ Volumen de Mantenimiento (${series} series semanales). Conserva masa muscular. Puedes sumar series (objetivo: ${regla.min} - ${regla.max}) si buscas máximo crecimiento localizado.`;
      }

      const porcentaje = Math.min(Math.round((series / (regla.max * 1.25)) * 100), 100);

      resultado.push({
        grupoMuscular: subMusculo,
        grupoPrincipal: regla.grupoPrincipal,
        icono: regla.icono,
        seriesTotales: series,
        ejerciciosCount: nombres.length,
        ejerciciosNombres: nombres,
        minOptimo: regla.min,
        maxOptimo: regla.max,
        limiteExcesivo: regla.maxRecuperable,
        estado,
        mensaje,
        porcentajeBarra: porcentaje
      });
    });

    return resultado.sort((a, b) => b.seriesTotales - a.seriesTotales);
  });

  // Modal de Crear Rutina - Flujo en Pasos Separados
  mostrarModalCrear = signal<boolean>(false);
  pasoCreacion = signal<number>(1); // 1: Datos y Días, 2: Búsqueda de Ejercicios, 3: Configurar Series/Cargas

  diasSeleccionadosParaRutina = signal<string[]>([]);
  ejerciciosAgregados = signal<EjercicioEnRutinaItem[]>([]);

  // Memoria local de últimos valores usados por ejercicio
  private memoriaEjercicios: Record<string, EjercicioMemoriaConfig> = {};

  // Filtros del selector de ejercicios en el modal
  buscarEjercicioTermino = signal<string>('');
  grupoSeleccionado = signal<string>('TODOS');
  gruposMusculares = ['TODOS', 'PECHO', 'ESPALDA', 'PIERNAS', 'HOMBROS', 'BRAZOS', 'ABDOMEN', 'CARDIO'];

  // Formulario
  rutinaForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    nivelDificultad: ['PRINCIPIANTE', Validators.required]
  });

  // Ejercicios filtrados para el catálogo del modal
  ejerciciosFiltrados = computed(() => {
    let lista = this.ejerciciosDisponibles();
    const grupo = this.grupoSeleccionado();
    const termino = this.buscarEjercicioTermino().trim().toLowerCase();

    if (grupo !== 'TODOS') {
      lista = lista.filter(e => e.grupoMuscular.toUpperCase() === grupo);
    }

    if (termino) {
      lista = lista.filter(e =>
        e.nombre.toLowerCase().includes(termino) ||
        e.grupoMuscular.toLowerCase().includes(termino) ||
        (e.subcategoria && e.subcategoria.toLowerCase().includes(termino))
      );
    }

    return lista;
  });

  ngOnInit(): void {
    this.cargarMemoriaEjercicios();
    this.cargarDatos();
  }

  private cargarMemoriaEjercicios(): void {
    try {
      const guardado = localStorage.getItem('fitness_ejercicios_memoria');
      if (guardado) {
        this.memoriaEjercicios = JSON.parse(guardado);
      }
    } catch (_) {}
  }

  private guardarMemoriaEjercicios(): void {
    try {
      localStorage.setItem('fitness_ejercicios_memoria', JSON.stringify(this.memoriaEjercicios));
    } catch (_) {}
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(false);

    this.rutinaService.listarMisRutinas().subscribe({
      next: (data) => {
        this.rutinas.set(data);
        this.cargando.set(false);
        // Poblar memoria inicial desde rutinas existentes
        data.forEach(r => {
          r.ejercicios?.forEach(re => {
            if (re.ejercicio?.nombre) {
              this.memoriaEjercicios[re.ejercicio.nombre.toLowerCase()] = {
                series: re.series || 3,
                repeticiones: re.repeticiones || 10,
                esUnilateral: re.esUnilateral || false,
                descansoLadoSegundos: re.descansoLadoSegundos || 15,
                descansoSeriesSegundos: re.descansoSeriesSegundos || 60,
                pesoKg: re.pesoKg || 0
              };
            }
          });
        });
        this.guardarMemoriaEjercicios();
      },
      error: (err) => {
        console.error('Error al listar rutinas', err);
        this.cargando.set(false);
        this.error.set(true);
      }
    });

    this.ejercicioService.listarTodos().subscribe({
      next: (data) => this.ejerciciosDisponibles.set(data),
      error: (err) => console.error('Error al listar ejercicios', err)
    });
  }

  // --- Manejo del Modal de Creación en Pasos ---
  abrirModalCrear(): void {
    if (!this.auth.estaAutenticado()) {
      alert('Inicia sesión para crear tus rutinas personalizadas.');
      this.router.navigate(['/login']);
      return;
    }

    this.pasoCreacion.set(1);
    this.mostrarModalCrear.set(true);
    this.diasSeleccionadosParaRutina.set(['LUNES']);
    this.ejerciciosAgregados.set([]);
    this.buscarEjercicioTermino.set('');
    this.grupoSeleccionado.set('TODOS');
    this.rutinaForm.reset({
      nombre: '',
      descripcion: '',
      nivelDificultad: 'PRINCIPIANTE'
    });
  }

  cerrarModalCrear(): void {
    this.mostrarModalCrear.set(false);
    this.pasoCreacion.set(1);
  }

  irPaso(paso: number): void {
    if (paso === 2) {
      if (this.rutinaForm.get('nombre')?.invalid) {
        this.rutinaForm.get('nombre')?.markAsTouched();
        return;
      }
      if (this.diasSeleccionadosParaRutina().length === 0) {
        alert('Por favor selecciona al menos un día de la semana para entrenar.');
        return;
      }
    }
    if (paso === 3) {
      if (this.ejerciciosAgregados().length === 0) {
        alert('Debes seleccionar al menos un ejercicio del catálogo.');
        return;
      }
    }
    this.pasoCreacion.set(paso);
  }

  toggleDiaRutina(dia: string): void {
    this.diasSeleccionadosParaRutina.update(dias =>
      dias.includes(dia) ? dias.filter(d => d !== dia) : [...dias, dia]
    );
  }

  agregarEjercicio(ej: Ejercicio): void {
    if (this.ejerciciosAgregados().some(ea => ea.ejercicio.id === ej.id)) {
      return; // Ya está agregado
    }

    // Cargar valores de memoria previa si el usuario ya usó este ejercicio antes
    const claveMemoria = ej.nombre.toLowerCase();
    const configMemoria = this.memoriaEjercicios[claveMemoria];

    const nuevoItem: EjercicioEnRutinaItem = configMemoria
      ? {
          ejercicio: ej,
          series: configMemoria.series,
          repeticiones: configMemoria.repeticiones,
          esUnilateral: configMemoria.esUnilateral,
          descansoLadoSegundos: configMemoria.descansoLadoSegundos,
          descansoSeriesSegundos: configMemoria.descansoSeriesSegundos,
          pesoKg: configMemoria.pesoKg
        }
      : {
          ejercicio: ej,
          series: 3,
          repeticiones: 10,
          esUnilateral: false,
          descansoLadoSegundos: 15,
          descansoSeriesSegundos: 60,
          pesoKg: 0
        };

    this.ejerciciosAgregados.update(lista => [...lista, nuevoItem]);
  }

  quitarEjercicio(idx: number): void {
    this.ejerciciosAgregados.update(lista => lista.filter((_, i) => i !== idx));
  }

  moverEjercicio(idx: number, direccion: 'subir' | 'bajar'): void {
    this.ejerciciosAgregados.update(lista => {
      const nueva = [...lista];
      const targetIdx = direccion === 'subir' ? idx - 1 : idx + 1;
      if (targetIdx >= 0 && targetIdx < nueva.length) {
        const temp = nueva[idx];
        nueva[idx] = nueva[targetIdx];
        nueva[targetIdx] = temp;
      }
      return nueva;
    });
  }

  actualizarParametro(idx: number, campo: keyof EjercicioEnRutinaItem, valor: any): void {
    this.ejerciciosAgregados.update(lista => {
      const nueva = [...lista];
      if (campo === 'esUnilateral') {
        nueva[idx] = { ...nueva[idx], esUnilateral: Boolean(valor) };
      } else {
        nueva[idx] = { ...nueva[idx], [campo]: Number(valor) || 0 };
      }

      // Actualizar memoria para este ejercicio
      const ejItem = nueva[idx];
      if (ejItem?.ejercicio?.nombre) {
        this.memoriaEjercicios[ejItem.ejercicio.nombre.toLowerCase()] = {
          series: ejItem.series,
          repeticiones: ejItem.repeticiones,
          esUnilateral: ejItem.esUnilateral,
          descansoLadoSegundos: ejItem.descansoLadoSegundos,
          descansoSeriesSegundos: ejItem.descansoSeriesSegundos,
          pesoKg: ejItem.pesoKg
        };
        this.guardarMemoriaEjercicios();
      }

      return nueva;
    });
  }

  // Manejo de foco para auto-seleccionar todo el texto y permitir reescritura directa
  seleccionarAlEnfocar(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    if (input && typeof input.select === 'function') {
      input.select();
    }
  }

  guardarRutina(): void {
    if (this.rutinaForm.invalid) {
      this.pasoCreacion.set(1);
      this.rutinaForm.markAllAsTouched();
      return;
    }

    if (this.ejerciciosAgregados().length === 0) {
      alert('Debes agregar al menos un ejercicio a la rutina.');
      this.pasoCreacion.set(2);
      return;
    }

    const formVal = this.rutinaForm.value;
    const req: RutinaRequest = {
      nombre: formVal.nombre!,
      descripcion: formVal.descripcion || '',
      nivelDificultad: formVal.nivelDificultad!,
      diasSemana: this.diasSeleccionadosParaRutina().join(','),
      ejercicios: this.ejerciciosAgregados().map(ea => ({
        ejercicioId: ea.ejercicio.id!,
        dia: this.diaSeleccionadoHub(),
        series: ea.series,
        repeticiones: ea.repeticiones,
        esUnilateral: ea.esUnilateral,
        descansoLadoSegundos: ea.esUnilateral ? ea.descansoLadoSegundos : 0,
        descansoSeriesSegundos: ea.descansoSeriesSegundos,
        pesoKg: ea.pesoKg
      }))
    };

    this.rutinaService.crear(req).subscribe({
      next: (nueva) => {
        this.rutinas.update(list => [nueva, ...list]);
        this.cerrarModalCrear();
      },
      error: (err) => {
        console.error('Error al guardar la rutina', err);
        alert('No se pudo guardar la rutina. Revisa tu conexión.');
      }
    });
  }

  eliminarRutina(id?: number): void {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas eliminar esta rutina de entrenamiento?')) {
      this.rutinaService.eliminar(id).subscribe({
        next: () => {
          this.rutinas.update(list => list.filter(r => r.id !== id));
        },
        error: (err) => console.error('Error al eliminar rutina', err)
      });
    }
  }

  seleccionarDiaHub(dia: string): void {
    this.diaSeleccionadoHub.set(dia);
  }

  iniciarEntrenamientoDia(rutinaId?: number, dia?: string): void {
    const id = rutinaId || this.rutinaActivaHub()?.id;
    if (!id) {
      this.abrirModalCrear();
      return;
    }
    const diaTarget = dia || this.diaSeleccionadoHub();
    this.router.navigate(['/entrenamiento', id], { queryParams: { dia: diaTarget } });
  }

  empezarRutina(id?: number): void {
    if (!id) return;
    this.router.navigate(['/entrenamiento', id]);
  }
}
