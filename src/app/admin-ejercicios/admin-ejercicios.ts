import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EjercicioService } from '../services/ejercicio.service';
import { SubcategoriaImagenService } from '../services/subcategoria-imagen.service';
import { Ejercicio, Genero } from '../models/api.models';

@Component({
  selector: 'app-admin-ejercicios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-ejercicios.html',
  styleUrl: './admin-ejercicios.scss'
})
export class AdminEjerciciosComponent implements OnInit {
  private readonly ejercicioService = inject(EjercicioService);
  public readonly subcatImgService = inject(SubcategoriaImagenService);
  private readonly fb = inject(FormBuilder);

  ejercicios = signal<Ejercicio[]>([]);
  mostrarFormulario = signal(false);
  mensaje = signal('');
  mensajeError = signal('');

  // Control de Vista Principal (Ejercicios vs Portadas de Subcategorías)
  vistaPrincipal = signal<'EJERCICIOS' | 'PORTADAS_SUBCATEGORIAS'>('EJERCICIOS');

  // Estado del Gestor de Imágenes Referenciales de Subcategorías (Músculos)
  mostrarModalSubcatImagenes = signal(false);
  grupoSubcatModal = signal('PECHO');
  filtroGeneroPortadas = signal<'TODOS' | 'HOMBRE' | 'MUJER'>('TODOS');

  subcategoriasPorGrupoAdmin: { [key: string]: string[] } = {
    'PECHO': ['PECTORAL ALTO', 'PECTORAL MEDIO', 'PECTORAL BAJO', 'PECTORAL COMPLETO'],
    'ESPALDA': ['AMPLITUD', 'DENSIDAD', 'LUMBAR'],
    'PIERNAS': ['CUADRICEPS', 'FEMORAL', 'GLUTEOS', 'PANTORRILLAS', 'TIBIAL'],
    'HOMBROS': ['FRONTAL', 'LATERAL', 'POSTERIOR'],
    'BRAZOS': ['BICEPS', 'TRICEPS', 'ANTEBRAZO'],
    'ABDOMEN': ['ABDOMINALES', 'CORE'],
    'CARDIO': ['CARDIO', 'HIIT', 'LISS']
  };

  contarEjerciciosSubcat(subcat: string): number {
    return this.ejercicios().filter(e => e.subcategoria?.toUpperCase() === subcat.toUpperCase() || (e.grupoMuscular?.toUpperCase() === subcat.toUpperCase() && !e.subcategoria)).length;
  }

  // Filtros de Búsqueda y Grupo Muscular
  filtroBusqueda = signal('');
  filtroGrupoMuscular = signal('TODOS');

  ejerciciosFiltrados = computed(() => {
    const q = this.filtroBusqueda().toLowerCase().trim();
    const g = this.filtroGrupoMuscular();
    return this.ejercicios().filter(ej => {
      const coincideGrupo = g === 'TODOS' || ej.grupoMuscular?.toUpperCase() === g.toUpperCase();
      const coincideTexto = !q || ej.nombre.toLowerCase().includes(q) || (ej.descripcion && ej.descripcion.toLowerCase().includes(q));
      return coincideGrupo && coincideTexto;
    });
  });

  gruposMusculares = ['PECHO', 'ESPALDA', 'PIERNAS', 'HOMBROS', 'BRAZOS', 'ABDOMEN', 'CARDIO'];

  ejercicioForm = this.fb.group({
    nombre: ['', Validators.required],
    grupoMuscular: ['PECHO', Validators.required],
    descripcion: [''],
    imagenUrl: [''],
    videoUrl: ['']
  });

  ngOnInit(): void {
    this.cargarEjercicios();
  }

  cargarEjercicios(): void {
    this.ejercicioService.listarTodos().subscribe({
      next: (data) => this.ejercicios.set(data),
      error: (err) => console.error('Error al cargar ejercicios', err)
    });
  }

  abrirCrear(): void {
    this.mostrarFormulario.set(true);
    this.ejercicioForm.reset({
      nombre: '',
      grupoMuscular: 'PECHO',
      descripcion: '',
      imagenUrl: '',
      videoUrl: ''
    });
    this.mensaje.set('');
    this.mensajeError.set('');
  }

  cerrarCrear(): void {
    this.mostrarFormulario.set(false);
  }

