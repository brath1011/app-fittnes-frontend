import { Injectable, signal, effect } from '@angular/core';

export type IdiomaCode = 'es' | 'en' | 'pt' | 'zh' | 'qu' | 'ay';
export type TemaMode = 'dark' | 'light';
export type TamanoFuente = 'pequeno' | 'normal' | 'grande' | 'extragrande';
export type UnidadesPeso = 'kg' | 'lbs';

export interface IdiomaOpcion {
  codigo: IdiomaCode;
  nombre: string;
  nombreNativo: string;
  bandera: string;
}

export interface ColorAcentoOpcion {
  id: string;
  nombre: string;
  colorHex: string;
  hoverHex: string;
  glowHex: string;
  glowSubtleHex: string;
}

export const COLORES_ACENTO_DISPONIBLES: ColorAcentoOpcion[] = [
  { id: 'predeterminado', nombre: 'Predeterminado (Sin efectos)', colorHex: '#007aff', hoverHex: '#005bb5', glowHex: 'transparent', glowSubtleHex: 'transparent' },
  { id: 'azul', nombre: 'Azul Deportivo (Electric Blue)', colorHex: '#007aff', hoverHex: '#0062cc', glowHex: 'rgba(0, 122, 255, 0.45)', glowSubtleHex: 'rgba(0, 122, 255, 0.15)' },
  { id: 'cian', nombre: 'Cian Cyberpunk (Neon Cyan)', colorHex: '#06b6d4', hoverHex: '#0891b2', glowHex: 'rgba(6, 182, 212, 0.45)', glowSubtleHex: 'rgba(6, 182, 212, 0.15)' },
  { id: 'aqua', nombre: 'Aqua Marina (Mint Fresh)', colorHex: '#2dd4bf', hoverHex: '#14b8a6', glowHex: 'rgba(45, 212, 191, 0.45)', glowSubtleHex: 'rgba(45, 212, 191, 0.15)' },
  { id: 'esmeralda', nombre: 'Verde Esmeralda (Emerald Glow)', colorHex: '#10b981', hoverHex: '#059669', glowHex: 'rgba(16, 185, 129, 0.45)', glowSubtleHex: 'rgba(16, 185, 129, 0.15)' },
  { id: 'neon', nombre: 'Verde Neón (Toxic Lime)', colorHex: '#84cc16', hoverHex: '#65a30d', glowHex: 'rgba(132, 204, 22, 0.45)', glowSubtleHex: 'rgba(132, 204, 22, 0.15)' },
  { id: 'oro', nombre: 'Oro Cyberpunk (Gold Voltage)', colorHex: '#eab308', hoverHex: '#ca8a04', glowHex: 'rgba(234, 179, 8, 0.45)', glowSubtleHex: 'rgba(234, 179, 8, 0.15)' },
  { id: 'ambar', nombre: 'Ámbar Solar (Sunset Amber)', colorHex: '#f59e0b', hoverHex: '#d97706', glowHex: 'rgba(245, 158, 11, 0.45)', glowSubtleHex: 'rgba(245, 158, 11, 0.15)' },
  { id: 'naranja', nombre: 'Naranja Fuego (Inferno Orange)', colorHex: '#f97316', hoverHex: '#ea580c', glowHex: 'rgba(249, 115, 22, 0.45)', glowSubtleHex: 'rgba(249, 115, 22, 0.15)' },
  { id: 'rojo', nombre: 'Rojo Carmesí (Crimson Red)', colorHex: '#ef4444', hoverHex: '#dc2626', glowHex: 'rgba(239, 68, 68, 0.45)', glowSubtleHex: 'rgba(239, 68, 68, 0.15)' },
  { id: 'coral', nombre: 'Rosa Coral (Sunset Coral)', colorHex: '#f43f5e', hoverHex: '#e11d48', glowHex: 'rgba(244, 63, 94, 0.45)', glowSubtleHex: 'rgba(244, 63, 94, 0.15)' },
  { id: 'rosa_neon', nombre: 'Rosa Neón (Cyber Magenta)', colorHex: '#ec4899', hoverHex: '#db2777', glowHex: 'rgba(236, 72, 153, 0.45)', glowSubtleHex: 'rgba(236, 72, 153, 0.15)' },
  { id: 'fucsia', nombre: 'Fucsia Synthwave (Hot Pink)', colorHex: '#d946ef', hoverHex: '#c026d3', glowHex: 'rgba(217, 70, 239, 0.45)', glowSubtleHex: 'rgba(217, 70, 239, 0.15)' },
  { id: 'lavanda', nombre: 'Lavanda Eléctrica (Electric Lavender)', colorHex: '#c084fc', hoverHex: '#a855f7', glowHex: 'rgba(192, 132, 252, 0.45)', glowSubtleHex: 'rgba(192, 132, 252, 0.15)' },
  { id: 'violeta', nombre: 'Violeta Pro (Ultra Violet)', colorHex: '#8b5cf6', hoverHex: '#7c3aed', glowHex: 'rgba(139, 92, 246, 0.45)', glowSubtleHex: 'rgba(139, 92, 246, 0.15)' },
  { id: 'indigo', nombre: 'Índigo Profundo (Deep Indigo)', colorHex: '#6366f1', hoverHex: '#4f46e5', glowHex: 'rgba(99, 102, 241, 0.45)', glowSubtleHex: 'rgba(99, 102, 241, 0.15)' },
  { id: 'oceano', nombre: 'Azul Océano (Sky Blue)', colorHex: '#38bdf8', hoverHex: '#0284c7', glowHex: 'rgba(56, 189, 248, 0.45)', glowSubtleHex: 'rgba(56, 189, 248, 0.15)' },
  { id: 'champagne', nombre: 'Oro Champagne (Luxury Gold)', colorHex: '#d4af37', hoverHex: '#b89628', glowHex: 'rgba(212, 175, 55, 0.45)', glowSubtleHex: 'rgba(212, 175, 55, 0.15)' },
  { id: 'blanco_platino', nombre: 'Platino Frost (Ice Platinum)', colorHex: '#e2e8f0', hoverHex: '#cbd5e1', glowHex: 'rgba(226, 232, 240, 0.45)', glowSubtleHex: 'rgba(226, 232, 240, 0.15)' },
  { id: 'gris', nombre: 'Gris Titanio (Titanium Steel)', colorHex: '#94a3b8', hoverHex: '#64748b', glowHex: 'rgba(148, 163, 184, 0.45)', glowSubtleHex: 'rgba(148, 163, 184, 0.15)' },
  // NUEVOS COLORES MODERNOS
  { id: 'manzana', nombre: 'Verde Manzana (Apple Green)', colorHex: '#a3e635', hoverHex: '#84cc16', glowHex: 'rgba(163, 230, 53, 0.45)', glowSubtleHex: 'rgba(163, 230, 53, 0.15)' },
  { id: 'hielo', nombre: 'Azul Hielo (Ice Blue)', colorHex: '#7dd3fc', hoverHex: '#38bdf8', glowHex: 'rgba(125, 211, 252, 0.45)', glowSubtleHex: 'rgba(125, 211, 252, 0.15)' },
  { id: 'carbon', nombre: 'Carbón Activo (Active Carbon)', colorHex: '#334155', hoverHex: '#1e293b', glowHex: 'rgba(51, 65, 85, 0.45)', glowSubtleHex: 'rgba(51, 65, 85, 0.15)' },
  { id: 'magenta_profundo', nombre: 'Magenta Profundo (Deep Magenta)', colorHex: '#be185d', hoverHex: '#9d174d', glowHex: 'rgba(190, 24, 93, 0.45)', glowSubtleHex: 'rgba(190, 24, 93, 0.15)' }
];

