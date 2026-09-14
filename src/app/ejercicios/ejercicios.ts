import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EjercicioService } from '../services/ejercicio.service';
import { RutinaService, RutinaRequest } from '../services/rutina.service';
import { Ejercicio, Rutina } from '../models/api.models';
import { AuthService } from '../services/auth.service';
import { SubcategoriaImagenService } from '../services/subcategoria-imagen.service';
import { AccesibilidadService } from '../services/accesibilidad.service';
import { obtenerIndicacionesCientificas, obtenerEjemploAyuda } from '../utils/biomecanica-cues';

@Component({
  selector: 'app-ejercicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ejercicios.html',
  styleUrl: './ejercicios.scss'
})
export class EjerciciosComponent implements OnInit {
  private readonly ejercicioService = inject(EjercicioService);
  private readonly rutinaService = inject(RutinaService);
  public readonly subcatImgService = inject(SubcategoriaImagenService);
  public readonly acc = inject(AccesibilidadService);
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  traducirGrupo(grupo: string): string {
    const clave = 'cat.' + grupo.toLowerCase();
    return this.acc.t(clave);
  }

  ejercicios = signal<Ejercicio[]>([]);
  rutinas = signal<Rutina[]>([]);
  grupoSeleccionado = signal<string>('PECHO');
  subcategoriaSeleccionada = signal<string>('TODOS');
  tipoSeleccionado = signal<string>('TODOS');
  buscarTermino = signal<string>('');
  tipoFiltroBusqueda = signal<'TODOS' | 'COMPUESTO' | 'AISLAMIENTO'>('TODOS');
  ejercicioSeleccionado = signal<Ejercicio | null>(null);
  activeMediaIndex = signal<number>(1);
  desplegarMultimedia = signal(false);
  imagenAmpliada = signal(false);

  // Estados del selector de rutina de 2 pasos
  mostrarSelectorRutina = signal(false);
  pasoSelectorRutina = signal<1 | 2>(1);
  ejercicioParaAgregar = signal<Ejercicio | null>(null);
  rutinaDestinoSeleccionadaId = signal<number | null>(null);
  diaSeleccionadoParaRutina = signal<string>('LUNES');
  seriesRutinaInput = signal<number>(3);
  repsRutinaInput = signal<number>(12);
  pesoRutinaInput = signal<number>(0);
  descansoRutinaInput = signal<number>(90);
  guardandoRutina = signal(false);

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

  // Estado del Gestor Multimedia ADMIN
  mostrarModalAdminMedia = signal(false);
  ejercicioAdminMedia = signal<Ejercicio | null>(null);
  adminFoto1 = signal('');
  adminFoto2 = signal('');
  adminFoto3 = signal('');
  adminFoto4 = signal('');
  adminFoto5 = signal('');
  adminFoto6 = signal('');
  adminVideo = signal('');
  guardandoAdminMedia = signal(false);

  // Estado de Navegación por Niveles
  nivelExploracion = signal<'GRUPO' | 'SUBCATEGORIA' | 'EJERCICIOS'>('SUBCATEGORIA');
  diasSemanaList = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

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

  subcategoriasDisponibles = computed(() => {
    const grupo = this.grupoSeleccionado().toUpperCase();
    return this.subcategoriasPorGrupo[grupo] || [];
  });

  subcategoriasTarjetas = computed(() => {
    return this.subcategoriasDisponibles().filter(s => s !== 'TODOS');
  });

  private normalizarTexto(txt: string | null | undefined): string {
    if (!txt) return '';
    return txt.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  ejerciciosFiltrados = computed(() => {
    let result = this.ejercicios();
    
    // Filtrar para mostrar solo ejercicios específicos (los que tienen efectividadPorcentaje)
    result = result.filter(e => e.efectividadPorcentaje !== null && e.efectividadPorcentaje !== undefined);

    const rawQuery = this.buscarTermino();
    const query = this.normalizarTexto(rawQuery);

    // Algoritmo de búsqueda inteligente multinivel
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

      // Filtro de tipo en resultados de búsqueda
      if (this.tipoFiltroBusqueda() !== 'TODOS') {
        result = result.filter(e => e.tipo === this.tipoFiltroBusqueda());
      }

      return result;
    }

    // Filtro por grupo muscular
    if (this.grupoSeleccionado() !== 'TODOS') {
      result = result.filter(e => e.grupoMuscular.toUpperCase() === this.grupoSeleccionado());
    }

    // Filtro por subcategoría
    if (this.grupoSeleccionado() !== 'TODOS' && this.subcategoriaSeleccionada() !== 'TODOS') {
      result = result.filter(e => e.subcategoria && e.subcategoria.toUpperCase() === this.subcategoriaSeleccionada().toUpperCase());
    }

    return result;
  });

