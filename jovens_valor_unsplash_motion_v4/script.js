// ============================================
// JOVENS DO VALOR — script principal v3 cirúrgico
// Foco: navbar funcional/acessível + GSAP limpo + sliders drag
// ============================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

let lenisInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  initSmoothScroll();
  initHeader();
  initHeroMotion();
  initHeroParallax();
  initReveal();
  initSlider();
  initValueSlider();
});

// --------------------------------------------
// Lenis smooth scroll, sincronizado com GSAP
// --------------------------------------------
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  if (!prefersReducedMotion && typeof window.Lenis !== 'undefined') {
    lenisInstance = new Lenis({
      lerp: 0.1,
      smoothWheel: true
    });

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

      if (lenisInstance) {
        lenisInstance.scrollTo(target, { offset: -78 });
      } else {
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });
}

// --------------------------------------------
// Header: estado visual + menu mobile acessível
// --------------------------------------------
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
  mobileNav.setAttribute('role', mobileNav.getAttribute('role') || 'dialog');
  mobileNav.setAttribute('aria-modal', 'true');

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

    const firstLink = mobileNav.querySelector('a');
    setTimeout(() => firstLink?.focus({ preventScroll: true }), 80);
  };

  const closeMenu = (returnFocus = true) => {
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
    if (isOpen) closeMenu(false);
    else openMenu();
  });

  mobileNav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => closeMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu(true);
      return;
    }

    if (e.key !== 'Tab') return;

    const focusable = Array.from(mobileNav.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }

    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  window.closeMobileNav = closeMobileNav;
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

// --------------------------------------------
// Hero: entrada esquerda/direita suave com GSAP
// --------------------------------------------
function initHeroMotion() {
  const title = document.querySelector('[data-split]');
  const eyebrow = document.querySelector('.hero .eyebrow-light');
  const heroSub = document.querySelector('.hero-sub');
  const heroActions = document.querySelector('.hero-actions');
  const scrollCue = document.querySelector('.scroll-cue');

  if (title && !title.dataset.splitted) {
    const words = title.textContent.trim().split(/\s+/);
    title.innerHTML = words
      .map((w) => `<span class="word"><span>${w}</span></span>`)
      .join(' ');
    title.dataset.splitted = 'true';
  }

  if (prefersReducedMotion || !hasGSAP) return;

  const words = title ? title.querySelectorAll('.word span') : [];

  gsap.set(eyebrow, { opacity: 0, x: -32 });
  gsap.set(words, { opacity: 0, x: -26, yPercent: 105, skewX: -5 });
  gsap.set([heroSub, heroActions].filter(Boolean), { opacity: 0, x: 42 });
  gsap.set(scrollCue, { opacity: 0, y: 14 });

  const tl = gsap.timeline({
    defaults: { ease: 'power4.out' },
    delay: 0.18
  });

  tl.to(eyebrow, {
    opacity: 1,
    x: 0,
    duration: 0.72
  })
    .to(words, {
      opacity: 1,
      x: 0,
      yPercent: 0,
      skewX: 0,
      duration: 0.95,
      stagger: 0.04
    }, '-=0.42')
    .to(heroSub, {
      opacity: 1,
      x: 0,
      duration: 0.78
    }, '-=0.48')
    .to(heroActions, {
      opacity: 1,
      x: 0,
      duration: 0.78
    }, '-=0.62')
    .to(scrollCue, {
      opacity: 1,
      y: 0,
      duration: 0.58
    }, '-=0.36');
}

// --------------------------------------------
// Hero: parallax/zoom-out controlado
// --------------------------------------------
function initHeroParallax() {
  const img = document.getElementById('heroImg');
  if (!img || prefersReducedMotion || !hasGSAP) return;

  gsap.fromTo(img,
    { scale: 1.08 },
    {
      scale: 1,
      yPercent: 8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    }
  );
}