export interface ColorCuadroOpcion {
  id: string;
  nombre: string;
  bgOscuro: string;
  bgClaro: string;
}

export const COLORES_CUADROS_DISPONIBLES: ColorCuadroOpcion[] = [
  { id: 'default', nombre: 'Por Defecto (Tema Actual)', bgOscuro: 'var(--bg-surface-default)', bgClaro: 'var(--bg-surface-default)' },
  { id: 'midnight', nombre: 'Midnight Navy (Azul Noche)', bgOscuro: '#0f172a', bgClaro: '#e8ecf4' },
  { id: 'slate', nombre: 'Slate Carbon (Gris Pizarra)', bgOscuro: '#1e293b', bgClaro: '#f1f5f9' },
  { id: 'cyber_dark', nombre: 'Cyberpunk Dark (Negro Neón)', bgOscuro: '#0a0d14', bgClaro: '#eef2ff' },
  { id: 'obsidian', nombre: 'Obsidian OLED (Negro Puro)', bgOscuro: '#000000', bgClaro: '#ffffff' },
  { id: 'titanium', nombre: 'Titanium Graphite (Grafito)', bgOscuro: '#18181b', bgClaro: '#f4f4f5' },
  { id: 'emerald', nombre: 'Emerald Jade (Jade Esmeralda)', bgOscuro: '#062e24', bgClaro: '#e6fcf5' },
  { id: 'forest', nombre: 'Nordic Forest (Verde Bosque)', bgOscuro: '#132a1e', bgClaro: '#ecfdf5' },
  { id: 'purple_velvet', nombre: 'Purple Velvet (Púrpura Imperial)', bgOscuro: '#1e102e', bgClaro: '#f5f3ff' },
  { id: 'violet_abyss', nombre: 'Violet Abyss (Abismo Violeta)', bgOscuro: '#23123d', bgClaro: '#f3e8ff' },
  { id: 'wine', nombre: 'Ruby Wine (Vino Rubí)', bgOscuro: '#370716', bgClaro: '#fff1f2' },
  { id: 'crimson', nombre: 'Dark Crimson (Carmesí Noche)', bgOscuro: '#2c0b0e', bgClaro: '#fef2f2' },
  { id: 'espresso', nombre: 'Dark Espresso (Café Robusto)', bgOscuro: '#1c1917', bgClaro: '#fafaf9' },
  { id: 'amber_glow', nombre: 'Warm Bronze (Bronce Cálido)', bgOscuro: '#29180d', bgClaro: '#fffbeb' },
  { id: 'ocean_depth', nombre: 'Ocean Abyss (Profundidad Marina)', bgOscuro: '#082f49', bgClaro: '#f0f9ff' },
  { id: 'teal_mystic', nombre: 'Teal Mystic (Turquesa Oscuro)', bgOscuro: '#042f2e', bgClaro: '#f0fdfa' },
  // NUEVOS COLORES MODERNOS
  { id: 'rose_gold', nombre: 'Rose Gold (Oro Rosa)', bgOscuro: '#2d1b23', bgClaro: '#fff0f5' },
  { id: 'sage_green', nombre: 'Sage Green (Verde Salvia)', bgOscuro: '#1b2a22', bgClaro: '#f4fbf6' },
  { id: 'lavender_mist', nombre: 'Lavender Mist (Niebla Lavanda)', bgOscuro: '#251e36', bgClaro: '#f8f5ff' },
  { id: 'ocean_breeze', nombre: 'Ocean Breeze (Brisa Marina)', bgOscuro: '#0f2933', bgClaro: '#f0faff' },
  { id: 'sandstone', nombre: 'Sandstone (Piedra Arena)', bgOscuro: '#26211c', bgClaro: '#fffdf5' },
];

@Injectable({
  providedIn: 'root'
})
export class AccesibilidadService {

  readonly idiomasDisponibles: IdiomaOpcion[] = [
    { codigo: 'es', nombre: 'Español', nombreNativo: 'Español', bandera: '🇪🇸' },
    { codigo: 'en', nombre: 'Inglés', nombreNativo: 'English', bandera: '🇺🇸' },
    { codigo: 'pt', nombre: 'Portugués', nombreNativo: 'Português', bandera: '🇧🇷' },
    { codigo: 'zh', nombre: 'Chino', nombreNativo: '中文', bandera: '🇨🇳' },
    { codigo: 'qu', nombre: 'Quechua', nombreNativo: 'Runasimi', bandera: '🇵🇪' },
    { codigo: 'ay', nombre: 'Aimara', nombreNativo: 'Aymar aru', bandera: '🇧🇴' },
  ];

  readonly coloresAcento = COLORES_ACENTO_DISPONIBLES;
  readonly coloresCuadros = COLORES_CUADROS_DISPONIBLES;

  readonly idiomaActual = signal<IdiomaCode>(this.obtenerIdiomaInicial());
  readonly temaActual = signal<TemaMode>(this.obtenerTemaInicial());
  readonly tamanoFuente = signal<TamanoFuente>(this.obtenerTamanoInicial());
  readonly colorAcento = signal<string>(this.obtenerColorAcentoInicial());
  readonly colorCuadros = signal<string>(this.obtenerColorCuadrosInicial());
  readonly unidadPeso = signal<UnidadesPeso>(this.obtenerUnidadInicial());

