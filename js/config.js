/**
 * ============================================================================
 * MARKETING GAMING CHALLENGE 2026 — GLOBAL CONTEST CONFIGURATION (v6)
 * Alianza Oficial: Mobile Legends: Bang Bang x USIL (Marketing) x Club M4L
 * Sincronizado con: Bases_Oficiales_Marketing_Gaming_Challenge_USIL_MLBB (V3)
 * ============================================================================
 */
const CONTEST_CONFIG = {
  contestTitle: 'MARKETING GAMING CHALLENGE',
  contestSubtitle: 'Diseña tu skin y desarrolla tu estrategia digital para clasificar tu squad al torneo de MLBB',
  registrationOpenDate: '2026-11-02T00:00:00-05:00',
  registrationCloseDate: '2026-12-02T23:59:59-05:00',
  finalistsAnnounceDate: '2026-12-04T18:00:00-05:00',
  grandFinalDate: '2026-12-09T16:30:00-05:00',
  minAge: 15,
  maxAge: 17,
  playersCount: 5,
  mentorsCount: 1,
  minNov2026Accounts: 3,
  socialScoreWeight: 50,
  juryScoreWeight: 50,
  finalistSquadsCount: 6,
  finalistSpotsCount: 30,
  phase2Capacity: 80,
  totalDiamondPool: 84000,
  officialHashtag: '#USILMarketingGamingMLBB',
  officialBasesPdfUrl: 'public/assets/docs/Bases_Oficiales_Marketing_Gaming_Challenge_2026.pdf',

  /**
   * Endpoints Backend de Producción (Google Sheets Apps Script + Supabase REST API).
   * Pueden configurarse directamente aquí o inyectarse mediante variables globales
   * window.MLBB_WEBHOOK_URL / window.MLBB_SUPABASE_URL / window.MLBB_SUPABASE_ANON_KEY.
   */
  googleSheetsWebhookUrl: (typeof window !== 'undefined' && window.MLBB_WEBHOOK_URL) ||
    'https://script.google.com/macros/s/AKfycbzbkH7HENEJbe2MtaV33CGMv9Y6VisLr-uEJ74H5-WKJBv0tJ9KiCB5GZ2Sv_pziYtpMA/exec',
  supabaseUrl: (typeof window !== 'undefined' && window.MLBB_SUPABASE_URL) ||
    'https://usil-mlbb-challenge.supabase.co',
  supabaseAnonKey: (typeof window !== 'undefined' && window.MLBB_SUPABASE_ANON_KEY) ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaWwtbWxiYi1jaGFsbGVuZ2UiLCJyb2xlIjoiYW5vbiJ9.publicAnonKeyV6',

  timelineMilestones: [
    {
      step: 'HITO 01',
      dateLabel: '02 de Noviembre de 2026',
      title: 'Apertura de Registros',
      description: 'Inicio de inscripciones web de escuadras escolares (5+1) y habilitación del directorio de Mentores USIL / Club M4L.'
    },
    {
      step: 'HITO 02',
      dateLabel: '02 de Diciembre de 2026',
      title: 'Cierre de Convocatoria',
      description: 'Fecha límite para registrar a tu squad y publicar el diseño de tu Skin con el hashtag #USILMarketingGamingMLBB.'
    },
    {
      step: 'HITO 03',
      dateLabel: '04 - 05 de Diciembre de 2026',
      title: 'Anuncio de 6 Finalistas',
      description: 'Publicación oficial de las 6 escuadras clasificadas según puntaje híbrido (50% Likes + 50% Jurado USIL).'
    },
    {
      step: 'HITO 04',
      dateLabel: '09 de Diciembre de 2026 (4:30 p. m.)',
      title: 'Gran Final & Torneo Presencial',
      description: 'Torneo presencial 5v5 en el Campus USIL (La Molina — Campus Miguel Grau) y Ceremonia Oficial de Premiación.'
    }
  ],

  mentorEpgBenefit: {
    discountPercentage: 25,
    status: 'Beneficio Oficial Vigente (Final Presencial: miércoles 9 de diciembre de 2026)',
    programTypes: 'Maestrías y Diplomados de la Escuela de Posgrado (EPG USIL)',
    terms: 'Otorgado a los estudiantes universitarios de USIL y miembros del Club M4L que lideren una escuadra escolar clasificada a la Fase 2 (Gran Final Presencial en Campus USIL).'
  },

  contactEmail: 'clubmarketing@usil.pe',
  organizer: 'Carrera de Marketing — Facultad de Ciencias Empresariales USIL',
  coOrganizers: ['Moonton Games (Mobile Legends: Bang Bang)', 'Club Marketing for Leaders (M4L)']
};

if (typeof window !== 'undefined') {
  window.CONTEST_CONFIG = CONTEST_CONFIG;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONTEST_CONFIG };
}
