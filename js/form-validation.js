/**
 * ============================================================================
 * MARKETING GAMING CHALLENGE 2026 — FORM VALIDATION, SECURITY & CLOUD SYNC (v6.2)
 * Adecuación Legal al MOU USIL S.R.L. × VIZTA PTE. LTD. y Ley N° 29733:
 * - Minimización de Datos (Cláusula 5.3 MOU): Sin campo DNI de menores en registro web.
 *   Solicita únicamente Nombre y Apellido, Edad (15 a 17 años), Nickname MLBB, Game ID y
 *   Server ID (Zona), más Correo y Teléfono del Capitán y del Padre/Apoderado responsable.
 * - Separación Lógica del Flujo:
 *   Etapa 1 (#schoolSquadForm): Inscripción inicial del Squad 5+1 sin obligatoriedad de links.
 *   Etapa 2 (#phase1SubmissionForm): Entrega posterior de Skin (#USILMarketingGamingMLBB)
 *   y Estrategia Digital (Google Drive / Canva / PDF) hasta el 02 de diciembre de 2026 (23:59 h)
 *   enviada con form_type: "phase1_submission".
 * - 3 Checkboxes de Consentimiento Diferenciados (Ley N° 29733):
 *   1) Obligatorio — Bases Oficiales y autorización de padres/tutores.
 *   2) Obligatorio — Aviso de Privacidad (Ley N° 29733) y uso de imagen/voz institucional.
 *   3) Opcional — Comunicaciones comerciales y académicas de USIL.
 * ============================================================================
 */

const RETRY_QUEUE_STORAGE_KEY = 'mlbb_sync_retry_queue';
let isSubmittingSquad = false;
let isSubmittingMentor = false;
let isSubmittingPhase1 = false;

/**
 * Sanitiza entradas de texto contra inyección XSS (<, >, &, ", ').
 */
function sanitizeInput(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Limpia texto plano seguro para enviar a APIs JSON (remueve etiquetas HTML crudas).
 */
function cleanPlainText(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/<[^>]*>?/gm, '')
    .trim();
}

function validateAge(age) {
  const num = Number(age);
  return Number.isInteger(num) && num >= 15 && num <= 17;
}

function validateDni(dni) {
  if (!dni) return false;
  const clean = String(dni).trim();
  return /^\d{8}$/.test(clean);
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

function validateUsilEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  return /^[a-z0-9._%+-]+@usil\.pe$/.test(clean);
}

function validatePhone(phone) {
  if (!phone) return false;
  const clean = String(phone).trim().replace(/\s+/g, '');
  return /^9\d{8}$/.test(clean);
}

function countNovember2026Accounts(players) {
  if (!Array.isArray(players)) return 0;
  return players.filter(p => Boolean(p && p.is_nov2026)).length;
}

/**
 * Etapa 1: Validación de Inscripción Inicial de Squad (#schoolSquadForm).
 * - Sin obligatoriedad de social_link ni strategy_doc_link en la inscripción inicial.
 * - Sin campo DNI de los 5 jugadores (Minimización de datos Ley N° 29733 / Cláusula 5.3 MOU).
 * - Valida datos de contacto del Capitán y del Padre/Apoderado responsable.
 * - Valida los Checkboxes obligatorios 1 (Bases y Menores) y 2 (Aviso de Privacidad Ley N° 29733).
 */
