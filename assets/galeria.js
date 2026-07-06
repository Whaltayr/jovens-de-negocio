// ============================================
// GALERIA — JS principal
// Filtros, lightbox, GSAP e menu mobile
// ============================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

let lenisInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power3.out' });
  }

  initSmoothScroll();
  initHeader();
  initGalleryHero();
  initGalleryReveals();
  initGalleryFilters();
  initLightbox();
});

function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  if (!prefersReducedMotion && typeof window.Lenis !== 'undefined') {
    lenisInstance = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });

    if (hasGSAP) {
      lenisInstance.on('scroll', ScrollTrigger.update);
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

  anchorLinks.forEach((link) => {
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

  mobileNav.setAttribute('aria-hidden', 'true');
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

  mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => closeMenu(false)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
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

function initGalleryHero() {
  const title = document.querySelector('[data-split-gallery]');
  if (!title) return;

  if (!title.dataset.splitted) {
    title.innerHTML = title.textContent.trim().split(/\s+/)
      .map((word) => `<span class="word"><span>${word}</span></span>`)
      .join(' ');
    title.dataset.splitted = 'true';
  }

  if (prefersReducedMotion || !hasGSAP) return;

  const words = title.querySelectorAll('.word span');
  const bg = document.querySelector('.gallery-hero__bg img');

  gsap.set(words, { opacity: 0, yPercent: 110, x: -34 });
  gsap.set('.gallery-hero .eyebrow, .gallery-hero__bottom, .gallery-stats', { opacity: 0, y: 24 });

  const tl = gsap.timeline({ delay: .18 });
  tl.to('.gallery-hero .eyebrow', { opacity: 1, y: 0, duration: .7 })
    .to(words, { opacity: 1, yPercent: 0, x: 0, duration: .95, stagger: .045, ease: 'power4.out' }, '-=.35')
    .to('.gallery-hero__bottom', { opacity: 1, y: 0, duration: .75 }, '-=.45')
    .to('.gallery-stats', { opacity: 1, y: 0, duration: .75 }, '-=.45');

  if (bg) {
    gsap.to(bg, {
      yPercent: 8,
      scale: 1.14,
      ease: 'none',
      scrollTrigger: { trigger: '.gallery-hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }
}

function initGalleryReveals() {
  const items = document.querySelectorAll('[data-reveal], .gallery-card, .featured-tile');
  if (!items.length) return;

  if (prefersReducedMotion || !hasGSAP) {
    items.forEach((item) => {
      item.style.opacity = 1;
      item.style.transform = 'none';
    });
    return;
  }

  gsap.set(items, { opacity: 0, y: 34 });

  ScrollTrigger.batch(items, {
    start: 'top 86%',
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration: .72,
      stagger: .06,
      overwrite: 'auto'
    }),
    once: true
  });
}

function initGalleryFilters() {
  const buttons = document.querySelectorAll('[data-filter]');
  const items = document.querySelectorAll('[data-gallery-item]');
  if (!buttons.length || !items.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      buttons.forEach((btn) => btn.classList.toggle('is-active', btn === button));

      items.forEach((item) => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('is-hidden', !match);
      });

      if (hasGSAP) {
        const visible = Array.from(items).filter((item) => !item.classList.contains('is-hidden'));
        gsap.fromTo(visible, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .45, stagger: .035 });
        ScrollTrigger.refresh();
      }
    });
  });
}

function initLightbox() {
  const lightbox = document.getElementById('galleryLightbox');
  if (!lightbox) return;

  const image = lightbox.querySelector('img');
  const title = lightbox.querySelector('figcaption strong');
  const meta = lightbox.querySelector('figcaption span');
  const closeBtn = lightbox.querySelector('.lightbox__close');
  const triggers = document.querySelectorAll('[data-lightbox-src]');

  const open = (trigger) => {
    image.src = trigger.dataset.lightboxSrc;
    image.alt = trigger.dataset.lightboxTitle || 'Imagem da galeria';
    title.textContent = trigger.dataset.lightboxTitle || '';
    meta.textContent = trigger.dataset.lightboxMeta || '';

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    if (lenisInstance) lenisInstance.stop();
    closeBtn.focus({ preventScroll: true });
  };

  const close = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lenisInstance) lenisInstance.start();
    image.src = '';
  };

  triggers.forEach((trigger) => trigger.addEventListener('click', () => open(trigger)));
  closeBtn.addEventListener('click', close);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
  });
}
