import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PagoService } from '../services/pago.service';
import { AuthService } from '../services/auth.service';
import { Pago, Boleta } from '../models/api.models';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pagos.html',
  styleUrl: './pagos.scss'
})
export class PagosComponent implements OnInit {
  private readonly pagoService = inject(PagoService);
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  boletas = signal<Boleta[]>([]);
  mostrarFormularioPago = signal(false);
  mensajeExito = signal('');
  mensajeError = signal('');
  procesando = signal(false);

  // Formulario simulador de tarjeta
  pagoForm = this.fb.group({
    nombreTitular: ['', Validators.required],
    nroTarjeta: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiracion: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
    metodoPago: ['TARJETA', Validators.required]
  });

  ngOnInit(): void {
    this.cargarBoletas();
  }

  cargarBoletas(): void {
    this.pagoService.listarMisBoletas().subscribe({
      next: (data) => this.boletas.set(data),
      error: (err) => console.error('Error al listar boletas', err)
    });
  }

  abrirPasarela(): void {
    this.mostrarFormularioPago.set(true);
    this.mensajeExito.set('');
    this.mensajeError.set('');
  }

  cerrarPasarela(): void {
    this.mostrarFormularioPago.set(false);
  }

  realizarPagoSimulado(): void {
    if (this.pagoForm.invalid) return;

    this.procesando.set(true);
    this.mensajeExito.set('');
    this.mensajeError.set('');

    const val = this.pagoForm.value;
    
    // Procesar pago (Monto Premium fijo: S/ 29.90)
    this.pagoService.procesarPago(29.90, val.metodoPago!).subscribe({
      next: (boleta) => {
        this.procesando.set(false);
        this.mostrarFormularioPago.set(false);
        this.mensajeExito.set(`¡Suscripción Premium activada con éxito! Se ha generado tu boleta ${boleta.nroBoleta} y se ha enviado a tu correo.`);
        
        // Simular activación del plan en la aplicación
        this.auth.cambiarPlan('PRO');

        this.cargarBoletas();
      },
      error: (err) => {
        this.procesando.set(false);
        this.mensajeError.set('Ocurrió un error al procesar el pago. Por favor intenta nuevamente.');
        console.error(err);
      }
    });
  }

  solicitarReenvio(boleta: Boleta): void {
    this.pagoService.reenviarBoleta(boleta.nroBoleta).subscribe({
      next: () => {
        alert(`Boleta ${boleta.nroBoleta} reenviada al correo con éxito.`);
        this.cargarBoletas();
      },
      error: (err) => {
        alert('No se pudo reenviar la boleta por correo.');
        console.error(err);
      }
    });
  }
}