function validateSquadRegistration(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Datos de formulario inválidos.'] };
  }

  // Honeypot anti-bots
  if (payload.website_hp && String(payload.website_hp).trim() !== '') {
    return { valid: false, errors: ['Solicitud bloqueada por filtro automático anti-bots.'] };
  }

  if (!payload.team_name || String(payload.team_name).trim().length < 2) {
    errors.push('El nombre del Squad es obligatorio (mínimo 2 caracteres).');
  }
  if (!payload.school_name || String(payload.school_name).trim().length < 2) {
    errors.push('El Colegio de Procedencia (actual o de egreso) es obligatorio.');
  }
  if (!payload.school_district || String(payload.school_district).trim().length < 2) {
    errors.push('El distrito o ciudad del colegio es obligatorio.');
  }

  // Enlaces opcionales en inscripción inicial: solo validar formato URL si el usuario ingresó texto
  if (payload.social_link && String(payload.social_link).trim() !== '' &&
      !/^https?:\/\/.+/i.test(String(payload.social_link).trim())) {
    errors.push('Si ingresas el enlace de publicación con #USILMarketingGamingMLBB, debe ser una URL válida (https://...).');
  }
  if (payload.strategy_doc_link && String(payload.strategy_doc_link).trim() !== '' &&
      !/^https?:\/\/.+/i.test(String(payload.strategy_doc_link).trim())) {
    errors.push('Si ingresas el enlace de Estrategia Digital, debe ser una URL válida (https://...).');
  }

  // Contacto obligatorio del Capitán y del Padre/Apoderado responsable (Directiva 5)
  if (!validateEmail(payload.captain_email)) {
    errors.push('Ingresa un correo electrónico de contacto válido para el Capitán del Squad.');
  }
  if (!validatePhone(payload.captain_phone)) {
    errors.push('Ingresa un teléfono/WhatsApp de contacto válido de 9 dígitos para el Capitán.');
  }
  if (!payload.guardian_name || String(payload.guardian_name).trim().length < 3) {
    errors.push('Ingresa el nombre y apellido del Padre, Madre o Apoderado responsable.');
  }
  if (!validateEmail(payload.guardian_email)) {
    errors.push('Ingresa un correo electrónico válido del Padre, Madre o Apoderado responsable.');
  }
  if (!validatePhone(payload.guardian_phone)) {
    errors.push('Ingresa un teléfono válido de 9 dígitos del Padre, Madre o Apoderado responsable.');
  }

  const validModes = ['choose', 'direct', 'random'];
  if (!validModes.includes(payload.mentor_mode)) {
    errors.push('Selecciona una modalidad de asignación de Mentor USIL.');
  }
  if (payload.mentor_mode === 'choose' &&
      (!payload.mentor_id || String(payload.mentor_id).trim() === '')) {
    errors.push('Debes elegir una especialidad de Mentor USIL / Club M4L del directorio.');
  }
  if (payload.mentor_mode === 'direct') {
    const hasCustom = payload.custom_mentor_name && String(payload.custom_mentor_name).trim().length >= 2;
    if (!hasCustom) {
      errors.push('Debes escribir el Nombre o Código de tu Mentor USIL.');
    }
  }

  const players = payload.players;
  if (!Array.isArray(players) || players.length !== 5) {
    errors.push('El equipo debe registrar exactamente 5 jugadores titulares de 15 a 17 años.');
  } else {
    players.forEach((p, idx) => {
      const num = idx + 1;
      if (!p.name || String(p.name).trim().length < 3) {
        errors.push(`Jugador ${num}: Nombre y Apellido obligatorio.`);
      }
      if (!validateAge(p.age)) {
        errors.push(`Jugador ${num}: La edad debe estar estrictamente entre 15 y 17 años cumplidos (ingresado: ${p.age ?? 'vacío'}).`);
      }
      if (!p.nick || String(p.nick).trim().length < 2) {
        errors.push(`Jugador ${num}: Nickname de MLBB obligatorio.`);
      }
      if (!p.game_id || !/^\d{6,12}$/.test(String(p.game_id).trim())) {
        errors.push(`Jugador ${num}: Game ID de MLBB inválido (6 a 12 dígitos).`);
      }
      if (!p.server_id || !/^\d{4,6}$/.test(String(p.server_id).trim())) {
        errors.push(`Jugador ${num}: Server ID (Zona) de MLBB inválido (4 a 6 dígitos).`);
      }
    });

    const novCount = countNovember2026Accounts(players);
    if (novCount < 3) {
      errors.push(`Regla de Cuentas Nuevas: Al menos 3 de los 5 jugadores deben tener cuenta MLBB creada en noviembre de 2026 (actualmente marcados: ${novCount}/5).`);
    }
  }

  if (!payload.terms_accepted) {
    errors.push('Checkbox 1 Obligatorio: Debes aceptar las Bases Oficiales del Concurso y declarar la autorización expresa de los padres o tutores legales.');
  }
  if (!payload.privacy_accepted) {
    errors.push('Checkbox 2 Obligatorio: Debes aceptar el Aviso de Privacidad (Ley N° 29733) y la autorización de uso de imagen, voz y propuestas creativas.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Etapa 2: Validación de Entrega Posterior de Propuesta Fase 1 (#phase1SubmissionForm).
 * El capitán ingresa su Código de Ticket (TKT-...) o Nombre de Squad, el Link de la
 * publicación en redes (#USILMarketingGamingMLBB) y el Link de Drive/Canva de su Estrategia Digital.
 */
function validatePhase1Submission(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Datos de entrega de Fase 1 inválidos.'] };
  }

  if (payload.website_hp && String(payload.website_hp).trim() !== '') {
    return { valid: false, errors: ['Solicitud bloqueada por filtro automático anti-bots.'] };
  }

  const identifier = String(payload.ticket_or_team || payload.ticket_id || payload.team_name || '').trim();
  if (identifier.length < 2) {
    errors.push('Debes ingresar tu Código de Ticket (TKT-...) o el Nombre de tu Squad inscrito.');
  }
  if (!payload.social_link || !/^https?:\/\/.+/i.test(String(payload.social_link).trim())) {
    errors.push('Debes ingresar el enlace público (URL) de la publicación en redes con #USILMarketingGamingMLBB.');
  }
  if (!payload.strategy_doc_link || !/^https?:\/\/.+/i.test(String(payload.strategy_doc_link).trim())) {
    errors.push('Debes ingresar el enlace de Google Drive, Canva o PDF de tu Estrategia Digital y Diseño de Skin.');
  }
  if (!payload.terms_accepted) {
    errors.push('Checkbox 1 Obligatorio: Debes confirmar la aceptación de las Bases Oficiales del Concurso y que los enlaces tienen acceso público.');
  }
  if (!payload.privacy_accepted) {
    errors.push('Checkbox 2 Obligatorio: Debes aceptar el Aviso de Privacidad (Ley N° 29733) y el uso de imagen, voz y propuestas creativas.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateMentorApplication(applicant) {
  const errors = [];
  if (!applicant || typeof applicant !== 'object') {
    return { valid: false, errors: ['Datos de postulación inválidos.'] };
  }

  // Honeypot anti-bots
  if (applicant.website_hp && String(applicant.website_hp).trim() !== '') {
    return { valid: false, errors: ['Solicitud bloqueada por filtro automático anti-bots.'] };
  }

  if (!applicant.name || String(applicant.name).trim().length < 3) {
    errors.push('Ingresa tus nombres y apellidos completos.');
  }
  if (!applicant.usil_code || String(applicant.usil_code).trim().length < 6) {
    errors.push('Ingresa tu código de alumno USIL válido (mínimo 6 caracteres).');
  }
  if (!validateUsilEmail(applicant.email)) {
    errors.push('El correo debe ser obligatoriamente institucional con dominio @usil.pe.');
  }
  if (!applicant.career || String(applicant.career).trim() === '') {
    errors.push('Selecciona tu carrera universitaria en USIL.');
  }
  if (!applicant.cycle || String(applicant.cycle).trim() === '') {
    errors.push('Selecciona tu ciclo actual.');
  }
  if (!applicant.specialty || String(applicant.specialty).trim() === '') {
    errors.push('Selecciona tu especialidad de mentoría.');
  }
  if (!validatePhone(applicant.phone)) {
    errors.push('Ingresa un número de WhatsApp válido de 9 dígitos (iniciando con 9).');
  }
  if (!applicant.terms_accepted) {
    errors.push('Checkbox 1 Obligatorio: Debes aceptar las Bases Oficiales del Concurso y el compromiso de mentoría.');
  }
  if (!applicant.privacy_accepted) {
    errors.push('Checkbox 2 Obligatorio: Debes aceptar el Aviso de Privacidad (Ley N° 29733).');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function updateNovAccountsProgressUI() {
  const checkboxes = document.querySelectorAll('.player-nov2026-checkbox');
  const countBadge = document.getElementById('nov2026CounterBadge');
  const progressFill = document.getElementById('nov2026ProgressFill');
  const statusText = document.getElementById('nov2026StatusText');

  if (!checkboxes.length) return 0;

  let checkedCount = 0;
  checkboxes.forEach(cb => {
    if (cb.checked) checkedCount++;
  });

  if (countBadge) {
    countBadge.textContent = `${checkedCount} / 5 Cuentas Noviembre 2026`;
    countBadge.className = checkedCount >= 3 ? 'badge badge-teal' : 'badge badge-gold';
  }

  if (progressFill) {
    const pct = Math.min(100, Math.round((checkedCount / 3) * 100));
    progressFill.style.width = `${pct}%`;
    progressFill.style.background = checkedCount >= 3
      ? 'linear-gradient(90deg, #00F2FE, #10B981)'
      : 'linear-gradient(90deg, #F59E0B, #EF4444)';
  }

  if (statusText) {
    if (checkedCount >= 3) {
      statusText.textContent = `Requisito cumplido (${checkedCount}/5 cuentas nuevas de noviembre 2026). ¡Tu squad está habilitado!`;
      statusText.style.color = '#10B981';
    } else {
      const missing = 3 - checkedCount;
      statusText.textContent = `Faltan marcar al menos ${missing} cuenta(s) creada(s) en noviembre de 2026 (mínimo reglamentario: 3 de 5).`;
      statusText.style.color = '#FBBF24';
    }
  }

  return checkedCount;
}

function selectMentorForRegistration(mentorId, mentorName) {
  const modeRadioChoose = document.querySelector('input[name="mentor_mode"][value="choose"]');
  const mentorSelect = document.getElementById('schoolMentorSelect');
  const selectedBanner = document.getElementById('selectedMentorBanner');

  if (modeRadioChoose) {
    modeRadioChoose.checked = true;
    modeRadioChoose.dispatchEvent(new Event('change'));
  }

  if (mentorSelect) {
    mentorSelect.value = mentorId;
  }

  if (selectedBanner) {
    selectedBanner.style.display = 'flex';
    selectedBanner.innerHTML = `
      <span>Especialidad M4L / Mentor Vinculado: <strong>${sanitizeInput(mentorName)} (${sanitizeInput(mentorId)})</strong> — Asesora tu estrategia digital</span>
      <button type="button" class="btn-clear-mentor" id="btnClearMentorSelection">Cambiar</button>
    `;
    const clearBtn = document.getElementById('btnClearMentorSelection');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (typeof window !== 'undefined' && typeof window.clearSelectedMentor === 'function') {
          window.clearSelectedMentor();
        } else {
          if (mentorSelect) mentorSelect.value = '';
          selectedBanner.style.display = 'none';
        }
      });
    }
  }

  document.querySelectorAll('[data-reg-tab]').forEach(btn => {
    const isMatch = btn.getAttribute('data-reg-tab') === 'registro-escolar';
    btn.classList.toggle('is-active', isMatch);
    btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
  });

  const formSection = document.getElementById('registro-escolar');
  if (formSection && typeof formSection.scrollIntoView === 'function') {
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Encola o actualiza un registro pendiente en localStorage cuando el navegador está offline
 * o si alguno de los endpoints remotos (Sheets o Supabase) responde con error transitorio.
 */
function enqueueForOfflineRetry(type, record, syncState) {
  try {
    const raw = localStorage.getItem(RETRY_QUEUE_STORAGE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    const itemId = record.ticket_id || record.submission_id || record.ref_code || `SYNC-${Date.now()}`;
    const existingIdx = queue.findIndex(item => item.id === itemId);
    const sheetsSynced = Boolean(syncState && syncState.sheetsOk);
    const supabaseSynced = Boolean(syncState && syncState.supabaseOk);

    if (existingIdx >= 0) {
      queue[existingIdx].sheetsSynced = Boolean(queue[existingIdx].sheetsSynced || sheetsSynced);
      queue[existingIdx].supabaseSynced = Boolean(queue[existingIdx].supabaseSynced || supabaseSynced);
      queue[existingIdx].updated_at = new Date().toISOString();
    } else {
      queue.push({
        id: itemId,
        type,
        record,
        sheetsSynced,
        supabaseSynced,
        queued_at: new Date().toISOString()
      });
    }
    localStorage.setItem(RETRY_QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    // Ignore storage quota errors
  }
}

/**
 * Envía el registro en paralelo a:
 * 1) Google Sheets Apps Script Webhook (`Content-Type: text/plain;charset=utf-8` para evitar bloqueo CORS preflight)
 * 2) Supabase PostgreSQL REST API con RLS (`POST /rest/v1/...`)
 */
async function dispatchToCloudBackends(type, record, options) {
  const opts = options || {};
  if (typeof fetch !== 'function') {
    if (!opts.fromRetryQueue) {
      enqueueForOfflineRetry(type, record, { sheetsOk: false, supabaseOk: false });
    }
    return { sheetsOk: false, supabaseOk: false, offline: true };
  }

  const cfg = (typeof window !== 'undefined' && window.CONTEST_CONFIG) ? window.CONTEST_CONFIG : {};
  const webhookUrl = cfg.googleSheetsWebhookUrl || '';
  const supabaseUrl = cfg.supabaseUrl || '';
  const supabaseAnonKey = cfg.supabaseAnonKey || '';

  let sheetsOk = Boolean(opts.skipSheets);
  let supabaseOk = Boolean(opts.skipSupabase);
  const tasks = [];

  // 1. Petición a Google Sheets Webhook (CORS-safe text/plain;charset=utf-8 con fallback no-cors)
  if (!opts.skipSheets && webhookUrl && /^https?:\/\//i.test(webhookUrl)) {
    const sheetsBody = Object.assign({ form_type: type, source: 'landing_v6_2' }, record);
    tasks.push(
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(sheetsBody)
      }).then(async res => {
        if (!res) return { target: 'sheets', ok: false };
        if (res.type === 'opaque') return { target: 'sheets', ok: true };
        if (!res.ok) return { target: 'sheets', ok: false };
        if (typeof res.json === 'function') {
          try {
            const data = await res.json();
            if (data && data.ok === false) {
              return { target: 'sheets', ok: false, error: data.error };
            }
          } catch (_) {
            // Non-JSON 200 OK response treated as success
          }
        }
        return { target: 'sheets', ok: true };
      }).catch(() =>
        fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(sheetsBody)
        }).then(res => ({ target: 'sheets', ok: Boolean(res && (res.ok || res.type === 'opaque')) }))
          .catch(() => ({ target: 'sheets', ok: false }))
      )
    );
  }

  // 2. Petición a Supabase REST API (con RLS de solo inserción anónima)
  if (!opts.skipSupabase && supabaseUrl && supabaseAnonKey && /^https?:\/\//i.test(supabaseUrl)) {
    const table = type === 'mentor'
      ? 'mentor_applications'
      : (type === 'phase1_submission' ? 'phase1_submissions' : 'squad_registrations');
    const endpoint = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/${table}`;
    let dbRow;
    if (type === 'mentor') {
      dbRow = {
        ref_code: record.ref_code,
        full_name: record.name,
        usil_code: record.usil_code,
        institutional_email: record.email,
        career: record.career,
        cycle: record.cycle,
        specialty: record.specialty,
        whatsapp_phone: record.phone,
        reg_type: record.reg_type || 'Bolsa Pública',
        privacy_law_29733_accepted: Boolean(record.privacy_accepted),
        marketing_opt_in: Boolean(record.marketing_opt_in),
        client_source: 'landing_v6_2'
      };
    } else if (type === 'phase1_submission') {
      dbRow = {
        submission_id: record.submission_id,
        ticket_or_team: record.ticket_or_team,
        social_link: record.social_link,
        strategy_doc_link: record.strategy_doc_link,
        official_hashtag: '#USILMarketingGamingMLBB',
        privacy_law_29733_accepted: Boolean(record.privacy_accepted),
        marketing_opt_in: Boolean(record.marketing_opt_in),
        client_source: 'landing_v6_2'
      };
    } else {
      dbRow = {
        ticket_id: record.ticket_id,
        team_name: record.team_name,
        school_name: record.school_name,
        school_district: record.school_district,
        captain_email: record.captain_email || '',
        captain_phone: record.captain_phone || '',
        guardian_name: record.guardian_name || '',
        guardian_email: record.guardian_email || '',
        guardian_phone: record.guardian_phone || '',
        social_link: record.social_link || '',
        strategy_doc_link: record.strategy_doc_link || '',
        official_hashtag: '#USILMarketingGamingMLBB',
        mentor_mode: record.mentor_mode,
        mentor_id: record.mentor_id,
        custom_mentor_name: record.custom_mentor_name || '',
        nov2026_count: record.nov2026_count,
        players: record.players,
        parental_consent_accepted: Boolean(record.terms_accepted),
        privacy_law_29733_accepted: Boolean(record.privacy_accepted),
        marketing_opt_in: Boolean(record.marketing_opt_in),
        client_source: 'landing_v6_2'
      };
    }

    tasks.push(
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(dbRow)
      }).then(res => ({ target: 'supabase', ok: Boolean(res && res.ok) }))
        .catch(() => ({ target: 'supabase', ok: false }))
    );
  }

  if (tasks.length > 0) {
    const results = await Promise.allSettled(tasks);
    results.forEach(r => {
      if (r.status === 'fulfilled' && r.value) {
        if (r.value.target === 'sheets') sheetsOk = r.value.ok;
        if (r.value.target === 'supabase') supabaseOk = r.value.ok;
      }
    });
  }

  if (!opts.fromRetryQueue && (!sheetsOk || !supabaseOk)) {
    enqueueForOfflineRetry(type, record, { sheetsOk, supabaseOk });
  }

  return { sheetsOk, supabaseOk };
}

/**
 * Reintenta sincronizar registros pendientes cuando vuelve la conexión,
 * enviando únicamente al destino (Google Sheets o Supabase) que aún no haya confirmado.
 */
async function flushSyncRetryQueue() {
  try {
    const raw = localStorage.getItem(RETRY_QUEUE_STORAGE_KEY);
    if (!raw) return;
    const queue = JSON.parse(raw);
    if (!Array.isArray(queue) || !queue.length) return;

    const remaining = [];
    for (const item of queue) {
      const res = await dispatchToCloudBackends(item.type, item.record, {
        skipSheets: Boolean(item.sheetsSynced),
        skipSupabase: Boolean(item.supabaseSynced),
        fromRetryQueue: true
      });
      item.sheetsSynced = Boolean(item.sheetsSynced || res.sheetsOk);
      item.supabaseSynced = Boolean(item.supabaseSynced || res.supabaseOk);
      if (!item.sheetsSynced || !item.supabaseSynced) {
        remaining.push(item);
      }
    }
    localStorage.setItem(RETRY_QUEUE_STORAGE_KEY, JSON.stringify(remaining));
  } catch (e) {
    // Ignore retry errors
  }
}

function populateSchoolMentorDropdown() {
  const mentorSelect = document.getElementById('schoolMentorSelect');
  if (!mentorSelect || typeof MENTORES_DATA === 'undefined') return;

  mentorSelect.innerHTML = '<option value="">-- Selecciona un Perfil de Especialidad M4L --</option>';
  MENTORES_DATA.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.id} — ${m.name} (${m.career})`;
    mentorSelect.appendChild(opt);
  });
}

function initRegistrationFlowTabs() {
  const tabBtns = document.querySelectorAll('[data-reg-tab]');
  const openPhase1Triggers = document.querySelectorAll('[data-open-phase1-tab]');

  function activateRegSection(targetId, shouldScroll) {
    tabBtns.forEach(btn => {
      const isMatch = btn.getAttribute('data-reg-tab') === targetId;
      btn.classList.toggle('is-active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });
    const targetEl = document.getElementById(targetId);
    if (targetEl && shouldScroll && typeof targetEl.scrollIntoView === 'function') {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-reg-tab');
      if (targetId) activateRegSection(targetId, true);
    });
  });

  openPhase1Triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      activateRegSection('entrega-fase1', true);
      const ticketInput = document.getElementById('phase1TicketOrTeamInput');
      if (ticketInput && typeof ticketInput.focus === 'function') {
        ticketInput.focus();
      }
    });
  });

  // Sync registration-flow-tabs active state when clicking any anchor link to #registro-escolar, #entrega-fase1, or #postulacion-mentores
  const regSectionLinks = document.querySelectorAll('a[href="#registro-escolar"], a[href="#entrega-fase1"], a[href="#postulacion-mentores"]');
  regSectionLinks.forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href') || '';
      const targetId = href.replace(/^#/, '');
      if (targetId) activateRegSection(targetId, false);
    });
  });
}

