/**
 * ============================================================================
 * MARKETING GAMING CHALLENGE 2026 — GLOBAL CONTEST CONFIGURATION (v6)
 * Alianza Oficial: Mobile Legends: Bang Bang x USIL (Marketing) x Club M4L
 * Sincronizado con las Bases Oficiales del Concurso 2026
 * ============================================================================
 */
const CONTEST_CONFIG = {
  contestTitle: 'MARKETING GAMING CHALLENGE',
  contestSubtitle: 'Diseña tu skin y desarrolla tu estrategia digital para clasificar tu squad al torneo de MLBB',
  prizesHeadline: 'MÁS DE 84,000 DIAMANTES MLBB Y DESCUENTOS EN TU PRÓXIMA CARRERA UNIVERSITARIA',
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
      description: 'Inicio de inscripciones web para escuadras de 5 jóvenes de 15 a 17 años (escolares o recién egresados) + 1 Mentor USIL / Club M4L.'
    },
    {
      step: 'HITO 02',
      dateLabel: '02 de Diciembre de 2026',
      title: 'Cierre de Convocatoria',
      description: 'Fecha límite para registrar a tu squad, enviar tu Estrategia de Marketing Digital y publicar el diseño de tu Skin con #USILMarketingGamingMLBB.'
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
      description: 'Torneo presencial 5v5 en sus propios teléfonos móviles en el Campus USIL (La Molina — Campus Miguel Grau) y Ceremonia Oficial de Premiación.'
    }
  ],

  mentorEpgBenefit: {
    headline: 'Hasta 7,000 💎 + Photobook Oficial',
    moontonRewards: 'Hasta 7,000 Diamantes MLBB (5,000 en Torneo + 2,000 en Diseño de Skin para el Mentor Top 1; 4,200 Top 2; 2,800 Top 3) + Photobook Oficial Conmemorativo de MLBB.',
    status: 'Certificación y Beneficios USIL',
    programTypes: 'Recompensas Oficiales Moonton Games + Certificación y Beneficios USIL',
    terms: 'Certificado oficial de liderazgo estratégico (USIL × Moonton Games × Club M4L) + Beneficios y descuentos académicos USIL (en confirmación oficial).'
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
