// --------------------------------------------
// Porquê — Parallax Impact Gallery
// --------------------------------------------
function initPorqueParallax() {
  const section = document.querySelector('.porque--parallax');
  if (!section || prefersReducedMotion || !hasGSAP) return;

  const bg = section.querySelector('.porque-parallax__bg img');
  const rows = gsap.utils.toArray('.impact-row');

  if (bg) {
    gsap.to(bg, {
      yPercent: 10,
      scale: 1.14,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  gsap.fromTo('.porque-parallax__head > *',
    { opacity: 0, x: -42 },
    {
      opacity: 1,
      x: 0,
      duration: .86,
      stagger: .1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        once: true
      }
    }
  );

  rows.forEach((row, index) => {
    const media = row.querySelector('.impact-row__media');
    const img = row.querySelector('.impact-row__media img');
    const textBits = row.querySelectorAll('.impact-row__text > *');
    const fromX = row.classList.contains('impact-row--right') ? 58 : -58;
    const textX = row.classList.contains('impact-row--right') ? -52 : 52;

    if (media) {
      gsap.fromTo(media,
        { opacity: 0, x: fromX, y: 34, rotate: index % 2 ? 7 : -7 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          rotate: index % 2 ? 5 : -4,
          duration: .9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 78%',
            once: true
          }
        }
      );
    }

    if (textBits.length) {
      gsap.fromTo(textBits,
        { opacity: 0, x: textX, y: 18 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: .78,
          stagger: .08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 72%',
            once: true
          }
        }
      );
    }

    if (img) {
      gsap.to(img, {
        yPercent: index % 2 ? -9 : 9,
        scale: 1.14,
        ease: 'none',
        scrollTrigger: {
          trigger: row,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    gsap.to(row, {
      yPercent: index % 2 ? -4 : 4,
      ease: 'none',
      scrollTrigger: {
        trigger: row,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
}