function initFormValidation() {
  populateSchoolMentorDropdown();
  initRegistrationFlowTabs();

  const novCheckboxes = document.querySelectorAll('.player-nov2026-checkbox');
  novCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateNovAccountsProgressUI);
  });
  updateNovAccountsProgressUI();

  const modeRadios = document.querySelectorAll('input[name="mentor_mode"]');
  const mentorSelectWrap = document.getElementById('mentorSelectWrapper');
  const mentorSelect = document.getElementById('schoolMentorSelect');
  const customMentorWrap = document.getElementById('customMentorWrapper');
  const customMentorInput = document.getElementById('customMentorNameInput');

  function syncMentorModeControls() {
    const checkedRadio = document.querySelector('input[name="mentor_mode"]:checked');
    const mode = checkedRadio ? checkedRadio.value : 'choose';
    const feedbackBox = document.getElementById('schoolFormFeedback');
    if (feedbackBox && feedbackBox.classList.contains('is-error')) {
      feedbackBox.style.display = 'none';
    }

    if (mode === 'direct') {
      if (typeof window !== 'undefined' && typeof window.clearSelectedMentor === 'function') {
        window.clearSelectedMentor();
      }
      if (customMentorWrap) customMentorWrap.style.display = 'flex';
      if (customMentorInput) {
        customMentorInput.disabled = false;
        customMentorInput.required = true;
      }
      if (mentorSelectWrap) mentorSelectWrap.style.display = 'none';
      if (mentorSelect) {
        mentorSelect.disabled = true;
        mentorSelect.value = '';
        if (mentorSelect.options && mentorSelect.options.length > 0) {
          mentorSelect.selectedIndex = 0;
        }
      }
    } else if (mode === 'random') {
      if (typeof window !== 'undefined' && typeof window.clearSelectedMentor === 'function') {
        window.clearSelectedMentor();
      }
      if (customMentorWrap) customMentorWrap.style.display = 'none';
      if (customMentorInput) {
        customMentorInput.disabled = true;
        customMentorInput.required = false;
      }
      if (mentorSelectWrap) {
        mentorSelectWrap.style.display = 'flex';
        mentorSelectWrap.style.opacity = '0.5';
      }
      if (mentorSelect) {
        mentorSelect.disabled = true;
        mentorSelect.value = '';
        if (mentorSelect.options && mentorSelect.options.length > 0) {
          mentorSelect.selectedIndex = 0;
        }
      }
    } else {
      // mode === 'choose'
      if (customMentorWrap) customMentorWrap.style.display = 'none';
      if (customMentorInput) {
        customMentorInput.disabled = true;
        customMentorInput.required = false;
      }
      if (mentorSelectWrap) {
        mentorSelectWrap.style.display = 'flex';
        mentorSelectWrap.style.opacity = '1';
      }
      if (mentorSelect) {
        mentorSelect.disabled = false;
        if (mentorSelect.selectedIndex < 0 && mentorSelect.options && mentorSelect.options.length > 0) {
          mentorSelect.selectedIndex = 0;
        }
      }
    }
  }

  modeRadios.forEach(radio => {
    radio.addEventListener('change', syncMentorModeControls);
  });
  syncMentorModeControls();

  if (mentorSelect) {
    mentorSelect.addEventListener('change', () => {
      const val = mentorSelect.value;
      if (!val) {
        if (typeof window !== 'undefined' && typeof window.clearSelectedMentor === 'function') {
          window.clearSelectedMentor();
        }
      } else if (typeof MENTORES_DATA !== 'undefined' && Array.isArray(MENTORES_DATA)) {
        const found = MENTORES_DATA.find(m => m.id === val);
        if (found && typeof window !== 'undefined' && typeof window.selectMentor === 'function') {
          window.selectMentor(found.id);
        }
      }
    });
  }

  const schoolForm = document.getElementById('schoolSquadForm');
  if (schoolForm) {
    schoolForm.addEventListener('submit', handleSchoolFormSubmit);
  }

  const phase1Form = document.getElementById('phase1SubmissionForm');
  if (phase1Form) {
    phase1Form.addEventListener('submit', handlePhase1SubmissionSubmit);
  }

  const mentorForm = document.getElementById('mentorApplicationForm');
  if (mentorForm) {
    mentorForm.addEventListener('submit', handleMentorFormSubmit);
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('online', flushSyncRetryQueue);
  }
}

