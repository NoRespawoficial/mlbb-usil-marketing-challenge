/**
 * ============================================================================
 * MARKETING GAMING CHALLENGE 2026 — GOOGLE SHEETS APPS SCRIPT WEBHOOK (v6)
 * Alianza Oficial: Mobile Legends: Bang Bang x USIL (Marketing) x Club M4L
 * ============================================================================
 *
 * INSTRUCCIONES DE DESPLIEGUE:
 * 1. Crea una hoja de cálculo en Google Sheets.
 * 2. Ve a Extensiones > Apps Script y pega este código completo en `Código.gs`.
 * 3. Haz clic en "Implementar" > "Nueva implementación".
 * 4. Selecciona tipo "Aplicación web":
 *    - Ejecutar como: "Yo" (propietario de la cuenta).
 *    - Quién tiene acceso: "Cualquier persona" (Anyone).
 * 5. Copia la URL de la aplicación web generada y pégala en `js/config.js`
 *    en la propiedad `googleSheetsWebhookUrl`.
 *
 * NOTA TÉCNICA DE CORS:
 * El cliente envía peticiones POST con `Content-Type: text/plain;charset=utf-8`
 * para evitar bloqueos de preflight OPTIONS en Google Apps Script y permitir
 * lectura íntegra del cuerpo JSON en `e.postData.contents`.
 */

var SHEET_NAMES = {
  SQUADS: 'Escuadrones_Escolares',
  MENTORS: 'Postulaciones_Mentores'
};

var SQUAD_HEADERS = [
  'Fecha_Hora_ISO',
  'Ticket_ID',
  'Nombre_Squad',
  'Colegio',
  'Distrito_Colegio',
  'Link_Publicacion_Skin (#USILMarketingGamingMLBB)',
  'Modalidad_Mentor',
  'ID_Mentor_Asignado',
  'Cuentas_Nov2026_Count',
  'Capitan_J1_Nombre',
  'Capitan_J1_Edad',
  'Capitan_J1_DNI',
  'Capitan_J1_Nick_MLBB',
  'Capitan_J1_Game_ID',
  'Capitan_J1_Server_ID',
  'Capitan_J1_Cuenta_Nov2026',
  'Jugador_2_Nombre',
  'Jugador_2_Edad',
  'Jugador_2_DNI',
  'Jugador_2_Nick_MLBB',
  'Jugador_2_Game_ID',
  'Jugador_2_Server_ID',
  'Jugador_2_Cuenta_Nov2026',
  'Jugador_3_Nombre',
  'Jugador_3_Edad',
  'Jugador_3_DNI',
  'Jugador_3_Nick_MLBB',
  'Jugador_3_Game_ID',
  'Jugador_3_Server_ID',
  'Jugador_3_Cuenta_Nov2026',
  'Jugador_4_Nombre',
  'Jugador_4_Edad',
  'Jugador_4_DNI',
  'Jugador_4_Nick_MLBB',
  'Jugador_4_Game_ID',
  'Jugador_4_Server_ID',
  'Jugador_4_Cuenta_Nov2026',
  'Jugador_5_Nombre',
  'Jugador_5_Edad',
  'Jugador_5_DNI',
  'Jugador_5_Nick_MLBB',
  'Jugador_5_Game_ID',
  'Jugador_5_Server_ID',
  'Jugador_5_Cuenta_Nov2026',
  'Autorizacion_Padres_Ley29733',
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
  'Compromiso_Ley29733',
  'Origen_Cliente'
];

/**
 * Sanitiza celdas para prevenir Formula Injection (CSV/Sheet Injection) y XSS.
 */
function sanitizeCell(value) {
  if (value === null || value === undefined) return '';
  var str = String(value).trim();
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str;
  }
  return str;
}

/**
 * Obtiene o crea automáticamente la pestaña indicada con formato de encabezados.
 */
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

/**
 * Construye respuesta JSON compatible con CORS de Google Apps Script.
 */
function buildJsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Endpoint GET de diagnóstico (Health Check).
 */
function doGet(e) {
  return buildJsonResponse({
    ok: true,
    service: 'MARKETING GAMING CHALLENGE 2026 — Webhook Oficial USIL x MLBB x Club M4L',
    version: '6.0.0',
    sheets: [SHEET_NAMES.SQUADS, SHEET_NAMES.MENTORS],
    timestamp: new Date().toISOString()
  });
}

/**
 * Endpoint POST principal protegido con LockService contra escrituras concurrentes.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Espera hasta 15 segundos para adquirir bloqueo exclusivo de escritura
    lock.waitLock(15000);

    if (!e || !e.postData || !e.postData.contents) {
      return buildJsonResponse({
        ok: false,
        error: 'EMPTY_PAYLOAD',
        message: 'No se recibió cuerpo de datos en la solicitud POST.'
      });
    }

    var body = JSON.parse(e.postData.contents);

    // Protección anti-bots (Honeypot)
    if (body.website_hp && String(body.website_hp).trim() !== '') {
      return buildJsonResponse({
        ok: false,
        error: 'BOT_DETECTED',
        message: 'Solicitud bloqueada por filtro de seguridad.'
      });
    }

    if (!body.terms_accepted) {
      return buildJsonResponse({
        ok: false,
        error: 'TERMS_NOT_ACCEPTED',
        message: 'Es obligatorio aceptar las Bases Oficiales V3 y la cláusula de Ley N° 29733.'
      });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var formType = String(body.form_type || body.type || 'squad').toLowerCase();
    var timestamp = sanitizeCell(body.timestamp || new Date().toISOString());

    if (formType === 'mentor' || formType === 'postulacion_mentor') {
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
        sanitizeCell(body.source || 'web_v6')
      ];
      mentorSheet.appendRow(mentorRow);

      return buildJsonResponse({
        ok: true,
        sheet: SHEET_NAMES.MENTORS,
        ref_code: body.ref_code || body.id || '',
        timestamp: timestamp
      });
    }

    // Por defecto: Registro de Escuadrón Escolar (5 Escolares + 1 Mentor USIL/M4L)
    var players = Array.isArray(body.players) ? body.players : [];
    var novCount = Number(body.nov2026_count || players.filter(function(p) { return p && p.is_nov2026; }).length || 0);
    if (players.length !== 5 || novCount < 3) {
      return buildJsonResponse({
        ok: false,
        error: 'INVALID_SQUAD_RULES',
        message: 'El escuadrón debe contar con 5 jugadores escolares y al menos 3 cuentas de noviembre de 2026.'
      });
    }

    var squadSheet = getOrCreateSheet(ss, SHEET_NAMES.SQUADS, SQUAD_HEADERS);

    var squadRow = [
      timestamp,
      sanitizeCell(body.ticket_id || body.id || ''),
      sanitizeCell(body.team_name || ''),
      sanitizeCell(body.school_name || ''),
      sanitizeCell(body.school_district || ''),
      sanitizeCell(body.social_link || ''),
      sanitizeCell(body.mentor_mode || ''),
      sanitizeCell(body.mentor_id || 'ASIGNACION_BOLSA_M4L'),
      novCount
    ];

    for (var i = 0; i < 5; i++) {
      var p = players[i] || {};
      squadRow.push(
        sanitizeCell(p.name || ''),
        sanitizeCell(p.age || ''),
        sanitizeCell(p.dni || ''),
        sanitizeCell(p.nick || ''),
        sanitizeCell(p.game_id || ''),
        sanitizeCell(p.server_id || ''),
        p.is_nov2026 ? 'SI_NOV2026' : 'NO'
      );
    }

    squadRow.push(
      body.terms_accepted ? 'AUTORIZADO_PADRES_Y_LEY_29733' : 'PENDIENTE',
      sanitizeCell(body.source || 'web_v6')
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
