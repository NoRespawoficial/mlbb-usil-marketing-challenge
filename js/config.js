/**
 * ============================================================================
 * MARKETING GAMING CHALLENGE 2026 — GLOBAL CONTEST CONFIGURATION (v6.2)
 * Iniciativa académica y de eSports organizada por la Carrera de Marketing de la
 * Universidad San Ignacio de Loyola (USIL) con el soporte estudiantil del Club
 * Marketing for Leaders (M4L), en colaboración promocional con VIZTA PTE. LTD.
 * para el videojuego Mobile Legends: Bang Bang (desarrollado por Moonton Games).
 * ============================================================================
 */
const CONTEST_CONFIG = {
  contestTitle: 'MARKETING GAMING CHALLENGE',
  contestSubtitle: 'Diseña tu skin y desarrolla tu estrategia digital para clasificar tu squad al torneo de MLBB',
  institutionalFormula:
    'Iniciativa académica y de eSports organizada por la Carrera de Marketing de la Universidad San Ignacio de Loyola (USIL) con el soporte estudiantil del Club Marketing for Leaders (M4L), en colaboración promocional con VIZTA PTE. LTD. para el videojuego Mobile Legends: Bang Bang (desarrollado por Moonton Games).',
  prizesBadge: 'CUADRO OFICIAL DE PREMIOS E INCENTIVOS',
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
  playersDiamondPool: 70000,
  mentorsDiamondPool: 14000,
  chestRewardsEquivalentDiamonds: 44940,
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
    'https://tcmeswydlsffnhtqnikb.supabase.co',
  supabaseAnonKey: (typeof window !== 'undefined' && window.MLBB_SUPABASE_ANON_KEY) ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbWVzd3lkbHNmZm5odHFuaWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0NTYwNTcsImV4cCI6MjExMDAzMjA1N30.WT-ja7Mn2ZdcNAcq_G_0KPUHnFQTec03c_ImaOG7_i0',

  timelineMilestones: [
    {
      step: 'HITO 01',
      dateLabel: '02 de Noviembre de 2026',
      title: 'Apertura de Inscripciones y Propuestas Fase 1',
      description: 'Inicio del periodo oficial (Del 02 de noviembre al 02 de diciembre de 2026, 23:59 h) para inscribir escuadras de 5 jugadores (15 a 17 años) + 1 Mentor USIL / Club M4L.'
    },
    {
      step: 'HITO 02',
      dateLabel: '02 de Diciembre de 2026',
      title: 'Cierre de Inscripciones y Entrega Fase 1 (23:59 h)',
      description: 'Fecha límite (02 de diciembre de 2026 a las 23:59 h GMT-5) para inscribir a tu squad y entregar el link de tu publicación pública con #USILMarketingGamingMLBB y tu Estrategia Digital.'
    },
    {
      step: 'HITO 03',
      dateLabel: '04 - 05 de Diciembre de 2026',
      title: 'Publicación de los 6 Equipos Finalistas',
      description: 'Del 04 al 05 de diciembre de 2026: Publicación oficial de los 6 equipos finalistas según evaluación 50% Popularidad Digital + 50% Jurado Calificador USIL.'
    },
    {
      step: 'HITO 04',
      dateLabel: '09 de Diciembre de 2026 (4:30 p. m.)',
      title: 'Gran Final Presencial en Campus USIL (La Molina)',
      description: 'Miércoles 09 de diciembre de 2026 a las 4:30 p. m.: Torneo presencial 5v5 (Custom Draft Pick) en sus propios teléfonos móviles en Campus USIL (La Molina) y Ceremonia de Premiación.'
    }
  ],

  mentorEpgBenefit: {
    headline: 'Hasta 7,000 💎 + Photobook Oficial',
    moontonRewards: '14,000 Diamantes MLBB como incentivo para Mentores (Mentor 1.er Lugar: 5,000 💎 en Torneo + 2,000 💎 en Diseño de Skin = 7,000 💎; Mentor 2.° Lugar: 3,000 💎 + 1,200 💎 = 4,200 💎; Mentor 3.er Lugar: 2,000 💎 + 800 💎 = 2,800 💎) + Photobook Oficial MLBB.',
    status: 'Certificado Oficial de Liderazgo Estratégico USIL',
    programTypes: 'Hasta 7,000 Diamantes MLBB (para el Mentor Top 1) + Photobook Oficial MLBB + Certificado Oficial de Liderazgo Estratégico emitido por la Carrera de Marketing USIL',
    terms: 'Hasta 7,000 Diamantes MLBB (para el Mentor Top 1) + Photobook Oficial MLBB + Certificado Oficial de Liderazgo Estratégico emitido por la Carrera de Marketing USIL.'
  },

  privacyNotice: {
    dataController: 'Universidad San Ignacio de Loyola S.R.L. (RUC N° 20297868790, domicilio en Av. La Fontana 550, La Molina, Lima, Perú).',
    purpose: 'Gestionar la inscripción, asignación de mentoría, evaluación, validación de cuentas de juego (Game ID/Server ID junto con VIZTA PTE. LTD. exclusivamente para la entrega de premios in-game) y difusión de resultados del concurso.',
    transfers: 'No se realizarán transferencias a terceros ajenos al certamen ni transferencias internacionales de datos personales sin autorización expresa conforme a la Cláusula 5.3 del MOU.',
    retention: 'Durante el desarrollo del concurso y hasta la culminación de la entrega de premios y reportes, procediéndose luego a su eliminación o anonimización segura.',
    arcoRights: 'Solicitud gratuita de acceso, rectificación, cancelación u oposición escribiendo a clubmarketing@usil.pe o en los canales oficiales de protección de datos de USIL.'
  },

  contactEmail: 'clubmarketing@usil.pe',
  organizer: 'Carrera de Marketing de la Universidad San Ignacio de Loyola (USIL)',
  studentSupport: 'Club Marketing for Leaders (M4L)',
  promotionalCollaborator: 'VIZTA PTE. LTD. para el videojuego Mobile Legends: Bang Bang (desarrollado por Moonton Games)'
};

if (typeof window !== 'undefined') {
  window.CONTEST_CONFIG = CONTEST_CONFIG;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONTEST_CONFIG };
}
