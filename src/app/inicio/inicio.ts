import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProgresoService } from '../services/progreso.service';
import { RutinaService } from '../services/rutina.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss'
})
export class InicioComponent implements OnInit, OnDestroy {
  banners = [
    { 
      id: 1,
      titulo: 'Domina Tu Rutina Diaria',
      subtitulo: 'Crea planes de entrenamiento a tu medida, configura descansos por series y optimiza tus ejercicios unilaterales.',
      link: '/rutinas',
      textoBoton: 'Ver Mis Rutinas'
    },
    { 
      id: 2,
      titulo: 'Entrena Como Un Profesional',
      subtitulo: 'Lleva el registro exacto de cada serie, repetición y tiempo de descanso con nuestro temporizador integrado.',
      link: '/ejercicios',
      textoBoton: 'Explorar Ejercicios'
    },
    { 
      id: 3,
      titulo: 'Obtén Tu Acceso Premium',
      subtitulo: 'Desbloquea estadísticas avanzadas, histórico de fotos de progreso y recibe boletas en tu correo de forma instantánea.',
      link: '/pagos',
      textoBoton: 'Hacerse Premium'
    }
  ];

  slideActual = signal(0);
  private intervalo: any;

  readonly auth = inject(AuthService);
  private readonly progresoApi = inject(ProgresoService);
  private readonly rutinaApi = inject(RutinaService);

  totalEntrenamientos = signal(0);
  caloriasTotales = signal(0);
  totalRutinas = signal(0);

  ngOnInit() {
    this.iniciarSlider();
    if (this.auth.estaAutenticado()) {
      this.cargarStats();
    }
  }

  ngOnDestroy() {
    this.detenerSlider();
  }

  iniciarSlider() {
    this.intervalo = setInterval(() => {
      this.siguiente();
    }, 6000);
  }

  detenerSlider() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  siguiente() {
    this.slideActual.set((this.slideActual() + 1) % this.banners.length);
  }

  anterior() {
    this.slideActual.set((this.slideActual() - 1 + this.banners.length) % this.banners.length);
  }

  irA(index: number) {
    this.slideActual.set(index);
    this.detenerSlider();
    this.iniciarSlider();
  }

  cargarStats() {
    this.progresoApi.listarMisEntrenamientos().subscribe({
      next: (data) => {
        this.totalEntrenamientos.set(data.length);
        this.caloriasTotales.set(data.reduce((acc, curr) => acc + curr.caloriasQuemadas, 0));
      }
    });

    this.rutinaApi.listarMisRutinas().subscribe({
      next: (data) => {
        this.totalRutinas.set(data.length);
      }
    });
  }
}