function handleSchoolFormSubmit(e) {
  e.preventDefault();
  if (isSubmittingSquad) return;

  const form = e.target;
  const feedbackBox = document.getElementById('schoolFormFeedback');
  const submitBtn = form.querySelector('button[type="submit"]');

  const selectedModeEl = form.querySelector('input[name="mentor_mode"]:checked');
  const mentorMode = selectedModeEl ? selectedModeEl.value : 'choose';
  const mentorSelect = document.getElementById('schoolMentorSelect');
  const customMentorInput = form.querySelector('[name="custom_mentor_name"]');
  const customMentorName = cleanPlainText(customMentorInput?.value || '');

  const players = [];
  for (let i = 1; i <= 5; i++) {
    players.push({
      name: cleanPlainText(form.querySelector(`[name="p${i}_name"]`)?.value || ''),
      age: Number(form.querySelector(`[name="p${i}_age"]`)?.value || 0),
      nick: cleanPlainText(form.querySelector(`[name="p${i}_nick"]`)?.value || ''),
      game_id: cleanPlainText(form.querySelector(`[name="p${i}_game_id"]`)?.value || ''),
      server_id: cleanPlainText(form.querySelector(`[name="p${i}_server_id"]`)?.value || ''),
      is_nov2026: Boolean(form.querySelector(`[name="p${i}_nov2026"]`)?.checked)
    });
  }

  const resolvedMentorId = mentorMode === 'random'
    ? 'ASIGNACION_ALEATORIA_M4L'
    : (mentorMode === 'direct'
        ? customMentorName
        : cleanPlainText(mentorSelect?.value || ''));

  const privacyEl = form.querySelector('[name="privacy_accepted"]');
  const payload = {
    website_hp: form.querySelector('[name="website_hp"]')?.value || '',
    team_name: cleanPlainText(form.querySelector('[name="team_name"]')?.value || ''),
    school_name: cleanPlainText(form.querySelector('[name="school_name"]')?.value || ''),
    school_district: cleanPlainText(form.querySelector('[name="school_district"]')?.value || ''),
    captain_email: cleanPlainText(form.querySelector('[name="captain_email"]')?.value || ''),
    captain_phone: cleanPlainText(form.querySelector('[name="captain_phone"]')?.value || ''),
    guardian_name: cleanPlainText(form.querySelector('[name="guardian_name"]')?.value || ''),
    guardian_email: cleanPlainText(form.querySelector('[name="guardian_email"]')?.value || ''),
    guardian_phone: cleanPlainText(form.querySelector('[name="guardian_phone"]')?.value || ''),
    require_contact_fields: true,
    mentor_mode: mentorMode,
    mentor_id: resolvedMentorId,
    custom_mentor_name: customMentorName,
    players,
    terms_accepted: Boolean(form.querySelector('[name="terms_accepted"]')?.checked),
    privacy_accepted: Boolean(form.querySelector('[name="privacy_accepted"]')?.checked),
    marketing_opt_in: Boolean(form.querySelector('[name="marketing_opt_in"]')?.checked)
  };

  const result = validateSquadRegistration(payload);

  if (!result.valid) {
    if (feedbackBox) {
      feedbackBox.className = 'form-feedback is-error';
      feedbackBox.innerHTML = `
        <strong>Revisa los siguientes requisitos antes de enviar:</strong>
        <ul>${result.errors.map(err => `<li>${sanitizeInput(err)}</li>`).join('')}</ul>
      `;
      feedbackBox.style.display = 'block';
    }
    return;
  }

  // Activar bloqueo debounce contra doble clic
  isSubmittingSquad = true;
  const originalBtnText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sincronizando registro oficial...';
  }

  const ticketId = `TKT-${Date.now().toString().slice(-6)}`;
  const novCount = countNovember2026Accounts(players);
  const fullRecord = Object.assign({}, payload, {
    ticket_id: ticketId,
    nov2026_count: novCount,
    official_hashtag: '#USILMarketingGamingMLBB',
    timestamp: new Date().toISOString()
  });

  // Pre-llenar automáticamente el Ticket ID en el formulario de Etapa 2 (Entrega Fase 1)
  const phase1TicketInput = document.getElementById('phase1TicketOrTeamInput');
  if (phase1TicketInput && !phase1TicketInput.value) {
    phase1TicketInput.value = ticketId;
  }

  try {
    const saved = JSON.parse(localStorage.getItem('mlbb_registered_squads') || '[]');
    saved.push(fullRecord);
    localStorage.setItem('mlbb_registered_squads', JSON.stringify(saved));
  } catch (err) {
    // Ignore storage errors
  }

  if (feedbackBox) {
    feedbackBox.className = 'form-feedback is-success';
    feedbackBox.innerHTML = `
      <strong>¡Escuadrón "${sanitizeInput(payload.team_name)}" inscrito con éxito (Etapa 1)!</strong>
      <p>Código de Ticket Oficial: <code>${sanitizeInput(ticketId)}</code> | Colegio de Procedencia: <strong>${sanitizeInput(payload.school_name)}</strong></p>
      <p>Cuentas Nuevas Nov 2026 verificadas: <strong>${novCount}/5</strong> | Mentor USIL / M4L: <strong>${sanitizeInput(payload.mentor_id)}</strong></p>
      <p style="font-size:0.84rem;color:#F2B53D;margin-top:0.35rem;">📤 <strong>Siguiente Paso (Hasta el 02 de diciembre de 2026, 23:59 h):</strong> Trabaja junto a tu Mentor USIL/M4L y entrega los links de tu Skin (#USILMarketingGamingMLBB) y Estrategia Digital en la pestaña «Entregar Proyecto Fase 1» indicando tu Ticket <code>${sanitizeInput(ticketId)}</code>.</p>
      <p id="schoolCloudSyncStatus" style="font-size:0.82rem;color:#01D3D2;margin-top:0.35rem;">✓ Respaldo local activo y sincronizando con Google Sheets + Supabase RLS...</p>
      <button type="button" class="btn btn-cyan btn-sm cut-corner-sm" onclick="window.printTicketConfirmation && window.printTicketConfirmation('${sanitizeInput(ticketId)}')" style="margin-top:0.5rem;">🖨️ Imprimir Ticket (${sanitizeInput(ticketId)})</button>
    `;
    feedbackBox.style.display = 'block';
  }

  dispatchToCloudBackends('squad', fullRecord)
    .then(syncRes => {
      const statusNode = document.getElementById('schoolCloudSyncStatus');
      if (statusNode) {
        if (syncRes.sheetsOk && syncRes.supabaseOk) {
          statusNode.textContent = '✓ Sincronizado en tiempo real con la base oficial USIL × Club M4L (Google Sheets + Supabase RLS).';
        } else if (syncRes.sheetsOk || syncRes.supabaseOk) {
          statusNode.textContent = '✓ Sincronización parcial completada; respaldo pendiente en cola de reintento.';
        } else {
          statusNode.textContent = '✓ Guardado en bóveda local segura (se sincronizará automáticamente al detectar red).';
        }
      }
    })
    .finally(() => {
      setTimeout(() => {
        isSubmittingSquad = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText || 'Inscribir Squad Oficial (5 + 1)';
        }
      }, 600);
    });
}