  compuestosFiltrados = computed(() => {
    return this.ejerciciosFiltrados().filter(e => e.tipo === 'COMPUESTO');
  });

  aislamientosFiltrados = computed(() => {
    return this.ejerciciosFiltrados().filter(e => e.tipo === 'AISLAMIENTO');
  });

  mostrarResultadosBusqueda = computed(() => {
    return this.buscarTermino().trim().length > 0;
  });

  ngOnInit(): void {
    this.cargarEjercicios();
    this.cargarRutinas();

    // Capturar término de búsqueda de la navbar (query param)
    this.route.queryParams.subscribe(params => {
      if (params['buscar']) {
        this.buscarTermino.set(params['buscar']);
      } else {
        this.buscarTermino.set('');
      }
    });
  }

  cargarEjercicios(): void {
    this.ejercicioService.listarTodos().subscribe({
      next: (data) => this.ejercicios.set(data),
      error: (err) => console.error('Error al cargar ejercicios', err)
    });
  }

  cargarRutinas(): void {
    if (!this.auth.estaAutenticado()) {
      this.rutinas.set([]);
      return;
    }
    this.rutinaService.listarMisRutinas().subscribe({
      next: (data) => this.rutinas.set(data),
      error: (err) => console.error('Error al cargar rutinas', err)
    });
  }

  seleccionarGrupo(grupo: string): void {
    this.grupoSeleccionado.set(grupo);
    this.subcategoriaSeleccionada.set('TODOS');
    this.tipoSeleccionado.set('TODOS');
    this.nivelExploracion.set('SUBCATEGORIA');
  }


  seleccionarSubcategoria(subcat: string): void {
    this.subcategoriaSeleccionada.set(subcat);
    this.nivelExploracion.set('EJERCICIOS');
  }

  seleccionarSubcategoriaDeGrupo(grupo: string, subcat: string): void {
    this.grupoSeleccionado.set(grupo);
    this.subcategoriaSeleccionada.set(subcat);
    this.nivelExploracion.set('EJERCICIOS');
  }

  volverASubcategorias(): void {
    this.subcategoriaSeleccionada.set('TODOS');
    this.nivelExploracion.set('SUBCATEGORIA');
  }

  obtenerSubcategoriaImagen(subcat: string): string | null {
    return this.subcatImgService.obtenerImagen(subcat, this.auth.generoActivo());
  }

  obtenerConteoEjercicios(subcat: string, grupoParam?: string): number {
    const grupo = (grupoParam || this.grupoSeleccionado()).toUpperCase();
    return this.ejercicios().filter(e => 
      (grupo === 'TODOS' || e.grupoMuscular.toUpperCase() === grupo) && 
      e.subcategoria && e.subcategoria.toUpperCase() === subcat.toUpperCase() &&
      e.efectividadPorcentaje !== null && e.efectividadPorcentaje !== undefined
    ).length;
  }

  obtenerSubcategoriaIcono(subcat: string): string {
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
    if (s.includes('ANTEBRAZO') || s.includes('BRAQUIO')) return '🦾';
    if (s.includes('ABDOMINALES')) return '🍫';
    if (s.includes('CORE')) return '🌀';
    return '🏋️‍♂️';
  }

  cerrarDetalle(): void {
    this.ejercicioSeleccionado.set(null);
  }

  // Métodos de Adición Rápida a Rutina Directa
  abrirSelectorRutina(ejercicio: Ejercicio, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.auth.estaAutenticado()) {
      alert('Crea tu cuenta o inicia sesión para agregar ejercicios a tu rutina.');
      this.router.navigate(['/login']);
      return;
    }
    this.ejercicioParaAgregar.set(ejercicio);
    
    // Obtener día actual por defecto
    const hoyIndex = new Date().getDay(); // 0 Dom, 1 Lun, ...
    const diasMap = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const diaActual = diasMap[hoyIndex] || 'LUNES';
    this.diaSeleccionadoParaRutina.set(diaActual);

