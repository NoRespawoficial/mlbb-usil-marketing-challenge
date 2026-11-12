/**
 * ============================================================================
 * MARKETING GAMING CHALLENGE 2026 — GOOGLE SHEETS APPS SCRIPT WEBHOOK (v6.2)
 * Iniciativa académica y de eSports organizada por la Carrera de Marketing de la
 * Universidad San Ignacio de Loyola (USIL) con el soporte estudiantil del Club
 * Marketing for Leaders (M4L), en colaboración promocional con VIZTA PTE. LTD.
 * para el videojuego Mobile Legends: Bang Bang (desarrollado por Moonton Games).
 * ============================================================================
 *
 * Soporta 3 flujos (form_type):
 * 1. "squad"              -> Pestaña 'Escuadrones_Escolares' (Inscripción Etapa 1 sin DNI)
 * 2. "phase1_submission"  -> Pestaña 'Entregas_Fase1' (Entrega Etapa 2: Skin + Estrategia Digital)
 * 3. "mentor"             -> Pestaña 'Postulaciones_Mentores' (Mentores USIL @usil.pe)
 */

var SHEET_NAMES = {
  SQUADS: 'Escuadrones_Escolares',
  PHASE1: 'Entregas_Fase1',
  MENTORS: 'Postulaciones_Mentores'
};

var SQUAD_HEADERS = [
  'Fecha_Hora_ISO',
  'Ticket_ID',
  'Nombre_Squad',
  'Colegio_Procedencia',
  'Distrito_Colegio',
  'Capitan_Email',
  'Capitan_Telefono',
  'Apoderado_Nombre',
  'Apoderado_Email',
  'Apoderado_Telefono',
  'Link_Publicacion_Skin (#USILMarketingGamingMLBB)',
  'Link_Estrategia_Digital_Skin (Drive/Canva/PDF)',
  'Modalidad_Mentor',
  'ID_o_Nombre_Mentor_Asignado',
  'Cuentas_Nov2026_Count',
  'Capitan_J1_Nombre',
  'Capitan_J1_Edad',
  'Capitan_J1_Nick_MLBB',
  'Capitan_J1_Game_ID',
  'Capitan_J1_Server_ID',
  'Capitan_J1_Cuenta_Nov2026',
  'Jugador_2_Nombre',
  'Jugador_2_Edad',
  'Jugador_2_Nick_MLBB',
  'Jugador_2_Game_ID',
  'Jugador_2_Server_ID',
  'Jugador_2_Cuenta_Nov2026',
  'Jugador_3_Nombre',
  'Jugador_3_Edad',
  'Jugador_3_Nick_MLBB',
  'Jugador_3_Game_ID',
  'Jugador_3_Server_ID',
  'Jugador_3_Cuenta_Nov2026',
  'Jugador_4_Nombre',
  'Jugador_4_Edad',
  'Jugador_4_Nick_MLBB',
  'Jugador_4_Game_ID',
  'Jugador_4_Server_ID',
  'Jugador_4_Cuenta_Nov2026',
  'Jugador_5_Nombre',
  'Jugador_5_Edad',
  'Jugador_5_Nick_MLBB',
  'Jugador_5_Game_ID',
  'Jugador_5_Server_ID',
  'Jugador_5_Cuenta_Nov2026',
  'Checkbox1_Bases_y_Menores',
  'Checkbox2_Privacidad_Ley29733',
  'Checkbox3_Comunicaciones_USIL_Opcional',
  'Origen_Cliente'
];

var PHASE1_HEADERS = [
  'Fecha_Hora_ISO',
  'Submission_ID',
  'Ticket_o_Nombre_Squad',
  'Link_Publicacion_Skin (#USILMarketingGamingMLBB)',
  'Link_Estrategia_Digital_Skin (Drive/Canva/PDF)',
  'Checkbox1_Bases',
  'Checkbox2_Privacidad_Ley29733',
  'Checkbox3_Comunicaciones_USIL_Opcional',
  'Origen_Cliente'
];

var MENTOR_HEADERS = [
  'Fecha_Hora_ISO',
  'Codigo_Referencia',
  'Nombre_Completo',
  'Codigo_Alumno_USIL',
  'Correo_Institucional_USIL',
  'Carrera_USIL',
  'Ciclo_Actual',
  'Especialidad_Mentoria',
  'Telefono_WhatsApp',
  'Modalidad_Postulacion',
  'Checkbox1_Bases_y_Mentoria',
  'Checkbox2_Privacidad_Ley29733',
  'Checkbox3_Comunicaciones_USIL_Opcional',
  'Origen_Cliente'
];

