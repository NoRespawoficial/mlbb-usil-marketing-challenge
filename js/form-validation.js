/**
 * ============================================================================
 * MARKETING GAMING CHALLENGE 2026 — FORM VALIDATION, SECURITY & CLOUD SYNC (v6)
 * Reglas:
 * - Edad estricta escolar: 15 <= edad <= 17 años (5 titulares)
 * - Cuentas nuevas MLBB: Mínimo 3 de 5 jugadores con cuenta Noviembre 2026
 * - Correo institucional Mentor USIL: obligatorio dominio @usil.pe
 * - Hashtag oficial Fase 1: #USILMarketingGamingMLBB
 * - Seguridad: Sanitización XSS, Honeypot anti-bots, Debounce anti-doble clic
 * - Persistencia Híbrida: Envío paralelo a Google Sheets Webhook + Supabase RLS
 *   con respaldo local en localStorage y cola de reintento offline automática.
 * ============================================================================
 */

const RETRY_QUEUE_STORAGE_KEY = 'mlbb_sync_retry_queue';
let isSubmittingSquad = false;
let isSubmittingMentor = false;

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
    errors.push('El nombre del Colegio es obligatorio.');
  }
  if (!payload.school_district || String(payload.school_district).trim().length < 2) {
    errors.push('El distrito o ciudad del colegio es obligatorio.');
  }
  if (!payload.social_link || !/^https?:\/\/.+/i.test(String(payload.social_link).trim())) {
    errors.push('Debes ingresar el enlace público (URL) de la publicación con el hashtag #USILMarketingGamingMLBB.');
  }

  const validModes = ['choose', 'direct', 'random'];
  if (!validModes.includes(payload.mentor_mode)) {
    errors.push('Selecciona una modalidad de asignación de Mentor USIL.');
  }
  if ((payload.mentor_mode === 'choose' || payload.mentor_mode === 'direct') &&
      (!payload.mentor_id || String(payload.mentor_id).trim() === '')) {
    errors.push('Debes elegir un Mentor USIL del directorio o ingresar su código.');
  }

  const players = payload.players;
  if (!Array.isArray(players) || players.length !== 5) {
    errors.push('El equipo debe registrar exactamente 5 jugadores escolares titulares.');
  } else {
    players.forEach((p, idx) => {
      const num = idx + 1;
      if (!p.name || String(p.name).trim().length < 3) {
        errors.push(`Jugador ${num}: Nombre completo obligatorio.`);
      }
      if (!validateAge(p.age)) {
        errors.push(`Jugador ${num}: La edad debe estar estrictamente entre 15 y 17 años (ingresado: ${p.age ?? 'vacío'}).`);
      }
      if (!validateDni(p.dni)) {
        errors.push(`Jugador ${num}: El DNI debe tener exactamente 8 dígitos numéricos.`);
      }
      if (!p.nick || String(p.nick).trim().length < 2) {
        errors.push(`Jugador ${num}: Nickname de MLBB obligatorio.`);
      }
      if (!p.game_id || !/^\d{6,12}$/.test(String(p.game_id).trim())) {
        errors.push(`Jugador ${num}: Game ID de MLBB inválido (6 a 12 dígitos).`);
      }
      if (!p.server_id || !/^\d{4,6}$/.test(String(p.server_id).trim())) {
        errors.push(`Jugador ${num}: Zone/Server ID de MLBB inválido (4 a 6 dígitos).`);
      }
    });

    const novCount = countNovember2026Accounts(players);
    if (novCount < 3) {
      errors.push(`Regla de Cuentas Nuevas: Al menos 3 de los 5 jugadores deben tener cuenta MLBB creada en noviembre de 2026 (actualmente marcados: ${novCount}/5).`);
    }
  }

  if (!payload.terms_accepted) {
    errors.push('Debes declarar la autorización de padres/tutores o docente responsable y aceptar las Bases Oficiales V3.');
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
    errors.push('Debes aceptar el compromiso de mentoría ética y protección de datos de menores (Ley N° 29733).');
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
      <span>Mentor USIL / M4L Vinculado: <strong>${sanitizeInput(mentorName)} (${sanitizeInput(mentorId)})</strong> — Asesora tu estrategia digital</span>
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
    const itemId = record.ticket_id || record.ref_code || `SYNC-${Date.now()}`;
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
    const sheetsBody = Object.assign({ form_type: type, source: 'landing_v6' }, record);
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
    const table = type === 'mentor' ? 'mentor_applications' : 'squad_registrations';
    const endpoint = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/${table}`;
    const dbRow = type === 'mentor'
      ? {
          ref_code: record.ref_code,
          full_name: record.name,
          usil_code: record.usil_code,
          institutional_email: record.email,
          career: record.career,
          cycle: record.cycle,
          specialty: record.specialty,
          whatsapp_phone: record.phone,
          reg_type: record.reg_type || 'Bolsa Pública',
          privacy_law_29733_accepted: true,
          client_source: 'landing_v6'
        }
      : {
          ticket_id: record.ticket_id,
          team_name: record.team_name,
          school_name: record.school_name,
          school_district: record.school_district,
          social_link: record.social_link,
          official_hashtag: '#USILMarketingGamingMLBB',
          mentor_mode: record.mentor_mode,
          mentor_id: record.mentor_id,
          nov2026_count: record.nov2026_count,
          players: record.players,
          parental_consent_accepted: true,
          privacy_law_29733_accepted: true,
          client_source: 'landing_v6'
        };

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

  mentorSelect.innerHTML = '<option value="">-- Selecciona un Mentor USIL / Club M4L --</option>';
  MENTORES_DATA.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.id} — ${m.name} (${m.career} | ${m.specialty})`;
    mentorSelect.appendChild(opt);
  });
}

