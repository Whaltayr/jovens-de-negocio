// --------------------------------------------
// O que nos diferencia — entrada alternada esquerda/direita
// --------------------------------------------
function initImpactRowsMotion() {
  const rows = gsap.utils.toArray('[data-impact-row]');
  if (!rows.length) return;

  if (prefersReducedMotion || !hasGSAP) {
    rows.forEach((row) => {
      row.style.opacity = '1';
      row.style.transform = 'none';

      const media = row.querySelector('.impact-row__media');
      const text = row.querySelector('.impact-row__text');

      if (media) {
        media.style.opacity = '1';
        media.style.transform = '';
      }

      if (text) {
        text.style.opacity = '1';
        text.style.transform = 'none';
      }
    });
    return;
  }

  const isMobile = window.matchMedia('(max-width: 980px)').matches;
  const rowDistance = isMobile ? 42 : 110;
  const textDistance = isMobile ? 28 : 62;

  rows.forEach((row, index) => {
    const media = row.querySelector('.impact-row__media');
    const text = row.querySelector('.impact-row__text');

    // Respeita a composição visual já existente.
    const comesFromRight =
      row.classList.contains('impact-row--right') ||
      (!row.classList.contains('impact-row--left') &&
       !row.classList.contains('impact-row--center') &&
       index % 2 !== 0);

    const direction = comesFromRight ? 1 : -1;

    gsap.set(row, { opacity: 1 });
    if (media) {
      gsap.set(media, {
        opacity: 0,
        x: direction * rowDistance,
        rotate: direction * 3.5,
        scale: 0.965
      });
    }

    if (text) {
      gsap.set(text, {
        opacity: 0,
        x: direction * textDistance
      });
    }

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: row,
        start: isMobile ? 'top 88%' : 'top 78%',
        once: true
      },
      defaults: {
        ease: 'power4.out'
      }
    });

    if (media) {
      timeline.to(media, {
        opacity: 1,
        x: 0,
        rotate: 0,
        scale: 1,
        duration: 0.95
      }, 0);
    }

    if (text) {
      timeline.to(text, {
        opacity: 1,
        x: 0,
        duration: 0.82
      }, media ? 0.14 : 0);
    }
  });

  ScrollTrigger.refresh();
}
