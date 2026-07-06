// ============================================
// JOVENS DO VALOR — Galeria limpa
// Header responsivo + filtro por edição + lightbox
// ============================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenisInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initHeader();
  initEditionFilter();
  initLightbox();
});

function initSmoothScroll() {
  if (!prefersReducedMotion && typeof window.Lenis !== 'undefined') {
    lenisInstance = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });

    if (typeof window.gsap !== 'undefined') {
      gsap.ticker.add((time) => lenisInstance.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      closeMobileNav(false);

      if (lenisInstance) lenisInstance.scrollTo(target, { offset: -78 });
      else target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
}

function initHeader() {
  const header = document.getElementById('topo');
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('navMobile');

  if (!header) return;

  const setHeaderState = () => {
    const menuIsOpen = toggle && toggle.getAttribute('aria-expanded') === 'true';
    header.classList.toggle('scrolled', window.scrollY > 24 || menuIsOpen);
    header.classList.toggle('menu-open', !!menuIsOpen);
  };

  window.addEventListener('scroll', setHeaderState, { passive: true });
  window.addEventListener('resize', setHeaderState, { passive: true });
  setHeaderState();

  if (!toggle || !mobileNav) return;

  const sr = toggle.querySelector('.sr-only');

  const openMenu = () => {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    if (sr) sr.textContent = 'Fechar menu';

    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    header.classList.add('menu-open', 'scrolled');
    document.body.classList.add('nav-open');
    if (lenisInstance) lenisInstance.stop();
  };

  const closeMenu = (returnFocus = false) => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    if (sr) sr.textContent = 'Abrir menu';

    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    header.classList.remove('menu-open');
    header.classList.toggle('scrolled', window.scrollY > 24);
    document.body.classList.remove('nav-open');
    if (lenisInstance) lenisInstance.start();
    if (returnFocus) toggle.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu(false) : openMenu();
  });

  mobileNav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => closeMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu(true);
      closeLightbox();
    }
  });
}

function closeMobileNav(returnFocus = false) {
  const header = document.getElementById('topo');
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('navMobile');

  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    const sr = toggle.querySelector('.sr-only');
    if (sr) sr.textContent = 'Abrir menu';
  }

  if (mobileNav) {
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
  }

  if (header) {
    header.classList.remove('menu-open');
    header.classList.toggle('scrolled', window.scrollY > 24);
  }

  document.body.classList.remove('nav-open');
  if (lenisInstance) lenisInstance.start();
  if (returnFocus && toggle) toggle.focus({ preventScroll: true });
}

function initEditionFilter() {
  const buttons = document.querySelectorAll('[data-edition-filter]');
  const cards = document.querySelectorAll('[data-edition]');

  if (!buttons.length || !cards.length) return;

  const applyFilter = (edition) => {
    cards.forEach((card) => {
      card.classList.toggle('is-hidden', card.dataset.edition !== edition);
    });

    buttons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.editionFilter === edition);
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => applyFilter(button.dataset.editionFilter));
  });

  applyFilter(buttons[0].dataset.editionFilter);
}

function initLightbox() {
  const lightbox = document.getElementById('galleryLightbox');
  if (!lightbox) return;

  const img = lightbox.querySelector('img');
  const close = lightbox.querySelector('.lightbox__close');

  document.querySelectorAll('[data-lightbox-src]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!img) return;
      img.src = button.dataset.lightboxSrc;
      img.alt = button.querySelector('img')?.alt || 'Imagem da galeria';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nav-open');
      close?.focus({ preventScroll: true });
    });
  });

  close?.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}

function closeLightbox() {
  const lightbox = document.getElementById('galleryLightbox');
  if (!lightbox || !lightbox.classList.contains('is-open')) return;

  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');

  const menuOpen = document.getElementById('navToggle')?.getAttribute('aria-expanded') === 'true';
  if (!menuOpen) document.body.classList.remove('nav-open');
}