  private readonly traducciones: Record<IdiomaCode, Record<string, string>> = {
    es: {
      "nav.inicio": "Inicio",
      "nav.ejercicios": "Ejercicios",
      "nav.rutinas": "Mis Rutinas",
      "nav.entrenamiento": "Entrenamiento",
      "nav.guia": "Guía Científica",
      "nav.admin": "Panel Admin",
      "nav.progreso": "Mi Progreso",
      "nav.perfil": "Perfil",
      "nav.configuracion": "Configuración",
      "nav.premium": "Premium & Boletas",
      "nav.panelControl": "Panel de Control",
      "nav.cerrarSesion": "Cerrar sesión",
      "nav.iniciarSesion": "Iniciar Sesión",
      "nav.buscarPlaceholder": "Buscar ejercicios...",
      "nav.idioma": "Idioma",
      "nav.modoOscuro": "Modo Oscuro",
      "nav.modoClaro": "Modo Claro",
      "nav.tamanoTexto": "Tamaño de texto",
      
      "ejercicios.titulo": "Catálogo de Ejercicios",
      "ejercicios.subtitulo": "Explora ejercicios guiados para armar tus rutinas y mejorar tus entrenamientos.",
      "ejercicios.disponibles": "ejercicios disponibles",
      "ejercicios.volver": "Volver a regiones de",
      "ejercicios.region": "Región",
      "ejercicios.sinResultados": "No se encontraron ejercicios",
      "ejercicios.sinResultadosSub": "Intenta con otro término de búsqueda o selecciona otra categoría.",
      "ejercicios.compuestos": "Ejercicios Compuestos (Multiarticulares)",
      "ejercicios.aislamiento": "Ejercicios de Aislamiento (Monoarticulares)",
      "ejercicios.verTecnica": "Ver Técnica Completa",
      "ejercicios.anadirARutina": "Añadir a Rutina",
      "ejercicios.enRutina": "En Rutina",
      "ejercicios.buscarPlaceholder": "Buscar ejercicio por nombre, músculo, agarre, compuesto...",
      "ejercicios.filtrarTipo": "Filtrar por tipo:",
      "ejercicios.todos": "Todos",
      "ejercicios.compuestoBtn": "Compuestos",
      "ejercicios.aislamientoBtn": "Aislamiento",
      
      "cat.pecho": "PECHO",
      "cat.espalda": "ESPALDA",
      "cat.piernas": "PIERNAS",
      "cat.hombros": "HOMBROS",
      "cat.brazos": "BRAZOS",
      "cat.abdomen": "ABDOMEN",
      "cat.cardio": "CARDIO",

      "rutinas.titulo": "Planificador Semanal de Rutinas",
      "rutinas.subtitulo": "Organiza tus ejercicios por día, ajusta series, repeticiones y descansos.",
      "rutinas.entrenar": "Entrenar",
      "rutinas.anadirEjercicio": "Añadir Ejercicio",
      "rutinas.sinEjercicios": "Sin ejercicios programados",
      "rutinas.series": "SER",
      "rutinas.reps": "REP",
      "rutinas.peso": "KG",

      "entrenamiento.titulo": "Centro de Entrenamiento",
      "entrenamiento.subtitulo": "Crea rutinas personalizadas, organízalas y ejecútalas en tiempo real con seguimiento de series, cronómetro y biomecánica.",
      "entrenamiento.crearNueva": "+ Crear Nueva Rutina",
      "entrenamiento.misRutinas": "Mis Rutinas Creadas",
      "entrenamiento.empezarRutina": "Empezar Rutina",
      "entrenamiento.continuarRutina": "Continuar Entrenamiento",

      "perfil.titulo": "Mi Perfil & Preferencias",
      "perfil.pestanaProgreso": "📊 Mi Progreso",
      "perfil.datos": "Datos Personales",
      "perfil.nombre": "Nombre Completo",
      "perfil.genero": "Preferencia Corporal (Guías & Anatomía)",
      "perfil.hombre": "Hombre (Guías Masculinas)",
      "perfil.mujer": "Mujer (Guías Femeninas)",
      "perfil.guardar": "Guardar Cambios",
      "perfil.accesibilidad": "Accesibilidad & Visualización",
      "perfil.tema": "Tema de la Aplicación",
      "perfil.fuente": "Tamaño de Fuente",
      "perfil.idioma": "Idioma del Sistema",
      "perfil.colorAcento": "Color de Resaltado (Hover & Sombras)",
      "perfil.fotosPeso": "Fotos y Peso",
      "perfil.historial": "Historial",
      "perfil.sesiones": "Sesiones",
      "perfil.minutos": "Minutos",
      "perfil.calorias": "Calorías",
      "perfil.frecuencia": "Sesiones / sem",
      "perfil.tendenciaPeso": "Tendencia de Peso Corporal",
      "perfil.sobrecarga": "Sobrecarga Progresiva (Peso Máximo)",

      "ajustes.titulo": "Ajustes",
      "ajustes.cuenta": "Cuenta",
      "ajustes.preferencias": "Preferencias",
      "ajustes.unidades": "Unidades",
      "ajustes.unidadesDesc": "Kilogramos (kg) / Libras (lbs)",
      "ajustes.idioma": "Idioma",
      "ajustes.tema": "Tema Visual",
      "ajustes.colorAcento": "Color de Resaltado",
      "ajustes.colorCuadros": "Colores Cuadros",
      "ajustes.fuente": "Tamaño de Fuente",
      "ajustes.datos": "Datos del Perfil",
      "ajustes.seguridad": "Contraseña y Seguridad",
      "ajustes.suscripcion": "Suscripción & Facturación",
      "ajustes.legal": "Información y Legal",
      "ajustes.terminos": "Términos y Condiciones",
      "ajustes.privacidad": "Políticas de Privacidad",
      "ajustes.cerrarSesion": "Cerrar Sesión",
      "ajustes.volver": "Volver",
    },
    en: {
      "nav.inicio": "Home",
      "nav.ejercicios": "Exercises",
      "nav.rutinas": "My Routines",
      "nav.entrenamiento": "Workout",
      "nav.guia": "Science Guide",
      "nav.admin": "Admin Panel",
      "nav.progreso": "My Progress",
      "nav.perfil": "Profile",
      "nav.configuracion": "Settings",
      "nav.premium": "Premium & Receipts",
      "nav.panelControl": "Control Panel",
      "nav.cerrarSesion": "Log out",
      "nav.iniciarSesion": "Log in",
      "nav.buscarPlaceholder": "Search exercises...",
      "nav.idioma": "Language",
      "nav.modoOscuro": "Dark Mode",
      "nav.modoClaro": "Light Mode",
      "nav.tamanoTexto": "Text Size",
      
      "ejercicios.titulo": "Exercise Catalogue",
      "ejercicios.subtitulo": "Explore guided exercises to build your routines and improve your workouts.",
      "ejercicios.disponibles": "exercises available",
      "ejercicios.volver": "Back to regions of",
      "ejercicios.region": "Region",
      "ejercicios.sinResultados": "No exercises found",
      "ejercicios.sinResultadosSub": "Try another search term or choose another muscle category.",
      "ejercicios.compuestos": "Compound Exercises (Multi-joint)",
      "ejercicios.aislamiento": "Isolation Exercises (Single-joint)",
      "ejercicios.verTecnica": "View Full Technique",
      "ejercicios.anadirARutina": "Add to Routine",
      "ejercicios.enRutina": "In Routine",
      "ejercicios.buscarPlaceholder": "Search exercise by name, muscle, grip, compound...",
      "ejercicios.filtrarTipo": "Filter by type:",
      "ejercicios.todos": "All",
      "ejercicios.compuestoBtn": "Compound",
      "ejercicios.aislamientoBtn": "Isolation",
      
      "cat.pecho": "CHEST",
      "cat.espalda": "BACK",
      "cat.piernas": "LEGS",
      "cat.hombros": "SHOULDERS",
      "cat.brazos": "ARMS",
      "cat.abdomen": "ABS",
      "cat.cardio": "CARDIO",

      "rutinas.titulo": "Weekly Routine Planner",
      "rutinas.subtitulo": "Organize your exercises by day, set sets, repetitions, and rest periods.",
      "rutinas.entrenar": "Workout",
      "rutinas.anadirEjercicio": "Add Exercise",
      "rutinas.sinEjercicios": "No exercises scheduled",
      "rutinas.series": "SETS",
      "rutinas.reps": "REPS",
      "rutinas.peso": "KG",

      "entrenamiento.titulo": "Workout Hub",
      "entrenamiento.subtitulo": "Create custom routines, organize them and run them in real-time with series tracking and biomechanics.",
      "entrenamiento.crearNueva": "+ Create New Routine",
      "entrenamiento.misRutinas": "My Created Routines",
      "entrenamiento.empezarRutina": "Start Workout",
      "entrenamiento.continuarRutina": "Resume Workout",

      "perfil.titulo": "My Profile & Preferences",
      "perfil.pestanaProgreso": "📊 My Progress",
      "perfil.datos": "Personal Data",
      "perfil.nombre": "Full Name",
      "perfil.genero": "Body Preference (Guides & Anatomy)",
      "perfil.hombre": "Men (Male Muscle Guides)",
      "perfil.mujer": "Women (Female Muscle Guides)",
      "perfil.guardar": "Save Changes",
      "perfil.accesibilidad": "Accessibility & Display",
      "perfil.tema": "App Theme",
      "perfil.fuente": "Font Size",
      "perfil.idioma": "System Language",
      "perfil.colorAcento": "Accent Color (Hover & Glow)",
      "perfil.fotosPeso": "Photos & Weight",
      "perfil.historial": "History",
      "perfil.sesiones": "Sessions",
      "perfil.minutos": "Minutes",
      "perfil.calorias": "Calories",
      "perfil.frecuencia": "Sessions / wk",
      "perfil.tendenciaPeso": "Body Weight Trend",
      "perfil.sobrecarga": "Progressive Overload (Max Weight)",

      "ajustes.titulo": "Settings",
      "ajustes.cuenta": "Account",
      "ajustes.preferencias": "Preferences",
      "ajustes.unidades": "Units",
      "ajustes.unidadesDesc": "Kilograms (kg) / Pounds (lbs)",
      "ajustes.idioma": "Language",
      "ajustes.tema": "Visual Theme",
      "ajustes.colorAcento": "Accent Color",
      "ajustes.fuente": "Font Size",
      "ajustes.datos": "Profile Details",
      "ajustes.seguridad": "Password & Security",
      "ajustes.suscripcion": "Subscription & Billing",
      "ajustes.legal": "About & Legal",
      "ajustes.terminos": "Terms & Conditions",
      "ajustes.privacidad": "Privacy Policy",
      "ajustes.cerrarSesion": "Log Out",
      "ajustes.volver": "Back",
    },
    pt: {
      "nav.inicio": "Início",
      "nav.ejercicios": "Exercícios",
      "nav.rutinas": "Minhas Rotinas",
      "nav.entrenamiento": "Treino",
      "nav.guia": "Guia Científico",
      "nav.admin": "Painel Admin",
      "nav.progreso": "Meu Progresso",
      "nav.perfil": "Perfil",
      "nav.configuracion": "Configurações",
      "nav.premium": "Premium & Recibos",
      "nav.panelControl": "Painel de Controle",
      "nav.cerrarSesion": "Sair",
      "nav.iniciarSesion": "Entrar",
      "nav.buscarPlaceholder": "Buscar exercícios...",
      "nav.idioma": "Idioma",
      "nav.modoOscuro": "Modo Escuro",
      "nav.modoClaro": "Modo Claro",
      "nav.tamanoTexto": "Tamanho do Texto",
      
      "ejercicios.titulo": "Catálogo de Exercícios",
      "ejercicios.subtitulo": "Explore exercícios guiados para montar suas rotinas e melhorar seus treinos.",
      "ejercicios.disponibles": "exercícios disponíveis",
      "ejercicios.volver": "Voltar às regiões de",
      "ejercicios.region": "Região",
      "ejercicios.sinResultados": "Nenhum exercício encontrado",
      "ejercicios.sinResultadosSub": "Tente outro termo de pesquisa ou selecione outra categoria.",
      "ejercicios.compuestos": "Exercícios Compostos (Multiarticulares)",
      "ejercicios.aislamiento": "Exercícios de Isolamento (Monoarticulares)",
      "ejercicios.verTecnica": "Ver Técnica Completa",
      "ejercicios.anadirARutina": "Adicionar à Rotina",
      "ejercicios.enRutina": "Na Rotina",
      "ejercicios.buscarPlaceholder": "Buscar exercício por nome, músculo, pegada...",
      "ejercicios.filtrarTipo": "Filtrar por tipo:",
      "ejercicios.todos": "Todos",
      "ejercicios.compuestoBtn": "Compostos",
      "ejercicios.aislamientoBtn": "Isolamento",
      
      "cat.pecho": "PEITO",
      "cat.espalda": "COSTAS",
      "cat.piernas": "PERNAS",
      "cat.hombros": "OMBROS",
      "cat.brazos": "BRAÇOS",
      "cat.abdomen": "ABDOMEN",
      "cat.cardio": "CARDIO",

      "rutinas.titulo": "Planejador Semanal de Rotinas",
      "rutinas.subtitulo": "Organize seus exercícios por dia, ajuste séries, repetições e descansos.",
      "rutinas.entrenar": "Treinar",
      "rutinas.anadirEjercicio": "Adicionar Exercício",
      "rutinas.sinEjercicios": "Sem exercícios agendados",
      "rutinas.series": "SÉR",
      "rutinas.reps": "REP",
      "rutinas.peso": "KG",

      "entrenamiento.titulo": "Centro de Treinamento",
      "entrenamiento.subtitulo": "Crie rotinas personalizadas, organize-as e execute-as em tempo real com cronômetro e biomecânica.",
      "entrenamiento.crearNueva": "+ Criar Nova Rotina",
      "entrenamiento.misRutinas": "Minhas Rotinas Criadas",
      "entrenamiento.empezarRutina": "Começar Treino",
      "entrenamiento.continuarRutina": "Continuar Treino",

      "perfil.titulo": "Meu Perfil & Preferências",
      "perfil.pestanaProgreso": "📊 Meu Progresso",
      "perfil.datos": "Dados Pessoais",
      "perfil.nombre": "Nome Completo",
      "perfil.genero": "Preferência Corporal (Guias & Anatomia)",
      "perfil.hombre": "Homem (Músculos Masculinos)",
      "perfil.mujer": "Mulher (Músculos Femininos)",
      "perfil.guardar": "Salvar Alterações",
      "perfil.accesibilidad": "Acessibilidade & Visualização",
      "perfil.tema": "Tema do Aplicativo",
      "perfil.fuente": "Tamanho da Fonte",
      "perfil.idioma": "Idioma do Sistema",
      "perfil.colorAcento": "Cor de Destaque (Hover & Sombras)",
      "perfil.fotosPeso": "Fotos e Peso",
      "perfil.historial": "Histórico",
      "perfil.sesiones": "Sessões",
      "perfil.minutos": "Minutos",
      "perfil.calorias": "Calorias",
      "perfil.frecuencia": "Sessões / sem",
      "perfil.tendenciaPeso": "Tendência de Peso",
      "perfil.sobrecarga": "Sobrecarga Progressiva",

      "ajustes.titulo": "Configurações",
      "ajustes.cuenta": "Conta",
      "ajustes.preferencias": "Preferências",
      "ajustes.unidades": "Unidades",
      "ajustes.unidadesDesc": "Quilogramas (kg) / Libras (lbs)",
      "ajustes.idioma": "Idioma",
      "ajustes.tema": "Tema Visual",
      "ajustes.colorAcento": "Cor de Destaque",
      "ajustes.fuente": "Tamanho da Fonte",
      "ajustes.datos": "Dados do Perfil",
      "ajustes.seguridad": "Senha e Segurança",
      "ajustes.suscripcion": "Assinatura & Cobrança",
      "ajustes.legal": "Informações e Legal",
      "ajustes.terminos": "Termos e Condições",
      "ajustes.privacidad": "Política de Privacidade",
      "ajustes.cerrarSesion": "Encerrar Sessão",
      "ajustes.volver": "Voltar",
    },
    zh: {
      "nav.inicio": "首页",
      "nav.ejercicios": "动作库",
      "nav.rutinas": "我的计划",
      "nav.entrenamiento": "训练",
      "nav.guia": "科学指南",
      "nav.admin": "管理面板",
      "nav.progreso": "我的进展",
      "nav.perfil": "个人资料",
      "nav.configuracion": "设置",
      "nav.premium": "会员与账单",
      "nav.panelControl": "控制面板",
      "nav.cerrarSesion": "退出登录",
      "nav.iniciarSesion": "登录",
      "nav.buscarPlaceholder": "搜索训练动作...",
      "nav.idioma": "语言",
      "nav.modoOscuro": "深色模式",
      "nav.modoClaro": "浅色模式",
      "nav.tamanoTexto": "字体大小",
      
      "ejercicios.titulo": "健身动作大全",
      "ejercicios.subtitulo": "浏览动作指导以制定您的专属训练方案。",
      "ejercicios.disponibles": "个可用动作",
      "ejercicios.volver": "返回到部位分类",
      "ejercicios.region": "目标部位",
      "ejercicios.sinResultados": "未找到相关动作",
      "ejercicios.sinResultadosSub": "请尝试其他关键词或选择其他肌肉分类。",
      "ejercicios.compuestos": "复合动作（多关节）",
      "ejercicios.aislamiento": "孤立动作（单关节）",
      "ejercicios.verTecnica": "查看完整技巧",
      "ejercicios.anadirARutina": "加入训练计划",
      "ejercicios.enRutina": "已加入计划",
      "ejercicios.buscarPlaceholder": "按名称、肌肉、握法搜索动作...",
      "ejercicios.filtrarTipo": "按类型筛选:",
      "ejercicios.todos": "全部",
      "ejercicios.compuestoBtn": "复合动作",
      "ejercicios.aislamientoBtn": "孤立动作",
      
      "cat.pecho": "胸部",
      "cat.espalda": "背部",
      "cat.piernas": "腿部",
      "cat.hombros": "肩部",
      "cat.brazos": "手臂",
      "cat.abdomen": "腹肌",
      "cat.cardio": "有氧",

      "rutinas.titulo": "每周训练计划表",
      "rutinas.subtitulo": "按星期安排动作、调整组数、次数及组间休息。",
      "rutinas.entrenar": "开始训练",
      "rutinas.anadirEjercicio": "添加动作",
      "rutinas.sinEjercicios": "暂无安排动作",
      "rutinas.series": "组数",
      "rutinas.reps": "次数",
      "rutinas.peso": "公斤",

      "entrenamiento.titulo": "训练中心",
      "entrenamiento.subtitulo": "创建并管理您的专属训练计划，实时进行动作记录与计时。",
      "entrenamiento.crearNueva": "+ 创建新计划",
      "entrenamiento.misRutinas": "我创建的计划",
      "entrenamiento.empezarRutina": "开始训练",
      "entrenamiento.continuarRutina": "继续训练",

      "perfil.titulo": "个人信息与设置",
      "perfil.pestanaProgreso": "📊 我的进展",
      "perfil.datos": "个人资料",
      "perfil.nombre": "姓名",
      "perfil.genero": "模型偏好（解剖指导）",
      "perfil.hombre": "男性肌肉图谱",
      "perfil.mujer": "女性肌肉图谱",
      "perfil.guardar": "保存修改",
      "perfil.accesibilidad": "无障碍与显示设置",
      "perfil.tema": "主题模式",
      "perfil.fuente": "字号大小",
      "perfil.idioma": "系统语言",
      "perfil.colorAcento": "高亮主题色（悬停与光晕）",
      "perfil.fotosPeso": "照片与体重",
      "perfil.historial": "训练记录",
      "perfil.sesiones": "训练次数",
      "perfil.minutos": "训练时长",
      "perfil.calorias": "消耗卡路里",
      "perfil.frecuencia": "每周频次",
      "perfil.tendenciaPeso": "体重变化趋势",
      "perfil.sobrecarga": "渐进负荷追踪",

      "ajustes.titulo": "设置",
      "ajustes.cuenta": "账户",
      "ajustes.preferencias": "偏好设置",
      "ajustes.unidades": "单位",
      "ajustes.unidadesDesc": "公斤 (kg) / 磅 (lbs)",
      "ajustes.idioma": "系统语言",
      "ajustes.tema": "主题模式",
      "ajustes.colorAcento": "高亮主题色",
      "ajustes.fuente": "字体大小",
      "ajustes.datos": "个人资料",
      "ajustes.seguridad": "密码与安全",
      "ajustes.suscripcion": "会员与订阅",
      "ajustes.legal": "法律与条款",
      "ajustes.terminos": "服务条款",
      "ajustes.privacidad": "隐私政策",
      "ajustes.cerrarSesion": "退出登录",
      "ajustes.volver": "返回",
    },
    qu: {
      "nav.inicio": "Qallariy",
      "nav.ejercicios": "Kallpachakuykuna",
      "nav.rutinas": "Ruranaykuna",
      "nav.entrenamiento": "Kallpanakuy",
      "nav.guia": "Yachay Ñan",
      "nav.admin": "Kamachina Pampa",
      "nav.progreso": "Ñawpariyniy",
      "nav.perfil": "Qhawaq",
      "nav.configuracion": "Allichaykuna",
      "nav.premium": "Qullqi Pata",
      "nav.panelControl": "Allichana",
      "nav.cerrarSesion": "Lluqsiy",
      "nav.iniciarSesion": "Yaykuy",
      "nav.buscarPlaceholder": "Maskay kallpachakuykunata...",
      "nav.idioma": "Simi",
      "nav.modoOscuro": "Laqha llimphi",
      "nav.modoClaro": "K'anchay llimphi",
      "nav.tamanoTexto": "Qillqapa sayaynin",
      
      "ejercicios.titulo": "Kallpachakuykunapa Qhawanan",
      "ejercicios.subtitulo": "Qhaway kurkuta kallpachanapaq ruraykunata sumaqta kawsanapaq.",
      "ejercicios.disponibles": "ruraykuna kachkan",
      "ejercicios.volver": "Kutipuy kay k'itikunaman",
      "ejercicios.region": "Kurku kiti",
      "ejercicios.sinResultados": "Manam ima tarisqachu",
      "ejercicios.sinResultadosSub": "Huk simita qillqay utaq huk kurku k'itita akllay.",
      "ejercicios.compuestos": "Tukuy Kurku Kallpachakuy (Achka moqokuna)",
      "ejercicios.aislamiento": "Ch'ulla Moqo Kallpachakuy",
      "ejercicios.verTecnica": "Allin Rurayta Qhaway",
      "ejercicios.anadirARutina": "Ruranaman Yapay",
      "ejercicios.enRutina": "Ruranapiñam",
      "ejercicios.buscarPlaceholder": "Maskay sutiwan, kurkuwan...",
      "ejercicios.filtrarTipo": "Akllay kaykunata:",
      "ejercicios.todos": "Llapallan",
      "ejercicios.compuestoBtn": "Tukuy Kurku",
      "ejercicios.aislamientoBtn": "Ch'ulla Moqo",
      
      "cat.pecho": "QHASQO",
      "cat.espalda": "WASA",
      "cat.piernas": "CHANKAKUNA",
      "cat.hombros": "RIKRA",
      "cat.brazos": "MARQ'A",
      "cat.abdomen": "WIKSA",
      "cat.cardio": "SUNQU KALLPA",

      "rutinas.titulo": "Qanchischaw Ruranakuna",
      "rutinas.subtitulo": "Sapa p'unchawpaq allichay ruranakunata, samay pachatawan.",
      "rutinas.entrenar": "Kallpachakuy",
      "rutinas.anadirEjercicio": "Rurayta Yapay",
      "rutinas.sinEjercicios": "Mana ruraykuna kanchu",
      "rutinas.series": "KUTI",
      "rutinas.reps": "YUPAY",
      "rutinas.peso": "KG",

      "entrenamiento.titulo": "Kallpanakuy Suyu",
      "entrenamiento.subtitulo": "Ruway, allichay rutinaykikunata chaymanta pachanpi kallpachakuy.",
      "entrenamiento.crearNueva": "+ Musuq Rutinata Ruway",
      "entrenamiento.misRutinas": "Ruwasqa Rutinaykuna",
      "entrenamiento.empezarRutina": "Kallpanakuyta Qallariy",
      "entrenamiento.continuarRutina": "Kallpanakuywan Qatiy",

      "perfil.titulo": "Ñuqa & Allichaykuna",
      "perfil.pestanaProgreso": "📊 Ñawpariyniy",
      "perfil.datos": "Suti & Riqsichikuy",
      "perfil.nombre": "Hunt'a Suti",
      "perfil.genero": "Kurkupa Riqsiynin",
      "perfil.hombre": "Qhari Kurku",
      "perfil.mujer": "Warmi Kurku",
      "perfil.guardar": "Waqaychay",
      "perfil.accesibilidad": "Sumaq Qhawana & Allichana",
      "perfil.tema": "Llimphin",
      "perfil.fuente": "Qillqapa Sayaynin",
      "perfil.idioma": "Llaqta Simi",
      "perfil.colorAcento": "Llimphi Akllana",
      "perfil.fotosPeso": "Rikch'akuna & Llasay",
      "perfil.historial": "Rurasqakuna",
      "perfil.sesiones": "Kutikuna",
      "perfil.minutos": "Minutukuna",
      "perfil.calorias": "Kaluriyakuna",
      "perfil.frecuencia": "Semana kutikuna",
      "perfil.tendenciaPeso": "Llasay Ñawpariy",
      "perfil.sobrecarga": "Kallpa Yapay",

      "ajustes.titulo": "Allichaykuna",
      "ajustes.cuenta": "Riqsichikuy",
      "ajustes.preferencias": "Akllanakuna",
      "ajustes.unidades": "Tupukuna",
      "ajustes.unidadesDesc": "Kilogramos (kg) / Libras (lbs)",
      "ajustes.idioma": "Llaqta Simi",
      "ajustes.tema": "Llimphin",
      "ajustes.colorAcento": "Llimphi Akllana",
      "ajustes.fuente": "Qillqapa Sayaynin",
      "ajustes.datos": "Suti & Riqsichikuy",
      "ajustes.seguridad": "Yaykuna & Waqaychay",
      "ajustes.suscripcion": "Qullqi Pata",
      "ajustes.legal": "Yachaykuna",
      "ajustes.terminos": "Kamachikuykuna",
      "ajustes.privacidad": "Pakasqa Yachay",
      "ajustes.cerrarSesion": "Lluqsiy",
      "ajustes.volver": "Kutipuy",
    },
    ay: {
      "nav.inicio": "Qallta",
      "nav.ejercicios": "Ch'amañchaña",
      "nav.rutinas": "Lurañanaka",
      "nav.entrenamiento": "Chʼamañchaña",
      "nav.guia": "Yatiña Yatichawi",
      "nav.admin": "Kamachiña Uta",
      "nav.progreso": "Nayrartawi",
      "nav.perfil": "Nayax",
      "nav.configuracion": "Askichawinaka",
      "nav.premium": "Qullqi Pata",
      "nav.panelControl": "Askichawi",
      "nav.cerrarSesion": "Mistuña",
      "nav.iniciarSesion": "Mantantaña",
      "nav.buscarPlaceholder": "Thaqhaña lurañanaka...",
      "nav.idioma": "Aru",
      "nav.modoOscuro": "Ch'amaka Samka",
      "nav.modoClaro": "Qhana Samka",
      "nav.tamanoTexto": "Qillqa Jach'a",
      
      "ejercicios.titulo": "Janch Ch'amañchañanaka",
      "ejercicios.subtitulo": "Uñjam lurañanaka janchima suma k'umaraptañataki.",
      "ejercicios.disponibles": "lurañanaka utji",
      "ejercicios.volver": "Kutt'aña aka tuqiru",
      "ejercicios.region": "Janchi tuqi",
      "ejercicios.sinResultados": "Janiw jikxataskiti",
      "ejercicios.sinResultadosSub": "Yant'am yaqha arumpi jan ukax yaqha janchituqimpi.",
      "ejercicios.compuestos": "Taqpacha Janchi Ch'ama (Walja moqonaka)",
      "ejercicios.aislamiento": "Mayaki Moqo Ch'ama",
      "ejercicios.verTecnica": "Suma Lurañ Uñjaña",
      "ejercicios.anadirARutina": "Lurañaru Yapaña",
      "ejercicios.enRutina": "Lurañankiwa",
      "ejercicios.buscarPlaceholder": "Thaqhaña sutimpi, janchimpi...",
      "ejercicios.filtrarTipo": "Akllawi kasta:",
      "ejercicios.todos": "Taqpacha",
      "ejercicios.compuestoBtn": "Taqpacha",
      "ejercicios.aislamientoBtn": "Mayaki",
      
      "cat.pecho": "CHIKU",
      "cat.espalda": "JIKHANI",
      "cat.piernas": "CHARANAKA",
      "cat.hombros": "KALLACHI",
      "cat.brazos": "AMPARA",
      "cat.abdomen": "PURAKA",
      "cat.cardio": "CHUYT'A CH'AMA",

      "rutinas.titulo": "Semana Luraña Wakichawi",
      "rutinas.subtitulo": "Urumpi urumpi wakichañani lurañanaka, samart'awinakata.",
      "rutinas.entrenar": "Ch'amañchaña",
      "rutinas.anadirEjercicio": "Luraña Yapaña",
      "rutinas.sinEjercicios": "Janiw lurañanakax utjkiti",
      "rutinas.series": "KUTI",
      "rutinas.reps": "JAKHU",
      "rutinas.peso": "KG",

      "entrenamiento.titulo": "Chʼamañchaña Uta",
      "entrenamiento.subtitulo": "Luraña, wakichaña rutinanakama ukat pachanpa chʼamañchaña relojampi.",
      "entrenamiento.crearNueva": "+ Machaqa Rutina Luraña",
      "entrenamiento.misRutinas": "Lurat Rutinanakaja",
      "entrenamiento.empezarRutina": "Chʼamañchaña Qalltaña",
      "entrenamiento.continuarRutina": "Chʼamañchañampi Sarantaña",

      "perfil.titulo": "Nayax & Askichawinaka",
      "perfil.pestanaProgreso": "📊 Nayrartawi",
      "perfil.datos": "Suti & Uñt'ayasiña",
      "perfil.nombre": "Taqpacha Suti",
      "perfil.genero": "Janchi Uñacht'ayawi",
      "perfil.hombre": "Chacha Janchi",
      "perfil.mujer": "Warmi Janchi",
      "perfil.guardar": "Imantaña",
      "perfil.accesibilidad": "Suma Uñjaña & Askichawi",
      "perfil.tema": "Samka",
      "perfil.fuente": "Qillqa Jach'aptayaña",
      "perfil.idioma": "Pacha Aru",
      "perfil.colorAcento": "Samka Akllawi (Llamkt'awi & Ch'ijlla)",
      "perfil.fotosPeso": "Jamunaka & Jathi",
      "perfil.historial": "Lurañanaka",
      "perfil.sesiones": "Kutita",
      "perfil.minutos": "Minutunaka",
      "perfil.calorias": "Kaluriyanaka",
      "perfil.frecuencia": "Semana kutinaka",
      "perfil.tendenciaPeso": "Jathi Nayraru Sarawi",
      "perfil.sobrecarga": "Ch'ama Jach'aptayaña",

      "ajustes.titulo": "Askichawinaka",
      "ajustes.cuenta": "Uñt'ayasiña",
      "ajustes.preferencias": "Askichawinaka",
      "ajustes.unidades": "Tupunaka",
      "ajustes.unidadesDesc": "Kilogramos (kg) / Libras (lbs)",
      "ajustes.idioma": "Pacha Aru",
      "ajustes.tema": "Samka",
      "ajustes.colorAcento": "Samka Akllawi",
      "ajustes.fuente": "Qillqa Jach'a",
      "ajustes.datos": "Suti & Uñt'ayasiña",
      "ajustes.seguridad": "Ch'amaka & Imantaña",
      "ajustes.suscripcion": "Qullqi Pata",
      "ajustes.legal": "Yatiñanaka",
      "ajustes.terminos": "Kamachinaka",
      "ajustes.privacidad": "Imat Yatiñanaka",
      "ajustes.cerrarSesion": "Mistuña",
      "ajustes.volver": "Kutt'aña",
    }
  };

