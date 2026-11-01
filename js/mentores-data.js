/**
 * Curated Mentor Profiles Dataset (24 Mentors)
 * Tripartite Alliance: Mobile Legends: Bang Bang × USIL Carrera de Marketing × Club M4L
 * Matches test/fixtures/sample_mentors.json specifications.
 */

const MENTORES_DATA = [
  {
    id: "M4L-01",
    name: "Mateo Valdivia Ramos",
    career: "Marketing",
    cycle: "8vo ciclo",
    specialty: "Estrategia Digital",
    m4lMember: true,
    m4lRole: "Director de Estrategia M4L",
    availability: "disponible",
    skills: ["Meta Ads", "Funnels", "Campañas Virales", "Storytelling"],
    bio: "Especialista en estructurar campañas con métricas de engagement alto para Fase 1."
  },
  {
    id: "M4L-02",
    name: "Camila Arévalo Mendoza",
    career: "Arte y Diseño Empresarial",
    cycle: "7mo ciclo",
    specialty: "Branding & Concept Art",
    m4lMember: true,
    m4lRole: "Líder Creativa M4L",
    availability: "disponible",
    skills: ["Concept Art", "Ilustración Digital", "Paleta de Color", "Motivos Peruanos"],
    bio: "Te ayudo a fusionar elementos de la cultura peruana y el estilo visual de MLBB para un diseño ganador."
  },
  {
    id: "M4L-03",
    name: "Diego Sebastián Huamán",
    career: "Marketing",
    cycle: "9no ciclo",
    specialty: "TikTok & Growth Marketing",
    m4lMember: true,
    m4lRole: "Growth Manager M4L",
    availability: "disponible",
    skills: ["Algoritmo TikTok", "Reels virales", "Edición CapCut", "Hooks"],
    bio: "Más de 500k vistas acumuladas en campañas universitarias. Maximizamos los likes de tu escuadrón."
  },
  {
    id: "M4L-04",
    name: "Rodrigo Alonso Alva",
    career: "Ingeniería de Software",
    cycle: "8vo ciclo",
    specialty: "Esports & Metagame",
    m4lMember: false,
    m4lRole: "Capitán Selección Esports USIL",
    availability: "disponible",
    skills: ["Draft Pick MLBB", "Macrogame", "Rotaciones", "Análisis de Parche"],
    bio: "Jugador Mythical Glory con experiencia en torneos competitivos. Optimizo el draft de tu equipo para la arena 5v5."
  },
  {
    id: "M4L-05",
    name: "Valeria Sofía Quispe",
    career: "Comunicaciones y Publicidad",
    cycle: "8vo ciclo",
    specialty: "Liderazgo & Pitch",
    m4lMember: true,
    m4lRole: "Coordinadora General M4L",
    availability: "disponible",
    skills: ["Pitching ante jurados", "Oratoria", "Gestión de Equipo", "Relaciones Públicas"],
    bio: "Aseguro que la presentación de tu equipo ante el jurado calificador destaque sobre todas las demás."
  },
  {
    id: "M4L-06",
    name: "Álvaro Barrenechea",
    career: "Marketing",
    cycle: "7mo ciclo",
    specialty: "Estrategia Digital",
    m4lMember: true,
    m4lRole: "Líder de Analytics M4L",
    availability: "disponible",
    skills: ["Métricas de Interacción", "Benchmarking", "Social Media Planning"],
    bio: "Monitoreo en tiempo real el rendimiento de tu contenido para asegurar el pase a semifinales."
  },
  {
    id: "M4L-07",
    name: "Nicole Luciana Cárdenas",
    career: "Diseño y Animación Digital",
    cycle: "9no ciclo",
    specialty: "Branding & Concept Art",
    m4lMember: true,
    m4lRole: "Diseñadora Senior M4L",
    availability: "disponible",
    skills: ["Modelado 2D/3D", "Texturizado", "Identidad Visual", "Splash Art"],
    bio: "Enfoque minucioso en la anatomía de skins y acabados visuales de calidad Moonton."
  },
  {
    id: "M4L-08",
    name: "Joaquín Tapia Salazar",
    career: "Administración y Emprendimiento",
    cycle: "8vo ciclo",
    specialty: "Liderazgo & Pitch",
    m4lMember: true,
    m4lRole: "Vicepresidente M4L",
    availability: "disponible",
    skills: ["Team Building", "Plan de Trabajo", "Negociación", "Disciplina"],
    bio: "Organizo los tiempos y roles de los 5 integrantes para que rindan al 100% sin estrés."
  },
  {
    id: "M4L-09",
    name: "Andrea Paola Benites",
    career: "Marketing",
    cycle: "6to ciclo",
    specialty: "TikTok & Growth Marketing",
    m4lMember: true,
    m4lRole: "Content Creator M4L",
    availability: "disponible",
    skills: ["Trends", "Micro-influencers escolares", "Copywriting", "Hashtags"],
    bio: "Conectamos con comunidades escolares de Lima para viralizar la propuesta de skin."
  },
  {
    id: "M4L-10",
    name: "Carlos Daniel Zegarra",
    career: "Ingeniería de Sistemas",
    cycle: "9no ciclo",
    specialty: "Esports & Metagame",
    m4lMember: false,
    m4lRole: "Analista Táctico Gaming USIL",
    availability: "disponible",
    skills: ["Sinergia de Héroes", "Control de Objetivos (Lord/Tortuga)", "Scouting"],
    bio: "Preparo estrategias tácticas personalizadas según las fortalezas mecánicas de cada escolar."
  },
  {
    id: "M4L-11",
    name: "Lucía Fernanda Morales",
    career: "Marketing",
    cycle: "10mo ciclo",
    specialty: "Estrategia Digital",
    m4lMember: true,
    m4lRole: "Directora de Campañas M4L",
    availability: "disponible",
    skills: ["Omnicanalidad", "Performance Marketing", "Conversión de Votos"],
    bio: "Egresando de la carrera con visión integral para maximizar alcance orgánico y pagado."
  },
  {
    id: "M4L-12",
    name: "Sebastián Ponce Delgado",
    career: "Arte y Diseño Empresarial",
    cycle: "8vo ciclo",
    specialty: "Branding & Concept Art",
    m4lMember: false,
    m4lRole: "Ilustrador Freelance",
    availability: "disponible",
    skills: ["Ilustración Fantasía", "Cultura Andina", "Concept Art", "Photoshop"],
    bio: "Diseñemos una skin que homenajee nuestras raíces peruanas con la energía estética de Mobile Legends: Bang Bang."
  },
  {
    id: "M4L-13",
    name: "Milagros Estefanía Chumpitaz",
    career: "Comunicaciones",
    cycle: "7mo ciclo",
    specialty: "TikTok & Growth Marketing",
    m4lMember: true,
    m4lRole: "Community Lead M4L",
    availability: "disponible",
    skills: ["Community Management", "Dinámicas Interactivas", "Encuestas IG"],
    bio: "Movilizo a comunidades escolares y grupos de fans para multiplicar las interacciones del post."
  },
  {
    id: "M4L-14",
    name: "Gonzalo Matías Romero",
    career: "Marketing",
    cycle: "8vo ciclo",
    specialty: "Esports & Metagame",
    m4lMember: true,
    m4lRole: "Coordinador Esports M4L",
    availability: "disponible",
    skills: ["Coaching", "Manejo de Tilt", "Comunicación en Partida (Shotcalling)"],
    bio: "Enseño al equipo a mantener la calma bajo presión en el escenario presencial del campus."
  },
  {
    id: "M4L-15",
    name: "Ariana Belén Chávez",
    career: "Administración Hotelera y Turismo",
    cycle: "8vo ciclo",
    specialty: "Liderazgo & Pitch",
    m4lMember: true,
    m4lRole: "Relaciones Institucionales M4L",
    availability: "disponible",
    skills: ["Logística de Eventos", "Protocolo", "Acompañamiento a Padres"],
    bio: "Coordino todos los detalles para que la llegada y estancia del equipo en Campus USIL sea impecable."
  },
  {
    id: "M4L-16",
    name: "Renzo Paolo Tello",
    career: "Marketing",
    cycle: "9no ciclo",
    specialty: "Estrategia Digital",
    m4lMember: true,
    m4lRole: "Estratega Senior M4L",
    availability: "disponible",
    skills: ["Embajadores de Marca", "Activaciones en Colegios", "Viral Loops"],
    bio: "Conectamos tu colegio con la barra oficial para llenar el auditorio de 80 personas."
  },
  {
    id: "M4L-17",
    name: "Daniela Ximena Flores",
    career: "Diseño Gráfico Publicitario",
    cycle: "7mo ciclo",
    specialty: "Branding & Concept Art",
    m4lMember: true,
    m4lRole: "Diseñadora M4L",
    availability: "disponible",
    skills: ["Tipografía", "Composición Visual", "Renders 2D", "Mockups"],
    bio: "Preparamos láminas de presentación profesionales para deslumbrar al jurado calificador."
  },
  {
    id: "M4L-18",
    name: "Gabriel Ignacio Ríos",
    career: "Negocios Internacionales",
    cycle: "8vo ciclo",
    specialty: "Liderazgo & Pitch",
    m4lMember: true,
    m4lRole: "Líder de Alianzas M4L",
    availability: "disponible",
    skills: ["Negociación", "Plan de Negocios de Skin", "Viabilidad Comercial"],
    bio: "Demostraremos al jurado el potencial comercial de la skin como un producto real de Moonton."
  },
  {
    id: "M4L-19",
    name: "Flavia Cristina Paredes",
    career: "Marketing",
    cycle: "7mo ciclo",
    specialty: "TikTok & Growth Marketing",
    m4lMember: true,
    m4lRole: "Content Strategist M4L",
    availability: "disponible",
    skills: ["Reels virales", "Audio Branding", "Retos interactivos"],
    bio: "Creamos micro-videos dinámicos del proceso de dibujo de la skin para enganchar a la audiencia."
  },
  {
    id: "M4L-20",
    name: "Bryan Alexis Villegas",
    career: "Ingeniería de Software",
    cycle: "9no ciclo",
    specialty: "Esports & Metagame",
    m4lMember: false,
    m4lRole: "Ex-caster de torneos Mobile Legends",
    availability: "disponible",
    skills: ["Lectura de rivales", "Posicionamiento en Teamfights", "Ban phase"],
    bio: "Aseguro que los 5 jugadores conozcan exactamente cómo neutralizar las composiciones enemigas."
  },
  {
    id: "M4L-21",
    name: "Stefany Lorena Ortiz",
    career: "Marketing",
    cycle: "8vo ciclo",
    specialty: "Estrategia Digital",
    m4lMember: true,
    m4lRole: "M4L",
    availability: "asignado",
    squadName: "Escuadrón Fénix USIL",
    skills: ["Marketing de Contenidos", "Emailing", "Campañas Escolares"],
    bio: "Asignada con escuadra escolar en entrenamiento intensivo."
  },
  {
    id: "M4L-22",
    name: "Leonardo David Salazar",
    career: "Artes Escénicas y Comunicación",
    cycle: "7mo ciclo",
    specialty: "Liderazgo & Pitch",
    m4lMember: false,
    m4lRole: "Coordinador de Vocería",
    availability: "asignado",
    squadName: "Los Inmortales MLBB",
    skills: ["Manejo de Escenario", "Venciendo el Pánico Escénico"],
    bio: "Entrenando a su equipo para desenvolverse con carisma en la tarima presencial."
  },
  {
    id: "M4L-23",
    name: "Jimena Rocío Navarro",
    career: "Marketing",
    cycle: "9no ciclo",
    specialty: "TikTok & Growth Marketing",
    m4lMember: true,
    m4lRole: "M4L",
    availability: "completo",
    squadName: "Imperio Inca Gaming",
    skills: ["Campañas virales con micro-influencers"],
    bio: "Escuadra completa y registrada con campaña en marcha."
  },
  {
    id: "M4L-24",
    name: "Kevin Anthony Luna",
    career: "Diseño y Comunicación",
    cycle: "8vo ciclo",
    specialty: "Branding & Concept Art",
    m4lMember: true,
    m4lRole: "M4L",
    availability: "completo",
    squadName: "Titanes de la Costa",
    skills: ["Ilustración conceptual y modelado de accesorios"],
    bio: "Escuadra completa con lámina de skin finalizada."
  }
];

if (typeof window !== 'undefined') {
  window.MENTORES_DATA = MENTORES_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MENTORES_DATA };
}
