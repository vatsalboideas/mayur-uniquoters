/**
 * Main application entry point
 */

import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.2.3/+esm';

document.addEventListener('DOMContentLoaded', () => {
  const lenis = initLenis();
  initCopyrightYear();
  initSiteHeader();
  initAboutHeroSlider();
  initAboutParallax(lenis);
});

/**
 * Lenis smooth scrolling
 */
function initLenis() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    anchors: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
  return lenis;
}

/**
 * Scroll parallax for About section images.
 * Disabled when the about stage is stacked (max-width: 64rem) so transforms
 * do not fight the static document-flow layout.
 */
function initAboutParallax(lenis) {
  const section = document.querySelector('.about-section');
  const figures = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!section || figures.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stackedLayout = window.matchMedia('(max-width: 64rem)');

  if (prefersReducedMotion.matches) return;

  const items = figures.map((figure) => ({
    figure,
    speed: Number.parseFloat(figure.dataset.parallaxSpeed) || 0.08,
  }));

  function clearTransforms() {
    items.forEach(({ figure }) => {
      figure.style.transform = '';
    });
  }

  function updateParallax() {
    if (stackedLayout.matches) {
      clearTransforms();
      return;
    }

    /* Rest at original layout when section top aligns with viewport top */
    const sectionTop = section.getBoundingClientRect().top;

    items.forEach(({ figure, speed }) => {
      /* Scroll down → sectionTop goes negative → images move up */
      const offset = sectionTop * speed;
      figure.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  }

  if (lenis) {
    lenis.on('scroll', updateParallax);
  } else {
    window.addEventListener('scroll', updateParallax, { passive: true });
  }

  window.addEventListener('resize', updateParallax, { passive: true });
  stackedLayout.addEventListener('change', updateParallax);
  updateParallax();
}

/**
 * Set footer copyright year to the current year
 */
function initCopyrightYear() {
  const yearEl = document.getElementById('copyright-year');
  if (!yearEl) return;

  yearEl.textContent = String(new Date().getFullYear());
}

/**
 * Mobile header navigation toggle
 */
function initSiteHeader() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.site-header__toggle');
  const nav = document.getElementById('site-header-nav');
  if (!header || !toggle || !nav) return;

  const desktopQuery = window.matchMedia('(min-width: 75.0625rem)');

  function closeNav() {
    header.classList.remove('is-nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  nav.querySelectorAll('.site-header__nav-link').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) closeNav();
  });
}

/**
 * About page hero slider — subtle crossfade with centered dot navigation
 */
function initAboutHeroSlider() {
  const slider = document.getElementById('about-hero-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.about-hero-slider__slide'));
  const dots = Array.from(slider.querySelectorAll('.about-hero-slider__dot'));

  if (slides.length === 0) return;

  let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;

  let autoplayTimer = null;
  const AUTOPLAY_MS = 6000;
  const TRANSITION_MS = 900;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setDotState(dot, isActive) {
    if (!dot) return;
    dot.classList.toggle('is-active', isActive);
    if (isActive) {
      dot.setAttribute('aria-current', 'true');
    } else {
      /* Omit aria-current when inactive — aria-current="false" is still announced oddly */
      dot.removeAttribute('aria-current');
    }
  }

  function goToSlide(index) {
    const nextIndex = ((index % slides.length) + slides.length) % slides.length;
    if (nextIndex === activeIndex) return;

    slides[activeIndex].classList.remove('is-active');
    slides[activeIndex].setAttribute('aria-hidden', 'true');
    setDotState(dots[activeIndex], false);

    slides[nextIndex].classList.add('is-active');
    slides[nextIndex].setAttribute('aria-hidden', 'false');
    setDotState(dots[nextIndex], true);

    activeIndex = nextIndex;
  }

  function nextSlide() {
    goToSlide(activeIndex + 1);
  }

  function startAutoplay() {
    if (prefersReducedMotion || slides.length < 2) return;
    stopAutoplay();
    autoplayTimer = window.setInterval(nextSlide, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (autoplayTimer !== null) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = Number(dot.dataset.slideTo);
      if (Number.isNaN(target)) return;
      goToSlide(target);
      startAutoplay();
    });
  });

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);
  slider.addEventListener('focusin', stopAutoplay);
  slider.addEventListener('focusout', (event) => {
    if (!slider.contains(event.relatedTarget)) startAutoplay();
  });

  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextSlide();
      startAutoplay();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToSlide(activeIndex - 1);
      startAutoplay();
    }
  });

  /* Sync initial a11y state from markup classes */
  slides.forEach((slide, index) => {
    slide.setAttribute('aria-hidden', String(index !== activeIndex));
  });
  dots.forEach((dot, index) => setDotState(dot, index === activeIndex));

  slider.setAttribute('tabindex', '0');

  if (prefersReducedMotion) {
    document.documentElement.style.setProperty('--slider-transition-duration', '0ms');
  } else {
    document.documentElement.style.setProperty('--slider-transition-duration', `${TRANSITION_MS}ms`);
    startAutoplay();
  }
}
