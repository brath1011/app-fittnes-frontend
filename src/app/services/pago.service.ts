import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pago, Boleta } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private readonly http = inject(HttpClient);
  
  procesarPago(monto: number, metodoPago: string): Observable<Boleta> {
    return this.http.post<Boleta>(`${environment.apiUrl}/pagos`, { monto, metodoPago });
  }

  listarMisPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${environment.apiUrl}/pagos/mis-pagos`);
  }

  listarMisBoletas(): Observable<Boleta[]> {
    return this.http.get<Boleta[]>(`${environment.apiUrl}/boletas/mis-boletas`);
  }

  listarTodasLasBoletas(): Observable<Boleta[]> {
    return this.http.get<Boleta[]>(`${environment.apiUrl}/boletas/admin/todas`);
  }

  reenviarBoleta(nroBoleta: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/boletas/${nroBoleta}/reenviar`, {});
  }
}
