import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface Pregunta {
  id: string;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
}

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  esPremium: boolean;
  contenidoDetallado: string;
}

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cursos.html',
  styleUrl: './cursos.scss'
})
export class CursosComponent {
  readonly auth = inject(AuthService);

  // Secciones de la Guía Científica con lenguaje simple, ejemplos prácticos y PubMed
  readonly cursos: Curso[] = [
    {
      id: 'basico',
      titulo: 'Sección Básica: Pilares Sencillos del Entrenamiento',
      descripcion: 'Aprende cómo prepararte, cómo hacer los ejercicios y cómo descansar. Responde el Reto Científico al final de esta sección para ganar 7 días de membresía PREMIUM gratis.',
      icono: '🏋️‍♂️',
      esPremium: false,
      contenidoDetallado: `
        <div class="modulo-contenido-completo">
          <div class="tema-seccion">
            <h4>1.1 Calentamiento Sencillo (Prepara tus articulaciones)</h4>
            <p>Para calentar antes de levantar pesas, <strong>no sirve de mucho correr 20 minutos en la trotadora</strong>. Eso solo te cansa y gasta la energía que necesitas para los ejercicios. Lo correcto es preparar los músculos y articulaciones específicos que vas a usar ese día:</p>
            <ul>
              <li><strong>Si te toca entrenar Pecho/Hombros:</strong> Haz giros suaves de brazos en círculos, rotaciones de hombros hacia adentro y afuera, y flexiones ligeras contra la pared.</li>
              <li><strong>Si te toca entrenar Piernas:</strong> Haz zancadas (desplantes) caminando sin peso, giros suaves de cadera y sentadillas solo con tu cuerpo bajando lento.</li>
            </ul>
            <p class="nota-cientifica">💡 <em><strong>Regla de oro:</strong> Dedica de 5 a 10 minutos a mover tus articulaciones y haz siempre 2 series con muy poco peso antes de empezar tu primer ejercicio pesado. Esto evitará lesiones graves en tus articulaciones.</em></p>
            <div class="referencia-cientifica">
              <a href="https://pubmed.ncbi.nlm.nih.gov/20145762/" target="_blank" class="pubmed-link-btn">
                🔬 Estudio PubMed: McCrary et al. (2015) - Efectos del Calentamiento Dinámico en la Fuerza
              </a>
            </div>
          </div>

          <div class="tema-seccion">
            <h4>1.2 Recorrido Completo vs. Cargar muy Pesado a Medias</h4>
            <p>Hacer los ejercicios a medias (por ejemplo, bajar solo un poquito en las sentadillas o en el press de banca) es uno de los mayores errores. En el gimnasio, <strong>el músculo crece mucho más cuando se estira por completo cargando peso y controlando la bajada</strong>.</p>
            <p>Es infinitamente mejor bajar el peso de forma controlada en <strong>3 segundos</strong> haciendo el recorrido completo (bajar todo lo que permita tu articulación sin dolor), que poner un peso exagerado y moverlo solo unos centímetros con mala postura. El peso excesivo con técnica incompleta solo daña tus tendones y no hace crecer tus músculos.</p>
            <div class="referencia-cientifica">
              <a href="https://pubmed.ncbi.nlm.nih.gov/32030110/" target="_blank" class="pubmed-link-btn">
                🔬 Evidencia Científica: Schoenfeld et al. (2020) - Recorrido Completo vs. Parcial para el Crecimiento
              </a>
            </div>
          </div>

          <div class="tema-seccion">
            <h4>1.3 Descanso (El músculo crece cuando duermes, no cuando entrenas)</h4>
            <p>Cuando levantas pesas, no estás construyendo músculo; en realidad estás rompiendo sus fibras. El verdadero crecimiento y la recuperación ocurren cuando descansas, especialmente durante el <strong>sueño profundo</strong>.</p>
            <p>Si duermes menos de 7 horas al día, tu cuerpo produce una hormona llamada <strong>cortisol (la hormona del estrés)</strong>, la cual destruye tu masa muscular y facilita que acumules grasa en el abdomen. Intenta dormir entre 7 y 8 horas diarias y no entrenes el mismo músculo dos días seguidos; dale al menos 48 horas de descanso.</p>
            <div class="referencia-cientifica">
              <a href="https://pubmed.ncbi.nlm.nih.gov/24435447/" target="_blank" class="pubmed-link-btn">
                🔬 Evidencia Científica: Dattilo et al. (2011) - Falta de Sueño y Desgaste Muscular
              </a>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'hipertrofia',
      titulo: 'Sección Avanzada: Evitar el "Volumen Basura" y la Carga Progresiva',
      descripcion: 'Entiende por qué hacer demasiadas series es malo si eres natural y cómo progresar de verdad en fuerza.',
      icono: '🧬',
      esPremium: true,
      contenidoDetallado: `
        <div class="modulo-contenido-completo">
          <div class="tema-seccion">
            <h4>2.1 ¿Qué es el "Volumen Basura" en Personas Naturales?</h4>
            <p>Hacer 20, 25 o 30 series de ejercicios para un solo músculo en un mismo día es lo que se conoce como <strong>volumen basura</strong>. Si entrenas de forma natural (sin fármacos), tu cuerpo tiene un límite de recuperación.</p>
            <p>Hacer series de más solo genera un cansancio extremo del que tu cuerpo no podrá recuperarse, impidiendo que ganes músculo. Lo ideal para alguien natural es realizar entre <strong>6 y 10 series intensas por músculo en cada entrenamiento</strong> (un máximo de 10 a 20 series a la semana).</p>
          </div>
          
          <div class="tema-seccion">
            <h4>2.2 La Carga Progresiva (Hacerte más fuerte con el tiempo)</h4>
            <p>La única forma de que tu cuerpo cambie es obligándolo a adaptarse. Si siempre levantas el mismo peso con las mismas repeticiones durante meses, tus músculos no crecerán porque ya se acostumbraron.</p>
            <p><strong>Carga progresiva</strong> significa que en cada entrenamiento intentes mejorar un poco. Por ejemplo: si hoy levantas 20 kg para 8 repeticiones, el próximo entrenamiento intenta hacer 9 repeticiones con el mismo peso, o sube a 21 kg para 8 repeticiones. Apunta tu progreso y supérate poco a poco.</p>
            <div class="referencia-cientifica">
              <a href="https://pubmed.ncbi.nlm.nih.gov/27102426/" target="_blank" class="pubmed-link-btn">
                🔬 Evidencia Científica: Schoenfeld et al. (2016) - Frecuencia de Entrenamiento y Volumen Semanal
              </a>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'nutricion',
      titulo: 'Sección Avanzada: Nutrición y Ejemplo de Cálculo (Caso Práctico 70 kg)',
      descripcion: 'Aprende a calcular tus calorías y macronutrientes fácilmente con un ejemplo de peso real.',
      icono: '🍎',
      esPremium: true,
      contenidoDetallado: `
        <div class="modulo-contenido-completo">
          <div class="tema-seccion">
            <h4>3.1 Calorías para "Volumen Limpio" y "Definición"</h4>
            <p>Para cambiar tu cuerpo debes ajustar las calorías que consumes frente a tu gasto diario:</p>
            <ul>
              <li><strong>Volumen Limpio (Ganar músculo con poca grasa):</strong> Debes comer un poco más de lo que gastas. Suma unas 300 calorías a tu gasto diario.</li>
              <li><strong>Definición (Perder grasa cuidando tu fuerza):</strong> Debes comer menos de lo que gastas. Resta unas 400 calorías a tu gasto diario.</li>
            </ul>
          </div>
          
          <div class="tema-seccion">
            <h4>3.2 Ejemplo de Cálculo Práctico para una Persona de 70 kg</h4>
            <p>Imaginemos que pesas <strong>70 kg</strong> y tu gasto diario para mantener tu peso es de <strong>2200 kcal</strong>:</p>
            
            <div class="tabla-ejemplo-calculo">
              <h5>1. Distribución de Macronutrientes Diarios:</h5>
              <ul>
                <li><strong>Proteína (2g por kilo):</strong> 70 kg x 2g = <strong>140 gramos al día</strong> (Equivale a 560 kcal).</li>
                <li><strong>Grasa Saludable (1g por kilo):</strong> 70 kg x 1g = <strong>70 gramos al día</strong> (Equivale a 630 kcal).</li>
              </ul>
              
              <h5>2. Ajuste de Carbohidratos según tu Meta:</h5>
              <ul>
                <li><strong>En Etapa de Volumen Limpio (Meta de 2500 kcal):</strong> Restamos la proteína y grasas (2500 - 560 - 630 = 1310 kcal). Dividimos entre 4 (las calorías de 1g de carbohidrato): Necesitas <strong>327g de carbohidratos al día</strong>.</li>
                <li><strong>En Etapa de Definición (Meta de 1800 kcal):</strong> Restamos la proteína y grasas (1800 - 560 - 630 = 610 kcal). Dividimos entre 4: Necesitas <strong>152g de carbohidratos al día</strong>.</li>
              </ul>
            </div>
            
            <div class="referencia-cientifica">
              <a href="https://pubmed.ncbi.nlm.nih.gov/29182451/" target="_blank" class="pubmed-link-btn">
                🔬 Evidencia Científica: Morton et al. (2018) - Meta-análisis sobre Proteínas e Hipertrofia
              </a>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'powerlifting',
      titulo: 'Sección Avanzada: Intensidad del Esfuerzo y Repeticiones en Reserva (RIR)',
      descripcion: 'Aprende a medir qué tan cerca estás del límite sin lesionarte.',
      icono: '⚡',
      esPremium: true,
      contenidoDetallado: `
        <div class="modulo-contenido-completo">
          <div class="tema-seccion">
            <h4>4.1 Repeticiones en Reserva (RIR) Explicado Fácil</h4>
            <p>No es necesario que en todas tus series termines tan cansado que no puedas hacer ni una repetición más (fallo muscular). Eso desgasta demasiado tu cuerpo. Es mejor autorregular la intensidad usando el <strong>RIR (Repeticiones en Reserva)</strong>:</p>
            <ul>
              <li><strong>RIR 0:</strong> Fallo muscular absoluto (no podías hacer ninguna repetición más).</li>
              <li><strong>RIR 1:</strong> Terminas la serie sabiendo que podías hacer exactamente 1 repetición más antes de fallar.</li>
              <li><strong>RIR 2:</strong> Terminas la serie sabiendo que podías hacer exactamente 2 repeticiones más.</li>
            </ul>
            <p class="nota-cientifica">💡 <em><strong>Recomendación:</strong> Mantén la mayoría de tus series entre un RIR 1 y RIR 3. Es el rango ideal para que tu músculo crezca con fuerza sin desgastar tu sistema nervioso ni lesionar tus articulaciones.</em></p>
            <div class="referencia-cientifica">
              <a href="https://pubmed.ncbi.nlm.nih.gov/27247245/" target="_blank" class="pubmed-link-btn">
                🔬 Evidencia Científica: Helms et al. (2016) - Escala de Esfuerzo RPE Basada en Repeticiones en Reserva
              </a>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'lesiones',
      titulo: 'Sección Avanzada: Biomecánica Sencilla (Protección de tu Espalda)',
      descripcion: 'Protege tu zona lumbar en ejercicios pesados usando la respiración de bracing.',
      icono: '🛡️',
      esPremium: true,
      contenidoDetallado: `
        <div class="modulo-contenido-completo">
          <div class="tema-seccion">
            <h4>5.1 La Técnica de Bracing (Apretón Abdominal)</h4>
            <p>Cuando haces ejercicios pesados de pie como la Sentadilla o el Peso Muerto, tu columna soporta una gran presión. Para evitar hernias o dolores lumbares, debes crear una "faja natural de aire" en tu abdomen usando la técnica de <strong>bracing</strong>:</p>
            <ol>
              <li>Antes de empezar a bajar en el ejercicio, toma aire profundo <strong>inflando tu abdomen</strong> (imagina empujar tu ombligo hacia afuera, no subas los hombros).</li>
              <li>Aprieta tu abdomen con mucha fuerza, como si te fueran a dar un golpe en el estómago.</li>
              <li>Mantén ese apretón durante la bajada y la subida del ejercicio. Suelta el aire solo cuando hayas terminado la repetición arriba.</li>
            </ol>
            <p class="nota-cientifica">💡 <em>Esta presión interna actúa como un escudo protector para tus discos lumbares, manteniéndolos alineados y estables.</em></p>
            <div class="referencia-cientifica">
              <a href="https://pubmed.ncbi.nlm.nih.gov/11710970/" target="_blank" class="pubmed-link-btn">
                🔬 Evidencia Científica: McGill et al. (2001) - Estabilidad Lumbar y Presión Intraabdominal
              </a>
            </div>
          </div>
        </div>
      `
    }
  ];

