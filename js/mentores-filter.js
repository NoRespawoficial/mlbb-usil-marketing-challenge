/**
 * Mentor Filter, Search and 1-Click Selection Controller (v6)
 * Tripartite Alliance: Mobile Legends: Bang Bang × USIL Carrera de Marketing × Club M4L
 */

const SPECIALTIES = [
  'Todas',
  'Branding & Concepto',
  'Growth & Viralización',
  'Dirección de Arte & Skins',
  'Estrategia Esports & Pitch'
];

const AVAILABILITY_FILTERS = ['Todas', 'Disponibles'];

const SPECIALTY_ALIASES = {
  'all': 'Todas',
  'todas': 'Todas'
};

const SPECIALTY_EQUIVALENTS = {
  'Branding & Concepto': ['Branding & Concepto', 'Branding & Concept Art', 'Estrategia Digital'],
  'Growth & Viralización': ['Growth & Viralización', 'TikTok & Growth Marketing', 'Estrategia Digital'],
  'Dirección de Arte & Skins': ['Dirección de Arte & Skins', 'Branding & Concept Art'],
  'Estrategia Esports & Pitch': ['Estrategia Esports & Pitch', 'Esports & Metagame', 'Liderazgo & Pitch']
};

let currentSpecialty = 'Todas';
let currentAvailability = 'Todas';
let searchQuery = '';
let selectedMentorId = null;

function resolveMentorsDataset() {
  if (typeof MENTORES_DATA !== 'undefined' && Array.isArray(MENTORES_DATA)) {
    return MENTORES_DATA;
  }
  if (typeof window !== 'undefined' && Array.isArray(window.MENTORES_DATA)) {
    return window.MENTORES_DATA;
  }
  return [];
}

function normalizeSpecialtyFilter(spec) {
  if (!spec) return 'Todas';
  const key = String(spec).trim().toLowerCase();
  return SPECIALTY_ALIASES[key] || String(spec).trim();
}

/**
 * Filters the mentor array based on specialty, availability, and search term.
 */
