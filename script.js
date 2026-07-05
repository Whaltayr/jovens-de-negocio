// ============================================
// JOVENS DO VALOR — script principal v2
// Reparos: menu mobile, sliders com 2 botões, drag e cards split
// ============================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

let lenisInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  initSmoothScroll();
  initHeader();
  initHeroSplit();
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
    lenisInstance = new Lenis({ lerp: 0.1, smoothWheel: true });

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
      closeMobileNav();

      if (lenisInstance) {
        lenisInstance.scrollTo(target, { offset: -70 });
      } else {
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });
}

// --------------------------------------------
// Header: fundo ao rolar + menu mobile
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

  if (hasGSAP) {
    ScrollTrigger.create({
      start: 'top -24',
      end: 99999,
      onUpdate: setHeaderState,
    });
  }

  window.addEventListener('scroll', setHeaderState, { passive: true });
  window.addEventListener('resize', setHeaderState, { passive: true });
  setHeaderState();

  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    const nextState = !isOpen;

    toggle.setAttribute('aria-expanded', String(nextState));
    mobileNav.classList.toggle('open', nextState);
    header.classList.toggle('menu-open', nextState);
    document.body.classList.toggle('nav-open', nextState);
    setHeaderState();
  });

  document.querySelectorAll('#navMobile a').forEach((a) => a.addEventListener('click', closeMobileNav));
}

function closeMobileNav() {
  const header = document.getElementById('topo');
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('navMobile');

  if (toggle) toggle.setAttribute('aria-expanded', 'false');
  if (mobileNav) mobileNav.classList.remove('open');
  if (header) {
    header.classList.remove('menu-open');
    header.classList.toggle('scrolled', window.scrollY > 24);
  }
  document.body.classList.remove('nav-open');
}

// --------------------------------------------
// Hero: título dividido em palavras, entrada em cascata
// --------------------------------------------
function initHeroSplit() {
  const el = document.querySelector('[data-split]');
  if (!el) return;

  const words = el.textContent.trim().split(' ');
  el.innerHTML = words
    .map((w) => `<span class="word"><span>${w}</span></span>`)
    .join(' ');

  if (prefersReducedMotion || !hasGSAP) return;

  gsap.set('.hero-title .word span', { yPercent: 110 });
  gsap.timeline({ delay: 0.2 })
    .to('.hero-title .word span', {
      yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.045,
    })
    .from(['.hero-sub', '.hero-actions'], {
      opacity: 0, y: 20, duration: 0.8, ease: 'power2.out', stagger: 0.1,
    }, '-=0.5');
}

// --------------------------------------------
// Hero: leve parallax/zoom-out na imagem de fundo ao rolar
// --------------------------------------------
function initHeroParallax() {
  const img = document.getElementById('heroImg');
  if (!img || prefersReducedMotion || !hasGSAP) return;

  gsap.to(img, {
    scale: 1,
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
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

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 85%',
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
    }),
    once: true,
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

  const getMaxScroll = () => slider.scrollWidth - slider.clientWidth;

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

    if (prev) prev.classList.toggle('is-disabled', atStart);
    if (next) next.classList.toggle('is-disabled', atEnd || max <= 4);

    if (progressFill) {
      const ratio = max > 0 ? slider.scrollLeft / max : 0;
      const visibleRatio = slider.scrollWidth > 0 ? slider.clientWidth / slider.scrollWidth : 1;
      progressFill.style.width = `${Math.min(visibleRatio, 1) * 100}%`;
      progressFill.style.transform = `translateX(${ratio * (1 / Math.max(visibleRatio, 0.001) - 1) * 100}%)`;
    }
  };

  const scrollByDir = (dir) => {
    slider.scrollBy({ left: dir * getStep(), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
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
    try { slider.releasePointerCapture?.(e.pointerId); } catch (_) {}
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
// Slider de cards (Áreas de Atuação) — split cards + setas + drag
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
// Carrossel de Valores — texto dentro da imagem + setas + drag + progresso
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
