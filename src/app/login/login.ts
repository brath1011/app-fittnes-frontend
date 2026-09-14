import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly mensajeError = signal('');
  readonly mostrarPassword = signal(false);

  togglePassword(): void {
    this.mostrarPassword.update(show => !show);
  }

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  enviar(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.mensajeError.set('Completa los campos correctamente.');
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');

    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.router.navigate(['/rutinas']);
      },
      error: (error) => {
        this.cargando.set(false);
        const msg = this.obtenerMensajeError(error, 'Credenciales incorrectas o backend no disponible.');
        this.mensajeError.set(msg);
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