function handlePhase1SubmissionSubmit(e) {
  e.preventDefault();
  if (isSubmittingPhase1) return;

  const form = e.target;
  const feedbackBox = document.getElementById('phase1FormFeedback');
  const submitBtn = form.querySelector('button[type="submit"]');

  const termsEl = form.querySelector('[name="phase1_terms_accepted"], [name="phase1_terms"]');
  const privacyEl = form.querySelector('[name="phase1_privacy_accepted"]');

  const payload = {
    website_hp: form.querySelector('[name="website_hp"]')?.value || '',
    ticket_or_team: cleanPlainText(form.querySelector('[name="ticket_or_team"]')?.value || ''),
    social_link: cleanPlainText(form.querySelector('[name="social_link"]')?.value || ''),
    strategy_doc_link: cleanPlainText(form.querySelector('[name="strategy_doc_link"]')?.value || ''),
    terms_accepted: Boolean(termsEl?.checked),
    privacy_accepted: Boolean(privacyEl?.checked),
    marketing_opt_in: Boolean(form.querySelector('[name="phase1_marketing_opt_in"]')?.checked)
  };

  const result = validatePhase1Submission(payload);

  if (!result.valid) {
    if (feedbackBox) {
      feedbackBox.className = 'form-feedback is-error';
      feedbackBox.innerHTML = `
        <strong>Revisa los datos de entrega de tu Proyecto Fase 1:</strong>
        <ul>${result.errors.map(err => `<li>${sanitizeInput(err)}</li>`).join('')}</ul>
      `;
      feedbackBox.style.display = 'block';
    }
    return;
  }

  isSubmittingPhase1 = true;
  const originalBtnText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando Entrega Fase 1...';
  }

  const submissionId = `FASE1-${Date.now().toString().slice(-6)}`;
  const fullRecord = Object.assign({}, payload, {
    submission_id: submissionId,
    form_type: 'phase1_submission',
    official_hashtag: '#USILMarketingGamingMLBB',
    timestamp: new Date().toISOString()
  });

  try {
    const saved = JSON.parse(localStorage.getItem('mlbb_phase1_submissions') || '[]');
    saved.push(fullRecord);
    localStorage.setItem('mlbb_phase1_submissions', JSON.stringify(saved));
  } catch (err) {
    // Ignore storage errors
  }

  if (feedbackBox) {
    feedbackBox.className = 'form-feedback is-success';
    feedbackBox.innerHTML = `
      <strong>¡Proyecto de Fase 1 recibido con éxito!</strong>
      <p>Constancia de Entrega: <code>${sanitizeInput(submissionId)}</code> | Ticket / Squad: <strong>${sanitizeInput(payload.ticket_or_team)}</strong></p>
      <p>Publicación (#USILMarketingGamingMLBB): <code>${sanitizeInput(payload.social_link)}</code></p>
      <p>Documento Estrategia Digital: <code>${sanitizeInput(payload.strategy_doc_link)}</code></p>
      <p id="phase1CloudSyncStatus" style="font-size:0.82rem;color:#01D3D2;margin-top:0.35rem;">✓ Respaldo local activo y sincronizando entrega Fase 1 con Google Sheets + Supabase RLS...</p>
      <button type="button" class="btn btn-cyan btn-sm cut-corner-sm" onclick="window.printTicketConfirmation && window.printTicketConfirmation('${sanitizeInput(submissionId)}')" style="margin-top:0.5rem;">🖨️ Imprimir Constancia (${sanitizeInput(submissionId)})</button>
    `;
    feedbackBox.style.display = 'block';
  }

  dispatchToCloudBackends('phase1_submission', fullRecord)
    .then(syncRes => {
      const statusNode = document.getElementById('phase1CloudSyncStatus');
      if (statusNode) {
        if (syncRes.sheetsOk && syncRes.supabaseOk) {
          statusNode.textContent = '✓ Entrega Fase 1 sincronizada en tiempo real con Google Sheets + Supabase RLS.';
        } else if (syncRes.sheetsOk || syncRes.supabaseOk) {
          statusNode.textContent = '✓ Sincronización parcial completada; respaldo pendiente en cola de reintento.';
        } else {
          statusNode.textContent = '✓ Guardado en bóveda local segura (se sincronizará automáticamente al detectar red).';
        }
      }
    })
    .finally(() => {
      setTimeout(() => {
        isSubmittingPhase1 = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText || '📤 Enviar Proyecto Fase 1 (#USILMarketingGamingMLBB)';
        }
      }, 600);
    });
}

