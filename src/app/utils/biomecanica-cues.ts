export function obtenerIndicacionesCientificas(grupoMuscular: string, nombreEjercicio: string): string {
  const grupo = grupoMuscular.toUpperCase();
  const nombre = nombreEjercicio.toLowerCase();

  if (grupo === 'PECHO') {
    if (nombre.includes('inclinado')) {
      return 'Posición: Banco regulado a 30° (máximo 45°) para enfocar la porción clavicular del pectoral y reducir el torque en el deltoides anterior. Biomecánica: Retracción y depresión escapular completa contra el banco. Baja controladamente (fase excéntrica de 3-4 segundos) alineando los codos a 45° respecto al torso. No permitas rebote; detén el peso a ras de pecho antes de un empuje concéntrico explosivo sin bloquear los codos al final.';
    }
    if (nombre.includes('plano') || nombre.includes('banca')) {
      return 'Posición: Banco plano a 0°. Biomecánica: Retracción escapular rígida con una ligera curvatura lumbar fisiológica (leg drive activo empujando con talones). Desciende la barra/mancuernas hacia el esternón bajo con codos a 45° respecto al cuerpo. Aplica una cadencia excéntrica de 3 segundos, sostén la contracción peak abajo y empuja verticalmente de forma explosiva.';
    }
    return 'Posición: Ajuste de poleas o máquina vertical. Biomecánica: Junta las escápulas y mantén los hombros deprimidos para maximizar la aducción de brazos. Mantén una flexión constante de codo (10-15°). Realiza una excéntrica de 3 segundos abriendo la caja torácica y exhala en la contracción peak contrayendo activamente el pecho al centro.';
  }

  if (grupo === 'ESPALDA') {
    if (nombre.includes('lumbar') || nombre.includes('peso muerto')) {
      return 'Posición: Columna en posición neutra. Biomecánica: Inicia la bisagra de cadera manteniendo la barra pegada a las espinillas. Empuja el suelo con las piernas en el tirón inicial. Mantén el core rígido (maniobra Valsalva) y evita hiper-extender la espalda alta en el bloqueo final. Desciende de forma controlada en 3 segundos.';
    }
    if (nombre.includes('remo')) {
      return 'Posición: Torso inclinado a 45° o 90° con soporte lumbar/pecho. Biomecánica: Tracción iniciada estrictamente por la depresión y retracción escapular. Imagina jalar con los codos dirigiéndolos hacia tu cadera, no hacia el techo. Realiza una fase excéntrica lenta (3 segundos) para elongar los dorsales y sostén la contracción máxima atrás durante 1 segundo.';
    }
    return 'Posición: Sentado con soporte de rodillas. Biomecánica: Jala inclinando levemente el torso hacia atrás (10-15°). Lleva la barra/maneral hacia la parte superior del pecho deprimiendo las escápulas. Fase excéntrica controlada de 3-4 segundos estirando los brazos por completo arriba para estirar el dorsal.';
  }

  if (grupo === 'PIERNAS') {
    if (nombre.includes('sentadilla')) {
      return 'Posición: Pies al ancho de los hombros con rotación de 15-30°. Biomecánica: Realiza presión intraabdominal activa para bloquear el core. Desciende iniciando el movimiento desde la cadera y rodillas a la vez, bajando lento en 4 segundos hasta romper el paralelo (flexión >90°). Mantén las rodillas alineadas con las puntas de los pies y sube empujando con toda la planta.';
    }
    if (nombre.includes('gluteo') || nombre.includes('abductor')) {
      return 'Posición: Tronco ligeramente inclinado al frente para alinear fibras del glúteo. Biomecánica: Realiza la extensión o abducción de cadera de forma fluida. Detén 1.5 segundos en la máxima contracción peak. Controla la fase de retorno (excéntrica de 3 segundos) evitando balanceos en la columna.';
    }
    if (nombre.includes('femoral') || nombre.includes('isquios')) {
      return 'Posición: Camilla acostado o sentado. Biomecánica: Mantén la pelvis pegada al soporte. Dobla la rodilla contrayendo los isquiotibiales con potencia. Controla la fase de estiramiento (excéntrica de 3-4 segundos) estirando casi por completo la pierna sin soltar la tensión muscular.';
    }
    return 'Posición: Prensa o máquina de extensión. Biomecánica: Baja la plataforma controladamente en 3 segundos hasta un ángulo de 90° en rodillas. Empuja con fuerza con el metatarso y talón sin hiperextender ni bloquear las rodillas arriba. Rodillas firmes sin valgo.';
  }

  if (grupo === 'HOMBROS') {
    if (nombre.includes('press')) {
      return 'Posición: Sentado con respaldo vertical. Biomecánica: Mantén los codos en el plano escapular (ligeramente adelantados, ~30° respecto a los hombros). Baja controladamente (3 segundos) hasta que los puños estén a la altura de las orejas/mentón y empuja verticalmente con fuerza sobre la cabeza.';
    }
    return 'Posición: De pie o sentado inclinado. Biomecánica: Eleva los brazos en el plano escapular (30° al frente, no laterales puros) apuntando con los codos y el dedo meñique hacia arriba. Mantén los hombros deprimidos para anular el trapecio. Desciende de forma controlada en 3 segundos.';
  }

  if (grupo === 'BRAZOS') {
    if (nombre.includes('antebrazo') || nombre.includes('muñeca') || nombre.includes('agarre') || nombre.includes('martillo') || nombre.includes('invertido') || nombre.includes('farmer') || nombre.includes('granjero')) {
      return 'Posición: Antebrazos apoyados en banco o de pie con codos estables. Biomecánica: Realiza la flexión o extensión de muñeca aislando el movimiento sin oscilar los codos. En curls martillo o invertidos, mantén el agarre firme para reclutar el braquiorradial y los extensores del antebrazo. Cadencia lenta y controlada (3 segundos) en la fase excéntrica.';
    }
    if (nombre.includes('bicep') || nombre.includes('curl')) {
      return 'Posición: De pie o sentado. Biomecánica: Mantén los codos completamente fijos a los costados del cuerpo. Flexiona los codos levantando el peso y añade una supinación activa de muñeca al final de la subida para contraer al máximo el bíceps. Fase de descenso controlada (3 segundos) hasta estirar el brazo.';
    }
    return 'Posición: Codos fijos al torso o sobre la cabeza. Biomecánica: Realiza la extensión de codo empujando el peso de forma potente, sosteniendo la contracción 1 segundo abajo. Retorna lento en 3 segundos (excéntrica), sin separar los codos ni balancear el cuerpo.';
  }

  if (grupo === 'ABDOMEN' || nombre.includes('crunch') || nombre.includes('abdominal')) {
    return 'Posición: Acostado o suspendido. Biomecánica: Realiza una retroversión pélvica activa ("esconde el coxis") y contrae el abdomen flexionando el tronco. Exhala todo el aire en la contracción arriba para maximizar el reclutamiento del recto abdominal. Desciende lento en 3 segundos estirando el abdomen.';
  }

  return 'Posición: Técnica neutra. Biomecánica: Realiza el movimiento en un rango completo de recorrido con una fase excéntrica controlada de 3 segundos y fase concéntrica explosiva. Mantén el core estable y respira de forma controlada.';
}