  onCrearImagenSeleccionada(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.ejercicioForm.patchValue({ imagenUrl: e.target.result });
    };
    reader.readAsDataURL(file);
  }

  onCrearVideoSeleccionado(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.ejercicioForm.patchValue({ videoUrl: e.target.result });
    };
    reader.readAsDataURL(file);
  }

  guardarEjercicio(): void {
    if (this.ejercicioForm.invalid) return;

    const val = this.ejercicioForm.value;
    const req: Ejercicio = {
      nombre: val.nombre!,
      grupoMuscular: val.grupoMuscular!,
      descripcion: val.descripcion || '',
      imagenUrl: val.imagenUrl || '',
      videoUrl: val.videoUrl || ''
    };

    this.ejercicioService.crear(req).subscribe({
      next: (data) => {
        this.ejercicios.update(lista => [...lista, data]);
        this.mostrarFormulario.set(false);
        this.mensaje.set('Ejercicio creado con éxito.');
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: (err) => {
        this.mensajeError.set('Error al guardar el ejercicio. Es posible que el nombre ya exista.');
        console.error(err);
      }
    });
  }

  // --- GESTOR MULTIMEDIA ADMIN (HOMBRE / MUJER) ---
  mostrarModalMedia = signal(false);
  ejercicioSeleccionado = signal<Ejercicio | null>(null);
  adminGeneroMedia = signal<Genero>('HOMBRE');

  // Buffer Hombre
  adminHombreFoto1 = signal('');
  adminHombreFoto2 = signal('');
  adminHombreFoto3 = signal('');
  adminHombreFoto4 = signal('');
  adminHombreFoto5 = signal('');
  adminHombreFoto6 = signal('');
  adminHombreVideo = signal('');

  // Buffer Mujer
  adminMujerFoto1 = signal('');
  adminMujerFoto2 = signal('');
  adminMujerFoto3 = signal('');
  adminMujerFoto4 = signal('');
  adminMujerFoto5 = signal('');
  adminMujerFoto6 = signal('');
  adminMujerVideo = signal('');

  guardandoMedia = signal(false);

  abrirGestorMedia(ej: Ejercicio, genero: Genero = 'HOMBRE'): void {
    this.ejercicioSeleccionado.set(ej);
    this.adminGeneroMedia.set(genero);

    // Cargar datos Hombre (con fallback a campos base si no tiene aún hombre)
    this.adminHombreFoto1.set(ej.foto1UrlHombre || ej.foto1Url || ej.imagenUrl || '');
    this.adminHombreFoto2.set(ej.foto2UrlHombre || ej.foto2Url || '');
    this.adminHombreFoto3.set(ej.foto3UrlHombre || ej.foto3Url || '');
    this.adminHombreFoto4.set(ej.foto4UrlHombre || ej.foto4Url || '');
    this.adminHombreFoto5.set(ej.foto5UrlHombre || ej.foto5Url || '');
    this.adminHombreFoto6.set(ej.foto6UrlHombre || ej.foto6Url || '');
    this.adminHombreVideo.set(ej.videoUrlHombre || ej.videoUrl || '');

    // Cargar datos Mujer
    this.adminMujerFoto1.set(ej.foto1UrlMujer || ej.foto1Url || ej.imagenUrl || '');
    this.adminMujerFoto2.set(ej.foto2UrlMujer || ej.foto2Url || '');
    this.adminMujerFoto3.set(ej.foto3UrlMujer || ej.foto3Url || '');
    this.adminMujerFoto4.set(ej.foto4UrlMujer || ej.foto4Url || '');
    this.adminMujerFoto5.set(ej.foto5UrlMujer || ej.foto5Url || '');
    this.adminMujerFoto6.set(ej.foto6UrlMujer || ej.foto6Url || '');
    this.adminMujerVideo.set(ej.videoUrlMujer || ej.videoUrl || '');

    this.mostrarModalMedia.set(true);
  }

  cambiarGeneroMedia(genero: Genero): void {
    this.adminGeneroMedia.set(genero);
  }

  cerrarGestorMedia(): void {
    this.mostrarModalMedia.set(false);
    this.ejercicioSeleccionado.set(null);
  }

  onArchivoSeleccionado(event: any, slot: string): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const dataUrl = e.target.result;
      const gen = this.adminGeneroMedia();

      if (gen === 'MUJER') {
        if (slot === 'foto1') this.adminMujerFoto1.set(dataUrl);
        if (slot === 'foto2') this.adminMujerFoto2.set(dataUrl);
        if (slot === 'foto3') this.adminMujerFoto3.set(dataUrl);
        if (slot === 'foto4') this.adminMujerFoto4.set(dataUrl);
        if (slot === 'foto5') this.adminMujerFoto5.set(dataUrl);
        if (slot === 'foto6') this.adminMujerFoto6.set(dataUrl);
        if (slot === 'video') this.adminMujerVideo.set(dataUrl);
      } else {
        if (slot === 'foto1') this.adminHombreFoto1.set(dataUrl);
        if (slot === 'foto2') this.adminHombreFoto2.set(dataUrl);
        if (slot === 'foto3') this.adminHombreFoto3.set(dataUrl);
        if (slot === 'foto4') this.adminHombreFoto4.set(dataUrl);
        if (slot === 'foto5') this.adminHombreFoto5.set(dataUrl);
        if (slot === 'foto6') this.adminHombreFoto6.set(dataUrl);
        if (slot === 'video') this.adminHombreVideo.set(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }

  guardarMedia(): void {
    const ej = this.ejercicioSeleccionado();
    if (!ej || !ej.id) return;

    this.guardandoMedia.set(true);
    const payload: Partial<Ejercicio> = {
      // General Fallback
      imagenUrl: this.adminHombreFoto1() || ej.imagenUrl,
      foto1Url: this.adminHombreFoto1(),
      foto2Url: this.adminHombreFoto2(),
      foto3Url: this.adminHombreFoto3(),
      foto4Url: this.adminHombreFoto4(),
      foto5Url: this.adminHombreFoto5(),
      foto6Url: this.adminHombreFoto6(),
      videoUrl: this.adminHombreVideo(),

      // Hombre
      imagenUrlHombre: this.adminHombreFoto1(),
      foto1UrlHombre: this.adminHombreFoto1(),
      foto2UrlHombre: this.adminHombreFoto2(),
      foto3UrlHombre: this.adminHombreFoto3(),
      foto4UrlHombre: this.adminHombreFoto4(),
      foto5UrlHombre: this.adminHombreFoto5(),
      foto6UrlHombre: this.adminHombreFoto6(),
      videoUrlHombre: this.adminHombreVideo(),

      // Mujer
      imagenUrlMujer: this.adminMujerFoto1(),
      foto1UrlMujer: this.adminMujerFoto1(),
      foto2UrlMujer: this.adminMujerFoto2(),
      foto3UrlMujer: this.adminMujerFoto3(),
      foto4UrlMujer: this.adminMujerFoto4(),
      foto5UrlMujer: this.adminMujerFoto5(),
      foto6UrlMujer: this.adminMujerFoto6(),
      videoUrlMujer: this.adminMujerVideo()
    };

    this.ejercicioService.actualizarMultimedia(ej.id, payload).subscribe({
      next: (actualizado) => {
        this.guardandoMedia.set(false);
        this.mensaje.set(`¡Guía multimedia de "${actualizado.nombre}" guardada con éxito (Hombre y Mujer)!`);
        this.cargarEjercicios();
        this.cerrarGestorMedia();
        setTimeout(() => this.mensaje.set(''), 3500);
      },
      error: (err) => {
        this.guardandoMedia.set(false);
        this.mensajeError.set('Error al guardar la multimedia del ejercicio.');
        console.error(err);
      }
    });
  }

  // --- MÉTODOS GESTOR DE PORTADAS DE SUBCATEGORÍAS (HOMBRE Y MUJER) ---
  abrirModalSubcatImagenes(): void {
    this.mostrarModalSubcatImagenes.set(true);
  }

  cerrarModalSubcatImagenes(): void {
    this.mostrarModalSubcatImagenes.set(false);
  }

  onSubcatImagenSeleccionada(subcat: string, genero: Genero, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.editorTargetId.set(subcat);
          this.editorTargetType.set('SUBCATEGORIA');
          this.editorTargetGenero.set(genero);
          this.editorImagenOriginal.set(result);
          this.editorZoom.set(1);
          this.editorOffsetX.set(0);
          this.editorOffsetY.set(0);
          this.mostrarEditorRecorte.set(true);

          setTimeout(() => this.inicializarEditorCanvas(), 100);
        }
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  confirmarEliminarSubcat(subcat: string, genero: Genero): void {
    const etiqueta = genero === 'MUJER' ? 'Femenina 👩' : 'Masculina 👨';
    const seguro = window.confirm(`¿Estás seguro de que deseas eliminar la foto de portada ${etiqueta} para "${subcat}"?`);
    if (seguro) {
      this.subcatImgService.eliminarImagen(subcat, genero);
      this.mensaje.set(`🗑️ Foto de portada (${genero}) para "${subcat}" eliminada.`);
      setTimeout(() => this.mensaje.set(''), 4000);
    }
  }

  // --- EDITOR DE RECORTE DE IMAGEN ---
  mostrarEditorRecorte = signal(false);
  editorImagenOriginal = signal('');
  
  editorTargetId = signal<string | number | null>(null);
  editorTargetType = signal<'SUBCATEGORIA' | 'EJERCICIO' | null>(null);
  editorTargetGenero = signal<Genero>('HOMBRE');
  
  editorZoom = signal(1);
  editorOffsetX = signal(0);
  editorOffsetY = signal(0);
  editorCropSize = signal(280);
  private editorCanvas: HTMLCanvasElement | null = null;
  private editorImg: HTMLImageElement | null = null;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragOffsetStartX = 0;
  private dragOffsetStartY = 0;

  inicializarEditorCanvas(): void {
    this.editorCanvas = document.getElementById('cropperCanvas') as HTMLCanvasElement;
    if (!this.editorCanvas) return;

    this.editorImg = new Image();
    this.editorImg.onload = () => this.dibujarEditorCanvas();
    this.editorImg.src = this.editorImagenOriginal();

    // Eventos de arrastre
    this.editorCanvas.addEventListener('mousedown', (e) => this.onEditorMouseDown(e));
    this.editorCanvas.addEventListener('mousemove', (e) => this.onEditorMouseMove(e));
    this.editorCanvas.addEventListener('mouseup', () => this.onEditorMouseUp());
    this.editorCanvas.addEventListener('mouseleave', () => this.onEditorMouseUp());

    // Eventos táctiles
    this.editorCanvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.onEditorMouseDown({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
    });
    this.editorCanvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.onEditorMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
    });
    this.editorCanvas.addEventListener('touchend', () => this.onEditorMouseUp());
  }

  dibujarEditorCanvas(): void {
    if (!this.editorCanvas || !this.editorImg) return;
    const ctx = this.editorCanvas.getContext('2d');
    if (!ctx) return;

    const cw = this.editorCanvas.width;
    const ch = this.editorCanvas.height;
    const zoom = this.editorZoom();
    const ox = this.editorOffsetX();
    const oy = this.editorOffsetY();
    const cropSize = this.editorCropSize();

    // Fondo oscuro
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, cw, ch);

    // Dibujar imagen con zoom y offset
    const imgW = this.editorImg.naturalWidth * zoom;
    const imgH = this.editorImg.naturalHeight * zoom;
    const drawX = (cw - imgW) / 2 + ox;
    const drawY = (ch - imgH) / 2 + oy;
    ctx.drawImage(this.editorImg, drawX, drawY, imgW, imgH);

    // Overlay semi-transparente oscuro
    const cropX = (cw - cropSize) / 2;
    const cropY = (ch - cropSize) / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, cw, cropY);
    ctx.fillRect(0, cropY + cropSize, cw, ch - (cropY + cropSize));
    ctx.fillRect(0, cropY, cropX, cropSize);
    ctx.fillRect(cropX + cropSize, cropY, cw - (cropX + cropSize), cropSize);

    // Borde blanco punteado
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(cropX, cropY, cropSize, cropSize);
    ctx.setLineDash([]);

    // Cuadrícula interior (3x3)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    const third = cropSize / 3;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cropX + third * i, cropY);
      ctx.lineTo(cropX + third * i, cropY + cropSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cropX, cropY + third * i);
      ctx.lineTo(cropX + cropSize, cropY + third * i);
      ctx.stroke();
    }

    // Esquinas destacadas
    const isMujer = this.editorTargetGenero() === 'MUJER';
    const cornerLen = 20;
    ctx.strokeStyle = isMujer ? '#ec4899' : '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cropX, cropY + cornerLen); ctx.lineTo(cropX, cropY); ctx.lineTo(cropX + cornerLen, cropY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cropX + cropSize - cornerLen, cropY); ctx.lineTo(cropX + cropSize, cropY); ctx.lineTo(cropX + cropSize, cropY + cornerLen); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cropX, cropY + cropSize - cornerLen); ctx.lineTo(cropX, cropY + cropSize); ctx.lineTo(cropX + cornerLen, cropY + cropSize); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cropX + cropSize - cornerLen, cropY + cropSize); ctx.lineTo(cropX + cropSize, cropY + cropSize); ctx.lineTo(cropX + cropSize, cropY + cropSize - cornerLen); ctx.stroke();

    // Indicador de dimensiones
    ctx.fillStyle = isMujer ? '#f472b6' : '#38bdf8';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${cropSize} × ${cropSize} px (${this.editorTargetGenero()})`, cw / 2, cropY + cropSize + 18);
  }

  onEditorMouseDown(e: MouseEvent): void {
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragOffsetStartX = this.editorOffsetX();
    this.dragOffsetStartY = this.editorOffsetY();
    if (this.editorCanvas) this.editorCanvas.style.cursor = 'grabbing';
  }

  onEditorMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;
    this.editorOffsetX.set(this.dragOffsetStartX + dx);
    this.editorOffsetY.set(this.dragOffsetStartY + dy);
    this.dibujarEditorCanvas();
  }

  onEditorMouseUp(): void {
    this.isDragging = false;
    if (this.editorCanvas) this.editorCanvas.style.cursor = 'grab';
  }

  onEditorZoomChange(value: number): void {
    this.editorZoom.set(value);
    this.dibujarEditorCanvas();
  }

  aplicarRecorte(): void {
    if (!this.editorCanvas || !this.editorImg) return;

    const cw = this.editorCanvas.width;
    const ch = this.editorCanvas.height;
    const cropSize = this.editorCropSize();
    const cropX = (cw - cropSize) / 2;
    const cropY = (ch - cropSize) / 2;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropSize;
    tempCanvas.height = cropSize;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;

    const zoom = this.editorZoom();
    const ox = this.editorOffsetX();
    const oy = this.editorOffsetY();
    const imgW = this.editorImg.naturalWidth * zoom;
    const imgH = this.editorImg.naturalHeight * zoom;
    const drawX = (cw - imgW) / 2 + ox - cropX;
    const drawY = (ch - imgH) / 2 + oy - cropY;

    tCtx.fillStyle = '#0f172a';
    tCtx.fillRect(0, 0, cropSize, cropSize);
    tCtx.drawImage(this.editorImg, drawX, drawY, imgW, imgH);

    const croppedDataUrl = tempCanvas.toDataURL('image/jpeg', 0.82);
    const targetId = this.editorTargetId();
    const targetType = this.editorTargetType();
    const genero = this.editorTargetGenero();

    if (targetType === 'SUBCATEGORIA' && typeof targetId === 'string') {
      this.subcatImgService.guardarImagen(targetId, croppedDataUrl, genero);
      this.mensaje.set(`✅ Imagen recortada (${genero}) para portada de "${targetId}" guardada.`);
      setTimeout(() => this.mensaje.set(''), 4000);
    } else if (targetType === 'EJERCICIO' && typeof targetId === 'number') {
      const payload: any = genero === 'MUJER' 
        ? { imagenUrlMujer: croppedDataUrl, foto1UrlMujer: croppedDataUrl }
        : { imagenUrlHombre: croppedDataUrl, foto1UrlHombre: croppedDataUrl, imagenUrl: croppedDataUrl };

      this.ejercicioService.actualizarMultimedia(targetId, payload).subscribe({
        next: () => {
          this.mensaje.set(`✅ Imagen recortada (${genero}) guardada correctamente.`);
          this.cargarEjercicios();
          setTimeout(() => this.mensaje.set(''), 4000);
        },
        error: (err) => {
          this.mensajeError.set('Error al guardar la imagen recortada.');
          console.error(err);
        }
      });
    }

    this.cerrarEditorRecorte();
  }

  cerrarEditorRecorte(): void {
    this.mostrarEditorRecorte.set(false);
    this.editorImagenOriginal.set('');
    this.editorTargetId.set(null);
    this.editorTargetType.set(null);
    this.editorCanvas = null;
    this.editorImg = null;
  }
}
