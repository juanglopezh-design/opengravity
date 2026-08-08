/* ============================================
   FASHION ZARAGOZA — Interactive JS
   ============================================ */

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
const announcementH = document.querySelector('.announcement-bar')?.offsetHeight || 36;

window.addEventListener('scroll', () => {
  if (window.scrollY > announcementH) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  // Back to top
  backToTop.classList.toggle('visible', window.scrollY > 600);
});

// ── MOBILE MENU ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
});
mobileClose.addEventListener('click', closeMobileMenu);
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

// ── HERO SLIDER ──
const slides = document.querySelectorAll('.hero-slide');
const dots   = document.querySelectorAll('.dot');
let current  = 0;
let autoplay;

function goToSlide(n) {
  slides[current].classList.remove('active');
  dots[current].classList.remove('active');
  current = (n + slides.length) % slides.length;
  slides[current].classList.add('active');
  dots[current].classList.add('active');
}

function startAutoplay() {
  autoplay = setInterval(() => goToSlide(current + 1), 5500);
}

document.querySelector('.hero-next').addEventListener('click', () => {
  clearInterval(autoplay);
  goToSlide(current + 1);
  startAutoplay();
});
document.querySelector('.hero-prev').addEventListener('click', () => {
  clearInterval(autoplay);
  goToSlide(current - 1);
  startAutoplay();
});
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    clearInterval(autoplay);
    goToSlide(i);
    startAutoplay();
  });
});

startAutoplay();

// ── PRODUCT FILTER ──
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    productCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.style.display = match ? '' : 'none';
      card.style.animation = match ? 'fadeIn 0.4s ease' : '';
    });
  });
});

// ── ADD TO CART ──
const cartCount  = document.querySelector('.cart-count');
const cartToast  = document.getElementById('cartToast');
let   count      = 0;

document.querySelectorAll('.add-cart-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    count++;
    cartCount.textContent = count;
    cartToast.classList.add('show');
    clearTimeout(cartToast._timer);
    cartToast._timer = setTimeout(() => cartToast.classList.remove('show'), 2200);
  });
});

// ── BACK TO TOP ──
const backToTop = document.getElementById('backToTop');
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── NEWSLETTER ──
function handleNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const btn   = e.target.querySelector('button');
  btn.textContent = '✓ ¡Suscrita!';
  btn.style.background = '#4caf50';
  btn.style.borderColor = '#4caf50';
  input.value = '';
  setTimeout(() => {
    btn.textContent = 'Suscribirme';
    btn.style.background = '';
    btn.style.borderColor = '';
  }, 3500);
}

// ── SCROLL FADE-UP ANIMATIONS ──
const fadeEls = document.querySelectorAll(
  '.product-card, .cat-card, .look-card, .coleccion-card, .testimonio-card, .stat, .feature, .section-header'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-up', 'visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach((el, i) => {
  el.classList.add('fade-up');
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  observer.observe(el);
});

// ── SMOOTH ANCHOR LINKS ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
