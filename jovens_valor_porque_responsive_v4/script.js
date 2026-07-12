// ============================================
// JOVENS DO VALOR — script principal v4
// GSAP/ScrollTrigger melhorado sem redesenhar o layout
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
  initHeroMotion();
  initHeroParallax();
  initSectionMotion();
  initSignatureSystem();
  initImpactRowsMotion();
  initInteractiveSurfaces();
  initMagneticButtons();
  initSlider();
  initValueSlider();
});

// --------------------------------------------
// Lenis smooth scroll
// --------------------------------------------
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  if (!prefersReducedMotion && typeof window.Lenis !== 'undefined') {
    lenisInstance = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.9
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
// Header/menu mobile
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

    if (!prefersReducedMotion && hasGSAP) {
      gsap.fromTo(
        mobileNav.querySelectorAll('li'),
        { opacity: 0, x: -22 },
        { opacity: 1, x: 0, duration: 0.55, stagger: 0.055, ease: 'power3.out' }
      );
    }
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
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu(true);
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

// --------------------------------------------
// Hero: esquerda/direita com timeline limpa
// --------------------------------------------
function initHeroMotion() {
  const title = document.querySelector('[data-split]');
  const eyebrow = document.querySelector('.hero .eyebrow-light');
  const heroSub = document.querySelector('.hero-sub');
  const heroActions = document.querySelector('.hero-actions');
  const heroBottom = document.querySelector('.hero-bottom-row');
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

  gsap.set(eyebrow, { opacity: 0, x: -42 });
  gsap.set(words, { opacity: 0, x: -30, yPercent: 108, rotate: -1.5 });
  gsap.set(heroBottom, { opacity: 0, clipPath: 'inset(0 100% 0 0)' });
  gsap.set(heroSub, { opacity: 0, x: 46 });
  gsap.set(heroActions, { opacity: 0, x: 56 });
  gsap.set(scrollCue, { opacity: 0, y: 18 });

  const tl = gsap.timeline({
    defaults: { ease: 'power4.out' },
    delay: 0.18
  });

  tl.to(eyebrow, { opacity: 1, x: 0, duration: 0.72 })
    .to(words, {
      opacity: 1,
      x: 0,
      yPercent: 0,
      rotate: 0,
      duration: 1,
      stagger: 0.04
    }, '-=0.36')
    .to(heroBottom, {
      opacity: 1,
      clipPath: 'inset(0 0% 0 0)',
      duration: 0.86
    }, '-=0.62')
    .to(heroSub, { opacity: 1, x: 0, duration: 0.76 }, '-=0.48')
    .to(heroActions, { opacity: 1, x: 0, duration: 0.76 }, '-=0.62')
    .to(scrollCue, { opacity: 1, y: 0, duration: 0.55 }, '-=0.34');
}

// --------------------------------------------
// Hero parallax
// --------------------------------------------
function initHeroParallax() {
  const img = document.getElementById('heroImg');
  if (!img || prefersReducedMotion || !hasGSAP) return;

  gsap.fromTo(img,
    { scale: 1.1 },
    {
      scale: 1,
      yPercent: 7,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    }
  );

  const overlay = document.querySelector('.hero-overlay');
  if (overlay) {
    gsap.to(overlay, {
      opacity: 0.88,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }
}

// --------------------------------------------
// ScrollTrigger por secção
// --------------------------------------------
function initSectionMotion() {
  const revealItems = document.querySelectorAll('[data-reveal]');

  if (prefersReducedMotion || !hasGSAP) {
    revealItems.forEach((item) => {
      item.style.opacity = 1;
      item.style.transform = 'none';
    });
    return;
  }

  gsap.set(revealItems, { opacity: 0, y: 28 });

  animateFromLeft('section .eyebrow[data-reveal], section .section-title[data-reveal]', 0.82, 0.06);

  animateOne('.manifesto-text', { x: -34, y: 0 }, { x: 0, y: 0, duration: 0.86 });
  animateOne('.manifesto-quote', { x: 42, y: 0 }, { x: 0, y: 0, duration: 0.86 });

  animateGroup('.mv-split', '.mv-item', { y: 34, scale: 0.985 }, { y: 0, scale: 1, duration: 0.78, stagger: 0.12 });

  animateGroup('.valores', '.value-card', { y: 44, scale: 0.975 }, { y: 0, scale: 1, duration: 0.8, stagger: 0.075 });

  gsap.utils.toArray('.value-card').forEach((card) => {
    const overlay = card.querySelector('.value-card__overlay');
    const img = card.querySelector('img');

    if (overlay) {
      gsap.fromTo(overlay,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.68,
          scrollTrigger: { trigger: card, start: 'top 82%', once: true }
        }
      );
    }

    if (img) {
      gsap.fromTo(img,
        { scale: 1.08 },
        {
          scale: 1,
          duration: 1.08,
          scrollTrigger: { trigger: card, start: 'top 84%', once: true }
        }
      );
    }
  });

  gsap.utils.toArray('.slide-card').forEach((card) => {
    const media = card.querySelector('.slide-media');
    const panel = card.querySelector('.slide-panel');

    const tl = gsap.timeline({
      scrollTrigger: { trigger: card, start: 'top 78%', once: true }
    });

    if (media) {
      tl.fromTo(media,
        { opacity: 0, x: -54, scale: 0.985 },
        { opacity: 1, x: 0, scale: 1, duration: 0.86 },
        0
      );
    }

    if (panel) {
      tl.fromTo(panel,
        { opacity: 0, x: 54 },
        { opacity: 1, x: 0, duration: 0.86 },
        0.08
      );
    }
  });

  animateGroup('.diff-list', '.diff-row', { x: -28, y: 0 }, { x: 0, y: 0, duration: 0.72, stagger: 0.08 });
  animateOne('.diff-banner', { y: 24 }, { y: 0, duration: 0.78 });
  animateGroup('.explorar', '.explorar-row', { x: -32, y: 0 }, { x: 0, y: 0, duration: 0.78, stagger: 0.1 });

  // Fallback para elementos restantes.
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.05,
      overwrite: 'auto'
    }),
    once: true
  });
}

