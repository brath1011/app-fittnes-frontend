import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/api.models';

const AUTH_STORAGE_KEY = 'fitness_auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly session = signal<AuthResponse | null>(this.readStoredSession());

  readonly usuario = computed(() => this.session());
  readonly estaAutenticado = computed(() => Boolean(this.session()?.token));
  readonly esAdmin = computed(() => this.session()?.rol === 'ADMIN');
  readonly generoActivo = computed<'HOMBRE' | 'MUJER'>(() => {
    const userGen = this.session()?.genero;
    if (userGen) return userGen;
    const guestGen = localStorage.getItem('fitness_guest_genero') as 'HOMBRE' | 'MUJER';
    return guestGen === 'MUJER' ? 'MUJER' : 'HOMBRE';
  });
  
  // Módulo de simulación de plan para pruebas y expiración temporal
  readonly plan = signal<'GRATIS' | 'PRO'>(this.obtenerPlanActual());
  readonly esPremium = computed(() => this.plan() === 'PRO');
  readonly premiumExpiresAt = signal<string | null>(localStorage.getItem('fitness_premium_expires_at'));

  private obtenerPlanActual(): 'GRATIS' | 'PRO' {
    const expiresAt = localStorage.getItem('fitness_premium_expires_at');
    if (expiresAt) {
      const expDate = new Date(expiresAt);
      if (expDate > new Date()) {
        return 'PRO';
      } else {
        localStorage.removeItem('fitness_premium_expires_at');
        localStorage.setItem('fitness_plan', 'GRATIS');
        return 'GRATIS';
      }
    }
    return (localStorage.getItem('fitness_plan') as any) || 'GRATIS';
  }

  cambiarPlan(nuevoPlan: 'GRATIS' | 'PRO'): void {
    this.plan.set(nuevoPlan);
    localStorage.setItem('fitness_plan', nuevoPlan);
    if (nuevoPlan === 'GRATIS') {
      localStorage.removeItem('fitness_premium_expires_at');
      this.premiumExpiresAt.set(null);
    }
  }

  activarPremiumTemporal(dias: number): void {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + dias);
    const expStr = expDate.toISOString();
    localStorage.setItem('fitness_premium_expires_at', expStr);
    this.premiumExpiresAt.set(expStr);
    this.cambiarPlan('PRO');
  }

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap((response) => this.saveSession(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/registro`, request).pipe(
      tap((response) => this.saveSession(response))
    );
  }

  actualizarPerfil(nombre: string, genero: 'HOMBRE' | 'MUJER'): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/usuarios/perfil`, { nombre, genero }).pipe(
      tap((updated) => {
        const actual = this.session();
        if (actual) {
          const nuevaSesion: AuthResponse = {
            ...actual,
            nombre: updated.nombre || actual.nombre,
            genero: (updated.genero as any) || actual.genero
          };
          this.saveSession(nuevaSesion);
        }
      })
    );
  }

  cambiarGeneroDirecto(genero: 'HOMBRE' | 'MUJER'): void {
    const actual = this.session();
    if (actual) {
      const nuevaSesion: AuthResponse = { ...actual, genero };
      this.saveSession(nuevaSesion);
      this.actualizarPerfil(actual.nombre, genero).subscribe({
        error: (e) => console.warn('Error sincronizando género con el backend', e)
      });
    } else {
      localStorage.setItem('fitness_guest_genero', genero);
      // Forzar recomputación emitiendo cambio
      this.session.set(this.readStoredSession());
    }
  }

  logout(): void {
    this.session.set(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('fitness_cuestionario');
  }

  getToken(): string | null {
    return this.session()?.token ?? null;
  }

  private saveSession(response: AuthResponse): void {
    this.session.set(response);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
  }

  private readStoredSession(): AuthResponse | null {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as AuthResponse;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  }
}