function initFormValidation() {
  populateSchoolMentorDropdown();

  const novCheckboxes = document.querySelectorAll('.player-nov2026-checkbox');
  novCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateNovAccountsProgressUI);
  });
  updateNovAccountsProgressUI();

  const modeRadios = document.querySelectorAll('input[name="mentor_mode"]');
  const mentorSelectWrap = document.getElementById('mentorSelectWrapper');
  const mentorSelect = document.getElementById('schoolMentorSelect');

  modeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (!mentorSelectWrap) return;
      if (radio.value === 'random' && radio.checked) {
        if (typeof window !== 'undefined' && typeof window.clearSelectedMentor === 'function') {
          window.clearSelectedMentor();
        }
        mentorSelectWrap.style.opacity = '0.5';
        if (mentorSelect) {
          mentorSelect.disabled = true;
          mentorSelect.value = 'ASIGNACION_ALEATORIA_M4L';
        }
      } else if (radio.checked) {
        mentorSelectWrap.style.opacity = '1';
        if (mentorSelect) {
          mentorSelect.disabled = false;
          if (mentorSelect.value === 'ASIGNACION_ALEATORIA_M4L') {
            mentorSelect.value = '';
          }
        }
      }
    });
  });

  const schoolForm = document.getElementById('schoolSquadForm');
  if (schoolForm) {
    schoolForm.addEventListener('submit', handleSchoolFormSubmit);
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

  const players = [];
  for (let i = 1; i <= 5; i++) {
    players.push({
      name: cleanPlainText(form.querySelector(`[name="p${i}_name"]`)?.value || ''),
      age: Number(form.querySelector(`[name="p${i}_age"]`)?.value || 0),
      dni: cleanPlainText(form.querySelector(`[name="p${i}_dni"]`)?.value || ''),
      nick: cleanPlainText(form.querySelector(`[name="p${i}_nick"]`)?.value || ''),
      game_id: cleanPlainText(form.querySelector(`[name="p${i}_game_id"]`)?.value || ''),
      server_id: cleanPlainText(form.querySelector(`[name="p${i}_server_id"]`)?.value || ''),
      is_nov2026: Boolean(form.querySelector(`[name="p${i}_nov2026"]`)?.checked)
    });
  }

  const payload = {
    website_hp: form.querySelector('[name="website_hp"]')?.value || '',
    team_name: cleanPlainText(form.querySelector('[name="team_name"]')?.value || ''),
    school_name: cleanPlainText(form.querySelector('[name="school_name"]')?.value || ''),
    school_district: cleanPlainText(form.querySelector('[name="school_district"]')?.value || ''),
    social_link: cleanPlainText(form.querySelector('[name="social_link"]')?.value || ''),
    mentor_mode: mentorMode,
    mentor_id: mentorMode === 'random' ? 'ASIGNACION_ALEATORIA_M4L' : cleanPlainText(mentorSelect?.value || ''),
    players,
    terms_accepted: Boolean(form.querySelector('[name="terms_accepted"]')?.checked)
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

  // Guardar inmediatamente en caché local para mostrar e imprimir el ticket de confirmación
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
      <strong>¡Escuadrón "${sanitizeInput(payload.team_name)}" registrado con éxito!</strong>
      <p>Código de Ticket Oficial: <code>${sanitizeInput(ticketId)}</code> | Colegio: <strong>${sanitizeInput(payload.school_name)}</strong></p>
      <p>Cuentas Nuevas Nov 2026 verificadas: <strong>${novCount}/5</strong> | Mentor USIL / M4L: <strong>${sanitizeInput(payload.mentor_id)}</strong></p>
      <p id="schoolCloudSyncStatus" style="font-size:0.82rem;color:#01D3D2;margin-top:0.35rem;">✓ Respaldo local activo y sincronizando con Google Sheets + Supabase RLS...</p>
      <button type="button" class="btn btn-cyan btn-sm cut-corner-sm" onclick="window.printTicketConfirmation && window.printTicketConfirmation('${sanitizeInput(ticketId)}')" style="margin-top:0.5rem;">🖨️ Imprimir Ticket (${sanitizeInput(ticketId)})</button>
    `;
    feedbackBox.style.display = 'block';
  }

  // Envío asíncrono en paralelo a Google Sheets Webhook y Supabase PostgreSQL
  dispatchToCloudBackends('squad', fullRecord)
    .then(syncRes => {
      const statusNode = document.getElementById('schoolCloudSyncStatus');
      if (statusNode) {
        if (syncRes.sheetsOk && syncRes.supabaseOk) {
          statusNode.textContent = '✓ Sincronizado en tiempo real con la base oficial USIL x Club M4L (Google Sheets + Supabase RLS).';
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

function handleMentorFormSubmit(e) {
  e.preventDefault();
  if (isSubmittingMentor) return;

  const form = e.target;
  const feedbackBox = document.getElementById('mentorFormFeedback');
  const submitBtn = form.querySelector('button[type="submit"]');

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
    terms_accepted: Boolean(form.querySelector('[name="mentor_terms"]')?.checked)
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
      <p>El equipo del Club M4L validará tu código USIL para habilitarte en la Bolsa Oficial de Mentores y activar tu elegibilidad al beneficio de 25% de descuento en la EPG USIL.</p>
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
          statusNode.textContent = '✓ Postulación sincronizada en tiempo real con el Comité USIL x Club M4L.';
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
  window.validateUsilEmail = validateUsilEmail;
  window.validatePhone = validatePhone;
  window.countNovember2026Accounts = countNovember2026Accounts;
  window.validateSquadRegistration = validateSquadRegistration;
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
    validateUsilEmail,
    validatePhone,
    countNovember2026Accounts,
    validateSquadRegistration,
    validateMentorApplication,
    updateNovAccountsProgressUI,
    selectMentorForRegistration,
    dispatchToCloudBackends,
    flushSyncRetryQueue,
    printTicketConfirmation,
    initFormValidation
  };
}