function filterMentors(mentors, specialty = 'Todas', availability = 'Todas', query = '') {
  const source = Array.isArray(mentors) ? mentors : resolveMentorsDataset();
  const normalizedSpec = normalizeSpecialtyFilter(specialty);
  const q = String(query || '').trim().toLowerCase();

  return source.filter((m) => {
    if (normalizedSpec !== 'Todas') {
      const equivalents = SPECIALTY_EQUIVALENTS[normalizedSpec] || [normalizedSpec];
      if (m.specialty !== normalizedSpec && !equivalents.includes(m.specialty)) {
        return false;
      }
    }

    if (availability === 'Disponibles' && m.availability !== 'disponible') {
      return false;
    }

    if (q) {
      const nameMatch = m.name.toLowerCase().includes(q);
      const careerMatch = m.career.toLowerCase().includes(q);
      const specMatch = m.specialty.toLowerCase().includes(q);
      const bioMatch = (m.bio || '').toLowerCase().includes(q);
      const skillsMatch = Array.isArray(m.skills) && m.skills.some((s) => s.toLowerCase().includes(q));

      if (!nameMatch && !careerMatch && !specMatch && !bioMatch && !skillsMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Creates mentor card HTML string with chamfered geometry and semantic badges.
 */
function createMentorCardMarkup(m) {
  const isAvailable = m.availability === 'disponible';
  const isSelected = selectedMentorId === m.id;

  let statusBadgeClass = 'status-disponible';
  let statusText = '🟢 Disponible';
  if (m.availability === 'asignado') {
    statusBadgeClass = 'status-asignado';
    statusText = `🟡 Asignado${m.squadName ? ` (${m.squadName})` : ''}`;
  } else if (m.availability === 'completo') {
    statusBadgeClass = 'status-completo';
    statusText = `🔴 Cupo Completo${m.squadName ? ` (${m.squadName})` : ''}`;
  }

  const skillsHtml = (m.skills || [])
    .map((skill) => `<span class="mentor-skill-tag">${skill}</span>`)
    .join('');

  const m4lBadge = m.m4lMember
    ? `<span class="badge badge-m4l-mini" title="${m.m4lRole || 'Miembro Club M4L'}">★ ${m.m4lRole || 'Club M4L'}</span>`
    : `<span class="badge badge-usil-mini" title="Estudiante USIL">USIL Esports</span>`;

  const btnMarkup = isAvailable
    ? `<button type="button" class="btn btn-sm btn-primary cut-btn mentor-select-btn" data-mentor-id="${m.id}" data-mentor-name="${m.name}" aria-label="Elegir a ${m.name} como mentor">
        <span>${isSelected ? '✓ Especialidad Elegida' : 'Elegir esta Especialidad M4L'}</span>
      </button>`
    : `<button type="button" class="btn btn-sm btn-secondary cut-btn mentor-select-btn" disabled aria-label="Mentor no disponible">
        <span>${m.availability === 'completo' ? 'Cupo Completo' : 'Asignado'}</span>
      </button>`;

  return `
    <article class="mentor-card cut-border-wrap ${isSelected ? 'is-selected' : ''} ${!isAvailable ? 'is-unavailable' : ''}" id="mentor-card-${m.id}" data-mentor-id="${m.id}">
      <div class="cut-inner">
        <div class="mentor-top-bar">
          <div class="mentor-meta">
            <span class="mentor-id-badge">${m.id}</span>
            <span class="mentor-cycle">${m.cycle}</span>
          </div>
          <div class="mentor-status-badge ${statusBadgeClass}">${statusText}</div>
        </div>

        <div class="mentor-identity">
          <h3 class="mentor-name">${m.name}</h3>
          <p class="mentor-career">${m.career}</p>
          <div class="mentor-badges-row">
            <span class="badge badge-specialty">${m.specialty}</span>
            ${m4lBadge}
          </div>
        </div>

        <p class="mentor-bio">${m.bio}</p>

        <div class="mentor-skills-wrap">
          <strong class="mentor-skills-title">Enfoque de Asesoría & Habilidades:</strong>
          <div class="mentor-skills-list">
            ${skillsHtml}
          </div>
        </div>

        <div class="mentor-card-footer">
          ${btnMarkup}
        </div>
      </div>
    </article>
  `;
}

/**
 * Renders mentor cards into the mentor grid container.
 */
function renderMentoresGrid(mentors) {
  const source = Array.isArray(mentors) ? mentors : resolveMentorsDataset();
  const grid = document.getElementById('mentoresGridContainer') || document.getElementById('mentores-grid');
  const countEl = document.getElementById('mentoresCountLabel') || document.getElementById('mentores-count-display');
  if (!grid) return;

  const filtered = filterMentors(source, currentSpecialty, currentAvailability, searchQuery);

  if (countEl) {
    countEl.textContent = `Mostrando ${filtered.length} de ${source.length} perfiles de especialidad M4L disponibles`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="mentores-empty-state">
        <p class="empty-icon">🔍</p>
        <h4>No se encontraron perfiles de especialidad</h4>
        <p>Intenta ajustar tus criterios de búsqueda o seleccionar otra especialidad.</p>
        <button type="button" class="btn btn-secondary cut-btn btn-sm" id="btnResetFilters">
          <span>Restablecer Filtros</span>
        </button>
      </div>
    `;

    const resetBtn = document.getElementById('btnResetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetFilters();
      });
    }
    return;
  }

  grid.innerHTML = filtered.map(createMentorCardMarkup).join('');

  grid.querySelectorAll('.mentor-select-btn:not([disabled])').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const mId = btn.getAttribute('data-mentor-id');
      selectMentor(mId);
    });
  });
}

/**
 * Selects a mentor by ID, updates form state, highlights selected mentor,
 * and triggers smooth scroll to registration form.
 */
function selectMentor(mentorId) {
  const source = resolveMentorsDataset();
  const mentor = source.find((m) => m.id === mentorId);
  if (!mentor) return;

  if (mentor.availability !== 'disponible') {
    return;
  }

  selectedMentorId = mentorId;
  renderMentoresGrid(source);

  if (typeof window !== 'undefined' && typeof window.selectMentorForRegistration === 'function') {
    window.selectMentorForRegistration(mentor.id, mentor.name);
  } else if (typeof window !== 'undefined' && typeof window.bindSelectedMentorToForm === 'function') {
    window.bindSelectedMentorToForm(mentor);
  }
}

/**
 * Clears currently selected mentor.
 */
function clearSelectedMentor() {
  selectedMentorId = null;
  const mentorSelect = document.getElementById('schoolMentorSelect') || document.getElementById('selected_mentor_id');
  if (mentorSelect) {
    mentorSelect.value = '';
  }
  const selectedBanner = document.getElementById('selectedMentorBanner');
  if (selectedBanner) {
    selectedBanner.style.display = 'none';
  }
  renderMentoresGrid(resolveMentorsDataset());
}

/**
 * Resets all filters to default.
 */
function resetFilters() {
  currentSpecialty = 'Todas';
  currentAvailability = 'Todas';
  searchQuery = '';

  const searchInput = document.getElementById('mentorSearchInput') || document.getElementById('mentores-search-input');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.mentor-filter-btn, .specialty-pill').forEach((pill, idx) => {
    const spec = pill.getAttribute('data-specialty');
    pill.classList.toggle('is-active', spec === 'all' || spec === 'Todas' || idx === 0);
  });

  renderMentoresGrid(resolveMentorsDataset());
}

/**
 * Initializes filter pills and search inputs for the Bolsa de Mentores.
 */
function initMentoresFilter() {
  const grid = document.getElementById('mentoresGridContainer') || document.getElementById('mentores-grid');
  if (!grid) return;

  const filterBtns = document.querySelectorAll('.mentor-filter-btn, .specialty-pill');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      currentSpecialty = normalizeSpecialtyFilter(btn.getAttribute('data-specialty'));
      renderMentoresGrid(resolveMentorsDataset());
    });
  });

  const searchInput = document.getElementById('mentorSearchInput') || document.getElementById('mentores-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderMentoresGrid(resolveMentorsDataset());
    });
  }

  renderMentoresGrid(resolveMentorsDataset());
}

if (typeof window !== 'undefined') {
  window.SPECIALTIES = SPECIALTIES;
  window.AVAILABILITY_FILTERS = AVAILABILITY_FILTERS;
  window.filterMentors = filterMentors;
  window.createMentorCardMarkup = createMentorCardMarkup;
  window.renderMentoresGrid = renderMentoresGrid;
  window.selectMentor = selectMentor;
  window.clearSelectedMentor = clearSelectedMentor;
  window.resetFilters = resetFilters;
  window.initMentoresFilter = initMentoresFilter;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SPECIALTIES,
    AVAILABILITY_FILTERS,
    filterMentors,
    createMentorCardMarkup,
    renderMentoresGrid,
    selectMentor,
    clearSelectedMentor,
    resetFilters,
    initMentoresFilter
  };
}
