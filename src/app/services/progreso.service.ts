import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FotoProgreso, RegistroEntrenamiento } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ProgresoService {
  private readonly http = inject(HttpClient);
  private readonly fotosUrl = `${environment.apiUrl}/progreso/fotos`;
  private readonly entrenamientosUrl = `${environment.apiUrl}/progreso/entrenamientos`;

  listarMisFotos(): Observable<FotoProgreso[]> {
    return this.http.get<FotoProgreso[]>(this.fotosUrl);
  }

  registrarFoto(imagenUrl: string, pesoKg: number): Observable<FotoProgreso> {
    return this.http.post<FotoProgreso>(this.fotosUrl, { imagenUrl, pesoKg });
  }

  listarMisEntrenamientos(): Observable<RegistroEntrenamiento[]> {
    return this.http.get<RegistroEntrenamiento[]>(this.entrenamientosUrl);
  }

  registrarEntrenamiento(rutinaId: number | null, duracionMinutos: number, caloriasQuemadas: number): Observable<RegistroEntrenamiento> {
    return this.http.post<RegistroEntrenamiento>(this.entrenamientosUrl, { rutinaId, duracionMinutos, caloriasQuemadas });
  }
}
