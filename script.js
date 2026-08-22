// ===== Config =====
// Pas deze datum aan zodra de echte datum van Rally 2026 gekend is.
// const NEXT_EVENT_DATE = new Date('2026-09-19T09:00:00');

// ===== Loader =====
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('is-hidden'), 350);
});

// ===== Sticky nav background =====
const nav = document.getElementById('nav');
const onScroll = () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 40);
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Scroll-spy active link =====
const navAnchors = document.querySelectorAll('[data-nav]');
const sections = Array.from(navAnchors)
  .map((a) => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navAnchors.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
      }
    });
  },
  { rootMargin: '-45% 0px -45% 0px' },
);
sections.forEach((s) => spyObserver.observe(s));

// ===== Reveal on scroll =====
const revealTargets = document.querySelectorAll('.section');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 },
);
revealTargets.forEach((t) => revealObserver.observe(t));

// ===== Gauge: draw ticks + animate needle/countdown =====
function buildGaugeTicks() {
  const group = document.getElementById('gaugeTicks');
  if (!group) return;

  const cx = 160,
    cy = 170,
    rOuter = 95,
    rInner = 78;
  const startAngle = -180,
    endAngle = 0; // half circle, degrees
  const tickCount = 20;
  let svg = '';
  for (let i = 0; i <= tickCount; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / tickCount);
    const rad = (angle * Math.PI) / 180;
    const x1 = cx + rInner * Math.cos(rad);
    const y1 = cy + rInner * Math.sin(rad);
    const x2 = cx + rOuter * Math.cos(rad);
    const y2 = cy + rOuter * Math.sin(rad);
    svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="gauge-tick"/>`;
  }
  group.innerHTML = svg;
}

function updateCountdown() {
  const daysLeftEl = document.getElementById('daysLeft');
  const eventDateEl = document.getElementById('eventDate');
  const needle = document.getElementById('gaugeNeedle');
  const yearEl = document.getElementById('nextYear');
  if (!daysLeftEl || !eventDateEl || !needle || !yearEl) return;

  const now = new Date();
  const diffMs = NEXT_EVENT_DATE - now;

  yearEl.textContent = NEXT_EVENT_DATE.getFullYear();

  const formatted = NEXT_EVENT_DATE.toLocaleDateString('nl-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (diffMs <= 0) {
    daysLeftEl.textContent = '🏁';
    eventDateEl.textContent = `Vandaag is het zover — ${formatted}`;
    needle.style.transform = 'rotate(90deg)';
    return;
  }

  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  daysLeftEl.textContent = daysLeft;
  eventDateEl.textContent = formatted;

  // Needle sweeps across a 90-degree-per-side gauge based on a rough
  // "planning horizon" of ~365 days out. Clamp so it stays on the dial.
  const horizonDays = 365;
  const progress = Math.min(Math.max(1 - daysLeft / horizonDays, 0), 1);
  const angleDeg = -90 + progress * 180; // -90 (left) -> +90 (right)
  needle.style.transform = `rotate(${angleDeg}deg)`;
}

buildGaugeTicks();
updateCountdown();

// ===== Sponsor strip: keep cloning until the loop has no visible end =====
const track = document.getElementById('sfeerTrack');
if (track) {
  const originalItems = Array.from(track.children);

  const buildSponsorLoop = () => {
    track.replaceChildren(...originalItems.map((item) => item.cloneNode(true)));

    const originalWidth = track.scrollWidth;
    const marquee = track.closest('.sponsor-marquee') || track.parentElement;
    const minWidth = (marquee?.offsetWidth || window.innerWidth) + originalWidth * 2;

    while (track.scrollWidth < minWidth) {
      originalItems.forEach((item) => track.appendChild(item.cloneNode(true)));
    }

    track.style.setProperty('--marquee-distance', `${originalWidth}px`);
  };

  window.addEventListener('load', buildSponsorLoop);
  window.addEventListener('resize', buildSponsorLoop);
  buildSponsorLoop();
}
