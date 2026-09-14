export interface ProvinciaData {
  [provincia: string]: string[];
}

export interface DepartamentoData {
  [departamento: string]: ProvinciaData;
}

export const UBIGEO_DATA: DepartamentoData = {
  "AMAZONAS": {
    "Chachapoyas": ["Chachapoyas", "Asunción", "Balsas", "Leimebamba", "Magdalena"],
    "Bagua": ["Bagua", "Aramango", "Copallin", "El Parco", "Imaza"],
    "Utcubamba": ["Bagua Grande", "Cajaruro", "Cumba", "El Milagro", "Jamalca"]
  },
  "ÁNCASH": {
    "Huaraz": ["Huaraz", "Cochabamba", "Colcabamba", "Huanchay", "Independencia"],
    "Santa": ["Chimbote", "Cáceres del Perú", "Coishco", "Macafe", "Moro", "Nepeña", "Nuevo Chimbote", "Samanco", "Santa"]
  },
  "APURÍMAC": {
    "Abancay": ["Abancay", "Chacoche", "Circa", "Curahuasi", "Huanipaca", "Lambrama", "Pichirhua", "San Pedro de Cachora", "Tamburco"],
    "Andahuaylas": ["Andahuaylas", "Andarapa", "Chiara", "Huancarama", "Huancaray", "Huayana", "Kishuara", "Pacobamba", "Pacucha", "Pampachiri", "Pomacocha", "San Antonio de Cachi", "San Jerónimo", "San Miguel de Chaccrampa", "Santa María de Chicmo", "Talavera", "Tumay Huaraca", "Turpo"]
  },
  "AREQUIPA": {
    "Arequipa": ["Arequipa", "Alto Selva Alegre", "Cayma", "Cerro Colorado", "Characato", "Chiguata", "Jacobo Hunter", "La Joya", "Mariano Melgar", "Miraflores", "Mollebaya", "Paucarpata", "Pocsi", "Polobaya", "Quequeña", "Sabandia", "Sachaca", "San Juan de Siguas", "San Juan de Tarucani", "Santa Isabel de Siguas", "Santa Rita de Siguas", "Socabaya", "Tiabaya", "Uchumayo", "Vitor", "Yanahuara", "Yarabamba", "Yura"],
    "Caylloma": ["Chivay", "Cabanaconde", "Callalli", "Caylloma", "Coporaque", "Huambo", "Huanca", "Ichupampa", "Lari", "Lluta", "Maca", "Madrigal", "San Antonio de Chuca", "Sibayo", "Tapay", "Tisco", "Tuti", "Yanque", "Majes"]
  },
  "AYACUCHO": {
    "Huamanga": ["Ayacucho", "Acocro", "Acos Vinchos", "Carmen Alto", "Chiara", "Ocros", "Pacaycasa", "Quinua", "San José de Ticllas", "San Juan Bautista", "Santiago de Pischa", "Socos", "Tambillo", "Vinchos", "Jesús Nazareno"],
    "Huanta": ["Huanta", "Ayahuanco", "Huamanguilla", "Iguaín", "Luricocha", "Santillana", "Sivia", "Llochegua", "Canayre", "Uchuraccay", "Pucacolpa"]
  },
  "CAJAMARCA": {
    "Cajamarca": ["Cajamarca", "Asunción", "Chetilla", "Cospán", "Encañada", "Jesús", "Llacanora", "Los Baños del Inca", "Magdalena", "Matara", "Namora", "San Juan"],
    "Jaén": ["Jaén", "Bellavista", "Chontali", "Colasay", "Huabal", "Las Pirias", "Pomahuaca", "Pucará", "Sallique", "San Felipe", "San José del Alto", "Santa Rosa"]
  },
  "CALLAO": {
    "Callao": ["Callao", "Bellavista", "Carmen de la Legua Reynoso", "La Perla", "La Punta", "Ventanilla", "Mi Perú"]
  },
  "CUSCO": {
    "Cusco": ["Cusco", "Ccorca", "Poroy", "San Jerónimo", "San Sebastián", "Santiago", "Saylla", "Wanchaq"],
    "Urubamba": ["Urubamba", "Chinchero", "Huayllabamba", "Machupicchu", "Maras", "Ollantaytambo", "Yucay"]
  },
  "HUANCAVELICA": {
    "Huancavelica": ["Huancavelica", "Acobambilla", "Acoria", "Conayca", "Cuenca", "Huachocolpa", "Huayllahuara", "Izcuchaca", "Laria", "Manta", "Mariscal Cáceres", "Moya", "Nuevo Occoro", "Palca", "Pilchaca", "Vilca", "Yauli", "Ascensión"]
  },
  "HUÁNUCO": {
    "Huánuco": ["Huánuco", "Amarilis", "Chinchao", "Churubamba", "Margos", "Quisqui (Kichki)", "San Francisco de Cayrán", "San Pedro de Chaulán", "Santa María del Valle", "Yarumayo", "Pillco Marca", "Yacus"]
  },
  "ICA": {
    "Ica": ["Ica", "La Tinguiña", "Los Aquijes", "Ocucaje", "Pachacutec", "Parcona", "Pueblo Nuevo", "Salas", "San José de los Molinos", "San Juan Bautista", "Santiago", "Subtanjalla", "Tate", "Yauca del Rosario"],
    "Chincha": ["Chincha Alta", "Alto Larán", "Chavín", "Chincha Baja", "El Carmen", "Grocio Prado", "Pueblo Nuevo", "San Juan de Yanac", "San Pedro de Huacarpana", "Sunampe", "Tambo de Mora"]
  },
  "JUNÍN": {
    "Huancayo": ["Huancayo", "Carhuacallanca", "Chacapampa", "Chicche", "Chilca", "Chongos Alto", "Chupuro", "Colca", "Cullhuas", "El Tambo", "Huacrapuquio", "Hualhuas", "Huancán", "Huasicancha", "Huayucachi", "Ingenio", "Pariahuanca", "Pilcomayo", "Pucará", "Quichuay", "Quilcas", "San Agustín", "San Jerónimo de Tunan", "Saño", "Sapallanga", "Sicaya", "Santo Domingo de Acobamba", "Viques"]
  },
  "LA LIBERTAD": {
    "Trujillo": ["Trujillo", "El Porvenir", "Florencia de Mora", "Huanchaco", "La Esperanza", "Laredo", "Moche", "Poroto", "Salaverry", "Simbal", "Victor Larco Herrera"]
  },
  "LAMBAYEQUE": {
    "Chiclayo": ["Chiclayo", "Chongoyape", "Eten", "Eten Puerto", "José Leonardo Ortiz", "La Victoria", "Lagunas", "Monsefú", "Nueva Arica", "Oyotún", "Picsi", "Pimentel", "Reque", "Santa Rosa", "Saña", "Cayaltí", "Patapo", "Pomalca", "Pucalá", "Tumán"]
  },
  "LIMA": {
    "Lima": [
      "Lima", "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos", "Cieneguilla", "Comas",
      "El Agustino", "Independencia", "Jesús María", "La Molina", "La Victoria", "Lince", "Los Olivos",
      "Lurigancho", "Lurín", "Magdalena del Mar", "Pueblo Libre", "Miraflores", "Pachacámac", "Pucusana",
      "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac", "San Bartolo", "San Borja", "San Isidro",
      "San Juan de Lurigancho", "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel",
      "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador",
      "Villa María del Triunfo"
    ],
    "Cañete": ["San Vicente de Cañete", "Asia", "Calango", "Cerro Azul", "Chilca", "Coayllo", "Imperial", "Lunahuaná", "Mala", "Nuevo Imperial", "Pacarán", "Quilmaná", "San Antonio", "San Luis", "Santa Cruz de Flores", "Zúñiga"],
    "Huaral": ["Huaral", "Atavillos Alto", "Atavillos Bajo", "Aucallama", "Chancay", "Ihuarí", "Lampían", "Pacaraos", "Santa Cruz de Andamarca", "Sumbilca", "San Miguel de Acos"],
    "Huaura": ["Huacho", "Ambar", "Caleta de Carquín", "Checras", "Hualmay", "Huaura", "Leoncio Prado", "Paccho", "Santa Leonor", "Santa María", "Sayán", "Vegueta"]
  },
  "LORETO": {
    "Maynas": ["Iquitos", "Alto Nanay", "Fernando Lores", "Indiana", "Las Amazonas", "Mazan", "Napo", "Punchana", "Putumayo", "Torres Causana", "Belén", "San Juan Bautista"]
  },
  "MADRE DE DIOS": {
    "Tambopata": ["Tambopata", "Inambari", "Las Piedras", "Laberinto"]
  },
  "MOQUEGUA": {
    "Mariscal Nieto": ["Moquegua", "Carumas", "Cuchumbaya", "Samegua", "San Cristóbal", "Torata"]
  },
  "PASCO": {
    "Pasco": ["Chaupimarca", "Huachón", "Huariaca", "Huayllay", "Ninacaca", "Pallanchacra", "Paucartambo", "San Francisco de Asís de Yarusyacán", "Simón Bolívar", "Ticlacayán", "Tinyahuarco", "Vicco", "Yanacancha"]
  },
  "PIURA": {
    "Piura": ["Piura", "Castilla", "Catacaos", "Cura Mori", "El Tallán", "La Arena", "La Unión", "Las Lomas", "Tambo Grande", "Veintiséis de Octubre"]
  },
  "PUNO": {
    "Puno": ["Puno", "Acora", "Amantaní", "Atuncolla", "Capachica", "Chucuito", "Coata", "Huata", "Mañazo", "Paucarcolla", "Pichacani", "Plateria", "San Antonio", "Tiquillaca", "Vilque"]
  },
  "SAN MARTÍN": {
    "Moyobamba": ["Moyobamba", "Calzada", "Habana", "Jepelacio", "Soritor", "Yantaló"],
    "San Martín": ["Tarapoto", "Alberto Leveau", "Cacatachi", "Chazuta", "Chipurana", "El Porvenir", "Huimbayoc", "Juan Guerra", "La Banda de Shilcayo", "Morales", "Papaplaya", "San Antonio", "Sauce", "Shapaja"]
  },
  "TACNA": {
    "Tacna": ["Tacna", "Alto de la Alianza", "Calana", "Ciudad Nueva", "Coronel Gregorio Albarracín Lanchipa", "Inclán", "Pachía", "Palca", "Pocollay", "Sama", "La Yarada Los Palos"]
  },
  "TUMBES": {
    "Tumbes": ["Tumbes", "Corrales", "La Cruz", "Pampas de Hospital", "San Jacinto", "San Juan de la Virgen"]
  },
  "UCAYALI": {
    "Coronel Portillo": ["Callería", "Campoverde", "Iparia", "Masisea", "Yarinacocha", "Nueva Requena", "Manantay"]
  }
};

