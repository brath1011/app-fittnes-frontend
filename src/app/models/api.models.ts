export type RolUsuario = 'USER' | 'ADMIN';

export type Genero = 'HOMBRE' | 'MUJER';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  genero?: Genero;
}

export interface AuthResponse {
  token: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  genero?: Genero;
}

export interface SubcategoriaImagenItem {
  nombre: string;
  imagenUrl?: string;
  imagenUrlHombre?: string;
  imagenUrlMujer?: string;
}

export interface Ejercicio {
  id?: number;
  nombre: string;
  descripcion?: string;
  grupoMuscular: string; // PECHO, ESPALDA, PIERNAS, HOMBROS, BRAZOS, ABDOMEN, CARDIO
  imagenUrl?: string;
  videoUrl?: string;
  foto1Url?: string;
  foto2Url?: string;
  foto3Url?: string;
  foto4Url?: string;
  foto5Url?: string;
  foto6Url?: string;
  
  // Multimedia Hombre
  imagenUrlHombre?: string;
  videoUrlHombre?: string;
  foto1UrlHombre?: string;
  foto2UrlHombre?: string;
  foto3UrlHombre?: string;
  foto4UrlHombre?: string;
  foto5UrlHombre?: string;
  foto6UrlHombre?: string;

  // Multimedia Mujer
  imagenUrlMujer?: string;
  videoUrlMujer?: string;
  foto1UrlMujer?: string;
  foto2UrlMujer?: string;
  foto3UrlMujer?: string;
  foto4UrlMujer?: string;
  foto5UrlMujer?: string;
  foto6UrlMujer?: string;

  efectividadPorcentaje?: number;
  subcategoria?: string;
  tipo?: string;
  variantes?: Ejercicio[];
}

export interface RutinaEjercicio {
  id?: number;
  ejercicio: Ejercicio;
  dia?: string;
  series: number;
  repeticiones: number;
  repeticionesMax?: number;
  esUnilateral: boolean;
  descansoLadoSegundos: number;
  descansoSeriesSegundos: number;
  pesoKg?: number;
  orden?: number;
}

export interface Rutina {
  id?: number;
  nombre: string;
  descripcion?: string;
  nivelDificultad: string; // PRINCIPIANTE, INTERMEDIO, AVANZADO
  diasSemana?: string;
  ejercicios?: RutinaEjercicio[];
  fechaCreacion?: string;
}

export interface Pago {
  id?: number;
  monto: number;
  fecha?: string;
  metodoPago: string; // TARJETA, PAYPAL, SIMULADOR
  estado: string; // PENDIENTE, COMPLETADO, RECHAZADO
  usuario?: {
    nombre: string;
    email: string;
  };
}

export interface Boleta {
  id?: number;
  pago?: Pago;
  nroBoleta: string;
  fechaEmision?: string;
  pdfUrl?: string;
  enviadoPorCorreo: boolean;
}

export interface FotoProgreso {
  id?: number;
  fecha?: string;
  imagenUrl: string;
  pesoKg: number;
}

export interface RegistroEntrenamiento {
  id?: number;
  rutina?: Rutina;
  fecha?: string;
  duracionMinutos: number;
  caloriasQuemadas: number;
}

