/**
 * ============================================================================
 * MARKETING GAMING CHALLENGE 2026 — OFFICIAL BASES MODAL CONTROLLER (v6)
 * Sincronizado estrictamente con:
 * `Bases_Oficiales_Marketing_Gaming_Challenge_USIL_MLBB (V3).docx`
 * ============================================================================
 */

const BASES_LEGALES_CONTENT = {
  title: 'BASES OFICIALES DE LA COMPETENCIA INTERESCOLAR — MARKETING GAMING CHALLENGE 2026 (V3)',
  version: 'Versión 3.0 Oficial — Alianza Carrera de Marketing USIL x Mobile Legends: Bang Bang x Club M4L',
  downloadUrl: 'public/assets/docs/Bases_Oficiales_Marketing_Gaming_Challenge_2026.pdf',
  clauses: [
    {
      heading: 'Cláusula 1: Organización y Objetivo del Certamen',
      body: 'El "MARKETING GAMING CHALLENGE" es una competencia nacional intercolegial co-organizada por la Carrera de Marketing de la Facultad de Ciencias Empresariales de la Universidad San Ignacio de Loyola (USIL), Mobile Legends: Bang Bang (Moonton Games) y el Club Marketing for Leaders (M4L). Su propósito es acercar a los estudiantes de educación secundaria al mundo real de los negocios digitales, el branding, la creación de producto (diseño de Skins) y los e-sports mediante el trabajo colaborativo con mentores universitarios.'
    },
    {
      heading: 'Cláusula 2: Conformación de Equipos (5+1) y Requisitos de Participación',
      body: 'Cada escuadra participante estará conformada obligatoriamente por seis (6) integrantes bajo la estructura "5 Escolares + 1 Mentor Universitario": (a) Cinco (5) Jugadores Escolares en cancha, quienes deben tener estrictamente entre 15 y 17 años de edad (3.°, 4.° o 5.° de secundaria de una misma institución educativa); (b) Un (1) Mentor Universitario USIL / Club M4L, quien asesora la propuesta creativa y la estrategia de difusión digital, pero NO juega las partidas de Mobile Legends: Bang Bang; y (c) Condición Reglamentaria de Cuentas Nuevas: Es requisito indispensable que al menos tres (3) de los cinco (5) jugadores escolares compitan con una cuenta de Mobile Legends: Bang Bang creada en noviembre de 2026 (nuevos ID de jugador verificables).'
    },
    {
      heading: 'Cláusula 3: Etapas de la Competencia (Fase 1 Digital y Fase 2 Torneo Presencial)',
      body: 'FASE 1 — Estrategia Digital «Crea tu Skin MLBB y Gana en la Arena»: (1) Desafío Creativo: Diseñar una propuesta visual de Skin original para un héroe de Mobile Legends: Bang Bang; (2) Requisito Cultural / Institucional: El diseño debe integrar obligatoriamente al menos un elemento representativo del Perú (folclore, iconografía, fauna o historia) o de la identidad USIL (mascota, colores o valores); (3) Publicación en Redes Sociales: El equipo publicará su diseño desde una cuenta pública de Facebook, Instagram y/o TikTok utilizando obligatoriamente el hashtag oficial #USILMarketingGamingMLBB; (4) Calificación Híbrida (50% + 50%): 50% Popularidad Digital (likes e interacciones orgánicas verificables) + 50% Jurado Calificador USIL (creatividad, concepto de marca e innovación); (5) Clasificación: Los seis (6) equipos con mayor puntaje ponderado clasifican a la Gran Final. FASE 2 — «Torneo MLBB» Presencial en Campus USIL: Las 6 escuadras finalistas disputarán enfrentamientos presenciales 5v5 en modo Personalizado/Draft desde dispositivos móviles el miércoles 9 de diciembre de 2026 a partir de las 4:30 p. m. en el Campus USIL (La Molina — Campus Miguel Grau, aforo referencial de sala de 80 personas).'
    },
    {
      heading: 'Cláusula 4: Cronograma Oficial en 4 Hitos y Cuadro de Premios',
      body: 'CRONOGRAMA OFICIAL: (1) Apertura de Registros: 02 de noviembre de 2026; (2) Cierre de Convocatoria y límite de publicación con #USILMarketingGamingMLBB: 02 de diciembre de 2026; (3) Anuncio de los 6 Finalistas: 04 al 05 de diciembre de 2026; (4) Gran Final Presencial 5v5 y Premiación en Campus USIL: miércoles 09 de diciembre de 2026 (4:30 p. m.). PREMIOS OFICIALES: (A) 1.er Lugar — Squad Campeón Escolar: Beca Académica del 30% en USIL para cada uno de los 5 escolares aplicable a TODA la carrera profesional de Marketing (bajo modalidad reservable garantizada hasta culminar el colegio y matricularse) + Recompensas In-Game y Merch Oficial MLBB; (B) Equipos Finalistas (6 Escuadras en Campus): Bolsa de 30 cupos con 20% de descuento aplicable al primer ciclo de la carrera de Marketing en USIL + Cajas de diamantes in-game MLBB, cofres de skins y recuerdos conmemorativos de Moonton Games (pozo total del evento: 84,000 diamantes puros + 44,940 en cofres Skin Choice Chest); (C) Mentores Universitarios USIL / Club M4L: 25% de descuento en la Escuela de Posgrado (EPG USIL) en Maestrías y Diplomados para los mentores cuyas escuadras clasifiquen a la Fase 2.'
    },
    {
      heading: 'Cláusula 5: Protección de Datos Personales de Menores (Ley N° 29733)',
      body: 'En estricto cumplimiento de la Ley N° 29733 (Ley de Protección de Datos Personales) y su reglamento, toda información personal de los estudiantes escolares (15 a 17 años) cuenta con la autorización expresa de sus padres de familia, tutores legales o docente coordinador acreditado. Los datos se almacenan bajo políticas de seguridad de nivel de fila (Row Level Security) para uso exclusivo de verificación académica y premiación por parte de USIL, sin exposición pública.'
    },
    {
      heading: 'Cláusula 6: Aceptación de las Bases y Propiedad Intelectual',
      body: 'La inscripción en el certamen supone la aceptación íntegra de las presentes Bases Oficiales V3. Los participantes declaran que su propuesta de Skin es una creación original e inédita, cediendo a USIL, Moonton Games y el Club M4L los derechos de exhibición académica y difusión institucional mencionando siempre la autoría del escuadrón escolar y su mentor.'
    }
  ]
};

function initBasesModal() {
  const modalBackdrop = document.getElementById('modalBasesBackdrop');
  if (!modalBackdrop) return;

  const openTriggers = document.querySelectorAll('[data-open-bases-modal]');
  const closeTriggers = document.querySelectorAll('[data-close-bases-modal]');

  function openModal(e) {
    if (e) e.preventDefault();
    modalBackdrop.classList.add('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeBtn = modalBackdrop.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modalBackdrop.classList.remove('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openTriggers.forEach(btn => btn.addEventListener('click', openModal));
  closeTriggers.forEach(btn => btn.addEventListener('click', closeModal));

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) {
      closeModal();
    }
  });
}

if (typeof window !== 'undefined') {
  window.BASES_LEGALES_CONTENT = BASES_LEGALES_CONTENT;
  window.initBasesModal = initBasesModal;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BASES_LEGALES_CONTENT, initBasesModal };
}