  // Banco de preguntas del Reto Científico
  readonly preguntasBasicas: Pregunta[] = [
    {
      id: 'preg1',
      pregunta: '1. ¿Cuál es el principal objetivo de calentar de forma dinámica antes de levantar pesas?',
      opciones: [
        'Cansar el músculo antes de empezar con los ejercicios reales.',
        'Lubricar las articulaciones específicas a usar, elevar la temperatura y evitar desgarros.',
        'Estirar de forma estática manteniendo el músculo inmóvil durante 1 minuto.'
      ],
      respuestaCorrecta: 1
    },
    {
      id: 'preg2',
      pregunta: '2. ¿Por qué es mejor hacer el recorrido completo controlado (bajar todo) con menos peso que cargar pesado a medias?',
      opciones: [
        'Porque permite presumir más peso ante otros usuarios.',
        'Porque el estiramiento del músculo bajo carga (fase de bajada controlada) es lo que más estimula el crecimiento.',
        'Hacer la mitad del recorrido da exactamente el mismo resultado muscular.'
      ],
      respuestaCorrecta: 1
    },
    {
      id: 'preg3',
      pregunta: '3. ¿Cuándo ocurre realmente el crecimiento de la masa muscular?',
      opciones: [
        'Durante las horas de descanso profundo y sueño reparador.',
        'En los segundos que dura el levantamiento de la pesa.',
        'Mientras realizamos fuerza e hinchamos el músculo en el entrenamiento.'
      ],
      respuestaCorrecta: 0
    },
    {
      id: 'preg4',
      pregunta: '4. ¿Qué consecuencia hormonal tiene no dormir lo suficiente (menos de 7 horas diarias)?',
      opciones: [
        'Aumenta el rendimiento y acelera la recuperación de fuerza.',
        'Eleva los niveles de cortisol (estrés), lo cual destruye músculo y facilita acumular grasa en el abdomen.',
        'No tiene ningún efecto en la composición corporal ni muscular.'
      ],
      respuestaCorrecta: 1
    },
    {
      id: 'preg5',
      pregunta: '5. ¿Cuánto descanso se recomienda dejar como mínimo para un músculo antes de volver a entrenarlo?',
      opciones: [
        'Al menos 12 horas.',
        'Al menos 48 horas para permitir la correcta reparación de las fibras musculares.',
        '7 días completos de descanso obligatorio por músculo.'
      ],
      respuestaCorrecta: 1
    }
  ];

