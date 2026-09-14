import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class RegistroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly mensaje = signal('');
  readonly mensajeError = signal('');
  readonly mostrarPassword = signal(false);

  togglePassword(): void {
    this.mostrarPassword.update(show => !show);
  }

  readonly registroForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    genero: ['HOMBRE' as 'HOMBRE' | 'MUJER', Validators.required]
  });

  seleccionarGenero(gen: 'HOMBRE' | 'MUJER'): void {
    this.registroForm.patchValue({ genero: gen });
  }

  registrar(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      this.mensajeError.set('Completa todos los campos requeridos.');
      return;
    }

    this.cargando.set(true);
    this.mensaje.set('');
    this.mensajeError.set('');

    this.auth.register(this.registroForm.getRawValue()).subscribe({
      next: () => {
        this.mensaje.set('Usuario registrado correctamente. Ingresando...');
        setTimeout(() => this.router.navigate(['/rutinas']), 700);
      },
      error: (error) => {
        this.cargando.set(false);
        this.mensajeError.set(this.obtenerMensajeError(error, 'No se pudo registrar el usuario.'));
      },
      complete: () => this.cargando.set(false)
    });
  }

  private obtenerMensajeError(error: any, fallback: string): string {
    if (error && error.error) {
      if (typeof error.error === 'string') return error.error;
      if (error.error.error) return error.error.error;
    }
    return fallback;
  }
}
