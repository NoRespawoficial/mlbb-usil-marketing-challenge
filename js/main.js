/**
 * ============================================================================
 * MARKETING GAMING CHALLENGE 2026 — MAIN INITIALIZER & GAMIFICATION ENGINE (v6)
 * Incluye:
 * - Parameterized EPG Benefit Banner
 * - Carrusel Interactivo de Héroes MLBB en el Hero (Swipe + Controles + Auto-rotación)
 * - Tarjetas Flip 3D Interactivas (`transform-style: preserve-3d`, `rotateY(180deg)`)
 *   al hacer clic o toque en Mecánica, Roles 5+1 y Premios
 * ============================================================================
 */

function syncParameterizedEpgBenefitUI() {
  if (typeof CONTEST_CONFIG === 'undefined' || !CONTEST_CONFIG.mentorEpgBenefit) return;
  const epg = CONTEST_CONFIG.mentorEpgBenefit;

  const pctNodes = document.querySelectorAll('[data-epg-discount-pct]');
  pctNodes.forEach(node => {
    node.textContent = `${epg.discountPercentage}%`;
  });

  const statusNodes = document.querySelectorAll('[data-epg-status-text]');
  statusNodes.forEach(node => {
    node.textContent = epg.status;
  });

  const programNodes = document.querySelectorAll('[data-epg-programs]');
  programNodes.forEach(node => {
    node.textContent = epg.programTypes;
  });
}

/**
 * Inicializa el Carrusel Interactivo de Héroes MLBB en la sección Hero.
 */
function initHeroCarousel() {
  const carousel = document.getElementById('heroCharacterCarousel');
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll('.hero-carousel-slide'));
  const dots = Array.from(carousel.querySelectorAll('.hero-carousel-dot'));
  const prevBtn = document.getElementById('heroCarouselPrev');
  const nextBtn = document.getElementById('heroCarouselNext');
  const activeNameEl = document.getElementById('heroActiveCharacterName');
  const activeRoleEl = document.getElementById('heroActiveCharacterRole');

  if (!slides.length) return;

  let currentIndex = 0;
  let autoPlayTimer = null;
  let touchStartX = 0;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => {
      const active = idx === currentIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      if (active) {
        if (activeNameEl && slide.dataset.heroName) {
          activeNameEl.textContent = slide.dataset.heroName;
        }
        if (activeRoleEl && slide.dataset.heroRole) {
          activeRoleEl.textContent = slide.dataset.heroRole;
        }
      }
    });

    dots.forEach((dot, idx) => {
      const active = idx === currentIndex;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(nextSlide, 4800);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoPlay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      startAutoPlay();
    });
  });

  carousel.addEventListener('mouseenter', stopAutoPlay);
  carousel.addEventListener('mouseleave', startAutoPlay);

  carousel.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 36) {
      if (deltaX < 0) nextSlide();
      else prevSlide();
      startAutoPlay();
    }
  }, { passive: true });

  showSlide(0);
  startAutoPlay();
}

/**
 * Inicializa las Tarjetas Flip 3D interactivas (`transform-style: preserve-3d`, `rotateY(180deg)`)
 * al hacer clic, toque o presionar Enter/Espacio.
 */
function initFlipCards() {
  const flipCards = document.querySelectorAll('.flip-card-3d');
  if (!flipCards.length) return;

  flipCards.forEach(card => {
    function toggleFlip(e) {
      // No voltear si el usuario hizo clic directamente en un enlace, botón o control interactivo interno
      if (e && e.target && typeof e.target.closest === 'function') {
        const interactiveTarget = e.target.closest('a, button, input, select, textarea, label');
        if (interactiveTarget && interactiveTarget !== card) {
          return;
        }
      }
      const flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    }

    card.addEventListener('click', toggleFlip);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlip(e);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  syncParameterizedEpgBenefitUI();

  if (typeof initCountdown === 'function') {
    initCountdown('countdownContainer');
  }
  if (typeof initHeroCarousel === 'function') {
    initHeroCarousel();
  }
  if (typeof initFlipCards === 'function') {
    initFlipCards();
  }
  if (typeof initMentoresFilter === 'function') {
    initMentoresFilter();
  }
  if (typeof initFormValidation === 'function') {
    initFormValidation();
  }
  if (typeof initBasesModal === 'function') {
    initBasesModal();
  }
});

if (typeof window !== 'undefined') {
  window.syncParameterizedEpgBenefitUI = syncParameterizedEpgBenefitUI;
  window.initHeroCarousel = initHeroCarousel;
  window.initFlipCards = initFlipCards;
}