function handleMentorFormSubmit(e) {
  e.preventDefault();
  if (isSubmittingMentor) return;

  const form = e.target;
  const feedbackBox = document.getElementById('mentorFormFeedback');
  const submitBtn = form.querySelector('button[type="submit"]');

  const privacyEl = form.querySelector('[name="mentor_privacy_accepted"], [name="mentor_privacy"]');
  const applicant = {
    website_hp: form.querySelector('[name="website_hp"]')?.value || '',
    name: cleanPlainText(form.querySelector('[name="mentor_name"]')?.value || ''),
    usil_code: cleanPlainText(form.querySelector('[name="mentor_usil_code"]')?.value || ''),
    email: cleanPlainText(form.querySelector('[name="mentor_email"]')?.value || ''),
    career: cleanPlainText(form.querySelector('[name="mentor_career"]')?.value || ''),
    cycle: cleanPlainText(form.querySelector('[name="mentor_cycle"]')?.value || ''),
    specialty: cleanPlainText(form.querySelector('[name="mentor_specialty"]')?.value || ''),
    phone: cleanPlainText(form.querySelector('[name="mentor_phone"]')?.value || ''),
    reg_type: cleanPlainText(form.querySelector('[name="mentor_reg_type"]')?.value || 'Bolsa Pública'),
    terms_accepted: Boolean(form.querySelector('[name="mentor_terms"]')?.checked),
    privacy_accepted: Boolean(privacyEl?.checked),
    marketing_opt_in: Boolean(form.querySelector('[name="mentor_marketing_opt_in"], [name="mentor_opt_in"]')?.checked)
  };

  const result = validateMentorApplication(applicant);

  if (!result.valid) {
    if (feedbackBox) {
      feedbackBox.className = 'form-feedback is-error';
      feedbackBox.innerHTML = `
        <strong>No se pudo completar tu postulación como Mentor USIL / M4L:</strong>
        <ul>${result.errors.map(err => `<li>${sanitizeInput(err)}</li>`).join('')}</ul>
      `;
      feedbackBox.style.display = 'block';
    }
    return;
  }

  isSubmittingMentor = true;
  const originalBtnText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sincronizando postulación...';
  }

  const refCode = `MENTOR-USIL-${Date.now().toString().slice(-4)}`;
  const fullRecord = Object.assign({}, applicant, {
    ref_code: refCode,
    timestamp: new Date().toISOString()
  });

  try {
    const saved = JSON.parse(localStorage.getItem('mlbb_mentor_applications') || '[]');
    saved.push(fullRecord);
    localStorage.setItem('mlbb_mentor_applications', JSON.stringify(saved));
  } catch (err) {
    // Ignore storage errors
  }

  if (feedbackBox) {
    feedbackBox.className = 'form-feedback is-success';
    feedbackBox.innerHTML = `
      <strong>¡Postulación de Mentor USIL / Club M4L recibida!</strong>
      <p>Bienvenido(a), <strong>${sanitizeInput(applicant.name)}</strong> (${sanitizeInput(applicant.email)}). Código de Referencia: <code>${sanitizeInput(refCode)}</code>.</p>
      <p>El equipo del Club M4L validará tu código USIL para asignarte una escuadra y activar tu elegibilidad por hasta 7,000 Diamantes MLBB (para el Mentor Top 1), Photobook Oficial MLBB y Certificado Oficial de Liderazgo Estratégico emitido por la Carrera de Marketing USIL.</p>
      <p id="mentorCloudSyncStatus" style="font-size:0.82rem;color:#01D3D2;margin-top:0.35rem;">✓ Respaldo local activo y sincronizando con Google Sheets + Supabase RLS...</p>
      <button type="button" class="btn btn-cyan btn-sm cut-corner-sm" onclick="window.printTicketConfirmation && window.printTicketConfirmation('${sanitizeInput(refCode)}')" style="margin-top:0.5rem;">🖨️ Imprimir Constancia (${sanitizeInput(refCode)})</button>
    `;
    feedbackBox.style.display = 'block';
  }

  dispatchToCloudBackends('mentor', fullRecord)
    .then(syncRes => {
      const statusNode = document.getElementById('mentorCloudSyncStatus');
      if (statusNode) {
        if (syncRes.sheetsOk && syncRes.supabaseOk) {
          statusNode.textContent = '✓ Postulación sincronizada en tiempo real con el Comité USIL × Club M4L.';
        } else if (syncRes.sheetsOk || syncRes.supabaseOk) {
          statusNode.textContent = '✓ Sincronización parcial completada; respaldo pendiente en cola de reintento.';
        } else {
          statusNode.textContent = '✓ Guardada en bóveda local segura (se sincronizará automáticamente al detectar red).';
        }
      }
    })
    .finally(() => {
      setTimeout(() => {
        isSubmittingMentor = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText || 'Postular como Mentor USIL';
        }
      }, 600);
    });
}

