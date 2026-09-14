import { Component } from '@angular/core';

@Component({
  selector: 'app-terminos',
  standalone: true,
  templateUrl: './terminos.html',
  styles: [`
    .terminos-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      font-family: 'Outfit', sans-serif;
    }
    h1 { margin-bottom: 20px; }
    h2 { margin-top: 30px; margin-bottom: 10px; font-size: 1.2rem; }
    p, li { line-height: 1.6; color: #444; margin-bottom: 15px; }
  `]
})
export class TerminosComponent {}
