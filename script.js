// script.js
// --- Configurable parameters ---
const NUM_SEGMENTS = 8; // 1 head + 7 tail
const SEGMENT_SPACING = 28; // px between segments
const EASING = 0.22; // trailing smoothness

// --- State ---
let segments = [];
let mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };
let isTouch = false;

// --- Utility: Get angle between two points ---
function getAngle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

// --- Create Cat Segments ---
function createCat() {
  const container = document.getElementById('cat-cursor');
  segments = [];
  container.innerHTML = '';

  // Head
  const head = document.createElement('div');
  head.className = 'cat-segment cat-head';
  head.innerHTML = `
    <div class="cat-face">
      <div class="cat-ear left"></div>
      <div class="cat-ear right"></div>
      <div class="cat-eye left"></div>
      <div class="cat-eye right"></div>
      <div class="cat-nose"></div>
      <div class="cat-whisker left"></div>
      <div class="cat-whisker right"></div>
      <div class="cat-smile"></div>
    </div>
  `;
  container.appendChild(head);
  segments.push({ el: head, x: mouse.x, y: mouse.y, angle: 0 });

  // Tail/body segments
  for (let i = 1; i < NUM_SEGMENTS; i++) {
    const seg = document.createElement('div');
    seg.className = 'cat-segment cat-tail-segment';
    container.appendChild(seg);
    segments.push({ el: seg, x: mouse.x, y: mouse.y, angle: 0 });
  }
}

// --- Animate Segments ---
function animateCat() {
  let prev = { x: mouse.x, y: mouse.y };
  let prevAngle = 0;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    seg.x += (prev.x - seg.x) * EASING;
    seg.y += (prev.y - seg.y) * EASING;
    seg.angle = getAngle(seg.x, seg.y, prev.x, prev.y);
    // Place segment
    let scale = 1 - i * 0.08;
    let opacity = 1 - i * 0.11;
    seg.el.style.transform = `translate(${seg.x - 28}px, ${seg.y - 28}px) rotate(${i === 0 ? seg.angle : prevAngle}rad) scale(${scale})`;
    seg.el.style.opacity = opacity;
    prev = {
      x: seg.x - Math.cos(seg.angle) * SEGMENT_SPACING,
      y: seg.y - Math.sin(seg.angle) * SEGMENT_SPACING
    };
    prevAngle = seg.angle;
  }
  // Head always on top
  segments[0].el.style.zIndex = 10;

  // Bonus: hover effect when head is near cursor
  const head = segments[0].el;
  const dx = segments[0].x - mouse.x;
  const dy = segments[0].y - mouse.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if (dist < 32) {
    head.classList.add('near-cursor');
  } else {
    head.classList.remove('near-cursor');
  }

  requestAnimationFrame(animateCat);
}

// --- Mouse/Touch Tracking ---
function updatePointer(e) {
  if (e.touches) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    isTouch = true;
  } else {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    isTouch = false;
  }
}
window.addEventListener('mousemove', updatePointer, { passive: true });
window.addEventListener('touchmove', updatePointer, { passive: false });
window.addEventListener('touchstart', updatePointer, { passive: false });

// --- Responsive: Recreate on resize ---
window.addEventListener('resize', () => {
  createCat();
});

// --- Blinking and Smiling Logic ---
let blinkTimeout;
function scheduleBlink() {
  const next = 3000 + Math.random() * 2000;
  blinkTimeout = setTimeout(() => {
    const eyes = document.querySelectorAll('.cat-eye');
    eyes.forEach(e => e.classList.add('blink'));
    setTimeout(() => {
      eyes.forEach(e => e.classList.remove('blink'));
      scheduleBlink();
    }, 120);
  }, next);
}
scheduleBlink();

// Smile on idle
let idleTimeout;
function resetIdleTimer() {
  clearTimeout(idleTimeout);
  document.querySelector('.cat-head')?.classList.remove('smiling');
  idleTimeout = setTimeout(() => {
    document.querySelector('.cat-head')?.classList.add('smiling');
  }, 2000);
}
window.addEventListener('mousemove', resetIdleTimer, { passive: true });
window.addEventListener('touchmove', resetIdleTimer, { passive: true });
resetIdleTimer();

// --- Init ---
createCat();
requestAnimationFrame(animateCat); 