// --------------------------------------------
// Reveal genérico em scroll para [data-reveal]
// --------------------------------------------
function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (prefersReducedMotion || !hasGSAP) {
    items.forEach((item) => {
      item.style.opacity = 1;
      item.style.transform = 'none';
    });
    return;
  }

  gsap.set(items, { opacity: 0, y: 28 });

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 84%',
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration: 0.76,
      ease: 'power3.out',
      stagger: 0.07,
      overwrite: true
    }),
    once: true
  });
}

// --------------------------------------------
// Utilitário: sliders horizontais com botões + drag
// --------------------------------------------
function getSliderGap(slider) {
  return parseFloat(getComputedStyle(slider).gap) || 20;
}

function setupHorizontalSlider({ slider, prev, next, mode = 'item', progressFill = null }) {
  if (!slider) return;

  slider.classList.add('is-draggable');

  const getMaxScroll = () => Math.max(0, slider.scrollWidth - slider.clientWidth);

  const getStep = () => {
    if (mode === 'page') return Math.max(slider.clientWidth * 0.92, 260);

    const firstItem = slider.querySelector(':scope > li, .slide, .value-slide');
    if (!firstItem) return slider.clientWidth * 0.9;

    return firstItem.getBoundingClientRect().width + getSliderGap(slider);
  };

  const updateControls = () => {
    const max = getMaxScroll();
    const atStart = slider.scrollLeft <= 4;
    const atEnd = slider.scrollLeft >= max - 4;

    if (prev) {
      prev.classList.toggle('is-disabled', atStart);
      prev.disabled = atStart;
    }

    if (next) {
      next.classList.toggle('is-disabled', atEnd || max <= 4);
      next.disabled = atEnd || max <= 4;
    }

    if (progressFill) {
      const ratio = max > 0 ? slider.scrollLeft / max : 0;
      const visibleRatio = slider.scrollWidth > 0 ? slider.clientWidth / slider.scrollWidth : 1;
      progressFill.style.width = `${Math.min(visibleRatio, 1) * 100}%`;
      progressFill.style.transform = `translateX(${ratio * (1 / Math.max(visibleRatio, 0.001) - 1) * 100}%)`;
    }
  };

  const scrollByDir = (dir) => {
    slider.scrollBy({
      left: dir * getStep(),
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  };

  if (prev) prev.addEventListener('click', () => scrollByDir(-1));
  if (next) next.addEventListener('click', () => scrollByDir(1));

  let pointerDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let hasMoved = false;

  slider.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;

    pointerDown = true;
    hasMoved = false;
    startX = e.clientX;
    startScrollLeft = slider.scrollLeft;

    slider.classList.add('is-dragging');
    slider.setPointerCapture?.(e.pointerId);
  });

  slider.addEventListener('pointermove', (e) => {
    if (!pointerDown) return;

    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) hasMoved = true;

    slider.scrollLeft = startScrollLeft - dx;
  });

  const stopDrag = (e) => {
    if (!pointerDown) return;

    pointerDown = false;
    slider.classList.remove('is-dragging');

    try {
      slider.releasePointerCapture?.(e.pointerId);
    } catch (_) {}

    updateControls();
  };

  slider.addEventListener('pointerup', stopDrag);
  slider.addEventListener('pointercancel', stopDrag);
  slider.addEventListener('pointerleave', stopDrag);

  slider.addEventListener('click', (e) => {
    if (!hasMoved) return;

    e.preventDefault();
    e.stopPropagation();
  }, true);

  slider.addEventListener('scroll', updateControls, { passive: true });
  window.addEventListener('resize', updateControls);
  updateControls();
}

// --------------------------------------------
// Slider de cards (Áreas de Atuação)
// --------------------------------------------
function initSlider() {
  setupHorizontalSlider({
    slider: document.getElementById('slider'),
    prev: document.getElementById('sliderPrev'),
    next: document.getElementById('sliderNext'),
    mode: 'page'
  });
}

// --------------------------------------------
// Carrossel de Valores
// --------------------------------------------
function initValueSlider() {
  setupHorizontalSlider({
    slider: document.getElementById('valueSlider'),
    prev: document.getElementById('valuePrev'),
    next: document.getElementById('valueNext'),
    mode: 'item',
    progressFill: document.getElementById('valueProgressFill')
  });
}
