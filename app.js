'use strict';
const cards = Array.from(document.querySelectorAll('.card'));
const audio = document.querySelector('audio');
const hint = document.querySelector('#hint');
let progress = 0;
let requestedFrame = 0;
let soundBlocked = false;
let audioPending = false;
let interacted = false;

function updateHint() {
  hint.textContent = soundBlocked ? 'Tap anywhere for music · ਸੰਗੀਤ ਲਈ ਟੈਪ ਕਰੋ' :
    progress < 0.002 ? 'Scroll to open · ਅੱਗੇ ਸਕ੍ਰੋਲ ਕਰੋ' : '';
}

function render() {
  requestedFrame = 0;
  const scrollRange = document.documentElement.scrollHeight - innerHeight;
  progress = Math.min(1, Math.max(0, scrollY / Math.max(1, scrollRange)));
  const position = progress * (cards.length - 1);
  const current = Math.floor(position);
  const fraction = position - current;
  // Hold each complete card while reading, then slide to the next card.
  const transition = Math.max(0, (fraction - 0.68) / 0.32);
  cards.forEach((card, index) => {
    const offset = (index - current - transition) * 100;
    card.style.transform = 'translateX(' + offset + '%)';
    card.style.visibility = Math.abs(offset) <= 100 ? 'visible' : 'hidden';
    card.setAttribute('aria-hidden', index !== Math.round(current + transition));
  });
  updateHint();
}

function requestRender() {
  if (!requestedFrame) requestedFrame = requestAnimationFrame(render);
}

function startMusic() {
  interacted = true;
  if (document.hidden || !audio.paused || audioPending) return;
  audioPending = true;
  audio.play().then(() => {
    soundBlocked = false;
  }).catch(error => {
    if (error.name === 'NotAllowedError') soundBlocked = true;
  }).finally(() => {
    audioPending = false;
    updateHint();
  });
}

addEventListener('scroll', requestRender, { passive: true });
addEventListener('resize', requestRender);
addEventListener('wheel', startMusic, { passive: true });
addEventListener('touchend', startMusic, { passive: true });
addEventListener('click', startMusic);
addEventListener('keydown', event => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) startMusic();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) audio.pause();
  else if (interacted && !soundBlocked) startMusic();
});
render();