export function obtenerEjemploAyuda(grupoMuscular: string, nombreEjercicio: string): string {
  const grupo = grupoMuscular.toUpperCase();
  const nombre = nombreEjercicio.toLowerCase();

  let cadencia = 'Cadencia sugerida: 3-0-1-1 [3s bajada, 0s pausa abajo, 1s subida, 1s contracción]';
  let nota = 'Nota: Prioriza la técnica sobre el peso de trabajo.';

  if (nombre.includes('sentadilla') || nombre.includes('prensa')) {
    cadencia = 'Cadencia sugerida: 4-1-1-0 [4s excéntrica lenta, 1s de pausa profunda, 1s de subida explosiva]';
    nota = 'Tip: Usa calzado de suela plana o coloca discos pequeños bajo tus talones si tienes poca movilidad de tobillo.';
  } else if (grupo === 'PECHO') {
    cadencia = 'Cadencia sugerida: 3-1-1-1 [3s bajada lenta, 1s de pausa isométrica a ras de pecho, 1s de empuje potente]';
    nota = 'Tip: Mantener el pecho expandido y hombros atrás durante todo el rango te ayudará a aislar el pectoral.';
  } else if (grupo === 'ESPALDA') {
    cadencia = 'Cadencia sugerida: 3-0-1-2 [3s estiramiento controlado, 1s tirón explosivo, 2s contracción peak sostenida]';
    nota = 'Tip: Si te fallan las manos antes que la espalda, puedes usar straps de agarre para aislar el dorsal.';
  } else if (grupo === 'BRAZOS') {
    cadencia = 'Cadencia sugerida: 3-0-1-1 [3s excéntrica lenta para maximizar micro-roturas, 1s contracción peak]';
    nota = 'Tip: Evita usar el balanceo del cuerpo (inercia). Mantén los codos pegados.';
  }

  return `${cadencia} | ${nota}`;
}
