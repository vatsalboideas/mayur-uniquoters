/**
 * Main application entry point
 */

import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.2.3/+esm';
import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

document.addEventListener('DOMContentLoaded', () => {
  const lenis = initLenis();
  initCopyrightYear();
  initSiteHeader();
  initAboutHeroSlider();
  initBoardSlider();
  initTestimonialsSlider();
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
 * Customer testimonials — centered coverflow: full-size active card,
 * neighbours one step smaller, outer pair two steps smaller.
 */
function initTestimonialsSlider() {
  const el = document.getElementById('testimonials-slider');
  if (!el) return;

  const SCALE = { center: 1, side: 0.82, far: 0.66 };
  const OPACITY = { center: 1, side: 0.55, far: 0.35 };

  function scaleForProgress(progress) {
    const d = Math.min(Math.abs(progress), 2);
    if (d <= 1) {
      return SCALE.center - d * (SCALE.center - SCALE.side);
    }
    return SCALE.side - (d - 1) * (SCALE.side - SCALE.far);
  }

  function opacityForProgress(progress) {
    const d = Math.min(Math.abs(progress), 2);
    if (d <= 1) {
      return OPACITY.center - d * (OPACITY.center - OPACITY.side);
    }
    return OPACITY.side - (d - 1) * (OPACITY.side - OPACITY.far);
  }

  function applyDepth(swiper) {
    swiper.slides.forEach((slide) => {
      const progress = slide.progress;
      const distance = Math.abs(progress);
      const scale = scaleForProgress(progress);
      const opacity = opacityForProgress(progress);

      slide.style.transform = `scale(${scale})`;
      slide.style.opacity = String(opacity);
      slide.style.zIndex = String(Math.round(10 - distance * 2));

      slide.classList.toggle('is-active', distance < 0.5);
      slide.classList.toggle('is-side', distance >= 0.5 && distance < 1.5);
      slide.classList.toggle('is-far', distance >= 1.5);
    });
  }

  new Swiper(el, {
    slidesPerView: 'auto',
    centeredSlides: true,
    loop: true,
    spaceBetween: 0,
    speed: 700,
    grabCursor: true,
    watchSlidesProgress: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    on: {
      setTranslate(swiper) {
        applyDepth(swiper);
      },
      setTransition(swiper, duration) {
        swiper.slides.forEach((slide) => {
          slide.style.transitionDuration = `${duration}ms`;
        });
      },
    },
  });
}

/**
 * Board members coverflow slider — active portrait centered, neighbours scaled
 * back and desaturated, outer pair clipped by the section edges.
 */
function initBoardSlider() {
  const slider = document.getElementById('board-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.board-slider__slide'));
  const prevButton = slider.querySelector('[data-board-prev]');
  const nextButton = slider.querySelector('[data-board-next]');
  if (slides.length === 0) return;

  /* Depth steps keyed by distance from the active slide; offsets are multiples
     of the slide width so the layout tracks the responsive slide size. */
  const DEPTHS = [
    { offset: 0, scale: 1, opacity: 1 },
    { offset: 1.148, scale: 0.82, opacity: 0.75 },
    { offset: 2.122, scale: 0.66, opacity: 0.35 },
  ];

  const total = slides.length;
  let activeIndex = 0;

  function relativeOffset(index) {
    let offset = index - activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    return offset;
  }

  function render() {
    const slideWidth = slides[0].offsetWidth;

    slides.forEach((slide, index) => {
      const offset = relativeOffset(index);
      const distance = Math.abs(offset);
      const depth = DEPTHS[distance];

      slide.classList.toggle('is-active', distance === 0);
      slide.classList.toggle('is-side', distance === 1);
      slide.classList.toggle('is-far', distance === 2);
      slide.classList.toggle('is-hidden', !depth);

      if (!depth) {
        /* Park beyond the outer pair so it slides in from the correct side */
        const parked = Math.sign(offset) * slideWidth * 2.8;
        slide.style.transform = `translateX(${parked}px) scale(0.6)`;
        slide.style.opacity = '0';
        slide.style.zIndex = '0';
        return;
      }

      const x = Math.sign(offset) * slideWidth * depth.offset;
      slide.style.transform = `translateX(${x}px) scale(${depth.scale})`;
      slide.style.opacity = String(depth.opacity);
      slide.style.zIndex = String(10 - distance);
    });
  }

  function goTo(index) {
    activeIndex = ((index % total) + total) % total;
    render();
  }

  prevButton?.addEventListener('click', () => goTo(activeIndex - 1));
  nextButton?.addEventListener('click', () => goTo(activeIndex + 1));

  slides.forEach((slide, index) => {
    slide.addEventListener('click', () => {
      if (relativeOffset(index) !== 0) goTo(index);
    });
  });

  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
  });

  window.addEventListener('resize', render, { passive: true });
  render();
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
