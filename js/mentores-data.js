/**
 * ============================================================================
 * MARKETING GAMING CHALLENGE 2026 — OFFICIAL M4L SPECIALTY PROFILES (v6.2)
 * Iniciativa académica y de eSports organizada por la Carrera de Marketing de la
 * Universidad San Ignacio de Loyola (USIL) con el soporte estudiantil del Club
 * Marketing for Leaders (M4L), en colaboración promocional con VIZTA PTE. LTD.
 * para el videojuego Mobile Legends: Bang Bang (desarrollado por Moonton Games).
 * ============================================================================
 */

const MENTORES_DATA = [
  {
    id: "M4L-ESP-01",
    name: "Mentor Especialista en Branding & Concepto",
    career: "Carrera de Marketing USIL / Club M4L",
    cycle: "Asignación Oficial M4L",
    specialty: "Branding & Concepto",
    m4lMember: true,
    m4lRole: "Especialidad Oficial Club M4L",
    availability: "disponible",
    skills: ["Identidad de Marca Perú/USIL", "Storytelling de la Skin", "Propuesta de Valor", "Concepto de Marca"],
    bio: "Guía en identidad de marca Perú/USIL y storytelling de la Skin."
  },
  {
    id: "M4L-ESP-02",
    name: "Mentor Especialista en Growth & Viralización",
    career: "Carrera de Marketing USIL / Club M4L",
    cycle: "Asignación Oficial M4L",
    specialty: "Growth & Viralización",
    m4lMember: true,
    m4lRole: "Especialidad Oficial Club M4L",
    availability: "disponible",
    skills: ["Alcance Orgánico", "Viralización en Redes", "#USILMarketingGamingMLBB", "TikTok / IG / FB"],
    bio: "Estrategia digital para maximizar alcance orgánico y likes con #USILMarketingGamingMLBB."
  },
  {
    id: "M4L-ESP-03",
    name: "Mentor Especialista en Dirección de Arte & Skins",
    career: "Arte y Diseño Empresarial / Club M4L",
    cycle: "Asignación Oficial M4L",
    specialty: "Dirección de Arte & Skins",
    m4lMember: true,
    m4lRole: "Especialidad Oficial Club M4L",
    availability: "disponible",
    skills: ["Asesoría Visual", "Conceptualización Estética", "Diseño de Personaje", "Identidad Visual MLBB"],
    bio: "Asesoría visual y conceptualización estética del personaje."
  },
  {
    id: "M4L-ESP-04",
    name: "Mentor Especialista en Estrategia Esports & Pitch",
    career: "Comunidad Competitiva USIL / Club M4L",
    cycle: "Asignación Oficial M4L",
    specialty: "Estrategia Esports & Pitch",
    m4lMember: true,
    m4lRole: "Especialidad Oficial Club M4L",
    availability: "disponible",
    skills: ["Organización Táctica 5v5", "Presentación del Proyecto", "Pitch Estratégico", "Liderazgo de Squad"],
    bio: "Organización táctica del squad 5v5 y presentación del proyecto."
  }
];

if (typeof window !== 'undefined') {
  window.MENTORES_DATA = MENTORES_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MENTORES_DATA };
}