  constructor() {
    // Aplicación inmediata en carga inicial
    this.aplicarTema(this.temaActual());
    this.aplicarTamanoFuente(this.tamanoFuente());
    this.aplicarColorAcento(this.colorAcento());
    this.aplicarColorCuadros(this.colorCuadros());

    effect(() => {
      this.aplicarTema(this.temaActual());
      this.aplicarColorCuadros(this.colorCuadros()); // Re-aplicar cuando cambie el tema
    });

    effect(() => {
      this.aplicarTamanoFuente(this.tamanoFuente());
    });

    effect(() => {
      this.guardarIdioma(this.idiomaActual());
    });

    effect(() => {
      this.aplicarColorAcento(this.colorAcento());
    });

    effect(() => {
      this.aplicarColorCuadros(this.colorCuadros());
    });
  }

  t(clave: string): string {
    const lang = this.idiomaActual();
    const dicc = this.traducciones[lang] || this.traducciones.es;
    return dicc[clave] || this.traducciones.es[clave] || clave;
  }

  setIdioma(nuevoIdioma: IdiomaCode): void {
    this.idiomaActual.set(nuevoIdioma);
  }

  toggleTema(): void {
    const nuevo = this.temaActual() === 'dark' ? 'light' : 'dark';
    this.setTema(nuevo);
  }

