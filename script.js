/* =============================================
   ABCJ – script.js
   ============================================= */

'use strict';

/* ---- Utility: throttle ---- */
function throttle(fn, ms) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn.apply(this, args); }
  };
}

/* =============================================
   1. HEADER – scroll effect + active links
   ============================================= */
const header = document.getElementById('header');

function updateHeader() {
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', throttle(updateHeader, 80));
updateHeader();

/* Active nav link on scroll */
const sections  = document.querySelectorAll('main section[id]');
const navLinks  = document.querySelectorAll('.nav__link');

function setActiveLink() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}
window.addEventListener('scroll', throttle(setActiveLink, 100));

/* =============================================
   2. MOBILE MENU – hamburger toggle
   ============================================= */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

function toggleMenu(force) {
  const isOpen = hamburger.classList.contains('open');
  const open   = force !== undefined ? force : !isOpen;
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
  mobileMenu.setAttribute('aria-hidden', !open);
  if (open) {
    mobileMenu.classList.add('open');
  } else {
    mobileMenu.classList.remove('open');
  }
}

hamburger.addEventListener('click', () => toggleMenu());

/* Close when a mobile link is clicked */
document.querySelectorAll('.mobile-menu__link').forEach(link => {
  link.addEventListener('click', () => toggleMenu(false));
});

/* Close on outside click */
document.addEventListener('click', e => {
  if (!header.contains(e.target)) toggleMenu(false);
});

/* =============================================
   3. SMOOTH SCROLL
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--header-h')) || 72;
    window.scrollTo({
      top: target.offsetTop - offset,
      behavior: 'smooth'
    });
  });
});

/* =============================================
   4. HERO PARALLAX
   ============================================= */
const heroBg = document.getElementById('hero-bg');
if (heroBg) {
  heroBg.classList.add('loaded'); // trigger subtle scale-in
  window.addEventListener('scroll', throttle(() => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
  }, 16));
}

/* Scroll indicator click */
const heroScroll = document.getElementById('hero-scroll');
if (heroScroll) {
  heroScroll.addEventListener('click', () => {
    const stats = document.getElementById('stats');
    if (stats) stats.scrollIntoView({ behavior: 'smooth' });
  });
}

/* =============================================
   5. COUNTER ANIMATION (Intersection Observer)
   ============================================= */
const statCards = document.querySelectorAll('.stat-card');

function animateCounter(el, target, duration = 1800) {
  let start     = null;
  const span    = el.querySelector('.stat-card__number');
  if (!span || span.dataset.animated) return;
  span.dataset.animated = 'true';
  const prefix = el.dataset.prefix || '';

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    span.textContent = prefix + Math.round(eased * target).toLocaleString('pt-BR');
    if (progress < 1) requestAnimationFrame(step);
    else span.textContent = prefix + target.toLocaleString('pt-BR');
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.target, 10);
      animateCounter(entry.target, target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

statCards.forEach(card => counterObserver.observe(card));

/* =============================================
   6. SCROLL REVEAL (fade + slide up)
   ============================================= */
const revealEls = document.querySelectorAll('.reveal, .stat-card, .project-card, .mvv__item, .about__img-wrap, .section-header, .contact__info, .contact-form');
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings
      const siblings = [...entry.target.parentElement.children].filter(c => c.classList.contains('reveal'));
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* =============================================
   7. PARTNER CAROUSEL – pause on hover (CSS handles animation,
      JS provides dynamic duplication insurance)
   ============================================= */
(function setupCarousel() {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  // CSS animation already handles infinite scroll via duplication in HTML
  // Nothing extra needed; hover pause is handled by CSS
})();

/* =============================================
   8. CONTACT FORM – validation
   ============================================= */
const contactForm = document.getElementById('contact-form');

function getField(id)  { return document.getElementById(id); }
function getError(id)  { return document.getElementById('error-' + id); }

function showError(fieldId, msg) {
  const input = getField(fieldId);
  const error = getError(fieldId);
  if (input) input.classList.add('error');
  if (error) error.textContent = msg;
}

function clearError(fieldId) {
  const input = getField(fieldId);
  const error = getError(fieldId);
  if (input) input.classList.remove('error');
  if (error) error.textContent = '';
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
  let valid = true;
  const nome     = getField('nome').value.trim();
  const email    = getField('email').value.trim();
  const assunto  = getField('assunto').value;
  const mensagem = getField('mensagem').value.trim();

  clearError('nome');
  clearError('email');
  clearError('assunto');
  clearError('mensagem');

  if (!nome) {
    showError('nome', 'Por favor, informe seu nome.'); valid = false;
  } else if (nome.length < 3) {
    showError('nome', 'Nome deve ter pelo menos 3 caracteres.'); valid = false;
  }

  if (!email) {
    showError('email', 'Por favor, informe seu e-mail.'); valid = false;
  } else if (!validateEmail(email)) {
    showError('email', 'Informe um e-mail válido.'); valid = false;
  }

  if (!assunto) {
    showError('assunto', 'Selecione um assunto.'); valid = false;
  }

  if (!mensagem) {
    showError('mensagem', 'Por favor, escreva sua mensagem.'); valid = false;
  } else if (mensagem.length < 10) {
    showError('mensagem', 'Mensagem deve ter pelo menos 10 caracteres.'); valid = false;
  }

  return valid;
}

/* Live validation on blur */
['nome','email','assunto','mensagem'].forEach(id => {
  const el = getField(id);
  if (el) {
    el.addEventListener('blur', () => {
      if (el.value.trim()) clearError(id);
    });
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) clearError(id);
    });
  }
});

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    const btn     = document.getElementById('form-submit');
    const success = document.getElementById('form-success');

    btn.disabled  = true;
    btn.textContent = 'Enviando…';

    // Simulate async send
    setTimeout(() => {
      btn.disabled    = false;
      btn.textContent = 'Enviar mensagem';
      contactForm.reset();
      success.textContent = '✅ Mensagem enviada! Entraremos em contato em breve.';
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 5000);
    }, 1400);
  });
}

/* =============================================
   9. MICRO-INTERACTIONS – button ripple effect
   ============================================= */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const rect   = this.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute; border-radius:50%; transform:scale(0); animation:ripple .5s linear;
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
      background:rgba(255,255,255,.25); pointer-events:none;
    `;
    this.style.position = 'relative';
    this.style.overflow  = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
});

/* Inject ripple keyframes */
const style = document.createElement('style');
style.textContent = `@keyframes ripple { to { transform:scale(2.5); opacity:0; } }`;
document.head.appendChild(style);

/* =============================================
   7. GALLERY LOAD MORE
   ============================================= */
const loadMoreBtn = document.getElementById('load-more-btn');
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => {
    const hiddenItems = document.querySelectorAll('.gallery-item.hidden');
    // Show next 12 items
    for (let i = 0; i < 12 && i < hiddenItems.length; i++) {
      hiddenItems[i].classList.remove('hidden');
    }
    // If no more hidden items, remove the button
    if (document.querySelectorAll('.gallery-item.hidden').length === 0) {
      loadMoreBtn.parentElement.style.display = 'none';
    }
  });
}
