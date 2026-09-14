import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProgresoService } from '../services/progreso.service';
import { RutinaService } from '../services/rutina.service';
import { AccesibilidadService, IdiomaCode, TamanoFuente, TemaMode } from '../services/accesibilidad.service';
import { AjustesModalService } from '../services/ajustes-modal.service';
import { FotoProgreso, RegistroEntrenamiento, Rutina } from '../models/api.models';
import { MedidaCorporalService, MedidaCorporalDTO } from '../services/medida-corporal.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class PerfilComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly acc = inject(AccesibilidadService);
  readonly ajustesModal = inject(AjustesModalService);
  private readonly progresoApi = inject(ProgresoService);
  private readonly medidaApi = inject(MedidaCorporalService);
  private readonly rutinaService = inject(RutinaService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  pestanaActiva = signal<'DASHBOARD' | 'PROGRESO' | 'HISTORIAL'>('DASHBOARD');
  
  fotos = signal<FotoProgreso[]>([]);
  entrenamientos = signal<RegistroEntrenamiento[]>([]);
  
  mensaje = signal('');
  mensajeError = signal('');
  procesandoFoto = signal(false);
  rutinas = signal<Rutina[]>([]);
  ultimaMedida = signal<MedidaCorporalDTO | null>(null);

  // Usuario & Identidad
  nombreUsuario = computed(() => {
    const u = this.authService.usuario();
    if (u?.nombre && u.nombre.trim()) return u.nombre;
    if (u?.email) return u.email.split('@')[0];
    return 'Atleta Fitness';
  });

  emailUsuario = computed(() => this.authService.usuario()?.email || 'atleta@fitnessguide.app');

  inicialesUsuario = computed(() => {
    const nom = this.nombreUsuario().trim();
    if (!nom) return 'FG';
    const partes = nom.split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nom.slice(0, 2).toUpperCase();
  });

  // Dashboard Computed
  totalSesiones = computed(() => this.entrenamientos().length);
  totalMinutos = computed(() => this.entrenamientos().reduce((sum, e) => sum + (e.duracionMinutos || 0), 0));
  totalHoras = computed(() => +(this.totalMinutos() / 60).toFixed(1));
  totalCalorias = computed(() => this.entrenamientos().reduce((sum, e) => sum + (e.caloriasQuemadas || 0), 0));

  // Tendencia de peso (últimos registros ordenados)
  tendenciaPeso = computed(() => {
    const fotosOrdenadas = [...this.fotos()].sort((a, b) => {
      const dateA = a.fecha ? new Date(a.fecha).getTime() : 0;
      const dateB = b.fecha ? new Date(b.fecha).getTime() : 0;
      return dateA - dateB;
    });
    return fotosOrdenadas.map(f => ({
      fecha: f.fecha || '',
      peso: f.pesoKg
    }));
  });

  pesoActual = computed(() => {
    const trend = this.tendenciaPeso();
    return trend.length > 0 ? trend[trend.length - 1].peso : null;
  });

  pesoPrimero = computed(() => {
    const trend = this.tendenciaPeso();
    return trend.length > 1 ? trend[0].peso : null;
  });

  pesoMinimo = computed(() => {
    const trend = this.tendenciaPeso();
    if (trend.length === 0) return null;
    return Math.min(...trend.map(t => t.peso));
  });

  pesoMaximo = computed(() => {
    const trend = this.tendenciaPeso();
    if (trend.length === 0) return null;
    return Math.max(...trend.map(t => t.peso));
  });

  cambioPeso = computed(() => {
    const actual = this.pesoActual();
    const primero = this.pesoPrimero();
    if (actual !== null && primero !== null) {
      return +(actual - primero).toFixed(1);
    }
    return null;
  });

  cambioPorcentaje = computed(() => {
    const actual = this.pesoActual();
    const primero = this.pesoPrimero();
    if (actual !== null && primero !== null && primero > 0) {
      return +(((actual - primero) / primero) * 100).toFixed(1);
    }
    return null;
  });

  diagnosticoPeso = computed(() => {
    const cambio = this.cambioPeso();
    const pct = this.cambioPorcentaje();
    const unit = this.acc.unidadPeso();
    if (cambio === null) {
      if (this.pesoActual() !== null) {
        return `Primer registro de ${this.pesoActual()} ${unit}. ¡Continúa registrando tu evolución semanal para calcular tu tendencia!`;
      }
      return 'Aún no has registrado tu peso. ¡Agrega tu peso inicial para activar el análisis inteligente!';
    }
    if (cambio > 0) {
      return `📈 Has subido +${cambio} ${unit} (+${pct}%). Fase óptima para superávit calórico y ganancia de masa muscular / hipertrofia.`;
    }
    if (cambio < 0) {
      return `📉 Has bajado ${cambio} ${unit} (${pct}%). Progreso favorable en déficit calórico, definición y reducción de porcentaje graso.`;
    }
    return `➡️ Tu peso se mantiene estable (${this.pesoActual()} ${unit}). Excelente para etapas de recomposición corporal y mantenimiento de fuerza.`;
  });

  // Volumen total levantado en rutinas
  volumenTotalEstimado = computed(() => {
    let vol = 0;
    this.rutinas().forEach(r => {
      if (r.ejercicios) {
        r.ejercicios.forEach(re => {
          if (re.pesoKg && re.series && re.repeticiones) {
            vol += (re.pesoKg * re.series * re.repeticiones);
          }
        });
      }
    });
    return vol;
  });

  // Distribución muscular en rutinas
  distribucionMuscular = computed(() => {
    const counts: Record<string, number> = {
      'PECHO': 0,
      'ESPALDA': 0,
      'PIERNAS': 0,
      'HOMBROS': 0,
      'BRAZOS': 0,
      'ABDOMEN': 0
    };
    let total = 0;
    this.rutinas().forEach(r => {
      if (r.ejercicios) {
        r.ejercicios.forEach(re => {
          const cat = (re.ejercicio?.grupoMuscular || '').toUpperCase();
          if (counts[cat] !== undefined) {
            counts[cat]++;
            total++;
          }
        });
      }
    });
    return Object.keys(counts).map(cat => ({
      categoria: cat,
      conteo: counts[cat],
      porcentaje: total > 0 ? Math.round((counts[cat] / total) * 100) : 0
    }));
  });

  // Filtros interactivos para Sobrecarga Progresiva
  filtroGrupoMuscular = signal<string>('TODOS');
  ejercicioProgresoSeleccionado = signal<string | null>(null);

  // Lista completa de ejercicios con métricas de sobrecarga
  ejerciciosCompletosProgreso = computed(() => {
    const rutinasData = this.rutinas();
    const map = new Map<string, {
      id: number;
      nombre: string;
      grupoMuscular: string;
      subcategoria?: string;
      pesoMax: number;
      series: number;
      reps: number;
      repsMax?: number;
      unRM: number; // 1RM Epley: peso * (1 + reps/30)
      volumenTotal: number; // series * reps * peso
      estadoProgreso: 'PROGRESO' | 'OPTIMO' | 'ESTANCADO';
      dias: string[];
      rutinaNombre: string;
    }>();

    rutinasData.forEach(r => {
      if (r.ejercicios) {
        r.ejercicios.forEach(re => {
          if (re.ejercicio) {
            const nom = re.ejercicio.nombre;
            const peso = re.pesoKg || 0;
            const series = re.series || 3;
            const reps = re.repeticiones || 10;
            const repsMax = re.repeticionesMax || reps;
            const unRM = peso > 0 ? Math.round(peso * (1 + reps / 30)) : 0;
            const vol = peso * series * reps;
            
            // Heurística de progresión
            let estado: 'PROGRESO' | 'OPTIMO' | 'ESTANCADO' = 'OPTIMO';
            if (peso === 0) {
              estado = 'ESTANCADO';
            } else if (reps >= 12 || unRM > (peso * 1.25)) {
              estado = 'PROGRESO';
            }

            const existing = map.get(nom);
            if (!existing || peso > existing.pesoMax) {
              map.set(nom, {
                id: re.ejercicio.id || 0,
                nombre: nom,
                grupoMuscular: (re.ejercicio.grupoMuscular || 'GENERAL').toUpperCase(),
                subcategoria: re.ejercicio.subcategoria,
                pesoMax: peso,
                series,
                reps,
                repsMax,
                unRM,
                volumenTotal: vol,
                estadoProgreso: estado,
                dias: re.dia ? [re.dia] : [],
                rutinaNombre: r.nombre
              });
            } else if (existing && re.dia && !existing.dias.includes(re.dia)) {
              existing.dias.push(re.dia);
            }
          }
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.pesoMax - a.pesoMax);
  });

  // Grupos musculares presentes en las rutinas del usuario
  gruposMuscularesDisponibles = computed(() => {
    const set = new Set<string>();
    this.ejerciciosCompletosProgreso().forEach(e => {
      if (e.grupoMuscular) set.add(e.grupoMuscular);
    });
    return Array.from(set).sort();
  });

  // Ejercicios filtrados por grupo
  ejerciciosFiltradosProgreso = computed(() => {
    const grupo = this.filtroGrupoMuscular();
    const todos = this.ejerciciosCompletosProgreso();
    if (grupo === 'TODOS') return todos;
    return todos.filter(e => e.grupoMuscular === grupo);
  });

  // Ejercicio seleccionado activo en el visor de detalle
  ejercicioActivoDetalle = computed(() => {
    const list = this.ejerciciosFiltradosProgreso();
    const sel = this.ejercicioProgresoSeleccionado();
    if (sel) {
      const match = list.find(e => e.nombre === sel);
      if (match) return match;
    }
    return list.length > 0 ? list[0] : null;
  });

  // Sobrecarga progresiva: top 10 PRs (compatibilidad)
  sobrecargaProgresiva = computed(() => {
    return this.ejerciciosCompletosProgreso().slice(0, 10);
  });

  // Ejercicios que requieren atención o están en alerta de estancamiento
  ejerciciosEstancados = computed(() => {
    return this.ejerciciosCompletosProgreso().filter(e => e.pesoMax === 0 || e.estadoProgreso === 'ESTANCADO');
  });

  // 5 Estrategias científicas de sobrecarga progresiva
  readonly estrategiasSobrecarga = [
    {
      icono: '🔄',
      titulo: '1. Doble Progresión (Regla de Oro)',
      subtitulo: 'Aumenta repeticiones antes de subir la carga',
      descripcion: 'Si estás usando 40 kg para 8 reps, no intentes saltar a 45 kg de inmediato. Mantén los 40 kg y busca llegar a 12 reps con técnica sólida. Cuando completes 12 reps en todas tus series, sube a 42.5 kg o 45 kg y vuelve a empezar en 8 reps.'
    },
    {
      icono: '⏱️',
      titulo: '2. Optimización de Descansos (ATP-CP)',
      subtitulo: '2 a 3 minutos para ejercicios multiarticulares',
      descripcion: 'El sistema nervioso central (SNC) y la fosfocreatina muscular necesitan al menos 120-180 segundos para recargarse al 95%. Descansos muy cortos (ej: 45s) acumulan fatiga metabólica que impide mover tu máxima fuerza.'
    },
    {
      icono: '🧱',
      titulo: '3. Uso de Microcargas Progresivas',
      subtitulo: 'Incrementos de +1 kg a +2.5 kg totales',
      descripcion: 'Subir 5 o 10 kg de golpe suele deteriorar el patrón de movimiento. Utiliza incrementos pequeños (+1.25 kg por lado) para forzar adaptaciones constantes sin estresar excesivamente los tendones.'
    },
    {
      icono: '📉',
      titulo: '4. Semana de Descarga Estratégica (Deload)',
      subtitulo: 'Reduce series al 50% cada 5-8 semanas',
      descripcion: 'Si llevas varias semanas sin subir peso y sientes fatiga articular, tu cuerpo necesita disipar fatiga residual. Reduce el volumen a la mitad por 1 semana; volverás con supercompensación y nuevos récords.'
    },
    {
      icono: '🎯',
      titulo: '5. Cambio de Ángulo o Variante Biomecánica',
      subtitulo: 'Estimula el músculo desde un perfil de fuerza diferente',
      descripcion: 'Si te has estancado en press plano con barra, cambia temporalmente a press inclinado con mancuernas o press en máquina convergente durante 4 semanas para reactivar adaptaciones neuronales.'
    }
  ];

  seleccionarFiltroGrupo(grupo: string): void {
    this.filtroGrupoMuscular.set(grupo);
    const primerEj = this.ejerciciosFiltradosProgreso()[0];
    if (primerEj) {
      this.ejercicioProgresoSeleccionado.set(primerEj.nombre);
    }
  }

  seleccionarEjercicioProgreso(nombre: string): void {
    this.ejercicioProgresoSeleccionado.set(nombre);
  }

  // Promedio de entrenamiento por semana
  frecuenciaSemanal = computed(() => {
    const entrenamientos = this.entrenamientos();
    if (entrenamientos.length < 2) return entrenamientos.length;
    const fechas = entrenamientos.map(e => e.fecha ? new Date(e.fecha).getTime() : 0).filter(t => t > 0);
    if (fechas.length < 2) return entrenamientos.length;
    const min = Math.min(...fechas);
    const max = Math.max(...fechas);
    const semanas = Math.max(1, (max - min) / (7 * 24 * 60 * 60 * 1000));
    return +(entrenamientos.length / semanas).toFixed(1);
  });

  // Formulario Perfil básico
  perfilForm = this.fb.group({
    nombre: [this.authService.usuario()?.nombre || '', Validators.required],
    email: [{ value: this.authService.usuario()?.email || '', disabled: true }],
    genero: [this.authService.usuario()?.genero || 'HOMBRE']
  });

  seleccionarGeneroPerfil(gen: 'HOMBRE' | 'MUJER'): void {
    this.perfilForm.patchValue({ genero: gen });
    this.actualizarDatosSilencioso(gen);
  }

  cambiarIdiomaPerfil(codigo: IdiomaCode): void {
    this.acc.setIdioma(codigo);
  }

  cambiarTemaPerfil(tema: TemaMode): void {
    this.acc.setTema(tema);
  }

  cambiarColorAcento(colorId: string): void {
    this.acc.setColorAcento(colorId);
  }

  cambiarTamanoPerfil(tamano: TamanoFuente): void {
    this.acc.setTamanoFuente(tamano);
  }

  // Formulario Cambio Contraseña
  passwordForm = this.fb.group({
    passwordActual: ['', Validators.required],
    nuevaPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Formulario Registro de Peso y Foto
  progresoForm = this.fb.group({
    pesoKg: ['', [Validators.required, Validators.min(20), Validators.max(300)]],
    objetivoFase: ['MANTENIMIENTO', Validators.required],
    imagenUrl: ['']
  });

  ngOnInit(): void {
    const tabParam = this.route.snapshot.queryParamMap.get('tab');
    this.procesarQueryParam(tabParam);

    this.route.queryParams.subscribe(params => {
      this.procesarQueryParam(params['tab']);
    });

    if (this.authService.estaAutenticado()) {
      this.cargarFotos();
      this.cargarEntrenamientos();
      this.cargarRutinas();
      this.cargarUltimaMedida();
    }
  }

  private procesarQueryParam(tab: string | null): void {
    if (!tab) return;
    if (tab === 'PERFIL' || tab === 'DATOS') {
      this.pestanaActiva.set('DASHBOARD');
      this.ajustesModal.abrir('DATOS');
    } else if (tab === 'PREFERENCIAS' || tab === 'AJUSTES') {
      this.pestanaActiva.set('DASHBOARD');
      this.ajustesModal.abrir('PRINCIPAL');
    } else if (tab === 'PROGRESO' || tab === 'HISTORIAL' || tab === 'DASHBOARD') {
      this.pestanaActiva.set(tab);
    }
  }

  cargarFotos(): void {
    this.progresoApi.listarMisFotos().subscribe({
      next: (data) => this.fotos.set(data),
      error: (err) => console.error('Error al cargar fotos de progreso', err)
    });
  }

  cargarEntrenamientos(): void {
    this.progresoApi.listarMisEntrenamientos().subscribe({
      next: (data) => this.entrenamientos.set(data),
      error: (err) => console.error('Error al cargar historial de entrenamientos', err)
    });
  }

  cargarUltimaMedida(): void {
    this.medidaApi.obtenerUltimaMedida().subscribe({
      next: (data) => {
        this.ultimaMedida.set(data);
        if (data?.objetivoFase) {
          this.progresoForm.patchValue({ objetivoFase: data.objetivoFase });
        }
      },
      error: (err) => console.error('Error al cargar metas', err)
    });
  }

  cambiarPestana(pestana: 'DASHBOARD' | 'PROGRESO' | 'HISTORIAL'): void {
    this.pestanaActiva.set(pestana);
    this.mensaje.set('');
    this.mensajeError.set('');
  }

  cargarRutinas(): void {
    this.rutinaService.listarMisRutinas().subscribe({
      next: (data) => this.rutinas.set(data),
      error: () => {}
    });
  }

  actualizarDatos(): void {
    if (this.perfilForm.invalid) return;
    const nombre = this.perfilForm.value.nombre || '';
    const genero = (this.perfilForm.value.genero as 'HOMBRE' | 'MUJER') || 'HOMBRE';

    this.authService.actualizarPerfil(nombre, genero).subscribe({
      next: () => {
        this.mensaje.set('¡Perfil actualizado con éxito! Tus imágenes y guías se han adaptado.');
        setTimeout(() => this.mensaje.set(''), 4000);
      },
      error: (err) => {
        this.mensajeError.set('Error al actualizar el perfil.');
        console.error(err);
      }
    });
  }

  private actualizarDatosSilencioso(genero: 'HOMBRE' | 'MUJER'): void {
    const nombre = this.perfilForm.value.nombre || this.authService.usuario()?.nombre || '';
    this.authService.actualizarPerfil(nombre, genero).subscribe({
      next: () => {
        this.mensaje.set('Preferencia de género actualizada.');
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: () => {}
    });
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid) return;
    this.mensaje.set('Contraseña modificada correctamente.');
    this.passwordForm.reset();
    setTimeout(() => this.mensaje.set(''), 3000);
  }

  abrirAjustes(sub: any = 'PRINCIPAL'): void {
    this.ajustesModal.abrir(sub);
  }

  subirFotoProgreso(): void {
    if (this.progresoForm.invalid) return;

    this.procesandoFoto.set(true);
    const peso = parseFloat(this.progresoForm.value.pesoKg || '0');
    const objetivo = this.progresoForm.value.objetivoFase as any;
    const imagenMock = this.progresoForm.value.imagenUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80';

    // Guardar también en el backend de Medidas
    this.medidaApi.registrarMedida({ pesoKg: peso, objetivoFase: objetivo }).subscribe({
      next: (data) => this.ultimaMedida.set(data),
      error: (err) => console.error(err)
    });

    this.progresoApi.registrarFoto(imagenMock, peso).subscribe({
      next: (fotoNueva) => {
        this.procesandoFoto.set(false);
        this.fotos.update(lista => [fotoNueva, ...lista]);
        this.progresoForm.reset();
        this.mensaje.set('Registro de peso y foto subidos con éxito.');
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: (err) => {
        this.procesandoFoto.set(false);
        this.mensajeError.set('Error al guardar el progreso.');
        console.error(err);
      }
    });
  }
}
