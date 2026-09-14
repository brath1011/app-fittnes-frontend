import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RutinaService, RutinaRequest } from '../services/rutina.service';
import { EjercicioService } from '../services/ejercicio.service';
import { Rutina, Ejercicio, RutinaEjercicio } from '../models/api.models';
import { AuthService } from '../services/auth.service';
import { SubcategoriaImagenService } from '../services/subcategoria-imagen.service';
import { EntrenamientoStateService } from '../services/entrenamiento-state.service';
import { AccesibilidadService } from '../services/accesibilidad.service';
import { obtenerIndicacionesCientificas, obtenerEjemploAyuda } from '../utils/biomecanica-cues';

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './rutinas.html',
  styleUrl: './rutinas.scss'
})
export class RutinasComponent implements OnInit {
  private readonly rutinaService = inject(RutinaService);
  private readonly ejercicioService = inject(EjercicioService);
  public readonly subcatImgService = inject(SubcategoriaImagenService);
  public readonly acc = inject(AccesibilidadService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly entrenamientoService = inject(EntrenamientoStateService);

  constructor() {
    effect(() => {
      if (!this.auth.estaAutenticado()) {
        this.rutinas.set([]);
        this.rutinaSeleccionadaId.set(null);
        this.ejerciciosAgregados.set([]);
        this.cuestionarioCompletado.set(false);
        this.formDias.set([]);
      }
    });
  }

  verificarAutenticacion(mensaje: string): boolean {
    if (!this.auth.estaAutenticado()) {
      alert(mensaje);
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  rutinas = signal<Rutina[]>([]);
  rutinaSeleccionadaId = signal<number | null>(null);
  vistaActualRutina = signal<'DETALLE_RUTINA' | 'CALENDARIO_SEMANAL'>('DETALLE_RUTINA');
  rutinaDestinoCatalog = signal<number | null>(null);
  diaSeleccionadoTab = signal<string>(this.obtenerDiaActualSemana());

  formatearNombreRutina(nombre?: string, index?: number): string {
    if (!nombre || nombre.trim() === '') {
      return `Rutina ${(index ?? 0) + 1}`;
    }
    return nombre.trim();
  }

  rutinaActual = computed(() => {
    const id = this.rutinaSeleccionadaId();
    const list = this.rutinas();
    if (id !== null) {
      const found = list.find(r => r.id === id);
      if (found) return found;
    }
    return list.length > 0 ? list[0] : null;
  });

  semanaDeRutina = computed(() => {
    const r = this.rutinaActual();
    if (!r) return [];
    const diasAsignados = r.diasSemana ? r.diasSemana.split(',').map(d => d.trim().toUpperCase()) : [];
    
    return this.diasSemanaList.map(dia => {
      const esActivo = diasAsignados.includes(dia);
      // Filtrar ejercicios asignados a este día específicamente
      const ejerciciosDelDia = (r.ejercicios || []).filter(e => {
        if (e.dia) {
          return e.dia.toUpperCase() === dia;
        }
        // Compatibilidad: si no tiene dia asignado, mostrar solo en el primer día activo
        return esActivo && diasAsignados.length > 0 && diasAsignados[0] === dia;
      });

      return {
        dia,
        esActivo,
        ejercicios: esActivo ? ejerciciosDelDia : []
      };
    });
  });

  datosDiaSeleccionado = computed(() => {
    const dia = this.diaSeleccionadoTab();
    const semana = this.semanaDeRutina();
    if (dia === 'TODOS') return null;
    return semana.find(d => d.dia === dia) || null;
  });

  menuDesplegableAbierto = signal<boolean>(false);

  toggleMenuDesplegable(): void {
    this.menuDesplegableAbierto.update(v => !v);
  }

  cerrarMenuDesplegable(): void {
    this.menuDesplegableAbierto.set(false);
  }

  seleccionarDiaTab(dia: string): void {
    this.diaSeleccionadoTab.set(dia);
  }

  seleccionarRutina(id: number): void {
    this.rutinaSeleccionadaId.set(id);
    this.menuDesplegableAbierto.set(false);
    this.vistaActualRutina.set('DETALLE_RUTINA');
  }

  scrollSemana(direction: 'left' | 'right'): void {
    const el = document.getElementById('semanaBoardScroll');
    if (el) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  subirEjercicio(rutinaId: number, indexEnDia: number, dia?: string): void {
    const rutina = this.rutinas().find(r => r.id === rutinaId);
    if (!rutina || !rutina.ejercicios) return;
    
    const targetDia = dia || this.diaSeleccionadoTab();
    const ejerciciosDelDia = rutina.ejercicios.filter(e => (e.dia || targetDia).toUpperCase() === targetDia.toUpperCase());
    if (indexEnDia <= 0 || indexEnDia >= ejerciciosDelDia.length) return;

    const actual = ejerciciosDelDia[indexEnDia];
    const anterior = ejerciciosDelDia[indexEnDia - 1];

    const idxActualEnFull = rutina.ejercicios.indexOf(actual);
    const idxAnteriorEnFull = rutina.ejercicios.indexOf(anterior);
    if (idxActualEnFull !== -1 && idxAnteriorEnFull !== -1) {
      const list = [...rutina.ejercicios];
      list[idxActualEnFull] = anterior;
      list[idxAnteriorEnFull] = actual;
      
      const req: RutinaRequest = {
        nombre: rutina.nombre,
        descripcion: rutina.descripcion || '',
        nivelDificultad: rutina.nivelDificultad,
        diasSemana: rutina.diasSemana,
        ejercicios: list.map(re => ({
          ejercicioId: re.ejercicio.id!,
          dia: re.dia || targetDia,
          series: re.series,
          repeticiones: re.repeticiones,
          repeticionesMax: re.repeticionesMax,
          esUnilateral: re.esUnilateral,
          descansoLadoSegundos: re.descansoLadoSegundos,
          descansoSeriesSegundos: re.descansoSeriesSegundos,
          pesoKg: re.pesoKg || 0
        }))
      };

      this.rutinaService.actualizar(rutina.id!, req).subscribe({
        next: () => this.cargarRutinas(),
        error: (err) => console.error('Error al subir ejercicio', err)
      });
    }
  }

  bajarEjercicio(rutinaId: number, indexEnDia: number, dia?: string): void {
    const rutina = this.rutinas().find(r => r.id === rutinaId);
    if (!rutina || !rutina.ejercicios) return;
    
    const targetDia = dia || this.diaSeleccionadoTab();
    const ejerciciosDelDia = rutina.ejercicios.filter(e => (e.dia || targetDia).toUpperCase() === targetDia.toUpperCase());
    if (indexEnDia < 0 || indexEnDia >= ejerciciosDelDia.length - 1) return;

    const actual = ejerciciosDelDia[indexEnDia];
    const siguiente = ejerciciosDelDia[indexEnDia + 1];

    const idxActualEnFull = rutina.ejercicios.indexOf(actual);
    const idxSiguienteEnFull = rutina.ejercicios.indexOf(siguiente);
    if (idxActualEnFull !== -1 && idxSiguienteEnFull !== -1) {
      const list = [...rutina.ejercicios];
      list[idxActualEnFull] = siguiente;
      list[idxSiguienteEnFull] = actual;
      
      const req: RutinaRequest = {
        nombre: rutina.nombre,
        descripcion: rutina.descripcion || '',
        nivelDificultad: rutina.nivelDificultad,
        diasSemana: rutina.diasSemana,
        ejercicios: list.map(re => ({
          ejercicioId: re.ejercicio.id!,
          dia: re.dia || targetDia,
          series: re.series,
          repeticiones: re.repeticiones,
          repeticionesMax: re.repeticionesMax,
          esUnilateral: re.esUnilateral,
          descansoLadoSegundos: re.descansoLadoSegundos,
          descansoSeriesSegundos: re.descansoSeriesSegundos,
          pesoKg: re.pesoKg || 0
        }))
      };

      this.rutinaService.actualizar(rutina.id!, req).subscribe({
        next: () => this.cargarRutinas(),
        error: (err) => console.error('Error al bajar ejercicio', err)
      });
    }
  }

  habilitarDiaParaRutina(rutinaId: number, dia: string): void {
    if (!this.verificarAutenticacion('Inicia sesión para modificar tus rutinas.')) return;
    const rutina = this.rutinas().find(r => r.id === rutinaId);
    if (!rutina) return;

    const diaUpper = dia.trim().toUpperCase();
    const confirmacion = window.confirm(`¿Deseas habilitar el ${diaUpper} como día de entrenamiento para la rutina "${rutina.nombre}"?`);
    if (!confirmacion) return;

    const diasActuales = rutina.diasSemana ? rutina.diasSemana.split(',').map(d => d.trim().toUpperCase()).filter(Boolean) : [];
    if (!diasActuales.includes(diaUpper)) {
      // Mantener orden cronológico natural de la semana
      const nuevosDias = this.diasSemanaList.filter(d => diasActuales.includes(d) || d === diaUpper);
      
      const req: RutinaRequest = {
        nombre: rutina.nombre,
        descripcion: rutina.descripcion || '',
        nivelDificultad: rutina.nivelDificultad,
        diasSemana: nuevosDias.join(','),
        ejercicios: (rutina.ejercicios || []).map(re => ({
          ejercicioId: re.ejercicio.id!,
          dia: re.dia || diasActuales[0] || diaUpper,
          series: re.series,
          repeticiones: re.repeticiones,
          repeticionesMax: re.repeticionesMax,
          esUnilateral: re.esUnilateral,
          descansoLadoSegundos: re.descansoLadoSegundos,
          descansoSeriesSegundos: re.descansoSeriesSegundos,
          pesoKg: re.pesoKg || 0
        }))
      };

      this.rutinaService.actualizar(rutina.id!, req).subscribe({
        next: () => {
          this.diaSeleccionadoTab.set(diaUpper);
          this.cargarRutinas();
          this.mostrarToast(`¡${diaUpper} habilitado exitosamente para entrenar!`);
        },
        error: (err) => {
          console.error('Error al habilitar día', err);
          this.mostrarToast('Error al habilitar el día. Por favor intenta de nuevo.');
        }
      });
    }
  }

  ejerciciosDisponibles = signal<Ejercicio[]>([]);
  mostrarModalCrear = signal(false);

  // Estados del Cuestionario
  cuestionarioCompletado = signal(false);
  cuestionarioPaso = signal(1);
  diasSemanaList = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  
  // Respuestas del cuestionario
  formDias = signal<string[]>([]);
  formNivel = signal<string>('PRINCIPIANTE');
  formObjetivo = signal<string>('HIPERTROFIA');

  // Días seleccionados en el modal de creación de rutinas
  diasSeleccionadosParaRutina = signal<string[]>([]);

  // Estados para añadir desde Catálogo en Rutinas
  diaSeleccionado = signal<string>('');
  mostrarSelectorCatalog = signal(false);
  buscarTerminoCatalog = signal('');
  grupoSeleccionadoCatalog = signal('PECHO');
  subcategoriaSeleccionadaCatalog = signal('TODOS');
  tipoSeleccionadoCatalog = signal('TODOS');
  gruposMusculares = ['PECHO', 'ESPALDA', 'PIERNAS', 'HOMBROS', 'BRAZOS', 'ABDOMEN', 'CARDIO'];

  gruposConSubcategorias = [
    { grupo: 'PECHO', subcategorias: ['PECTORAL ALTO', 'PECTORAL MEDIO', 'PECTORAL BAJO', 'PECTORAL COMPLETO'] },
    { grupo: 'ESPALDA', subcategorias: ['AMPLITUD', 'DENSIDAD', 'LUMBAR'] },
    { grupo: 'PIERNAS', subcategorias: ['CUADRICEPS', 'FEMORAL', 'GLUTEOS', 'PANTORRILLAS', 'TIBIAL'] },
    { grupo: 'HOMBROS', subcategorias: ['FRONTAL', 'LATERAL', 'POSTERIOR'] },
    { grupo: 'BRAZOS', subcategorias: ['BICEPS', 'TRICEPS', 'ANTEBRAZO'] },
    { grupo: 'ABDOMEN', subcategorias: ['ABDOMINALES', 'CORE'] },
    { grupo: 'CARDIO', subcategorias: ['CARDIO'] }
  ];

  // Estado de navegación multinivel en catálogo de rutinas
  nivelExploracionCatalog = signal<'SUBCATEGORIA' | 'EJERCICIOS'>('SUBCATEGORIA');
  
  // ==================== CREADOR DE RUTINA POR DÍAS Y MÚSCULOS ====================
  creadorDiaActual = signal<string>('LUNES');
  creadorGrupoSeleccionado = signal<string>('PECHO');
  creadorSubcatSeleccionada = signal<string>('TODOS');
  creadorBusqueda = signal<string>('');
  creadorEjerciciosPorDia = signal<{ [dia: string]: {
    ejercicio: Ejercicio;
    series: number;
    repeticiones: number;
    esUnilateral: boolean;
    descansoLadoSegundos: number;
    descansoSeriesSegundos: number;
    pesoKg: number;
  }[] }>({
    'LUNES': [],
    'MARTES': [],
    'MIERCOLES': [],
    'JUEVES': [],
    'VIERNES': [],
    'SABADO': [],
    'DOMINGO': []
  });

  creadorEjerciciosFiltrados = computed(() => {
    let result = this.ejerciciosDisponibles().filter(e => e.efectividadPorcentaje !== null && e.efectividadPorcentaje !== undefined);
    
    const query = this.normalizarTexto(this.creadorBusqueda());
    if (query) {
      const tokens = query.split(/\s+/).filter(t => t.length > 0);
      return result.filter(e => {
        const fullText = `${this.normalizarTexto(e.nombre)} ${this.normalizarTexto(e.grupoMuscular)} ${this.normalizarTexto(e.subcategoria)} ${this.normalizarTexto(e.tipo)}`;
        return tokens.every(tok => fullText.includes(tok));
      });
    }

    const grupo = this.creadorGrupoSeleccionado();
    if (grupo && grupo !== 'TODOS') {
      result = result.filter(e => e.grupoMuscular.toUpperCase() === grupo);
    }

    const subcat = this.creadorSubcatSeleccionada();
    if (subcat && subcat !== 'TODOS') {
      result = result.filter(e => e.subcategoria && e.subcategoria.toUpperCase() === subcat.toUpperCase());
    }

    return result;
  });

  // Estado para modal rápido de configuración de ejercicio
  ejercicioParaConfigurar = signal<Ejercicio | null>(null);
  configSeries = signal<number>(3);
  configReps = signal<number>(10);
  configRepsMax = signal<number>(15);
  configPeso = signal<number>(0);
  configDescanso = signal<number>(120);
  mostrarModalConfigEjercicio = signal<boolean>(false);
  mostrarInfoDescanso = signal<boolean>(false);
  mostrarInfoPeso = signal<boolean>(false);
  toastMensaje = signal<string | null>(null);

  mostrarToast(msg: string): void {
    this.toastMensaje.set(msg);
    setTimeout(() => {
      if (this.toastMensaje() === msg) {
        this.toastMensaje.set(null);
      }
    }, 3500);
  }

  // Estado para abrir modal de detalle desde el planificador semanal
  ejercicioSeleccionadoDetalle = signal<Ejercicio | null>(null);
  editandoRutinaId = signal<number | null>(null);
  editandoRutinaEjercicio = signal<RutinaEjercicio | null>(null);
  editandoDia = signal<string>('');
  editSeries = signal<number>(3);
  editReps = signal<number>(10);
  editRepsMax = signal<number>(15);
  editPeso = signal<number>(0);
  editDescanso = signal<number>(120);
  guardandoEdicion = signal<boolean>(false);
  activeMediaIndex = signal<number>(1);
  desplegarMultimedia = signal(false);
  imagenAmpliada = signal(false);

  toggleDesplegarMultimedia(): void {
    this.desplegarMultimedia.update(v => !v);
  }

  seleccionarYAmpliarMedia(idx: number): void {
    this.activeMediaIndex.set(idx);
    this.imagenAmpliada.set(true);
  }

  cerrarImagenAmpliada(): void {
    this.imagenAmpliada.set(false);
  }

  obtenerDescripcionBreveMedia(idx: number): string {
    switch (idx) {
      case 1: return 'Foto 1 - Vista Principal: Posición inicial y postura general del cuerpo para iniciar el ejercicio con alineación anatómica correcta.';
      case 2: return 'Foto 2 - Plano Escapular: Movimiento inclinado a 30° al frente para maximizar hipertrofia y proteger la articulación del hombro.';
      case 3: return 'Foto 3 - Depresión Escapular: Hombros abajo y alejados de las orejas para anular la activación del trapecio.';
      case 4: return 'Foto 4 - Vista POV (Primera Persona): Perspectiva en 1ra persona para verificar el rango de movimiento (ROM) completo.';
      case 5: return 'Foto 5 - Vista Cenital (Posterior): Alineación de escápulas y espalda para asegurar contracción máxima en la fase pico.';
      case 6: return 'Foto 6 - Variante y Agarre: Detalle técnico del agarre neutro o pronunciado para optimizar la tensión mecánica.';
      case 7: return 'Video Guía Demostrativo: Ejecución completa en movimiento en tiempo real con cadencia controlada 3-0-1-1.';
      default: return 'Detalle técnico y biomecánico de ejecución.';
    }
  }

  // Estado para día seleccionado en versión móvil
  diaSeleccionadoMobile = signal<string>(this.obtenerDiaActualSemana());

  obtenerDiaActualSemana(): string {
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const hoy = new Date().getDay();
    return dias[hoy];
  }

  subcategoriasPorGrupo: { [key: string]: string[] } = {
    'TODOS': [],
    'PECHO': ['TODOS', 'PECTORAL ALTO', 'PECTORAL MEDIO', 'PECTORAL BAJO', 'PECTORAL COMPLETO'],
    'ESPALDA': ['TODOS', 'AMPLITUD', 'DENSIDAD', 'LUMBAR'],
    'PIERNAS': ['TODOS', 'CUADRICEPS', 'FEMORAL', 'GLUTEOS', 'PANTORRILLAS', 'TIBIAL'],
    'HOMBROS': ['TODOS', 'FRONTAL', 'LATERAL', 'POSTERIOR'],
    'BRAZOS': ['TODOS', 'BICEPS', 'TRICEPS', 'ANTEBRAZO'],
    'ABDOMEN': ['TODOS', 'ABDOMINALES', 'CORE'],
    'CARDIO': ['TODOS', 'CARDIO', 'HIIT', 'LISS']
  };

  subcategoriaDescripciones: { [key: string]: string } = {
    'PECTORAL ALTO': 'Parte de arriba del pecho (cerca del cuello). Sirve para dar un aspecto lleno y fuerte.',
    'PECTORAL MEDIO': 'Parte central del pecho. Es la zona más grande y la que empuja con más fuerza.',
    'PECTORAL BAJO': 'Parte inferior del pecho. Ayuda a definir la forma de la base del pectoral.',
    'PECTORAL COMPLETO': 'Ejercicios completos que trabajan todo el pecho a la vez.',
    'AMPLITUD': 'Hacer la espalda más ancha (en forma de V). Se logra jalando de arriba hacia abajo (como jalones o dominadas).',
    'DENSIDAD': 'Hacer la espalda más gruesa y robusta. Se logra jalando hacia tu cuerpo (como remos con barra o mancuerna).',
    'LUMBAR': 'Espalda baja. Muy importante para proteger tu columna, evitar dolores y mantener una buena postura.',
    'CUADRICEPS': 'Parte de adelante del muslo. Sirven para estirar la rodilla y dar fuerza general a las piernas.',
    'FEMORAL': 'Parte de atrás del muslo. Sirven para doblar la pierna y dar estabilidad.',
    'GLUTEOS': 'Músculos de las nalgas. Son el motor de fuerza del cuerpo para saltar, correr y empujar.',
    'PANTORRILLAS': 'Parte trasera e inferior de la pierna. Sirven para pararte de puntillas y dar estabilidad al tobillo.',
    'TIBIAL': 'Parte delantera de la espinilla (al lado del hueso). Ayuda a la salud del tobillo y estabilidad al pisar.',
    'FRONTAL': 'Parte delantera del hombro. Se trabaja principalmente con presses y empujes.',
    'LATERAL': 'Parte del costado del hombro. Da un aspecto ancho y redondo a los lados.',
    'POSTERIOR': 'Parte de atrás del hombro. Ayuda a dar un aspecto redondo y previene lesiones de hombro.',
    'BICEPS': 'Parte de adelante del brazo. Sirve para doblar el codo y levantar cosas.',
    'TRICEPS': 'Parte de atrás del brazo (ocupa la mayor parte del brazo). Sirve para estirar el codo.',
    'ANTEBRAZO': 'Músculos flexores, extensores y braquiorradial del antebrazo. Claves para la fuerza de agarre y estabilidad de muñeca.',
    'ABDOMINALES': 'Parte de adelante del abdomen. Da el aspecto de "abdominales marcados".',
    'CORE': 'Toda la zona media del cuerpo. Da estabilidad y fuerza para cualquier movimiento.',
    'CARDIO': 'Ejercicios generales para mejorar tu resistencia del corazón y pulmones.',
    'HIIT': 'Cardio muy rápido e intenso con descansos cortos.',
    'LISS': 'Cardio suave y a ritmo constante (como caminar rápido o bicicleta suave).'
  };

  subcategoriasDisponiblesCatalog = computed(() => {
    const grupo = this.grupoSeleccionadoCatalog().toUpperCase();
    return this.subcategoriasPorGrupo[grupo] || [];
  });

  subcategoriasTarjetasCatalog = computed(() => {
    return this.subcategoriasDisponiblesCatalog().filter(s => s !== 'TODOS');
  });

  // Estados del modal de edición de días activos
  mostrarModalDias = signal(false);
  diasEditando = signal<string[]>([]);

  // Estados de candado y drag-and-drop
  lockedExercises = signal<string[]>([]);
  draggedIndex: number | null = null;
  draggedRutinaId: number | null = null;

  private normalizarTexto(txt: string | null | undefined): string {
    if (!txt) return '';
    return txt.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  // Ejercicios filtrados para el catálogo dentro de rutinas
  ejerciciosCatalogFiltrados = computed(() => {
    let result = this.ejerciciosDisponibles();
    
    // Filtrar para mostrar solo ejercicios específicos (los que tienen efectividadPorcentaje)
    result = result.filter(e => e.efectividadPorcentaje !== null && e.efectividadPorcentaje !== undefined);

    const query = this.normalizarTexto(this.buscarTerminoCatalog());
    if (query) {
      const tokens = query.split(/\s+/).filter(t => t.length > 0);

      result = result.filter(e => {
        const nombreNorm = this.normalizarTexto(e.nombre);
        const grupoNorm = this.normalizarTexto(e.grupoMuscular);
        const subcatNorm = this.normalizarTexto(e.subcategoria);
        const tipoNorm = this.normalizarTexto(e.tipo);
        const descNorm = this.normalizarTexto(e.descripcion);
        const cuesNorm = this.normalizarTexto(obtenerIndicacionesCientificas(e.grupoMuscular, e.nombre));
        const ayudaNorm = this.normalizarTexto(obtenerEjemploAyuda(e.grupoMuscular, e.nombre));

        const fullText = `${nombreNorm} ${grupoNorm} ${subcatNorm} ${tipoNorm} ${descNorm} ${cuesNorm} ${ayudaNorm}`;

        return tokens.every(tok => fullText.includes(tok));
      });

      return result;
    }

    if (this.grupoSeleccionadoCatalog() !== 'TODOS') {
      result = result.filter(e => e.grupoMuscular.toUpperCase() === this.grupoSeleccionadoCatalog());
    }

    if (this.grupoSeleccionadoCatalog() !== 'TODOS' && this.subcategoriaSeleccionadaCatalog() !== 'TODOS') {
      result = result.filter(e => e.subcategoria && e.subcategoria.toUpperCase() === this.subcategoriaSeleccionadaCatalog().toUpperCase());
    }

    return result;
  });

  compuestosFiltradosCatalog = computed(() => {
    return this.ejerciciosCatalogFiltrados().filter(e => e.tipo === 'COMPUESTO');
  });

  aislamientosFiltradosCatalog = computed(() => {
    return this.ejerciciosCatalogFiltrados().filter(e => e.tipo === 'AISLAMIENTO');
  });

  mostrarResultadosBusquedaCatalog = computed(() => {
    return this.buscarTerminoCatalog().trim().length > 0;
  });

  // Formulario de creación
  rutinaForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    nivelDificultad: ['PRINCIPIANTE', Validators.required]
  });

  // Lista de ejercicios agregados en la nueva rutina
  ejerciciosAgregados = signal<{
    ejercicio: Ejercicio;
    series: number;
    repeticiones: number;
    esUnilateral: boolean;
    descansoLadoSegundos: number;
    descansoSeriesSegundos: number;
    pesoKg: number;
  }[]>([]);

  // Mapear rutinas por día de la semana
  rutinasPorDia = computed(() => {
    const map = new Map<string, Rutina[]>();
    this.diasSemanaList.forEach(d => map.set(d, []));
    this.rutinas().forEach(rutina => {
      if (rutina.diasSemana) {
        const dias = rutina.diasSemana.split(',');
        dias.forEach(d => {
          const cleaned = d.trim().toUpperCase();
          if (map.has(cleaned)) {
            map.get(cleaned)!.push(rutina);
          }
        });
      }
    });
    return map;
  });

  // Mapear rutina principal y lista consolidada de ejercicios por día
  rutinaPrincipalPorDia = computed(() => {
    const map = new Map<string, { rutina: Rutina; ejercicios: any[] }>();
    this.diasSemanaList.forEach(d => {
      const ruts = this.rutinasPorDia().get(d) || [];
      if (ruts.length > 0) {
        const principal = ruts.reduce((max, r) => 
          ((r.ejercicios?.length || 0) >= (max.ejercicios?.length || 0)) ? r : max, ruts[0]
        );
        const ejerciciosCombinados: any[] = [];
        const seenIds = new Set<number>();
        
        for (const r of ruts) {
          if (r.ejercicios) {
            for (const re of r.ejercicios) {
              if (re.ejercicio && re.ejercicio.id && !seenIds.has(re.ejercicio.id)) {
                seenIds.add(re.ejercicio.id);
                ejerciciosCombinados.push(re);
              }
            }
          }
        }
        
        map.set(d, { rutina: principal, ejercicios: ejerciciosCombinados });
      }
    });
    return map;
  });

  // Volumen de entrenamiento en tiempo real
  volumenPorGrupo = computed(() => {
    const totals: { [key: string]: number } = {};
    this.ejerciciosAgregados().forEach(ea => {
      // Si el ejercicio tiene parent, buscamos el grupo del parent o el suyo
      const grupo = ea.ejercicio.grupoMuscular.toUpperCase();
      totals[grupo] = (totals[grupo] || 0) + ea.series;
    });
    return totals;
  });

  // Alerta de volumen basura (>15 series en un mismo grupo)
  alertaVolumenBasura = computed(() => {
    const totals = this.volumenPorGrupo();
    const alertas: { grupo: string; series: number }[] = [];
    Object.keys(totals).forEach(grupo => {
      if (totals[grupo] > 15) {
        alertas.push({ grupo, series: totals[grupo] });
      }
    });
    return alertas;
  });

  ngOnInit(): void {
    if (!this.auth.estaAutenticado()) {
      this.rutinas.set([]);
      this.router.navigate(['/login']);
      return;
    }

    this.cargarRutinas();
    this.cargarEjerciciosDisponibles();

    // Cargar cuestionario del localStorage
    const saved = localStorage.getItem('fitness_cuestionario');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.formDias.set(data.dias || []);
        this.formNivel.set(data.nivel || 'PRINCIPIANTE');
        this.formObjetivo.set(data.objetivo || 'HIPERTROFIA');
        this.cuestionarioCompletado.set(true);
      } catch (e) {
        console.error('Error al cargar cuestionario guardado', e);
      }
    }
  }

  // Métodos del Cuestionario
  siguientePaso(): void {
    this.cuestionarioPaso.update(p => p + 1);
  }

  anteriorPaso(): void {
    this.cuestionarioPaso.update(p => p - 1);
  }

  toggleDiaCuestionario(dia: string): void {
    this.formDias.update(dias =>
      dias.includes(dia) ? dias.filter(d => d !== dia) : [...dias, dia]
    );
  }

  guardarCuestionario(): void {
    if (this.formDias().length === 0) {
      alert('Por favor selecciona al menos un día en el que desees entrenar.');
      return;
    }
    const data = {
      dias: this.formDias(),
      nivel: this.formNivel(),
      objetivo: this.formObjetivo()
    };
    localStorage.setItem('fitness_cuestionario', JSON.stringify(data));
    this.cuestionarioCompletado.set(true);
  }

  reiniciarCuestionario(): void {
    if (confirm('¿Deseas reiniciar tu cuestionario de planificación semanal?')) {
      localStorage.removeItem('fitness_cuestionario');
      this.formDias.set([]);
      this.cuestionarioPaso.set(1);
      this.cuestionarioCompletado.set(false);
    }
  }

  // Métodos de Rutina
  cargarRutinas(): void {
    if (!this.auth.estaAutenticado()) {
      this.rutinas.set([]);
      this.rutinaSeleccionadaId.set(null);
      return;
    }
    this.rutinaService.listarMisRutinas().subscribe({
      next: (data) => {
        const sortedData = data.map(rutina => {
          if (rutina.ejercicios) {
            rutina.ejercicios.sort((a, b) => (a.orden || 0) - (b.orden || 0));
          }
          return rutina;
        });

        // Filtrar y eliminar automáticamente cualquier rutina fragmentada redundante ("Rutina de Lunes", "Rutina de Martes", etc.)
        const esRedundante = (nombre?: string) => {
          if (!nombre) return false;
          const n = nombre.toLowerCase().trim();
          return (
            n.startsWith('rutina de lunes') ||
            n.startsWith('rutina de martes') ||
            n.startsWith('rutina de miercoles') ||
            n.startsWith('rutina de miércoles') ||
            n.startsWith('rutina de jueves') ||
            n.startsWith('rutina de viernes') ||
            n.startsWith('rutina de sabado') ||
            n.startsWith('rutina de sábado') ||
            n.startsWith('rutina de domingo') ||
            n.startsWith('plan lunes') ||
            n.startsWith('plan martes') ||
            n.startsWith('plan miercoles') ||
            n.startsWith('plan miércoles') ||
            n.startsWith('plan jueves') ||
            n.startsWith('plan viernes') ||
            n.startsWith('plan sabado') ||
            n.startsWith('plan sábado') ||
            n.startsWith('plan domingo')
          );
        };

        const rutinasValidas = sortedData.filter(r => !esRedundante(r.nombre));
        const redundantes = sortedData.filter(r => esRedundante(r.nombre));

        // Purgar de la base de datos las rutinas redundantes para que nunca más aparezcan
        if (redundantes.length > 0) {
          redundantes.forEach(red => {
            if (red.id) {
              this.rutinaService.eliminar(red.id).subscribe({
                error: (e) => console.warn('Error purgando rutina redundante', e)
              });
            }
          });
        }

        // Si no quedó ninguna rutina tras purgar, pero había ejercicios en las redundantes, consolidar una sola semanal
        if (rutinasValidas.length === 0 && redundantes.length > 0) {
          const todosEjercicios: any[] = [];
          redundantes.forEach(r => {
            if (r.ejercicios) {
              r.ejercicios.forEach(re => {
                if (re.ejercicio && re.ejercicio.id && !todosEjercicios.some(e => e.ejercicioId === re.ejercicio.id)) {
                  todosEjercicios.push({
                    ejercicioId: re.ejercicio.id,
                    series: re.series || 3,
                    repeticiones: re.repeticiones || 10,
                    esUnilateral: re.esUnilateral || false,
                    descansoLadoSegundos: re.descansoLadoSegundos || 0,
                    descansoSeriesSegundos: re.descansoSeriesSegundos || 60,
                    pesoKg: re.pesoKg || 0
                  });
                }
              });
            }
          });

          const req: RutinaRequest = {
            nombre: 'Mi Rutina Semanal',
            descripcion: 'Rutina semanal unificada.',
            nivelDificultad: 'INTERMEDIO',
            diasSemana: 'LUNES,MARTES,MIERCOLES,JUEVES,VIERNES,SABADO,DOMINGO',
            ejercicios: todosEjercicios
          };

          this.rutinaService.crear(req).subscribe({
            next: (creada) => {
              this.rutinas.set([creada]);
              this.rutinaSeleccionadaId.set(creada.id!);
            }
          });
          return;
        }

        this.rutinas.set(rutinasValidas);
        if (rutinasValidas.length > 0) {
          const actual = this.rutinaSeleccionadaId();
          if (!actual || !rutinasValidas.some(r => r.id === actual)) {
            this.rutinaSeleccionadaId.set(rutinasValidas[0].id!);
          }
        } else {
          this.rutinaSeleccionadaId.set(null);
        }
      },
      error: (err) => console.error('Error al listar rutinas', err)
    });
  }

  cargarEjerciciosDisponibles(): void {
    this.ejercicioService.listarTodos().subscribe({
      next: (data) => {
        // Filtrar y mostrar solo los ejercicios padres en la lista para agregar
        this.ejerciciosDisponibles.set(data);
      },
      error: (err) => console.error('Error al listar ejercicios', err)
    });
  }

  abrirModal(): void {
    if (!this.verificarAutenticacion('Crea tu cuenta o inicia sesión para planificar tu rutina.')) return;
    this.mostrarModalCrear.set(true);
    this.ejerciciosAgregados.set([]);
    
    const count = this.rutinas().length + 1;
    this.diasSeleccionadosParaRutina.set(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']);
    
    this.rutinaForm.reset({
      nombre: `Rutina ${count}`,
      descripcion: 'Plan de entrenamiento personalizado.',
      nivelDificultad: 'INTERMEDIO'
    });
  }

  cerrarModal(): void {
    this.mostrarModalCrear.set(false);
  }

  // Métodos del Creador Interactivo por Días y Músculos
  seleccionarDiaCreador(dia: string): void {
    this.creadorDiaActual.set(dia);
    if (!this.diasSeleccionadosParaRutina().includes(dia)) {
      this.diasSeleccionadosParaRutina.update(dias => [...dias, dia]);
    }
  }

  seleccionarGrupoCreador(grupo: string): void {
    this.creadorGrupoSeleccionado.set(grupo);
    this.creadorSubcatSeleccionada.set('TODOS');
  }

  seleccionarSubcatCreador(subcat: string): void {
    this.creadorSubcatSeleccionada.set(subcat);
  }

  agregarEjercicioACreador(ejercicio: Ejercicio): void {
    const dia = this.creadorDiaActual();
    const mapa = { ...this.creadorEjerciciosPorDia() };
    const listaActual = mapa[dia] ? [...mapa[dia]] : [];

    if (listaActual.some(ea => ea.ejercicio.id === ejercicio.id)) return;

    listaActual.push({
      ejercicio,
      series: 3,
      repeticiones: 10,
      esUnilateral: false,
      descansoLadoSegundos: 15,
      descansoSeriesSegundos: 60,
      pesoKg: 0
    });

    mapa[dia] = listaActual;
    this.creadorEjerciciosPorDia.set(mapa);

    // Asegurar que el día esté seleccionado
    if (!this.diasSeleccionadosParaRutina().includes(dia)) {
      this.diasSeleccionadosParaRutina.update(dias => [...dias, dia]);
    }
  }

  quitarEjercicioCreador(dia: string, index: number): void {
    const mapa = { ...this.creadorEjerciciosPorDia() };
    if (!mapa[dia]) return;
    mapa[dia] = mapa[dia].filter((_, i) => i !== index);
    this.creadorEjerciciosPorDia.set(mapa);
  }

  actualizarCampoCreador(dia: string, index: number, campo: string, value: any): void {
    const mapa = { ...this.creadorEjerciciosPorDia() };
    if (!mapa[dia] || !mapa[dia][index]) return;
    
    const item = { ...mapa[dia][index] };
    if (campo === 'esUnilateral') {
      item.esUnilateral = !!value;
    } else {
      (item as any)[campo] = parseInt(value, 10) || 0;
    }
    mapa[dia][index] = item;
    this.creadorEjerciciosPorDia.set(mapa);
  }

  guardarDiaYPasarSiguiente(): void {
    const diaActual = this.creadorDiaActual();
    const idx = this.diasSemanaList.indexOf(diaActual);
    const siguienteIdx = (idx + 1) % this.diasSemanaList.length;
    const siguienteDia = this.diasSemanaList[siguienteIdx];

    if (!this.diasSeleccionadosParaRutina().includes(diaActual)) {
      this.diasSeleccionadosParaRutina.update(dias => [...dias, diaActual]);
    }

    this.creadorDiaActual.set(siguienteDia);
    if (!this.diasSeleccionadosParaRutina().includes(siguienteDia)) {
      this.diasSeleccionadosParaRutina.update(dias => [...dias, siguienteDia]);
    }
  }

  conteoEjerciciosDiaCreador(dia: string): number {
    return this.creadorEjerciciosPorDia()[dia]?.length || 0;
  }

  totalEjerciciosCreador(): number {
    let total = 0;
    const mapa = this.creadorEjerciciosPorDia();
    Object.keys(mapa).forEach(k => {
      total += mapa[k]?.length || 0;
    });
    return total;
  }

  agregarEjercicio(ejercicioIdStr: string): void {
    const id = parseInt(ejercicioIdStr, 10);
    const ejercicio = this.ejerciciosDisponibles().find(e => e.id === id);
    if (!ejercicio) return;
    this.agregarEjercicioACreador(ejercicio);
  }

  quitarEjercicio(id?: number): void {
    if (!id) return;
    const dia = this.creadorDiaActual();
    const mapa = { ...this.creadorEjerciciosPorDia() };
    if (mapa[dia]) {
      mapa[dia] = mapa[dia].filter(ea => ea.ejercicio.id !== id);
      this.creadorEjerciciosPorDia.set(mapa);
    }
  }

  actualizarCampo(index: number, campo: string, value: any): void {
    this.actualizarCampoCreador(this.creadorDiaActual(), index, campo, value);
  }

  toggleDiaRutina(dia: string): void {
    this.diasSeleccionadosParaRutina.update(dias => {
      if (dias.includes(dia)) {
        if (dias.length <= 1) return dias; // Mantener al menos un día
        return dias.filter(d => d !== dia);
      } else {
        return [...dias, dia];
      }
    });
  }

  guardarRutina(): void {
    if (this.rutinaForm.invalid) return;

    const val = this.rutinaForm.value;
    const dias = this.diasSeleccionadosParaRutina();
    const diasStr = dias.length > 0 ? dias.join(',') : 'LUNES,MARTES,MIERCOLES,JUEVES,VIERNES';

    const req: RutinaRequest = {
      nombre: val.nombre?.trim() || `Rutina ${this.rutinas().length + 1}`,
      descripcion: val.descripcion || 'Plan de entrenamiento personalizado',
      nivelDificultad: val.nivelDificultad || 'INTERMEDIO',
      diasSemana: diasStr,
      ejercicios: []
    };

    const mapa = this.creadorEjerciciosPorDia();
    Object.keys(mapa).forEach(dia => {
      mapa[dia].forEach(ea => {
        req.ejercicios.push({
          ejercicioId: ea.ejercicio.id!,
          dia: dia,
          series: ea.series,
          repeticiones: ea.repeticiones,
          esUnilateral: ea.esUnilateral,
          descansoLadoSegundos: ea.esUnilateral ? ea.descansoLadoSegundos : 0,
          descansoSeriesSegundos: ea.descansoSeriesSegundos,
          pesoKg: ea.pesoKg
        });
      });
    });

    this.rutinaService.crear(req).subscribe({
      next: (creada) => {
        this.cargarRutinas();
        if (creada && creada.id) {
          this.rutinaSeleccionadaId.set(creada.id);
          if (dias.length > 0 && !dias.includes(this.diaSeleccionadoTab())) {
            this.diaSeleccionadoTab.set(dias[0]);
          }
        }
        this.cerrarModal();
      },
      error: (err) => console.error('Error al guardar rutina', err)
    });
  }

  eliminarRutina(id?: number): void {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas eliminar esta rutina?')) {
      this.rutinaService.eliminar(id).subscribe({
        next: () => this.cargarRutinas(),
        error: (err) => console.error('Error al eliminar rutina', err)
      });
    }
  }

  // Métodos del Catalog Directo
  abrirCatalogParaRutina(rutinaId: number, dia?: string): void {
    if (!this.verificarAutenticacion('Crea tu cuenta o inicia sesión para añadir ejercicios.')) return;
    const targetDia = dia || this.diaSeleccionadoTab() || 'LUNES';
    this.rutinaDestinoCatalog.set(rutinaId);
    this.diaSeleccionado.set(targetDia);
    this.mostrarSelectorCatalog.set(true);
    this.buscarTerminoCatalog.set('');
    this.grupoSeleccionadoCatalog.set('PECHO');
    this.subcategoriaSeleccionadaCatalog.set('TODOS');
    this.tipoSeleccionadoCatalog.set('TODOS');
    this.nivelExploracionCatalog.set('SUBCATEGORIA');
  }

  abrirCatalogParaDia(dia: string, rutinaId?: number): void {
    if (!this.verificarAutenticacion('Crea tu cuenta o inicia sesión para añadir ejercicios.')) return;
    const rId = rutinaId ?? this.rutinaActual()?.id ?? null;
    this.rutinaDestinoCatalog.set(rId);
    this.diaSeleccionado.set(dia);
    this.mostrarSelectorCatalog.set(true);
    this.buscarTerminoCatalog.set('');
    this.grupoSeleccionadoCatalog.set('PECHO');
    this.subcategoriaSeleccionadaCatalog.set('TODOS');
    this.tipoSeleccionadoCatalog.set('TODOS');
    this.nivelExploracionCatalog.set('SUBCATEGORIA');
  }

  cerrarCatalog(): void {
    this.mostrarSelectorCatalog.set(false);
  }

  seleccionarGrupoCatalog(grupo: string): void {
    this.grupoSeleccionadoCatalog.set(grupo);
    this.subcategoriaSeleccionadaCatalog.set('TODOS');
    this.tipoSeleccionadoCatalog.set('TODOS');
    this.nivelExploracionCatalog.set('SUBCATEGORIA');
  }

  seleccionarSubcategoriaCatalog(subcat: string): void {
    this.subcategoriaSeleccionadaCatalog.set(subcat);
    this.nivelExploracionCatalog.set('EJERCICIOS');
  }

  seleccionarSubcategoriaDeGrupoCatalog(grupo: string, subcat: string): void {
    this.grupoSeleccionadoCatalog.set(grupo);
    this.subcategoriaSeleccionadaCatalog.set(subcat);
    this.nivelExploracionCatalog.set('EJERCICIOS');
  }

  volverASubcategoriasCatalog(): void {
    this.subcategoriaSeleccionadaCatalog.set('TODOS');
    this.nivelExploracionCatalog.set('SUBCATEGORIA');
  }

  formatearTiempoDescanso(segundos: number): string {
    if (!segundos) return '0s';
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    if (mins > 0 && secs > 0) return `${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m`;
    return `${secs}s`;
  }

  abrirDetalleYEdicionEjercicio(rutinaId: number, re: RutinaEjercicio, dia: string): void {
    this.editandoRutinaId.set(rutinaId);
    this.editandoRutinaEjercicio.set(re);
    this.editandoDia.set(dia);
    this.editSeries.set(re.series || 3);
    this.editReps.set(re.repeticiones || 10);
    this.editRepsMax.set(re.repeticionesMax || re.repeticiones || 15);
    this.editPeso.set(re.pesoKg || 0);
    this.editDescanso.set(re.descansoSeriesSegundos || this.obtenerDescansoDefecto(re.ejercicio));
    
    this.ejercicioSeleccionadoDetalle.set(re.ejercicio);
    this.activeMediaIndex.set(1);
    this.desplegarMultimedia.set(false);
    this.imagenAmpliada.set(false);
  }

  incrementarEditSeries(): void {
    this.editSeries.update(s => Math.min(s + 1, 20));
  }

  decrementarEditSeries(): void {
    this.editSeries.update(s => Math.max(s - 1, 1));
  }

  incrementarEditReps(): void {
    this.editReps.update(r => Math.min(r + 1, 100));
  }

  decrementarEditReps(): void {
    this.editReps.update(r => {
      const nuevo = Math.max(r - 1, 1);
      if (this.editRepsMax() < nuevo) {
        this.editRepsMax.set(nuevo);
      }
      return nuevo;
    });
  }

  incrementarEditRepsMax(): void {
    this.editRepsMax.update(r => Math.min(r + 1, 100));
  }

  decrementarEditRepsMax(): void {
    this.editRepsMax.update(r => Math.max(r - 1, this.editReps()));
  }

  incrementarEditPeso(step: number = 2.5): void {
    this.editPeso.update(p => Math.max(0, +(p + step).toFixed(1)));
  }

  decrementarEditPeso(step: number = 2.5): void {
    this.editPeso.update(p => Math.max(0, +(p - step).toFixed(1)));
  }

  setEditDescanso(segundos: number): void {
    this.editDescanso.set(segundos);
  }

  incrementarEditDescanso(step: number = 15): void {
    this.editDescanso.update(d => Math.min(d + step, 600));
  }

  decrementarEditDescanso(step: number = 15): void {
    this.editDescanso.update(d => Math.max(d - step, 15));
  }

  guardarEdicionParametros(): void {
    const rId = this.editandoRutinaId();
    const reActual = this.editandoRutinaEjercicio();
    const targetDia = this.editandoDia();
    if (!rId || !reActual) return;

    const rutina = this.rutinas().find(r => r.id === rId);
    if (!rutina || !rutina.ejercicios) return;

    this.guardandoEdicion.set(true);

    const targetDiaUpper = targetDia.toUpperCase();
    const ejerciciosActualizados = rutina.ejercicios.map(re => {
      const matchDia = (re.dia || targetDiaUpper).toUpperCase() === targetDiaUpper;
      const matchEj = re.ejercicio.id === reActual.ejercicio.id;
      if (matchDia && matchEj) {
        return {
          ...re,
          series: this.editSeries(),
          repeticiones: this.editReps(),
          repeticionesMax: this.editRepsMax(),
          pesoKg: this.editPeso(),
          descansoSeriesSegundos: this.editDescanso()
        };
      }
      return re;
    });

    const req: RutinaRequest = {
      nombre: rutina.nombre,
      descripcion: rutina.descripcion || '',
      nivelDificultad: rutina.nivelDificultad,
      diasSemana: rutina.diasSemana,
      ejercicios: ejerciciosActualizados.map(re => ({
        ejercicioId: re.ejercicio.id!,
        dia: re.dia || targetDiaUpper,
        series: re.series,
        repeticiones: re.repeticiones,
        repeticionesMax: re.repeticionesMax,
        esUnilateral: re.esUnilateral,
        descansoLadoSegundos: re.descansoLadoSegundos,
        descansoSeriesSegundos: re.descansoSeriesSegundos,
        pesoKg: re.pesoKg || 0
      }))
    };

    this.rutinaService.actualizar(rutina.id!, req).subscribe({
      next: () => {
        this.guardandoEdicion.set(false);
        this.diaSeleccionadoTab.set(targetDiaUpper);
        this.cargarRutinas();
        this.cerrarDetalleEjercicio();
        this.mostrarToast(`✅ Ajustes de "${reActual.ejercicio.nombre}" guardados`);
      },
      error: (err) => {
        this.guardandoEdicion.set(false);
        console.error('Error al actualizar parámetros del ejercicio', err);
        alert('Hubo un error al guardar los cambios.');
      }
    });
  }

  verDetalleEjercicio(ejercicio: Ejercicio): void {
    this.editandoRutinaId.set(null);
    this.editandoRutinaEjercicio.set(null);
    this.editandoDia.set('');
    this.ejercicioSeleccionadoDetalle.set(ejercicio);
    this.activeMediaIndex.set(1);
    this.desplegarMultimedia.set(false);
    this.imagenAmpliada.set(false);
  }

  obtenerPortadaEjercicio(ej: Ejercicio): string | null {
    return this.obtenerUrlFotoActiva(ej, 1);
  }

  cerrarDetalleEjercicio(): void {
    this.ejercicioSeleccionadoDetalle.set(null);
    this.editandoRutinaId.set(null);
    this.editandoRutinaEjercicio.set(null);
    this.editandoDia.set('');
  }

  private esUrlValida(url: string | null | undefined): boolean {
    if (!url || typeof url !== 'string') return false;
    const u = url.trim();
    if (u.length < 5) return false;
    if (/^\d+$/.test(u)) return false; // Descartar OIDs numéricos residuales de la BD
    return u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:image/') || u.startsWith('/') || u.startsWith('assets/');
  }

  obtenerUrlFotoActiva(ej: Ejercicio, idx: number): string | null {
    if (!ej) return null;
    const gen = this.auth.generoActivo();

    let rawUrl: string | null = null;
    if (gen === 'MUJER') {
      switch (idx) {
        case 1: rawUrl = ej.foto1UrlMujer || ej.imagenUrlMujer || ej.foto1Url || ej.imagenUrl || null; break;
        case 2: rawUrl = ej.foto2UrlMujer || ej.foto2Url || null; break;
        case 3: rawUrl = ej.foto3UrlMujer || ej.foto3Url || null; break;
        case 4: rawUrl = ej.foto4UrlMujer || ej.foto4Url || null; break;
        case 5: rawUrl = ej.foto5UrlMujer || ej.foto5Url || null; break;
        case 6: rawUrl = ej.foto6UrlMujer || ej.foto6Url || null; break;
        case 7: return ej.videoUrlMujer || ej.videoUrl || null;
        default: rawUrl = ej.foto1UrlMujer || ej.imagenUrlMujer || ej.foto1Url || ej.imagenUrl || null; break;
      }
    } else {
      switch (idx) {
        case 1: rawUrl = ej.foto1UrlHombre || ej.foto1Url || ej.imagenUrlHombre || ej.imagenUrl || null; break;
        case 2: rawUrl = ej.foto2UrlHombre || ej.foto2Url || null; break;
        case 3: rawUrl = ej.foto3UrlHombre || ej.foto3Url || null; break;
        case 4: rawUrl = ej.foto4UrlHombre || ej.foto4Url || null; break;
        case 5: rawUrl = ej.foto5UrlHombre || ej.foto5Url || null; break;
        case 6: rawUrl = ej.foto6UrlHombre || ej.foto6Url || null; break;
        case 7: return ej.videoUrlHombre || ej.videoUrl || null;
        default: rawUrl = ej.foto1UrlHombre || ej.foto1Url || ej.imagenUrlHombre || ej.imagenUrl || null; break;
      }
    }

    if (this.esUrlValida(rawUrl)) {
      return rawUrl;
    }

    return null;
  }

  obtenerIndicacionesCientificas(grupo: string, nombre: string): string {
    return obtenerIndicacionesCientificas(grupo, nombre);
  }

  obtenerEjemploAyuda(grupo: string, nombre: string): string {
    return obtenerEjemploAyuda(grupo, nombre);
  }

  obtenerConteoEjerciciosCatalog(subcat: string, grupoParam?: string): number {
    const grupo = (grupoParam || this.grupoSeleccionadoCatalog()).toUpperCase();
    return this.ejerciciosDisponibles().filter(e => 
      (grupo === 'TODOS' || e.grupoMuscular.toUpperCase() === grupo) && 
      e.subcategoria && e.subcategoria.toUpperCase() === subcat.toUpperCase() &&
      e.efectividadPorcentaje !== null && e.efectividadPorcentaje !== undefined
    ).length;
  }

  obtenerSubcategoriaImagenCatalog(subcat: string): string | null {
    return this.subcatImgService.obtenerImagen(subcat, this.auth.generoActivo());
  }

  obtenerSubcategoriaIconoCatalog(subcat: string): string {
    const s = subcat.toUpperCase();
    if (s.includes('ALTO')) return '📈';
    if (s.includes('MEDIO')) return '⚖️';
    if (s.includes('BAJO')) return '📉';
    if (s.includes('COMPLETO')) return '🛡️';
    if (s.includes('AMPLITUD')) return '👐';
    if (s.includes('DENSIDAD')) return '🧱';
    if (s.includes('LUMBAR')) return '🦴';
    if (s.includes('CUADRICEPS')) return '🦵';
    if (s.includes('FEMORAL')) return '🎯';
    if (s.includes('GLUTEOS')) return '🍑';
    if (s.includes('PANTORRILLAS')) return '👣';
    if (s.includes('TIBIAL')) return '👟';
    if (s.includes('FRONTAL')) return '⚪';
    if (s.includes('LATERAL')) return '🔵';
    if (s.includes('POSTERIOR')) return '⚫';
    if (s.includes('BICEPS')) return '💪';
    if (s.includes('TRICEPS')) return '💥';
    if (s.includes('ABDOMINALES')) return '🍫';
    if (s.includes('CORE')) return '🌀';
    return '🏋️‍♂️';
  }

  moverEjercicio(rutinaId: number, index: number, direccion: 'subir' | 'bajar'): void {
    const rutina = this.rutinas().find(r => r.id === rutinaId);
    if (!rutina || !rutina.ejercicios) return;

    const targetIndex = direccion === 'subir' ? index - 1 : index + 1;
    const ejercicios = [...rutina.ejercicios];

    if (targetIndex < 0 || targetIndex >= ejercicios.length) return;

    // Swap
    const temp = ejercicios[index];
    ejercicios[index] = ejercicios[targetIndex];
    ejercicios[targetIndex] = temp;

    const req: RutinaRequest = {
      nombre: rutina.nombre,
      descripcion: rutina.descripcion || '',
      nivelDificultad: rutina.nivelDificultad,
      diasSemana: rutina.diasSemana,
      ejercicios: ejercicios.map(re => ({
        ejercicioId: re.ejercicio.id!,
        dia: re.dia,
        series: re.series,
        repeticiones: re.repeticiones,
        repeticionesMax: re.repeticionesMax,
        esUnilateral: re.esUnilateral,
        descansoLadoSegundos: re.descansoLadoSegundos,
        descansoSeriesSegundos: re.descansoSeriesSegundos,
        pesoKg: re.pesoKg || 0
      }))
    };

    this.rutinaService.actualizar(rutina.id!, req).subscribe({
      next: () => this.cargarRutinas(),
      error: (err) => console.error('Error al reordenar', err)
    });
  }

  quitarEjercicioDeDia(rutinaId: number, ejercicioId: number, dia?: string): void {
    const rutina = this.rutinas().find(r => r.id === rutinaId);
    if (!rutina || !rutina.ejercicios) return;

    const targetDia = (dia || this.diaSeleccionadoTab() || '').toUpperCase();
    const ejercicios = rutina.ejercicios.filter(re => {
      if (re.ejercicio.id === ejercicioId) {
        if (targetDia && re.dia) {
          return re.dia.toUpperCase() !== targetDia;
        }
        return false;
      }
      return true;
    });

    const req: RutinaRequest = {
      nombre: rutina.nombre,
      descripcion: rutina.descripcion || '',
      nivelDificultad: rutina.nivelDificultad,
      diasSemana: rutina.diasSemana,
      ejercicios: ejercicios.map(re => ({
        ejercicioId: re.ejercicio.id!,
        dia: re.dia,
        series: re.series,
        repeticiones: re.repeticiones,
        repeticionesMax: re.repeticionesMax,
        esUnilateral: re.esUnilateral,
        descansoLadoSegundos: re.descansoLadoSegundos,
        descansoSeriesSegundos: re.descansoSeriesSegundos,
        pesoKg: re.pesoKg || 0
      }))
    };

    this.rutinaService.actualizar(rutina.id!, req).subscribe({
      next: () => this.cargarRutinas(),
      error: (err) => console.error('Error al quitar ejercicio de día', err)
    });
  }

  actualizarEjercicioInline(rutinaId: number, ejercicioId: number, campo: string, valor: any): void {
    const rutina = this.rutinas().find(r => r.id === rutinaId);
    if (!rutina || !rutina.ejercicios) return;

    const ejercicios = rutina.ejercicios.map(re => {
      if (re.ejercicio.id === ejercicioId) {
        let valParsed = parseInt(valor, 10);
        if (isNaN(valParsed)) valParsed = 0;
        return { ...re, [campo]: valParsed };
      }
      return re;
    });

    const req: RutinaRequest = {
      nombre: rutina.nombre,
      descripcion: rutina.descripcion || '',
      nivelDificultad: rutina.nivelDificultad,
      diasSemana: rutina.diasSemana,
      ejercicios: ejercicios.map(re => ({
        ejercicioId: re.ejercicio.id!,
        dia: re.dia,
        series: re.series,
        repeticiones: re.repeticiones,
        repeticionesMax: re.repeticionesMax,
        esUnilateral: re.esUnilateral,
        descansoLadoSegundos: re.descansoLadoSegundos,
        descansoSeriesSegundos: re.descansoSeriesSegundos,
        pesoKg: re.pesoKg || 0
      }))
    };

    this.rutinaService.actualizar(rutina.id!, req).subscribe({
      next: () => {
        // Cargar datos silenciosamente sin perder foco del input
        this.rutinaService.listarMisRutinas().subscribe(data => {
          const sortedData = data.map(r => {
            if (r.ejercicios) {
              r.ejercicios.sort((a, b) => (a.orden || 0) - (b.orden || 0));
            }
            return r;
          });
          this.rutinas.set(sortedData);
        });
      },
      error: (err) => console.error('Error al actualizar inline', err)
    });
  }

  obtenerDescansoDefecto(ejercicio: Ejercicio): number {
    const grupo = ejercicio.grupoMuscular.toUpperCase();
    const nombre = ejercicio.nombre.toLowerCase();
    
    // Si es Bíceps o Tríceps (Brazos) o contiene nombres afines
    if (grupo === 'BRAZOS' || nombre.includes('bicep') || nombre.includes('curl') || nombre.includes('tricep') || nombre.includes('copa') || nombre.includes('martillo')) {
      return 90; // 1:30 minutos
    }
    
    // Si es un ejercicio compuesto grande o pesado (Pecho plano, Sentadillas, Peso muerto, Espalda)
    const esCompuestoGrande = ejercicio.tipo === 'COMPUESTO' && (
      grupo === 'PECHO' || grupo === 'ESPALDA' || grupo === 'PIERNAS'
    );
    if (esCompuestoGrande || nombre.includes('sentadilla') || nombre.includes('press') || nombre.includes('peso muerto') || nombre.includes('remo')) {
      return 180; // 3 minutos
    }
    
    // Por defecto para otros ejercicios (aislamientos de hombros, abdomen, etc.)
    return 120; // 2 minutos
  }

  abrirConfiguracionEjercicio(ejercicio: Ejercicio): void {
    if (!this.verificarAutenticacion('Crea tu cuenta o inicia sesión para añadir ejercicios a tu rutina.')) return;
    
    // Autocompletar con ajustes previos si el ejercicio ya está en la rutina actual o en la lista de agregados
    let prevSettings: any = null;
    const r = this.rutinaActual();
    if (r && r.ejercicios) {
      const existing = r.ejercicios.find(re => re.ejercicio.id === ejercicio.id);
      if (existing) prevSettings = existing;
    }
    if (!prevSettings) {
      const existing = this.ejerciciosAgregados().find(ea => ea.ejercicio.id === ejercicio.id);
      if (existing) prevSettings = existing;
    }

    this.ejercicioParaConfigurar.set(ejercicio);
    this.configSeries.set(prevSettings ? prevSettings.series : 3);
    this.configReps.set(prevSettings ? prevSettings.repeticiones : 10);
    this.configRepsMax.set(prevSettings && prevSettings.repeticionesMax ? prevSettings.repeticionesMax : (prevSettings ? prevSettings.repeticiones : 15));
    this.configPeso.set(prevSettings && prevSettings.pesoKg !== undefined ? prevSettings.pesoKg : 0);
    this.configDescanso.set(prevSettings && prevSettings.descansoSeriesSegundos ? prevSettings.descansoSeriesSegundos : this.obtenerDescansoDefecto(ejercicio));
    
    this.mostrarInfoDescanso.set(false);
    this.mostrarInfoPeso.set(false);
    this.mostrarModalConfigEjercicio.set(true);
  }

  cerrarModalConfigEjercicio(): void {
    this.mostrarModalConfigEjercicio.set(false);
    this.ejercicioParaConfigurar.set(null);
  }

  toggleInfoDescanso(): void {
    this.mostrarInfoDescanso.update(v => !v);
  }

  toggleInfoPeso(): void {
    this.mostrarInfoPeso.update(v => !v);
  }

  // --- Helpers para Tipo de Peso (Barra, Mancuerna, Corporal) ---
  esEjercicioUnilateral(ejercicio: Ejercicio | null): boolean {
    if (!ejercicio || !ejercicio.nombre) return false;
    const nombre = ejercicio.nombre.toLowerCase();
    return nombre.includes('mancuerna') || 
           nombre.includes('unilateral') || 
           nombre.includes('polea') || 
           nombre.includes('búlgara') || 
           nombre.includes('bulgara') || 
           nombre.includes('lateral');
  }

  esEjercicioConBarra(ejercicio: Ejercicio | null): boolean {
    if (!ejercicio || !ejercicio.nombre) return false;
    const nombre = ejercicio.nombre.toLowerCase();
    return nombre.includes('barra') || 
           nombre.includes('press banca') || 
           nombre.includes('peso muerto') || 
           nombre.includes('sentadilla libre') || 
           nombre.includes('multipower') || 
           nombre.includes('smith');
  }

  esEjercicioPesoCorporal(ejercicio: Ejercicio | null): boolean {
    if (!ejercicio || !ejercicio.nombre) return false;
    const nombre = ejercicio.nombre.toLowerCase();
    return nombre.includes('dominada') || 
           nombre.includes('pull up') || 
           nombre.includes('fondo') || 
           nombre.includes('flexion') || 
           nombre.includes('flexión') || 
           nombre.includes('abdominal');
  }

  sumarPesoBarra(pesoBarra: number = 20): void {
    this.configPeso.update(p => p + pesoBarra);
  }


  establecerDescansoPreset(segundos: number): void {
    this.configDescanso.set(segundos);
  }

  incrementarSeries(): void {
    this.configSeries.update(s => Math.min(s + 1, 20));
  }

  decrementarSeries(): void {
    this.configSeries.update(s => Math.max(s - 1, 1));
  }

  incrementarReps(): void {
    this.configReps.update(r => Math.min(r + 1, 100));
  }

  decrementarReps(): void {
    this.configReps.update(r => Math.max(r - 1, 1));
    // Asegurar que repsMax >= reps
    if (this.configRepsMax() < this.configReps()) {
      this.configRepsMax.set(this.configReps());
    }
  }

  incrementarRepsMax(): void {
    this.configRepsMax.update(r => Math.min(r + 1, 100));
  }

  decrementarRepsMax(): void {
    this.configRepsMax.update(r => Math.max(r - 1, this.configReps()));
  }

  incrementarPeso(step: number = 2.5): void {
    this.configPeso.update(p => Math.max(0, +(p + step).toFixed(1)));
  }

  decrementarPeso(step: number = 2.5): void {
    this.configPeso.update(p => Math.max(0, +(p - step).toFixed(1)));
  }

  confirmarAgregarEjercicio(): void {
    const ej = this.ejercicioParaConfigurar();
    if (!ej) return;

    if (this.rutinaDestinoCatalog() !== null) {
      this.agregarEjercicioARutinaDirecto(
        this.rutinaDestinoCatalog()!,
        ej,
        this.configSeries(),
        this.configReps(),
        this.configPeso(),
        this.configDescanso(),
        this.configRepsMax()
      );
    } else if (this.diaSeleccionado()) {
      this.agregarEjercicioADiaDirecto(
        this.diaSeleccionado(),
        ej,
        this.configSeries(),
        this.configReps(),
        this.configPeso(),
        this.configDescanso(),
        this.configRepsMax()
      );
    }

    this.cerrarModalConfigEjercicio();
  }

  agregarEjercicioARutinaDirecto(
    rutinaId: number,
    ejercicio: Ejercicio,
    series: number,
    repeticiones: number,
    pesoKg: number,
    descansoSegundos: number,
    repeticionesMax?: number
  ): void {
    const rutina = this.rutinas().find(r => r.id === rutinaId);
    if (!rutina) return;

    const targetDia = (this.diaSeleccionado() || this.diaSeleccionadoTab() || 'LUNES').toUpperCase();
    
    // Validar si ya existe este ejercicio en el mismo día seleccionado
    const existeEnDia = (rutina.ejercicios || []).some(
      re => re.ejercicio.id === ejercicio.id && (re.dia?.toUpperCase() || targetDia) === targetDia
    );
    if (existeEnDia) {
      alert(`Este ejercicio ya está agregado en ${targetDia}.`);
      return;
    }

    let diasArray = rutina.diasSemana ? rutina.diasSemana.split(',').map(d => d.trim().toUpperCase()).filter(Boolean) : [];
    if (targetDia && !diasArray.includes(targetDia)) {
      diasArray.push(targetDia);
    }
    const diasSemanaActualizado = diasArray.join(',');

    const ejerciciosExistentes = [...(rutina.ejercicios || [])].sort((a, b) => (a.orden || 0) - (b.orden || 0));

    const request: RutinaRequest = {
      nombre: rutina.nombre,
      descripcion: rutina.descripcion || '',
      nivelDificultad: rutina.nivelDificultad,
      diasSemana: diasSemanaActualizado || rutina.diasSemana,
      ejercicios: [
        ...ejerciciosExistentes.map(re => ({
          ejercicioId: re.ejercicio.id!,
          dia: re.dia || targetDia,
          series: re.series,
          repeticiones: re.repeticiones,
          repeticionesMax: re.repeticionesMax,
          esUnilateral: re.esUnilateral,
          descansoLadoSegundos: re.descansoLadoSegundos,
          descansoSeriesSegundos: re.descansoSeriesSegundos,
          pesoKg: re.pesoKg || 0
        })),
        {
          ejercicioId: ejercicio.id!,
          dia: targetDia,
          series,
          repeticiones,
          repeticionesMax: repeticionesMax || repeticiones,
          esUnilateral: false,
          descansoLadoSegundos: 0,
          descansoSeriesSegundos: descansoSegundos,
          pesoKg
        }
      ]
    };

    this.rutinaService.actualizar(rutina.id!, request).subscribe({
      next: () => {
        this.cargarRutinas();
        this.rutinaSeleccionadaId.set(rutinaId);
        if (targetDia) this.diaSeleccionadoTab.set(targetDia);
        this.mostrarToast(`✅ "${ejercicio.nombre}" añadido a ${targetDia} (${series} series × ${repeticiones} reps)`);
      },
      error: (err) => console.error('Error al agregar ejercicio a rutina', err)
    });
  }

  agregarEjercicioADiaDirecto(
    dia: string,
    ejercicio: Ejercicio,
    series: number,
    repeticiones: number,
    pesoKg: number,
    descansoSegundos: number,
    repeticionesMax?: number
  ): void {
    const diaUpper = dia.toUpperCase();
    const rutina = this.rutinas().find(r => 
      r.diasSemana && r.diasSemana.split(',').map(d => d.trim().toUpperCase()).includes(diaUpper)
    ) || (this.rutinas().length > 0 ? this.rutinas()[0] : null);

    if (rutina) {
      this.diaSeleccionado.set(diaUpper);
      this.agregarEjercicioARutinaDirecto(rutina.id!, ejercicio, series, repeticiones, pesoKg, descansoSegundos, repeticionesMax);
    } else {
      const request: RutinaRequest = {
        nombre: `Plan ${diaUpper.charAt(0) + diaUpper.slice(1).toLowerCase()}`,
        descripcion: `Plan de entrenamiento para ${diaUpper.toLowerCase()}.`,
        nivelDificultad: this.formNivel() || 'PRINCIPIANTE',
        diasSemana: diaUpper,
        ejercicios: [{
          ejercicioId: ejercicio.id!,
          dia: diaUpper,
          series,
          repeticiones,
          repeticionesMax: repeticionesMax || repeticiones,
          esUnilateral: false,
          descansoLadoSegundos: 0,
          descansoSeriesSegundos: descansoSegundos,
          pesoKg
        }]
      };

      this.rutinaService.crear(request).subscribe({
        next: (creada) => {
          this.cargarRutinas();
          this.rutinaSeleccionadaId.set(creada.id!);
          this.diaSeleccionadoTab.set(diaUpper);
          this.mostrarToast(`✅ "${ejercicio.nombre}" añadido a ${diaUpper}`);
        },
        error: (err) => console.error('Error al crear rutina', err)
      });
    }
  }

  agregarEjercicioADiaDesdeCatalog(dia: string, ejercicio: Ejercicio, seriesVal: string, repsVal: string, pesoVal: string): void {
    const series = parseInt(seriesVal, 10) || 3;
    const repeticiones = parseInt(repsVal, 10) || 10;
    const pesoKg = parseFloat(pesoVal) || 0;
    const descanso = this.obtenerDescansoDefecto(ejercicio);

    this.agregarEjercicioADiaDirecto(dia, ejercicio, series, repeticiones, pesoKg, descanso);
  }

  // Métodos de candado y drag & drop
  toggleLock(rutinaId: number, ejercicioId: number): void {
    const key = `${rutinaId}-${ejercicioId}`;
    this.lockedExercises.update(keys =>
      keys.includes(key) ? keys.filter(k => k !== key) : [...keys, key]
    );
  }

  isLocked(rutinaId: number, ejercicioId: number): boolean {
    return this.lockedExercises().includes(`${rutinaId}-${ejercicioId}`);
  }

  onDragStart(event: DragEvent, index: number, rutinaId: number): void {
    const rutina = this.rutinas().find(r => r.id === rutinaId);
    if (!rutina || !rutina.ejercicios) return;
    const re = rutina.ejercicios[index];

    this.draggedIndex = index;
    this.draggedRutinaId = rutinaId;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetIndex: number, rutinaId: number): void {
    event.preventDefault();
    if (this.draggedIndex === null || this.draggedRutinaId !== rutinaId || this.draggedIndex === targetIndex) {
      return;
    }

    const rutina = this.rutinas().find(r => r.id === rutinaId);
    if (!rutina || !rutina.ejercicios) return;

    const ejercicios = [...rutina.ejercicios];
    const movedItem = ejercicios.splice(this.draggedIndex, 1)[0];
    ejercicios.splice(targetIndex, 0, movedItem);

    this.draggedIndex = null;
    this.draggedRutinaId = null;

    const req: RutinaRequest = {
      nombre: rutina.nombre,
      descripcion: rutina.descripcion || '',
      nivelDificultad: rutina.nivelDificultad,
      diasSemana: rutina.diasSemana,
      ejercicios: ejercicios.map(re => ({
        ejercicioId: re.ejercicio.id!,
        dia: re.dia,
        series: re.series,
        repeticiones: re.repeticiones,
        repeticionesMax: re.repeticionesMax,
        esUnilateral: re.esUnilateral,
        descansoLadoSegundos: re.descansoLadoSegundos,
        descansoSeriesSegundos: re.descansoSeriesSegundos,
        pesoKg: re.pesoKg || 0
      }))
    };

    this.rutinaService.actualizar(rutina.id!, req).subscribe({
      next: () => this.cargarRutinas(),
      error: (err) => console.error('Error al reordenar por drag-and-drop', err)
    });
  }

  // Métodos de edición de días activos
  abrirModalDias(): void {
    if (!this.verificarAutenticacion('Crea tu cuenta o inicia sesión para re-planificar tus días.')) return;
    this.diasEditando.set([...this.formDias()]);
    this.mostrarModalDias.set(true);
  }

  cerrarModalDias(): void {
    this.mostrarModalDias.set(false);
  }

  toggleDiaEdicion(dia: string): void {
    this.diasEditando.update(dias =>
      dias.includes(dia) ? dias.filter(d => d !== dia) : [...dias, dia]
    );
  }

  guardarDiasEditados(): void {
    if (this.diasEditando().length === 0) {
      alert('Por favor selecciona al menos un día en el que desees entrenar.');
      return;
    }

    this.formDias.set(this.diasEditando());

    const saved = localStorage.getItem('fitness_cuestionario');
    let data = { dias: this.diasEditando(), nivel: this.formNivel(), objetivo: this.formObjetivo() };
    if (saved) {
      try {
        data = { ...JSON.parse(saved), dias: this.diasEditando() };
      } catch (e) {}
    }
    localStorage.setItem('fitness_cuestionario', JSON.stringify(data));
    this.cerrarModalDias();
  }

  habilitarDiaDirecto(dia: string): void {
    if (!this.verificarAutenticacion('Crea tu cuenta o inicia sesión para habilitar este día de entrenamiento.')) return;
    this.formDias.update(dias => {
      if (!dias.includes(dia)) {
        const nuevosDias = [...dias, dia];
        const saved = localStorage.getItem('fitness_cuestionario');
        let data = { dias: nuevosDias, nivel: this.formNivel(), objetivo: this.formObjetivo() };
        if (saved) {
          try {
            data = { ...JSON.parse(saved), dias: nuevosDias };
          } catch (e) {}
        }
        localStorage.setItem('fitness_cuestionario', JSON.stringify(data));
        return nuevosDias;
      }
      return dias;
    });
  }
}