  setTema(nuevoTema: TemaMode): void {
    this.temaActual.set(nuevoTema);
    try {
      localStorage.setItem('fitness_theme', nuevoTema);
    } catch (_) {}
  }

  setColorAcento(nuevoColorId: string): void {
    this.colorAcento.set(nuevoColorId);
    try {
      localStorage.setItem('fitness_accent_color', nuevoColorId);
    } catch (_) {}
  }

  setColorCuadros(nuevoColorId: string): void {
    this.colorCuadros.set(nuevoColorId);
    try {
      localStorage.setItem('fitness_cuadros_color', nuevoColorId);
    } catch (_) {}
  }

  setTamanoFuente(nuevoTamano: TamanoFuente): void {
    this.tamanoFuente.set(nuevoTamano);
    try {
      localStorage.setItem('fitness_font_size', nuevoTamano);
    } catch (_) {}
  }

  setUnidadPeso(nuevaUnidad: UnidadesPeso): void {
    this.unidadPeso.set(nuevaUnidad);
    try {
      localStorage.setItem('fitness_weight_unit', nuevaUnidad);
    } catch (_) {}
  }

  aumentarTamano(): void {
    const actual = this.tamanoFuente();
    if (actual === 'pequeno') this.setTamanoFuente('normal');
    else if (actual === 'normal') this.setTamanoFuente('grande');
    else if (actual === 'grande') this.setTamanoFuente('extragrande');
  }