export const ZONAS_LIMA = {
  NORTE: [
    "Ancón", "Santa Rosa", "Carabayllo", "Puente Piedra", "Comas", 
    "Los Olivos", "San Martín de Porres", "Independencia"
  ],
  SUR: [
    "San Juan de Miraflores", "Villa María del Triunfo", "Villa El Salvador",
    "Pachacámac", "Lurín", "Punta Hermosa", "Punta Negra", "San Bartolo",
    "Santa María del Mar", "Pucusana", "Chorrillos"
  ],
  ESTE: [
    "San Juan de Lurigancho", "El Agustino", "Ate", "Santa Anita",
    "La Molina", "Cieneguilla", "Lurigancho", "Chaclacayo"
  ],
  CENTRO: [
    "Lima", "Rímac", "Breña", "La Victoria", "Lince", "San Isidro",
    "Miraflores", "Surquillo", "San Borja", "Santiago de Surco",
    "Barranco", "Pueblo Libre", "San Miguel", "Magdalena del Mar",
    "Jesús María", "San Luis"
  ],
  CALLAO: [
    "Callao", "Bellavista", "Carmen de la Legua Reynoso", "La Perla", "La Punta", "Ventanilla", "Mi Perú"
  ]
};

export function obtenerZonaPorDistrito(distrito: string): string {
  if (!distrito) return 'CENTRO'; // Por defecto
  
  for (const [zona, distritos] of Object.entries(ZONAS_LIMA)) {
    if (distritos.includes(distrito)) {
      return zona;
    }
  }
  
  // Si es un distrito de provincia u otro que no mapeamos, 
  // le daremos un fallback, por ejemplo CENTRO o NORTE
  return 'CENTRO'; 
}

export function determinarZonaPedido(direccion: any): string {
  if (!direccion || !direccion.direccionExacta) return 'CENTRO';
  
  const partes = direccion.direccionExacta.split(',');
  if (partes.length < 2) {
    return obtenerZonaPorDistrito(direccion.distrito);
  }
  
  const departamento = partes[0].trim().toUpperCase();
  const distrito = partes.length > 2 ? partes[2].split('-')[0].trim() : direccion.distrito;
  
  // Si no es ni LIMA ni CALLAO, entonces es provincia externa
  if (departamento !== 'LIMA' && departamento !== 'CALLAO') {
    return 'Fuera de Lima';
  }
  
  // Si es Lima o Callao, obtenemos la zona local
  return obtenerZonaPorDistrito(distrito);
}