function printTicketConfirmation(code) {
  if (typeof window !== 'undefined' && typeof window.print === 'function') {
    window.print();
  }
  return code;
}

if (typeof window !== 'undefined') {
  window.sanitizeInput = sanitizeInput;
  window.validateAge = validateAge;
  window.validateDni = validateDni;
  window.validateEmail = validateEmail;
  window.validateUsilEmail = validateUsilEmail;
  window.validatePhone = validatePhone;
  window.countNovember2026Accounts = countNovember2026Accounts;
  window.validateSquadRegistration = validateSquadRegistration;
  window.validatePhase1Submission = validatePhase1Submission;
  window.validateMentorApplication = validateMentorApplication;
  window.updateNovAccountsProgressUI = updateNovAccountsProgressUI;
  window.selectMentorForRegistration = selectMentorForRegistration;
  window.dispatchToCloudBackends = dispatchToCloudBackends;
  window.flushSyncRetryQueue = flushSyncRetryQueue;
  window.printTicketConfirmation = printTicketConfirmation;
  window.initFormValidation = initFormValidation;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sanitizeInput,
    validateAge,
    validateDni,
    validateEmail,
    validateUsilEmail,
    validatePhone,
    countNovember2026Accounts,
    validateSquadRegistration,
    validatePhase1Submission,
    validateMentorApplication,
    updateNovAccountsProgressUI,
    selectMentorForRegistration,
    dispatchToCloudBackends,
    flushSyncRetryQueue,
    printTicketConfirmation,
    initFormValidation
  };
}