function animateFromLeft(selector, duration = 0.8, stagger = 0.06) {
  const els = gsap.utils.toArray(selector);
  els.forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, x: -38, y: 0 },
      {
        opacity: 1,
        x: 0,
        duration,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      }
    );
  });
}

function animateOne(selector, fromVars, toVars) {
  const el = document.querySelector(selector);
  if (!el) return;

  gsap.fromTo(el,
    { opacity: 0, ...fromVars },
    {
      opacity: 1,
      ...toVars,
      scrollTrigger: { trigger: el, start: 'top 84%', once: true }
    }
  );
}

function animateGroup(triggerSelector, itemSelector, fromVars, toVars) {
  const trigger = document.querySelector(triggerSelector);
  const items = gsap.utils.toArray(itemSelector);
  if (!trigger || !items.length) return;

  gsap.fromTo(items,
    { opacity: 0, ...fromVars },
    {
      opacity: 1,
      ...toVars,
      scrollTrigger: { trigger, start: 'top 78%', once: true }
    }
  );
}

// --------------------------------------------
// Sliders horizontais com botões + drag
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

function initSlider() {
  setupHorizontalSlider({
    slider: document.getElementById('slider'),
    prev: document.getElementById('sliderPrev'),
    next: document.getElementById('sliderNext'),
    mode: 'page'
  });
}

function initValueSlider() {
  setupHorizontalSlider({
    slider: document.getElementById('valueSlider'),
    prev: document.getElementById('valuePrev'),
    next: document.getElementById('valueNext'),
    mode: 'item',
    progressFill: document.getElementById('valueProgressFill')
  });
}

