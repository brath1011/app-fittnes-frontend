import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EjercicioService } from '../services/ejercicio.service';
import { Ejercicio } from '../models/api.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  private readonly ejercicioService = inject(EjercicioService);

  ejercicios = signal<Ejercicio[]>([]);
  cargando = signal(true);

  gruposMusculares = ['PECHO', 'ESPALDA', 'PIERNAS', 'HOMBROS', 'BRAZOS', 'ABDOMEN', 'CARDIO'];

  grupoIconos: { [key: string]: string } = {
    'PECHO': '🫁',
    'ESPALDA': '🔙',
    'PIERNAS': '🦵',
    'HOMBROS': '💪',
    'BRAZOS': '💪',
    'ABDOMEN': '🍫',
    'CARDIO': '❤️'
  };

  // KPIs calculados
  totalEjercicios = computed(() => this.ejercicios().length);

  ejerciciosConEfectividad = computed(() =>
    this.ejercicios().filter(e => e.efectividadPorcentaje !== null && e.efectividadPorcentaje !== undefined).length
  );

  ejerciciosCompuestos = computed(() =>
    this.ejercicios().filter(e => e.tipo === 'COMPUESTO').length
  );

  ejerciciosAislamiento = computed(() =>
    this.ejercicios().filter(e => e.tipo === 'AISLAMIENTO').length
  );

  // Distribución por grupo muscular
  distribucionPorGrupo = computed(() => {
    const dist: { grupo: string; cantidad: number; porcentaje: number }[] = [];
    const total = this.ejerciciosConEfectividad();
    this.gruposMusculares.forEach(grupo => {
      const cantidad = this.ejercicios().filter(e =>
        e.grupoMuscular?.toUpperCase() === grupo &&
        e.efectividadPorcentaje !== null && e.efectividadPorcentaje !== undefined
      ).length;
      dist.push({
        grupo,
        cantidad,
        porcentaje: total > 0 ? Math.round((cantidad / total) * 100) : 0
      });
    });
    return dist.sort((a, b) => b.cantidad - a.cantidad);
  });

  // Cobertura multimedia
  ejerciciosConFoto = computed(() =>
    this.ejercicios().filter(e => this.tieneFoto(e)).length
  );

  ejerciciosConVideo = computed(() =>
    this.ejercicios().filter(e => this.tieneVideo(e)).length
  );

  porcentajeCobertura = computed(() => {
    const total = this.ejerciciosConEfectividad();
    if (total === 0) return 0;
    return Math.round((this.ejerciciosConFoto() / total) * 100);
  });

  // Ejercicios sin multimedia (para que el admin los complete)
  ejerciciosSinMultimedia = computed(() =>
    this.ejercicios()
      .filter(e =>
        e.efectividadPorcentaje !== null &&
        e.efectividadPorcentaje !== undefined &&
        !this.tieneFoto(e)
      )
      .slice(0, 15)
  );

  // Subcategorías únicas
  subcategoriasUnicas = computed(() => {
    const set = new Set<string>();
    this.ejercicios().forEach(e => {
      if (e.subcategoria) set.add(e.subcategoria.toUpperCase());
    });
    return set.size;
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.ejercicioService.listarTodos().subscribe({
      next: (data) => {
        this.ejercicios.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard', err);
        this.cargando.set(false);
      }
    });
  }

  private esUrlValida(url: string | null | undefined): boolean {
    if (!url || typeof url !== 'string') return false;
    const u = url.trim();
    if (u.length < 5) return false;
    if (/^\d+$/.test(u)) return false;
    return u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:image/') || u.startsWith('/') || u.startsWith('assets/');
  }

  tieneFoto(e: Ejercicio): boolean {
    return this.esUrlValida(e.foto1Url) || this.esUrlValida(e.imagenUrl) ||
           this.esUrlValida(e.foto1UrlHombre) || this.esUrlValida(e.imagenUrlHombre) ||
           this.esUrlValida(e.foto1UrlMujer) || this.esUrlValida(e.imagenUrlMujer);
  }

  tieneVideo(e: Ejercicio): boolean {
    return this.esUrlValida(e.videoUrl) || this.esUrlValida(e.videoUrlHombre) || this.esUrlValida(e.videoUrlMujer);
  }
}