function sanitizeCell(value) {
  if (value === null || value === undefined) return '';
  var str = String(value).trim();
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str;
  }
  return str;
}

function getOrCreateSheet(spreadsheet, sheetName, headers) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#0B1120');
    headerRange.setFontColor('#01D3D2');
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function buildJsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return buildJsonResponse({
    ok: true,
    service: 'MARKETING GAMING CHALLENGE 2026 — Webhook Oficial USIL × Club M4L × VIZTA PTE. LTD.',
    version: '6.2.0',
    sheets: [SHEET_NAMES.SQUADS, SHEET_NAMES.PHASE1, SHEET_NAMES.MENTORS],
    timestamp: new Date().toISOString()
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);

    if (!e || !e.postData || !e.postData.contents) {
      return buildJsonResponse({
        ok: false,
        error: 'EMPTY_PAYLOAD',
        message: 'No se recibió cuerpo de datos en la solicitud POST.'
      });
    }

    var body = JSON.parse(e.postData.contents);

    if (body.website_hp && String(body.website_hp).trim() !== '') {
      return buildJsonResponse({
        ok: false,
        error: 'BOT_DETECTED',
        message: 'Solicitud bloqueada por filtro de seguridad.'
      });
    }

    if (!body.terms_accepted || body.privacy_accepted === false) {
      return buildJsonResponse({
        ok: false,
        error: 'TERMS_NOT_ACCEPTED',
        message: 'Es obligatorio aceptar las Bases Oficiales y el Aviso de Privacidad (Ley N° 29733).'
      });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var formType = String(body.form_type || body.type || 'squad').toLowerCase();
    var timestamp = sanitizeCell(body.timestamp || new Date().toISOString());

    // 1. Entrega de Proyecto Fase 1 (Equipos ya inscritos)
    if (formType === 'phase1_submission') {
      var ticketOrTeam = String(body.ticket_or_team || body.ticket_id || body.team_name || '').trim();
      var socialLink = String(body.social_link || '').trim();
      var strategyDocLink = String(body.strategy_doc_link || '').trim();
      if (ticketOrTeam.length < 2 || !/^https?:\/\/.+/i.test(socialLink) || !/^https?:\/\/.+/i.test(strategyDocLink)) {
        return buildJsonResponse({
          ok: false,
          error: 'INVALID_PHASE1_SUBMISSION',
          message: 'Debes ingresar tu Código de Ticket (TKT-...) o Nombre de Squad y enlaces válidos (https://...) de tu publicación (#USILMarketingGamingMLBB) y Estrategia Digital.'
        });
      }

      var phase1Sheet = getOrCreateSheet(ss, SHEET_NAMES.PHASE1, PHASE1_HEADERS);
      var phase1Row = [
        timestamp,
        sanitizeCell(body.submission_id || ''),
        sanitizeCell(ticketOrTeam),
        sanitizeCell(socialLink),
        sanitizeCell(strategyDocLink),
        body.terms_accepted ? 'ACEPTADO' : 'PENDIENTE',
        body.privacy_accepted !== false ? 'ACEPTADO_LEY_29733' : 'PENDIENTE',
        body.marketing_opt_in ? 'SI_OPT_IN' : 'NO',
        sanitizeCell(body.source || 'landing_v6_2')
      ];
      phase1Sheet.appendRow(phase1Row);

      return buildJsonResponse({
        ok: true,
        sheet: SHEET_NAMES.PHASE1,
        submission_id: body.submission_id || '',
        timestamp: timestamp
      });
    }

    // 2. Postulación de Mentores Universitarios USIL (@usil.pe)
    if (formType === 'mentor' || formType === 'postulacion_mentor') {
      if (!body.terms_accepted) {
        return buildJsonResponse({
          ok: false,
          error: 'TERMS_NOT_ACCEPTED',
          message: 'Es obligatorio aceptar las Bases Oficiales y la cláusula de Ley N° 29733.'
        });
      }
      var emailClean = String(body.email || '').trim().toLowerCase();
      if (!/^[a-z0-9._%+-]+@usil\.pe$/.test(emailClean)) {
        return buildJsonResponse({
          ok: false,
          error: 'INVALID_USIL_EMAIL',
          message: 'El correo del mentor debe pertenecer al dominio institucional @usil.pe.'
        });
      }

      var mentorSheet = getOrCreateSheet(ss, SHEET_NAMES.MENTORS, MENTOR_HEADERS);
      var mentorRow = [
        timestamp,
        sanitizeCell(body.ref_code || body.id || ''),
        sanitizeCell(body.name || ''),
        sanitizeCell(body.usil_code || ''),
        sanitizeCell(emailClean),
        sanitizeCell(body.career || ''),
        sanitizeCell(body.cycle || ''),
        sanitizeCell(body.specialty || ''),
        sanitizeCell(body.phone || ''),
        sanitizeCell(body.reg_type || 'Bolsa Pública'),
        body.terms_accepted ? 'ACEPTADO' : 'PENDIENTE',
        body.privacy_accepted !== false ? 'ACEPTADO_LEY_29733' : 'PENDIENTE',
        body.marketing_opt_in ? 'SI_OPT_IN' : 'NO',
        sanitizeCell(body.source || 'landing_v6_2')
      ];
      mentorSheet.appendRow(mentorRow);

      return buildJsonResponse({
        ok: true,
        sheet: SHEET_NAMES.MENTORS,
        ref_code: body.ref_code || body.id || '',
        timestamp: timestamp
      });
    }

    // 3. Por defecto: Inscripción Inicial de Escuadrón (5 Jugadores de 15-17 años + 1 Mentor USIL/M4L)
    if (!body.terms_accepted) {
      return buildJsonResponse({
        ok: false,
        error: 'TERMS_NOT_ACCEPTED',
        message: 'Es obligatorio aceptar las Bases Oficiales y la cláusula de Ley N° 29733.'
      });
    }

    var players = Array.isArray(body.players) ? body.players : [];
    var novCount = Number(body.nov2026_count || players.filter(function(p) { return p && p.is_nov2026; }).length || 0);
    if (players.length !== 5 || novCount < 3) {
      return buildJsonResponse({
        ok: false,
        error: 'INVALID_SQUAD_RULES',
        message: 'El escuadrón debe contar con 5 jugadores de 15 a 17 años y al menos 3 cuentas de noviembre de 2026.'
      });
    }

    var squadSheet = getOrCreateSheet(ss, SHEET_NAMES.SQUADS, SQUAD_HEADERS);

    var squadRow = [
      timestamp,
      sanitizeCell(body.ticket_id || body.id || ''),
      sanitizeCell(body.team_name || ''),
      sanitizeCell(body.school_name || ''),
      sanitizeCell(body.school_district || ''),
      sanitizeCell(body.captain_email || ''),
      sanitizeCell(body.captain_phone || ''),
      sanitizeCell(body.guardian_name || ''),
      sanitizeCell(body.guardian_email || ''),
      sanitizeCell(body.guardian_phone || ''),
      sanitizeCell(body.social_link || ''),
      sanitizeCell(body.strategy_doc_link || ''),
      sanitizeCell(body.mentor_mode || ''),
      sanitizeCell(body.custom_mentor_name || body.mentor_id || 'ASIGNACION_BOLSA_M4L'),
      novCount
    ];

    for (var i = 0; i < 5; i++) {
      var p = players[i] || {};
      squadRow.push(
        sanitizeCell(p.name || ''),
        sanitizeCell(p.age || ''),
        sanitizeCell(p.nick || ''),
        sanitizeCell(p.game_id || ''),
        sanitizeCell(p.server_id || ''),
        p.is_nov2026 ? 'SI_NOV2026' : 'NO'
      );
    }

    squadRow.push(
      body.terms_accepted ? 'AUTORIZADO_PADRES_Y_BASES' : 'PENDIENTE',
      body.privacy_accepted !== false ? 'ACEPTADO_AVISO_PRIVACIDAD_LEY_29733' : 'PENDIENTE',
      body.marketing_opt_in ? 'SI_OPT_IN_USIL' : 'NO',
      sanitizeCell(body.source || 'landing_v6_2')
    );

    squadSheet.appendRow(squadRow);

    return buildJsonResponse({
      ok: true,
      sheet: SHEET_NAMES.SQUADS,
      ticket_id: body.ticket_id || body.id || '',
      timestamp: timestamp
    });

  } catch (err) {
    return buildJsonResponse({
      ok: false,
      error: 'WEBHOOK_EXCEPTION',
      message: String(err && err.message ? err.message : err)
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (ignore) {}
  }
}