    if (this.rutinas().length > 0 && !this.rutinaDestinoSeleccionadaId()) {
      this.rutinaDestinoSeleccionadaId.set(this.rutinas()[0].id!);
    }
    this.seriesRutinaInput.set(3);
    this.repsRutinaInput.set(12);
    this.pesoRutinaInput.set(0);
    this.descansoRutinaInput.set(this.obtenerDescansoDefecto(ejercicio));
    this.mostrarSelectorRutina.set(true);
  }

  cerrarSelectorRutina(): void {
    this.mostrarSelectorRutina.set(false);
    this.ejercicioParaAgregar.set(null);
    this.guardandoRutina.set(false);
  }

  ajustarSeries(delta: number): void {
    this.seriesRutinaInput.update(v => Math.max(1, Math.min(20, v + delta)));
  }

  ajustarReps(delta: number): void {
    this.repsRutinaInput.update(v => Math.max(1, Math.min(100, v + delta)));
  }

  ajustarPeso(delta: number): void {
    this.pesoRutinaInput.update(v => Math.max(0, Math.min(500, v + delta)));
  }

  ajustarDescanso(segundos: number): void {
    this.descansoRutinaInput.set(segundos);
  }

  obtenerDescansoDefecto(ejercicio: Ejercicio): number {
    if (!ejercicio) return 90;
    const grupo = (ejercicio.grupoMuscular || '').toUpperCase();
    const nombre = (ejercicio.nombre || '').toLowerCase();
    
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

  obtenerRutinasTextoParaDia(dia: string): string {
    const rId = this.rutinaDestinoSeleccionadaId();
    const rutina = (rId ? this.rutinas().find(r => r.id === rId) : null) || this.rutinas()[0];
    if (rutina) {
      const diasAsignados = rutina.diasSemana ? rutina.diasSemana.split(',').map(d => d.trim().toUpperCase()) : [];
      if (diasAsignados.includes(dia)) {
        const cant = rutina.ejercicios?.length || 0;
        return `${cant} ${cant === 1 ? 'ejercicio' : 'ejercicios'}`;
      }
    }
    return 'Día de descanso';
  }

  confirmarAgregarEjercicioARutina(): void {
    const ejercicio = this.ejercicioParaAgregar();
    const dia = this.diaSeleccionadoParaRutina();
    if (!ejercicio || !dia || this.guardandoRutina()) return;

    const series = this.seriesRutinaInput() || 3;
    const repeticiones = this.repsRutinaInput() || 12;
    const pesoKg = this.pesoRutinaInput() || 0;
    const descansoSeriesSegundos = this.descansoRutinaInput() || this.obtenerDescansoDefecto(ejercicio);

    this.guardandoRutina.set(true);

    // Buscar la rutina seleccionada o una asignada a ese día
    const rId = this.rutinaDestinoSeleccionadaId();
    let rutina = (rId ? this.rutinas().find(r => r.id === rId) : null) || this.rutinas()[0];

    if (rutina) {
      // Verificar si ya tiene el ejercicio
      const diaUpper = dia.toUpperCase();
      const existe = (rutina.ejercicios || []).some(
        re => re.ejercicio.id === ejercicio.id && (re.dia?.toUpperCase() || diaUpper) === diaUpper
      );
      if (existe) {
        alert(`"${ejercicio.nombre}" ya se encuentra en tu rutina del ${dia.toLowerCase()}.`);
        this.guardandoRutina.set(false);
        return;
      }

      // Ordenar los existentes por orden actual y anexar estrictamente al final
      const ejerciciosExistentes = [...(rutina.ejercicios || [])].sort((a, b) => (a.orden || 0) - (b.orden || 0));

      const request: RutinaRequest = {
        nombre: rutina.nombre,
        descripcion: rutina.descripcion || '',
        nivelDificultad: rutina.nivelDificultad,
        diasSemana: rutina.diasSemana,
        ejercicios: [
          ...ejerciciosExistentes.map(re => ({
            ejercicioId: re.ejercicio.id!,
            dia: re.dia || diaUpper,
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
            dia: diaUpper,
            series,
            repeticiones,
            repeticionesMax: repeticiones,
            esUnilateral: false,
            descansoLadoSegundos: 0,
            descansoSeriesSegundos,
            pesoKg
          }
        ]
      };

      this.rutinaService.actualizar(rutina.id!, request).subscribe({
        next: () => {
          this.guardandoRutina.set(false);
          alert(`¡"${ejercicio.nombre}" agregado con éxito al final de tu rutina del ${dia.toLowerCase()}!`);
          this.cargarRutinas();
          this.cerrarSelectorRutina();
        },
        error: (err) => {
          this.guardandoRutina.set(false);
          console.error('Error al actualizar rutina', err);
          alert('Hubo un error al agregar el ejercicio a la rutina.');
        }
      });
    } else {
      // Crear nueva rutina asignada a ese día
      const diaUpper = dia.toUpperCase();
      const nombrePlan = `Plan ${diaUpper.charAt(0) + diaUpper.slice(1).toLowerCase()}`;
      const request: RutinaRequest = {
        nombre: nombrePlan,
        descripcion: `Plan de entrenamiento para ${dia.toLowerCase()}.`,
        nivelDificultad: 'PRINCIPIANTE',
        diasSemana: diaUpper,
        ejercicios: [{
          ejercicioId: ejercicio.id!,
          dia: diaUpper,
          series,
          repeticiones,
          repeticionesMax: repeticiones,
          esUnilateral: false,
          descansoLadoSegundos: 0,
          descansoSeriesSegundos,
          pesoKg
        }]
      };

      this.rutinaService.crear(request).subscribe({
        next: () => {
          this.guardandoRutina.set(false);
          alert(`¡Se ha creado el "${nombrePlan}" con "${ejercicio.nombre}"!`);
          this.cargarRutinas();
          this.cerrarSelectorRutina();
        },
        error: (err) => {
          this.guardandoRutina.set(false);
          console.error('Error al crear rutina', err);
          alert('Hubo un error al crear la rutina.');
        }
      });
    }
  }

  abrirDetalle(ejercicio: Ejercicio): void {
    this.ejercicioSeleccionado.set(ejercicio);
    this.activeMediaIndex.set(1);
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

    // Si es la foto 1 (portada) y no tiene foto específica del ejercicio, usar la de su subcategoría
    if (idx === 1 && ej.subcategoria) {
      const subcatImg = this.subcatImgService.obtenerImagen(ej.subcategoria, gen);
      if (this.esUrlValida(subcatImg)) {
        return subcatImg;
      }
    }

    return null;
  }

  obtenerPortadaEjercicio(ej: Ejercicio): string | null {
    return this.obtenerUrlFotoActiva(ej, 1);
  }

  // --- MÉTODOS GESTOR MULTIMEDIA ADMIN ---
  abrirAdminMediaModal(ejercicio: Ejercicio, event?: Event): void {
    if (event) event.stopPropagation();
    this.ejercicioAdminMedia.set(ejercicio);
    this.adminFoto1.set(ejercicio.foto1Url || ejercicio.imagenUrl || '');
    this.adminFoto2.set(ejercicio.foto2Url || '');
    this.adminFoto3.set(ejercicio.foto3Url || '');
    this.adminFoto4.set(ejercicio.foto4Url || '');
    this.adminFoto5.set(ejercicio.foto5Url || '');
    this.adminFoto6.set(ejercicio.foto6Url || '');
    this.adminVideo.set(ejercicio.videoUrl || '');
    this.mostrarModalAdminMedia.set(true);
  }

  cerrarAdminMediaModal(): void {
    this.mostrarModalAdminMedia.set(false);
    this.ejercicioAdminMedia.set(null);
  }

  onArchivoSeleccionado(event: any, slot: string): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const dataUrl = e.target.result;
      if (slot === 'foto1') this.adminFoto1.set(dataUrl);
      if (slot === 'foto2') this.adminFoto2.set(dataUrl);
      if (slot === 'foto3') this.adminFoto3.set(dataUrl);
      if (slot === 'foto4') this.adminFoto4.set(dataUrl);
      if (slot === 'foto5') this.adminFoto5.set(dataUrl);
      if (slot === 'foto6') this.adminFoto6.set(dataUrl);
      if (slot === 'video') this.adminVideo.set(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  guardarAdminMedia(): void {
    const ej = this.ejercicioAdminMedia();
    if (!ej || !ej.id) return;

    this.guardandoAdminMedia.set(true);
    const payload: Partial<Ejercicio> = {
      imagenUrl: this.adminFoto1() || ej.imagenUrl,
      foto1Url: this.adminFoto1(),
      foto2Url: this.adminFoto2(),
      foto3Url: this.adminFoto3(),
      foto4Url: this.adminFoto4(),
      foto5Url: this.adminFoto5(),
      foto6Url: this.adminFoto6(),
      videoUrl: this.adminVideo()
    };

    this.ejercicioService.actualizarMultimedia(ej.id, payload).subscribe({
      next: (actualizado) => {
        this.guardandoAdminMedia.set(false);
        alert(`¡Guía multimedia de "${actualizado.nombre}" actualizada con éxito!`);
        
        // Actualizar estado local
        this.cargarEjercicios();
        if (this.ejercicioSeleccionado()?.id === actualizado.id) {
          this.ejercicioSeleccionado.set(actualizado);
        }
        this.cerrarAdminMediaModal();
      },
      error: (err) => {
        this.guardandoAdminMedia.set(false);
        console.error('Error al guardar multimedia', err);
        alert('Hubo un error al guardar la multimedia del ejercicio.');
      }
    });
  }

  obtenerIndicacionesCientificas(grupo: string, nombre: string): string {
    return obtenerIndicacionesCientificas(grupo, nombre);
  }

  obtenerEjemploAyuda(grupo: string, nombre: string): string {
    return obtenerEjemploAyuda(grupo, nombre);
  }
}
