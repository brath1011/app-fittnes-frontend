import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Rutina } from '../models/api.models';

export interface RutinaRequest {
  nombre: string;
  descripcion?: string;
  nivelDificultad: string;
  diasSemana?: string;
  ejercicios: {
    ejercicioId: number;
    dia?: string;
    series: number;
    repeticiones: number;
    repeticionesMax?: number;
    esUnilateral: boolean;
    descansoLadoSegundos: number;
    descansoSeriesSegundos: number;
    pesoKg?: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class RutinaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/rutinas`;

  listarMisRutinas(): Observable<Rutina[]> {
    return this.http.get<Rutina[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<Rutina> {
    return this.http.get<Rutina>(`${this.baseUrl}/${id}`);
  }

  crear(rutina: RutinaRequest): Observable<Rutina> {
    return this.http.post<Rutina>(this.baseUrl, rutina);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  actualizar(id: number, rutina: RutinaRequest): Observable<Rutina> {
    return this.http.put<Rutina>(`${this.baseUrl}/${id}`, rutina);
  }
}
