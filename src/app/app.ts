import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar';
import { AjustesModalComponent } from './components/ajustes-modal/ajustes-modal';
import { AuthService } from './services/auth.service';
import { InfoModalService } from './services/info-modal.service';
import { AccesibilidadService } from './services/accesibilidad.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent, AjustesModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'fitness-guide-frontend';
  readonly auth = inject(AuthService);
  readonly infoModal = inject(InfoModalService);
  readonly acc = inject(AccesibilidadService);

  constructor() {
    let tituloOriginal = document.title;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        document.title = "No te vayas! 🏆";
      } else {
        document.title = tituloOriginal;
      }
    });
  }
}

