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

if (hamburger) hamburger.addEventListener('click', () => toggleMenu());

document.querySelectorAll('.mobile-menu__link').forEach(link => {
  link.addEventListener('click', () => toggleMenu(false));
});

document.addEventListener('click', e => {
  if (header && !header.contains(e.target)) toggleMenu(false);
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
  heroBg.classList.add('loaded');
  window.addEventListener('scroll', throttle(() => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
  }, 16));
}

/* =============================================
   5. COUNTER ANIMATION
   ============================================= */
const statCards = document.querySelectorAll('.stat-card');

function animateCounter(el, target, duration = 1800) {
  let start = null;
  const span = el.querySelector('.stat-card__number');
  if (!span || span.dataset.animated) return;
  span.dataset.animated = 'true';
  const prefix = el.dataset.prefix || '';

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
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
   6. SCROLL REVEAL
   ============================================= */
const revealEls = document.querySelectorAll('.reveal, .stat-card, .project-card, .mvv__item, .about__img-wrap, .section-header, .contact__info, .contact-form');
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
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
   7. CONTACT FORM
   ============================================= */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = document.getElementById('form-submit');
    const success = document.getElementById('form-success');
    btn.disabled = true;
    btn.textContent = 'Enviando…';
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Enviar mensagem';
      contactForm.reset();
      success.textContent = '✅ Mensagem enviada! Entraremos em contato em breve.';
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 5000);
    }, 1400);
  });
}

/* =============================================
   8. MICRO-INTERACTIONS
   ============================================= */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute; border-radius:50%; transform:scale(0); animation:ripple .5s linear;
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
      background:rgba(255,255,255,.25); pointer-events:none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `@keyframes ripple { to { transform:scale(2.5); opacity:0; } }`;
document.head.appendChild(rippleStyle);

/* =============================================
   9. GALLERY LOAD MORE
   ============================================= */
const loadMoreBtn = document.getElementById('load-more-btn');
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => {
    const hiddenItems = document.querySelectorAll('.gallery-item.hidden');
    for (let i = 0; i < 12 && i < hiddenItems.length; i++) {
      hiddenItems[i].classList.remove('hidden');
    }
    if (document.querySelectorAll('.gallery-item.hidden').length === 0) {
      loadMoreBtn.parentElement.style.display = 'none';
    }
  });
}

/* =============================================
   10. BLOG ARCHIVE ENGINE (680 posts)
   ============================================= */
const blogGrid = document.getElementById('blog-grid');
const paginationContainer = document.getElementById('pagination');
const blogSearch = document.getElementById('blog-search');

if (blogGrid && paginationContainer) {
  let allPosts = [];
  let filteredPosts = [];
  let currentPage = 1;
  const postsPerPage = 12;

  // Load data
  fetch('all_posts.json')
    .then(response => response.json())
    .then(data => {
      allPosts = data;
      filteredPosts = data;
      renderPage(1);
    })
    .catch(err => {
      console.error('Erro ao carregar arquivo de posts:', err);
      blogGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Erro ao carregar arquivo de posts. Por favor, recarregue a página.</p>';
    });

  function renderPage(page) {
    currentPage = page;
    blogGrid.innerHTML = '';
    blogGrid.classList.add('loading');

    const start = (page - 1) * postsPerPage;
    const end = start + postsPerPage;
    const pagePosts = filteredPosts.slice(start, end);

    if (pagePosts.length === 0) {
      blogGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Nenhum post encontrado para sua pesquisa.</p>';
      paginationContainer.innerHTML = '';
      blogGrid.classList.remove('loading');
      return;
    }

    pagePosts.forEach((post, i) => {
      const dateObj = new Date(post.date);
      const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      
      const article = document.createElement('a');
      article.href = post.url;
      article.target = "_blank";
      article.className = 'blog-card--text reveal';
      article.innerHTML = `
        <div class="blog-card__meta">
          <span class="blog-card__date">${formattedDate}</span>
          <span class="blog-card__category">Arquivo</span>
        </div>
        <h2 class="blog-card__title">${post.title}</h2>
        <p class="blog-card__excerpt">Clique para ler o conteúdo original no portal da ABCJ.</p>
      `;
      blogGrid.appendChild(article);
      
      // Delay for reveal effect
      setTimeout(() => article.classList.add('visible'), i * 50);
    });

    blogGrid.classList.remove('loading');
    renderPagination();
    
    // Scroll to top of grid
    if (page > 1) {
      window.scrollTo({
        top: blogGrid.getBoundingClientRect().top + window.pageYOffset - 120,
        behavior: 'smooth'
      });
    }
  }

  function renderPagination() {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    if (totalPages <= 1) return;

    // Previous
    if (currentPage > 1) {
      const prev = createPaginationLink('← Anterior', currentPage - 1);
      paginationContainer.appendChild(prev);
    }

    // Logic for showing limited page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage === totalPages) startPage = Math.max(1, endPage - 4);

    if (startPage > 1) {
      paginationContainer.appendChild(createPaginationLink('1', 1));
      if (startPage > 2) {
        const dots = document.createElement('span');
        dots.className = 'pagination__dots';
        dots.textContent = '...';
        paginationContainer.appendChild(dots);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i === currentPage) {
        const span = document.createElement('span');
        span.className = 'pagination__current';
        span.textContent = i;
        paginationContainer.appendChild(span);
      } else {
        paginationContainer.appendChild(createPaginationLink(i, i));
      }
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = document.createElement('span');
        dots.className = 'pagination__dots';
        dots.textContent = '...';
        paginationContainer.appendChild(dots);
      }
      paginationContainer.appendChild(createPaginationLink(totalPages, totalPages));
    }

    // Next
    if (currentPage < totalPages) {
      const next = createPaginationLink('Próximo →', currentPage + 1);
      paginationContainer.appendChild(next);
    }
  }

  function createPaginationLink(text, page) {
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'pagination__link';
    link.textContent = text;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      renderPage(page);
    });
    return link;
  }

  // Search Logic
  if (blogSearch) {
    blogSearch.addEventListener('input', throttle((e) => {
      const term = e.target.value.toLowerCase();
      filteredPosts = allPosts.filter(post => 
        post.title.toLowerCase().includes(term)
      );
      renderPage(1);
    }, 300));
  }
}
