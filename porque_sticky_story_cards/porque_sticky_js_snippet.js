// --------------------------------------------
// Porquê — Sticky Story Cards
// --------------------------------------------
function initPorqueSticky() {
  const section = document.querySelector('.porque--sticky');
  if (!section || prefersReducedMotion || !hasGSAP) return;

  const cards = gsap.utils.toArray('.porque-card');
  const progress = section.querySelector('.porque__progress-line span');
  const current = section.querySelector('.porque__progress-current');

  if (!cards.length) return;

  gsap.fromTo('.porque__intro',
    { opacity: 0, x: -34 },
    {
      opacity: 1,
      x: 0,
      duration: .86,
      ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 76%', once: true }
    }
  );

  cards.forEach((card, index) => {
    const media = card.querySelector('.porque-card__media');
    const img = card.querySelector('.porque-card__media img');
    const body = card.querySelector('.porque-card__body');

    gsap.fromTo(card,
      { opacity: 0, y: 70, scale: .965 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: .86,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 86%', once: true }
      }
    );

    if (media) {
      gsap.fromTo(media,
        { x: -34, opacity: .72 },
        {
          x: 0,
          opacity: 1,
          duration: .9,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 84%', once: true }
        }
      );
    }

    if (body) {
      gsap.fromTo(body,
        { x: 38, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: .86,
          delay: .08,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 84%', once: true }
        }
      );
    }

    if (img) {
      gsap.to(img, {
        yPercent: 8,
        scale: 1.09,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    ScrollTrigger.create({
      trigger: card,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => updatePorqueProgress(index),
      onEnterBack: () => updatePorqueProgress(index)
    });
  });

  function updatePorqueProgress(index) {
    if (current) current.textContent = String(index + 1).padStart(2, '0');
    if (progress) progress.style.width = `${((index + 1) / cards.length) * 100}%`;
  }

  updatePorqueProgress(0);
}