  disminuirTamano(): void {
    const actual = this.tamanoFuente();
    if (actual === 'extragrande') this.setTamanoFuente('grande');
    else if (actual === 'grande') this.setTamanoFuente('normal');
    else if (actual === 'normal') this.setTamanoFuente('pequeno');
  }

  private aplicarTema(tema: TemaMode): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (tema === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
    } else {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
    }
  }

  private aplicarColorAcento(colorId: string): void {
    if (typeof document === 'undefined') return;
    const opcion = this.coloresAcento.find(c => c.id === colorId) || this.coloresAcento[0];
    const root = document.documentElement;
    root.style.setProperty('--primary-color', opcion.colorHex);
    root.style.setProperty('--primary-hover', opcion.hoverHex);
    root.style.setProperty('--primary-glow', opcion.glowHex);
    root.style.setProperty('--primary-glow-subtle', opcion.glowSubtleHex);
    root.style.setProperty('--accent-green', opcion.colorHex);
    root.style.setProperty('--accent-green-glow', opcion.glowHex);
  }

  private aplicarColorCuadros(colorId: string): void {
    if (typeof document === 'undefined') return;
    const opcion = this.coloresCuadros.find(c => c.id === colorId) || this.coloresCuadros[0];
    const root = document.documentElement;
    if (opcion.id === 'default') {
      root.style.removeProperty('--bg-cuadros');
    } else {
      const isDark = this.temaActual() === 'dark';
      root.style.setProperty('--bg-cuadros', isDark ? opcion.bgOscuro : opcion.bgClaro);
    }
  }

  private aplicarTamanoFuente(tamano: TamanoFuente): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    let scale = '1';
    if (tamano === 'pequeno') scale = '0.88';
    if (tamano === 'normal') scale = '1';
    if (tamano === 'grande') scale = '1.15';
    if (tamano === 'extragrande') scale = '1.30';
    
    root.style.setProperty('--app-font-scale', scale);
    root.setAttribute('data-font-size', tamano);
  }

  private guardarIdioma(lang: IdiomaCode): void {
    try {
      localStorage.setItem('fitness_lang', lang);
    } catch (_) {}
  }

  private obtenerIdiomaInicial(): IdiomaCode {
    try {
      const guardado = localStorage.getItem('fitness_lang') as IdiomaCode;
      if (guardado && ['es', 'en', 'pt', 'zh', 'qu', 'ay'].includes(guardado)) {
        return guardado;
      }
    } catch (_) {}
    return 'es';
  }

  private obtenerTemaInicial(): TemaMode {
    try {
      const guardado = localStorage.getItem('fitness_theme') as TemaMode;
      if (guardado === 'light' || guardado === 'dark') {
        return guardado;
      }
    } catch (_) {}
    return 'dark';
  }

  private obtenerColorAcentoInicial(): string {
    try {
      if (typeof window !== 'undefined') {
        const guardado = localStorage.getItem('fitness_accent_color');
        if (guardado) return guardado;
      }
    } catch (_) {}
    return 'predeterminado';
  }

  private obtenerColorCuadrosInicial(): string {
    try {
      if (typeof window !== 'undefined') {
        const guardado = localStorage.getItem('fitness_cuadros_color');
        if (guardado) return guardado;
      }
    } catch (_) {}
    return 'default';
  }

  private obtenerTamanoInicial(): TamanoFuente {
    try {
      const guardado = localStorage.getItem('fitness_font_size') as TamanoFuente;
      if (guardado === 'pequeno' || guardado === 'normal' || guardado === 'grande' || guardado === 'extragrande') {
        return guardado;
      }
    } catch (_) {}
    return 'normal';
  }

  private obtenerUnidadInicial(): UnidadesPeso {
    try {
      const guardado = localStorage.getItem('fitness_weight_unit') as UnidadesPeso;
      if (guardado === 'kg' || guardado === 'lbs') {
        return guardado;
      }
    } catch (_) {}
    return 'kg';
  }
}