  // Estado del progreso
  examenAprobado = signal<boolean>(localStorage.getItem('fitness_examen_aprobado') === 'true');

  // Estado del examen en curso (Cisco style)
  examenActivo = signal<boolean>(false);
  respuestasUsuario = signal<{ [key: string]: number }>({});
  examenResultado = signal<{ aprobado: boolean; nota: number; total: number; enviado: boolean } | null>(null);

  readonly respondidasCount = computed(() => Object.keys(this.respuestasUsuario()).length);

  constructor() {
    effect(() => {
      localStorage.setItem('fitness_examen_aprobado', String(this.examenAprobado()));
    });
  }

  // Lógica del Examen
  abrirExamen(): void {
    this.examenActivo.set(true);
    this.respuestasUsuario.set({});
    this.examenResultado.set(null);
  }

  cerrarExamen(): void {
    this.examenActivo.set(false);
    this.respuestasUsuario.set({});
    this.examenResultado.set(null);
  }

  seleccionarRespuesta(preguntaId: string, opcionIndex: number): void {
    const respuestas = { ...this.respuestasUsuario() };
    respuestas[preguntaId] = opcionIndex;
    this.respuestasUsuario.set(respuestas);
  }

  enviarExamen(): void {
    const respuestas = this.respuestasUsuario();
    let correctasCount = 0;

    this.preguntasBasicas.forEach(p => {
      if (respuestas[p.id] === p.respuestaCorrecta) {
        correctasCount++;
      }
    });

    const notaPorcentaje = (correctasCount / this.preguntasBasicas.length) * 100;
    const aprobado = notaPorcentaje >= 80; // Aprobado con 80% (4 de 5 correctas)

    this.examenResultado.set({
      aprobado,
      nota: correctasCount,
      total: this.preguntasBasicas.length,
      enviado: true
    });

    if (aprobado) {
      this.examenAprobado.set(true);
      // Activar 7 días premium
      this.auth.activarPremiumTemporal(7);
    }
  }

  reiniciarProgreso(): void {
    this.examenAprobado.set(false);
    this.auth.cambiarPlan('GRATIS');
    localStorage.removeItem('fitness_premium_expires_at');
    this.auth.premiumExpiresAt.set(null);
    this.cerrarExamen();
  }

  obtenerDiasRestantesPremium(): number {
    const exp = this.auth.premiumExpiresAt();
    if (!exp) return 0;
    const diff = new Date(exp).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  obtenerFechaFormateadaExpiracion(): string {
    const exp = this.auth.premiumExpiresAt();
    if (!exp) return '';
    return new Date(exp).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
