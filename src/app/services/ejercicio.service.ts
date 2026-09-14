import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ejercicio } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class EjercicioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ejercicios`;

  listarTodos(): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(this.baseUrl);
  }

  listarPorGrupo(grupo: string): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(`${this.baseUrl}/grupo/${grupo}`);
  }

  crear(ejercicio: Ejercicio): Observable<Ejercicio> {
    return this.http.post<Ejercicio>(this.baseUrl, ejercicio);
  }

  actualizarMultimedia(id: number, datos: Partial<Ejercicio>): Observable<Ejercicio> {
    return this.http.put<Ejercicio>(`${this.baseUrl}/${id}/multimedia`, datos);
  }
}
