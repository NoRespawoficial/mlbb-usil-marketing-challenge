/**
 * ============================================================================
 * MARKETING GAMING CHALLENGE 2026 — LIVE COUNTDOWN TIMER CONTROLLER (v6)
 * Target Deadline: 02 de Diciembre de 2026 (2026-12-02T23:59:59-05:00)
 * ============================================================================
 */

function calculateRemainingTime(deadlineIso, nowDate) {
  const targetMs = new Date(deadlineIso).getTime();
  const currentMs = (nowDate ? new Date(nowDate) : new Date()).getTime();
  const diffMs = targetMs - currentMs;

  if (isNaN(targetMs) || diffMs <= 0) {
    return {
      isExpired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    isExpired: false,
    days,
    hours,
    minutes,
    seconds
  };
}

function initCountdown(containerId = 'countdownContainer') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const deadlineIso =
    container.getAttribute('data-deadline') ||
    (typeof CONTEST_CONFIG !== 'undefined' && CONTEST_CONFIG.registrationCloseDate) ||
    '2026-12-02T23:59:59-05:00';

  const daysEl = container.querySelector('[data-cd-days]');
  const hoursEl = container.querySelector('[data-cd-hours]');
  const minutesEl = container.querySelector('[data-cd-minutes]');
  const secondsEl = container.querySelector('[data-cd-seconds]');
  const statusBadge = document.getElementById('countdownStatusBadge');

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function tick() {
    const state = calculateRemainingTime(deadlineIso);
    if (daysEl) daysEl.textContent = pad2(state.days);
    if (hoursEl) hoursEl.textContent = pad2(state.hours);
    if (minutesEl) minutesEl.textContent = pad2(state.minutes);
    if (secondsEl) secondsEl.textContent = pad2(state.seconds);

    if (state.isExpired && statusBadge) {
      statusBadge.textContent = 'Inscripciones Finalizadas';
    }
  }

  tick();
  setInterval(tick, 1000);
}

if (typeof window !== 'undefined') {
  window.calculateRemainingTime = calculateRemainingTime;
  window.initCountdown = initCountdown;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateRemainingTime, initCountdown };
}
