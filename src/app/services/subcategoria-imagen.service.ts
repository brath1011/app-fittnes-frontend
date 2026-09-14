import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SubcategoriaImagenItem, Genero } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class SubcategoriaImagenService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/subcategorias-imagenes`;
  private readonly STORAGE_KEY_HOMBRE = 'fitness_subcat_img_hombre_v2';
  private readonly STORAGE_KEY_MUJER = 'fitness_subcat_img_mujer_v2';

  // Mapas reactivos de imágenes por subcategoría
  imagenesHombreMap = signal<{ [key: string]: string }>({});
  imagenesMujerMap = signal<{ [key: string]: string }>({});

  private readonly defaultImagenesHombre: { [key: string]: string } = {
    'PECTORAL ALTO': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%230f172a"/><path d="M25 40 C35 30 65 30 75 40 L70 55 C60 48 40 48 30 55 Z" fill="%2338bdf8"/><circle cx="50" cy="35" r="5" fill="%2360a5fa"/><text x="50" y="80" text-anchor="middle" fill="%2394a3b8" font-size="10" font-family="sans-serif" font-weight="bold">PEC ALTO ♂</text></svg>',
    'PECTORAL MEDIO': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%230f172a"/><path d="M25 45 C35 42 65 42 75 45 L70 65 C60 62 40 62 30 65 Z" fill="%233b82f6"/><text x="50" y="82" text-anchor="middle" fill="%2394a3b8" font-size="10" font-family="sans-serif" font-weight="bold">PEC MEDIO ♂</text></svg>',
    'PECTORAL BAJO': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%230f172a"/><path d="M25 55 C35 52 65 52 75 55 L65 75 C55 78 45 78 35 75 Z" fill="%2310b981"/><text x="50" y="88" text-anchor="middle" fill="%2334d399" font-size="9" font-family="sans-serif" font-weight="bold">PEC BAJO ♂</text></svg>',
    'PECTORAL COMPLETO': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%230f172a"/><path d="M25 35 C35 28 65 28 75 35 L70 70 C55 75 45 75 30 70 Z" fill="%238b5cf6"/><text x="50" y="88" text-anchor="middle" fill="%23c084fc" font-size="8" font-family="sans-serif" font-weight="bold">PEC COMPLETO ♂</text></svg>',
    'ANTEBRAZO': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%230f172a"/><path d="M35 30 L65 30 L58 70 L42 70 Z" fill="%23f59e0b"/><circle cx="50" cy="50" r="10" fill="%23fbbf24"/><text x="50" y="88" text-anchor="middle" fill="%23fde68a" font-size="8" font-family="sans-serif" font-weight="bold">ANTEBRAZO ♂</text></svg>'
  };

  private readonly defaultImagenesMujer: { [key: string]: string } = {
    'PECTORAL ALTO': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231e112a"/><path d="M25 40 C35 30 65 30 75 40 L70 55 C60 48 40 48 30 55 Z" fill="%23ec4899"/><circle cx="50" cy="35" r="5" fill="%23f472b6"/><text x="50" y="80" text-anchor="middle" fill="%23f472b6" font-size="10" font-family="sans-serif" font-weight="bold">PEC ALTO ♀</text></svg>',
    'PECTORAL MEDIO': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231e112a"/><path d="M25 45 C35 42 65 42 75 45 L70 65 C60 62 40 62 30 65 Z" fill="%23d946ef"/><text x="50" y="82" text-anchor="middle" fill="%23f472b6" font-size="10" font-family="sans-serif" font-weight="bold">PEC MEDIO ♀</text></svg>',
    'PECTORAL BAJO': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231e112a"/><path d="M25 55 C35 52 65 52 75 55 L65 75 C55 78 45 78 35 75 Z" fill="%23a855f7"/><text x="50" y="88" text-anchor="middle" fill="%23c084fc" font-size="9" font-family="sans-serif" font-weight="bold">PEC BAJO ♀</text></svg>',
    'PECTORAL COMPLETO': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231e112a"/><path d="M25 35 C35 28 65 28 75 35 L70 70 C55 75 45 75 30 70 Z" fill="%23f43f5e"/><text x="50" y="88" text-anchor="middle" fill="%23fda4af" font-size="8" font-family="sans-serif" font-weight="bold">PEC COMPLETO ♀</text></svg>',
    'ANTEBRAZO': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231e112a"/><path d="M35 30 L65 30 L58 70 L42 70 Z" fill="%23ec4899"/><circle cx="50" cy="50" r="10" fill="%23f472b6"/><text x="50" y="88" text-anchor="middle" fill="%23fda4af" font-size="8" font-family="sans-serif" font-weight="bold">ANTEBRAZO ♀</text></svg>'
  };

  constructor() {
    this.cargarImagenesIniciales();
  }

  private safeSetLocalStorage(key: string, value: string): void {
    if (!value || value.length > 80000) return; // Evitar saturar localStorage con Base64 masivos
    try {
      localStorage.setItem(key, value);
    } catch (e: any) {
      // Ignorar de forma segura si la cuota del navegador está llena
    }
  }

  private cargarImagenesIniciales(): void {
    // 1. Limpieza preventiva de almacenamiento local pesado
    try {
      localStorage.removeItem('fitness_subcat_img_hombre_v2');
      localStorage.removeItem('fitness_subcat_img_mujer_v2');
      localStorage.removeItem('fitness_subcat_img_hombre');
      localStorage.removeItem('fitness_subcat_img_mujer');
      localStorage.removeItem('fitness_subcat_imagenes');
    } catch (e) {}

    this.imagenesHombreMap.set({ ...this.defaultImagenesHombre });
    this.imagenesMujerMap.set({ ...this.defaultImagenesMujer });

    // 2. Consultar Backend
    this.http.get<any[]>(this.baseUrl).subscribe({
      next: (items) => {
        if (Array.isArray(items)) {
          const nuevoMapH = { ...this.defaultImagenesHombre };
          const nuevoMapM = { ...this.defaultImagenesMujer };

          for (const item of items) {
            const key = (item.nombre || '').toUpperCase();
            if (item.imagenUrlHombre) {
              nuevoMapH[key] = item.imagenUrlHombre;
            } else if (item.imagenUrl) {
              nuevoMapH[key] = item.imagenUrl;
            }

            if (item.imagenUrlMujer) {
              nuevoMapM[key] = item.imagenUrlMujer;
            } else if (item.imagenUrl) {
              // fallback inicial
              nuevoMapM[key] = item.imagenUrl;
            }
          }

          this.imagenesHombreMap.set(nuevoMapH);
          this.imagenesMujerMap.set(nuevoMapM);
        }
      },
      error: (err) => console.warn('No se pudo sincronizar imágenes con el servidor, usando memoria', err)
    });
  }

  guardarImagen(subcategoria: string, imagenUrl: string, genero: Genero = 'HOMBRE'): void {
    const key = subcategoria.trim().toUpperCase();
    if (genero === 'MUJER') {
      const actual = { ...this.imagenesMujerMap() };
      if (imagenUrl && imagenUrl.trim()) actual[key] = imagenUrl.trim();
      else delete actual[key];
      this.imagenesMujerMap.set(actual);
      this.safeSetLocalStorage(this.STORAGE_KEY_MUJER, JSON.stringify(actual));
    } else {
      const actual = { ...this.imagenesHombreMap() };
      if (imagenUrl && imagenUrl.trim()) actual[key] = imagenUrl.trim();
      else delete actual[key];
      this.imagenesHombreMap.set(actual);
      this.safeSetLocalStorage(this.STORAGE_KEY_HOMBRE, JSON.stringify(actual));
    }

    // Persistir en Backend
    const body: any = { imagenUrl, genero };
    if (genero === 'MUJER') body.imagenUrlMujer = imagenUrl;
    else body.imagenUrlHombre = imagenUrl;

    this.http.put(`${this.baseUrl}/${encodeURIComponent(key)}`, body).subscribe({
      next: () => console.log(`Portada de ${key} (${genero}) guardada en BD.`),
      error: (err) => console.error(`Error guardando portada de ${key} en servidor`, err)
    });
  }

  obtenerImagen(subcategoria: string, genero: Genero = 'HOMBRE'): string | null {
    if (!subcategoria) return null;
    const key = subcategoria.trim().toUpperCase();
    if (genero === 'MUJER') {
      return this.imagenesMujerMap()[key] || this.imagenesHombreMap()[key] || null;
    }
    return this.imagenesHombreMap()[key] || this.imagenesMujerMap()[key] || null;
  }

  obtenerImagenHombre(subcategoria: string): string | null {
    if (!subcategoria) return null;
    return this.imagenesHombreMap()[subcategoria.trim().toUpperCase()] || null;
  }

  obtenerImagenMujer(subcategoria: string): string | null {
    if (!subcategoria) return null;
    return this.imagenesMujerMap()[subcategoria.trim().toUpperCase()] || null;
  }

  eliminarImagen(subcategoria: string, genero: Genero = 'HOMBRE'): void {
    const key = subcategoria.trim().toUpperCase();
    if (genero === 'MUJER') {
      const actual = { ...this.imagenesMujerMap() };
      delete actual[key];
      this.imagenesMujerMap.set(actual);
      this.safeSetLocalStorage(this.STORAGE_KEY_MUJER, JSON.stringify(actual));
    } else {
      const actual = { ...this.imagenesHombreMap() };
      delete actual[key];
      this.imagenesHombreMap.set(actual);
      this.safeSetLocalStorage(this.STORAGE_KEY_HOMBRE, JSON.stringify(actual));
    }

    // Eliminar en Backend
    this.http.delete(`${this.baseUrl}/${encodeURIComponent(key)}?genero=${genero}`).subscribe({
      next: () => console.log(`Portada de ${key} (${genero}) eliminada en BD.`),
      error: (err) => console.error(`Error al eliminar portada de ${key}`, err)
    });
  }
}
