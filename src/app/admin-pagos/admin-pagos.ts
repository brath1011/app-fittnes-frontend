import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagoService } from '../services/pago.service';
import { Boleta } from '../models/api.models';

@Component({
  selector: 'app-admin-pagos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-pagos.html',
  styleUrl: './admin-pagos.scss'
})
export class AdminPagosComponent implements OnInit {
  private readonly pagoService = inject(PagoService);

  boletas = signal<Boleta[]>([]);
  mensajeExito = signal('');
  mensajeError = signal('');

  ngOnInit(): void {
    this.cargarBoletas();
  }

  cargarBoletas(): void {
    this.pagoService.listarTodasLasBoletas().subscribe({
      next: (data) => this.boletas.set(data),
      error: (err) => console.error('Error al cargar boletas globales', err)
    });
  }

  reenviarCorreo(boleta: Boleta): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');
    
    this.pagoService.reenviarBoleta(boleta.nroBoleta).subscribe({
      next: () => {
        this.mensajeExito.set(`Boleta ${boleta.nroBoleta} reenviada con éxito.`);
        this.cargarBoletas();
        setTimeout(() => this.mensajeExito.set(''), 3000);
      },
      error: (err) => {
        this.mensajeError.set('No se pudo reenviar la boleta.');
        console.error(err);
        setTimeout(() => this.mensajeError.set(''), 3000);
      }
    });
  }
}
