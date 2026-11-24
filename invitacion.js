{
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- MÚSICA ---------- */
const music = $('#music'), musicBtn = $('#music-toggle');
let musicWanted = false;
const musicState = () => {
  const on = !music.paused;
  musicBtn.setAttribute('aria-pressed', String(on));
  musicBtn.setAttribute('aria-label', on ? 'Pausar música' : 'Reproducir música');
};
music.addEventListener('play', musicState);
music.addEventListener('pause', musicState);
musicBtn.addEventListener('click', () => {
  if (music.paused) { musicWanted = true; music.play().catch(musicState); }
  else { musicWanted = false; music.pause(); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) music.pause();
  else if (musicWanted) music.play().catch(musicState);
});

/* ---------- ANIMACIONES ---------- */
const animBtn = $('#anim-toggle');
let animOn = !reduced;
const animState = () => {
  document.body.classList.toggle('still', !animOn);
  animBtn.setAttribute('aria-pressed', String(animOn));
  animBtn.setAttribute('aria-label', animOn ? 'Pausar animaciones' : 'Reanudar animaciones');
};
animBtn.addEventListener('click', () => { animOn = !animOn; animState(); });

const colors = ['#ffffff', '#f6f1e2', '#dfeacd', '#c3d8a4', '#a5c483', '#e3cf9a'];
const petalos = $('#petalos');
for (let i = 0; i < 20; i++) {
  const el = document.createElement('i');
  if (i % 3 === 0) el.className = 'hoja';
  el.style.cssText = `--x:${Math.random() * 100}%;--s:${12 + Math.random() * 10}px;--c:${colors[i % colors.length]};--d:${13 + Math.random() * 12}s;--delay:-${Math.random() * 25}s;--drift:${-70 + Math.random() * 140}px;--r:${260 + Math.random() * 480}deg`;
  petalos.append(el);
}

/* ---------- NOMBRES LETRA POR LETRA ---------- */
let idx = 0;
$$('.names .n, .names .amp').forEach(el => {
  const text = el.textContent; el.textContent = '';
  [...text].forEach(ch => {
    if (ch === ' ') { el.append(' '); return; }
    const s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', idx++); s.textContent = ch; el.append(s);
  });
});
$('.names').setAttribute('aria-label', 'Miguel Angel y Carmen Rosa');

/* ---------- ENTRADA DE SECCIONES ---------- */
$$('.reveal').forEach(sec => [...sec.children].forEach((c, i) => c.style.setProperty('--d', (i * .1).toFixed(2) + 's')));
const observer = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
}), { threshold: .08 });

/* ---------- ABRIR ---------- */
let opened = false;
function openInvitation() {
  if (opened) return; opened = true;
  musicWanted = true; music.play().catch(musicState);
  $('#envelope').classList.add('open');
  $('#cover').classList.add('opening');
  setTimeout(() => $('#cover').classList.add('leaving'), reduced ? 50 : 1700);
  setTimeout(() => {
    $('#cover').hidden = true;
    $('#invitation').hidden = false;
    $('#controls').hidden = false;
    document.body.classList.add('entered');
    animState();
    window.scrollTo(0, 0);
    $('.names').focus({ preventScroll: true });
    $$('.reveal').forEach(s => observer.observe(s));
    timelineProgress();
  }, reduced ? 200 : 2400);
}
$('#open').addEventListener('click', openInvitation);

/* ---------- CALENDARIO (diciembre 2026 empieza en martes) ---------- */
const cal = $('#cal-days');
for (let d = 0; d <= 31; d++) {
  const s = document.createElement('span'); s.style.setProperty('--i', d);
  if (d > 0) { s.textContent = d; if ((d + 1) % 7 === 0) s.classList.add('sun'); if (d === 27) s.classList.add('chosen'); }
  cal.append(s);
}

/* ---------- CUENTA REGRESIVA ---------- */
const target = new Date('2026-12-27T13:30:00-04:00').getTime();
const units = [['days', 86400000], ['hours', 3600000], ['minutes', 60000], ['seconds', 1000]];
function count() {
  let n = target - Date.now();
  if (n <= 0) { $('#countdown').hidden = true; $('#today').hidden = false; return; }
  units.forEach(([id, ms]) => {
    const el = document.getElementById(id), v = String(Math.floor(n / ms)).padStart(2, '0'); n %= ms;
    if (el.textContent !== v) { el.textContent = v; el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
  });
}
count(); setInterval(count, 1000);

/* ---------- CRONOGRAMA QUE SE LLENA AL BAJAR ---------- */
const tl = $('#timeline'), items = $$('#timeline li');
function timelineProgress() {
  const r = tl.getBoundingClientRect(), mid = innerHeight * .62;
  const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
  tl.style.setProperty('--prog', p.toFixed(3));
  items.forEach(li => li.classList.toggle('on', li.getBoundingClientRect().top + 30 < mid));
}
addEventListener('scroll', timelineProgress, { passive: true });
addEventListener('resize', timelineProgress);

/* ---------- FOTOS AMPLIABLES ---------- */
const box = $('#lightbox');
$$('[data-full]').forEach(b => b.addEventListener('click', () => {
  const img = $('#lb-img'); img.src = b.dataset.full; img.alt = b.querySelector('img').alt; box.showModal();
}));
$('.close').addEventListener('click', () => box.close());
box.addEventListener('click', e => { if (e.target === box) box.close(); });

/* ---------- CONFIRMACIÓN ---------- */
$('#rsvp').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#guest').value.trim(), people = $('#people').value;
  let msg = '¡Hola! ' + (name ? `Soy ${name}. ` : '') + 'Confirmo mi asistencia a la boda de Miguel Angel y Carmen Rosa el domingo 27 de diciembre de 2026.';
  msg += people === '1' ? ' Asistiré 1 persona.' : ` Asistiremos ${people} personas.`;
  window.open('https://wa.me/59163904181?text=' + encodeURIComponent(msg), '_blank', 'noopener');
});
}
