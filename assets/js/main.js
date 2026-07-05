(function () {
  "use strict";
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.getElementById("siteHeader");
  var menuToggle = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("aria-hidden", "true");
      });
    });
  }
  function splitText(selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (el.dataset.splitDone === "true") return;
      var text = el.textContent.trim().replace(/\s+/g, " ");
      if (!text) return;
      el.setAttribute("aria-label", text);
      el.innerHTML = text
        .split(" ")
        .map(function (word) {
          return (
            '<span class="word" aria-hidden="true"><span>' +
            word +
            "</span></span>"
          );
        })
        .join(" ");
      el.dataset.splitDone = "true";
    });
  }
  if (!reduceMotion) {
    splitText(".split-text");
  }
  var hasGSAP = window.gsap && window.ScrollTrigger;
  var lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.08,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
      syncTouch: false,
    });
    if (hasGSAP) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }
  if (!hasGSAP || reduceMotion) {
    document
      .querySelectorAll(".reveal-up, .reveal-fade, .stagger-item, .media-scale")
      .forEach(function (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    return;
  }
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  gsap.set(".reveal-up", { opacity: 0, y: 34 });
  gsap.set(".reveal-fade", { opacity: 0 });
  gsap.set(".stagger-item", { opacity: 0, y: 26 });
  gsap.set(".media-scale", { opacity: 0, scale: 0.965 });
  document.querySelectorAll(".split-text").forEach(function (el) {
    var words = el.querySelectorAll(".word > span");
    if (!words.length) return;
    gsap.set(words, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: el,
      start: "top 86%",
      once: true,
      onEnter: function () {
        gsap.to(words, {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.035,
          ease: "power4.out",
        });
      },
    });
  });
  document.querySelectorAll(".reveal-up").forEach(function (el) {
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: function () {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          clearProps: "willChange",
        });
      },
    });
  });
  document.querySelectorAll(".reveal-fade").forEach(function (el) {
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: function () {
        gsap.to(el, {
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          clearProps: "willChange",
        });
      },
    });
  });
  document.querySelectorAll(".media-scale").forEach(function (el) {
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: function () {
        gsap.to(el, {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          clearProps: "willChange",
        });
      },
    });
  });
  [
    ".areas__grid",
    ".programs__grid",
    ".diff__grid",
    ".partners__grid",
    ".testimonials__grid",
    ".values__chips",
  ].forEach(function (selector) {
    var group = document.querySelector(selector);
    if (!group) return;
    var items = group.querySelectorAll(".stagger-item");
    if (!items.length) return;
    ScrollTrigger.create({
      trigger: group,
      start: "top 84%",
      once: true,
      onEnter: function () {
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.72,
          stagger: 0.07,
          ease: "power3.out",
          clearProps: "willChange",
        });
      },
    });
  });
  document.querySelectorAll(".draw-svg").forEach(function (svg) {
    var lines = svg.querySelectorAll(".draw-line");
    var nodes = svg.querySelectorAll(".draw-node");
    lines.forEach(function (line) {
      try {
        var length = line.getTotalLength();
        line.style.strokeDasharray = length;
        line.style.strokeDashoffset = length;
      } catch (err) {}
    });
    gsap.set(nodes, { opacity: 0, scale: 0.35, transformOrigin: "center" });
    ScrollTrigger.create({
      trigger: svg.closest("section") || svg,
      start: "top 70%",
      once: true,
      onEnter: function () {
        gsap.to(lines, {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "power3.out",
        });
        gsap.to(nodes, {
          opacity: 1,
          scale: 1,
          duration: 0.55,
          stagger: 0.14,
          delay: 0.45,
          ease: "back.out(1.8)",
        });
      },
    });
  });
  gsap.utils.toArray(".orb").forEach(function (orb, i) {
    gsap.to(orb, {
      y: i % 2 === 0 ? 80 : -70,
      x: i % 2 === 0 ? -30 : 24,
      ease: "none",
      scrollTrigger: {
        trigger: orb.closest("section") || document.body,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
  var heroVideo = document.querySelector(".hero__media");
  if (heroVideo) {
    gsap.to(heroVideo, {
      scale: 1.08,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }
  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();