// --------------------------------------------
// Brand signature: hero orbit, kinetic ribbon and third-edition story
// --------------------------------------------
function initSignatureSystem() {
  if (prefersReducedMotion || !hasGSAP) return;

  const signature = document.querySelector('.hero-signature');
  const outer = document.querySelector('.hero-signature__ring--outer');
  const inner = document.querySelector('.hero-signature__ring--inner');
  const core = document.querySelector('.hero-signature__core');

  if (signature) {
    const tl = gsap.timeline({ delay: 0.38 });

    tl.fromTo(signature,
      { opacity: 0, scale: .88, rotate: -8 },
      { opacity: 1, scale: 1, rotate: 0, duration: 1.1, ease: 'power4.out' }
    );

    if (outer && inner) {
      tl.to([outer, inner], {
        strokeDashoffset: 0,
        duration: 1.35,
        stagger: .14,
        ease: 'power3.inOut'
      }, '-=.88');

      gsap.to(outer, {
        rotate: '+=360',
        duration: 32,
        repeat: -1,
        ease: 'none',
        transformOrigin: '50% 50%'
      });

      gsap.to(inner, {
        rotate: '-=360',
        duration: 24,
        repeat: -1,
        ease: 'none',
        transformOrigin: '50% 50%'
      });
    }

    if (core) {
      gsap.to(core, {
        y: -8,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    gsap.to(signature, {
      yPercent: 16,
      opacity: .48,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  const ribbon = document.querySelector('.brand-ribbon__track');
  if (ribbon) {
    gsap.fromTo(ribbon,
      { xPercent: 0 },
      {
        xPercent: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.brand-ribbon',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      }
    );
  }

  gsap.utils.toArray('main > section[data-chapter]').forEach((section) => {
    gsap.fromTo(section,
      { '--chapter-shift': '0px' },
      {
        '--chapter-shift': '34px',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  });

  const nextSection = document.querySelector('.next-edition-v2');
  if (nextSection) {
    const bg = nextSection.querySelector('.next-edition-v2__media img');
    const number = nextSection.querySelector('.next-edition-v2__number');
    const copy = nextSection.querySelector('.next-edition-v2__copy');
    const panel = nextSection.querySelector('.next-edition-v2__panel');

    if (bg) {
      gsap.fromTo(bg,
        { scale: 1.12, yPercent: -3 },
        {
          scale: 1.02,
          yPercent: 7,
          ease: 'none',
          scrollTrigger: {
            trigger: nextSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    }

    if (number) {
      gsap.fromTo(number,
        { xPercent: 10, opacity: .15 },
        {
          xPercent: -4,
          opacity: .82,
          ease: 'none',
          scrollTrigger: {
            trigger: nextSection,
            start: 'top 88%',
            end: 'bottom 20%',
            scrub: 1
          }
        }
      );
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: nextSection,
        start: 'top 68%',
        once: true
      }
    });

    if (copy) {
      tl.fromTo(copy,
        { opacity: 0, x: -54 },
        { opacity: 1, x: 0, duration: .95, ease: 'power4.out' },
        0
      );
    }

    if (panel) {
      tl.fromTo(panel,
        { opacity: 0, x: 58, rotateY: -5 },
        { opacity: 1, x: 0, rotateY: 0, duration: 1, ease: 'power4.out' },
        .08
      );
    }
  }
}

// --------------------------------------------
// Pointer-following light on cards and panels
// --------------------------------------------
function initInteractiveSurfaces() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const selector = [
    '.value-card',
    '.slide-card',
    '.program-detail',
    '.info-card',
    '.process-item',
    '.gallery-image-card',
    '.next-edition-v2__panel'
  ].join(',');

  document.querySelectorAll(selector).forEach((surface) => {
    surface.classList.add('signature-surface');

    surface.addEventListener('pointermove', (event) => {
      const rect = surface.getBoundingClientRect();
      surface.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
      surface.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
    });
  });
}

// --------------------------------------------
// Subtle magnetic movement only on primary CTAs
// --------------------------------------------
function initMagneticButtons() {
  if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.magnetic, .hero-actions .btn-primary').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      gsap.to(button, {
        x: x * .08,
        y: y * .12,
        duration: .28,
        ease: 'power2.out'
      });
    });

    button.addEventListener('pointerleave', () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: .48,
        ease: 'elastic.out(1, .45)'
      });
    });
  });
}

// --------------------------------------------
// O que nos diferencia — entrada alternada esquerda/direita
// --------------------------------------------
function initImpactRowsMotion() {
  const rows = gsap.utils.toArray('[data-impact-row]');
  if (!rows.length) return;

  if (prefersReducedMotion || !hasGSAP) {
    rows.forEach((row) => {
      gsap.set(row, { clearProps: 'all' });
      gsap.set(row.querySelectorAll('.impact-row__media, .impact-row__text'), {
        clearProps: 'all',
        opacity: 1
      });
    });
    return;
  }

  const mm = gsap.matchMedia();

  mm.add(
    {
      desktop: '(min-width: 981px)',
      mobile: '(max-width: 980px)'
    },
    (context) => {
      const isMobile = context.conditions.mobile;
      const mediaDistance = isMobile ? 34 : 96;
      const textDistance = isMobile ? 22 : 52;
      const rotations = isMobile ? 0 : 2.5;

      rows.forEach((row, index) => {
        const media = row.querySelector('.impact-row__media');
        const text = row.querySelector('.impact-row__text');

        const fromRight =
          row.classList.contains('impact-row--right') ||
          (
            !row.classList.contains('impact-row--left') &&
            !row.classList.contains('impact-row--center') &&
            index % 2 !== 0
          );

        const direction = fromRight ? 1 : -1;

        gsap.set(row, {
          opacity: 1,
          overflow: 'visible'
        });

        if (media) {
          gsap.set(media, {
            opacity: 0,
            x: direction * mediaDistance,
            rotate: direction * rotations,
            scale: isMobile ? .985 : .965
          });
        }

        if (text) {
          gsap.set(text, {
            opacity: 0,
            x: direction * textDistance,
            y: isMobile ? 12 : 0
          });
        }

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: isMobile ? 'top 90%' : 'top 79%',
            once: true,
            invalidateOnRefresh: true
          },
          defaults: {
            ease: 'power4.out'
          }
        });

        if (media) {
          timeline.to(
            media,
            {
              opacity: 1,
              x: 0,
              rotate: 0,
              scale: 1,
              duration: isMobile ? .78 : .95,
              clearProps: 'transform'
            },
            0
          );
        }

        if (text) {
          timeline.to(
            text,
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: isMobile ? .7 : .82,
              clearProps: 'transform'
            },
            media ? .1 : 0
          );
        }
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        rows.forEach((row) => {
          gsap.set(row, { clearProps: 'overflow' });
          gsap.set(row.querySelectorAll('.impact-row__media, .impact-row__text'), {
            clearProps: 'transform,opacity'
          });
        });
      };
    }
  );
}

