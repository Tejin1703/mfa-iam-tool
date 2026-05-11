/* =============================================
   MAIN.JS — Tommy Le IT & Cloud Security Portfolio
   ============================================= */

// ── Matrix Rain ──────────────────────────────
(function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, cols, drops;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols = Math.floor(W / 18);
    drops = Array(cols).fill(1);
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = 'アイウエオABCDEFGHIJK0123456789@#$%^&*<>/\\|{}[]';

  function drawMatrix() {
    ctx.fillStyle = 'rgba(10, 13, 18, 0.05)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#00ff88';
    ctx.font = '14px Fira Code, monospace';
    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * 18, drops[i] * 18);
      if (drops[i] * 18 > H && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  setInterval(drawMatrix, 50);
})();

// ── Navbar scroll ─────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Mobile hamburger ──────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(l =>
  l.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ── Terminal typewriter (real info) ───────────
(function initTerminal() {
  const cmdEl    = document.getElementById('typed-cmd');
  const outputEl = document.getElementById('terminal-output');

  const command = 'cat whoami.json';
  const output = [
    { key: 'name',     val: '"Tommy Le"' },
    { key: 'role',     val: '"IT & Cloud Security Professional"' },
    { key: 'learning', val: '"AWS · CCNA · CompTIA"' },
    { key: 'target',   val: '"Help Desk / MSP / Internship"' },
    { key: 'status',   val: '"Open to Work"', green: true },
  ];

  let ci = 0;
  function typeCmd() {
    if (ci < command.length) {
      cmdEl.textContent += command[ci++];
      setTimeout(typeCmd, 80);
    } else {
      setTimeout(showOutput, 400);
    }
  }

  let oi = 0;
  function showOutput() {
    if (oi < output.length) {
      const item = output[oi++];
      const line = document.createElement('div');
      line.innerHTML = `<span class="t-key">"${item.key}"</span>: <span class="t-val${item.green ? ' t-green' : ''}">${item.val}</span>`;
      outputEl.appendChild(line);
      setTimeout(showOutput, 220);
    }
  }

  setTimeout(typeCmd, 900);
})();

// ── Skill bars animate on scroll ─────────────
const fills = document.querySelectorAll('.fill');
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('animated');
      skillObs.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });
fills.forEach(el => skillObs.observe(el));

// ── Project filter ────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
      if (match) {
        card.style.animation = 'none';
        void card.offsetHeight;
        card.style.animation = 'fadeInUp 0.4s ease forwards';
      }
    });
  });
});

// ── Fade-in on scroll ─────────────────────────
const fadeEls = document.querySelectorAll(
  '.skill-card, .project-card, .cert-card, .about-card, .stat, .showcase-info, .showcase-visual'
);
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 70);
      fadeObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  fadeObs.observe(el);
});

// ── Contact form (Formspree ready) ───────────
const form      = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  // ⬇️ When hosted, replace with your real Formspree endpoint:
  // const res = await fetch('https://formspree.io/f/YOUR_ID', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     name: document.getElementById('name').value,
  //     email: document.getElementById('email').value,
  //     message: document.getElementById('message').value,
  //   }),
  // });

  // Simulated success (remove timeout below once Formspree is connected)
  setTimeout(() => {
    submitBtn.textContent = '✓ Message Sent!';
    submitBtn.style.background = '#00e07a';
    form.reset();
    setTimeout(() => {
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
      submitBtn.style.background = '';
    }, 3000);
  }, 1200);
});

// ── Visitor counter display (GitHub Pages ready) ──
// Uncomment once hosted if you add a visitor API
// fetch('https://api.countapi.xyz/hit/tommyle-portfolio/visits')
//   .then(r => r.json())
//   .then(d => {
//     const el = document.getElementById('visitor-count');
//     if (el) el.textContent = d.value.toLocaleString();
//   });

// ── Inject keyframes ──────────────────────────
const style = document.createElement('style');
style.textContent = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}`;
document.head.appendChild(style);
