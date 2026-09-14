import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MedidaCorporalDTO {
  id?: number;
  fecha?: string;
  pesoKg: number;
  alturaCm?: number;
  objetivoFase?: 'DEFICIT' | 'MANTENIMIENTO' | 'VOLUMEN_LIMPIO' | 'VOLUMEN_SUCIO';
  pesoMetaKg?: number;
  recomendacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedidaCorporalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/medidas`;

  registrarMedida(dto: MedidaCorporalDTO): Observable<MedidaCorporalDTO> {
    return this.http.post<MedidaCorporalDTO>(this.apiUrl, dto);
  }

  listarMedidas(): Observable<MedidaCorporalDTO[]> {
    return this.http.get<MedidaCorporalDTO[]>(this.apiUrl);
  }

  obtenerUltimaMedida(): Observable<MedidaCorporalDTO> {
    return this.http.get<MedidaCorporalDTO>(`${this.apiUrl}/actual`);
  }
}
