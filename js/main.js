/**
 * Main application entry point
 */

import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.2.3/+esm';
import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/ScrollTrigger.js';
import { SEGMENT_DATA } from './segment-data.js';
import { PLANT_DATA, PLANT_ORDER } from './plant-data.js';
import { PRESENCE_LOCATIONS, PRESENCE_TYPES } from './presence-data.js';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  const lenis = initLenis();
  bindLenisToGsap(lenis);
  initCopyrightYear();
  initSiteHeader();
  initAboutHeroSlider();
  initRndProcessSlider();
  initMarketSegments();
  initPlants();
  initBoardSlider();
  initLifeSlider();
  initOpeningsForm();
  initPresenceMap();
  initPresenceCounters();
  // initTestimonialsSlider();
  initAboutParallax(lenis);
  initHistoryStack();
  initFounderReadMore();
  initPolicyCertificates();
  initAOS();
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
    autoRaf: false,
    prevent: (node) =>
      node?.closest?.('[data-lenis-prevent], [data-lenis-prevent-wheel]') != null,
  });

  return lenis;
}

/**
 * Drive Lenis from GSAP's ticker so ScrollTrigger stays in sync.
 */
function bindLenisToGsap(lenis) {
  if (!lenis) return;

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

/**
 * Animate On Scroll (AOS)
 */
function initAOS() {
  const aos = window.AOS;
  if (!aos) return;

  aos.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80,
    disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });

  requestAnimationFrame(() => aos.refresh());
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
 * Life at Mayur — centered image carousel: active slide full size,
 * neighbours scaled down and dimmed.
 */
function initLifeSlider() {
  const el = document.querySelector('[data-life-slider]');
  if (!el) return;

  const wrap = el.closest('.careers-life__slider-wrap');
  const wrapper = el.querySelector('.swiper-wrapper');
  const originals = wrapper ? Array.from(wrapper.querySelectorAll('.swiper-slide')) : [];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /*
    Slides are ~58% wide and centered, so Swiper only has a couple of them to
    shuffle around and its loop runs out of slides on one side. Duplicating the
    set gives loopFix enough material to keep the track filled in both
    directions.
  */
  if (wrapper && originals.length > 1) {
    for (let i = 0; i < 2; i += 1) {
      originals.forEach((slide) => {
        const clone = slide.cloneNode(true);
        clone.querySelectorAll('img').forEach((img) => {
          img.setAttribute('alt', '');
        });
        wrapper.appendChild(clone);
      });
    }
  }

  new Swiper(el, {
    slidesPerView: 'auto',
    centeredSlides: true,
    loop: true,
    loopPreventsSliding: false,
    spaceBetween: 32,
    speed: 700,
    grabCursor: true,
    slideToClickedSlide: true,
    watchSlidesProgress: true,
    autoplay: prefersReducedMotion
      ? false
      : {
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        },
    navigation: {
      prevEl: wrap?.querySelector('[data-life-prev]'),
      nextEl: wrap?.querySelector('[data-life-next]'),
    },
  });
}

/**
 * Current Openings application form — prevent a full-page reload on submit.
 */
function initOpeningsForm() {
  document.querySelectorAll('[data-openings-form]').forEach((form) => {
    const status = form.querySelector('[data-openings-status]');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.reset();
      if (!status) return;
      status.hidden = false;
      status.textContent = 'Thank you. Your message has been sent.';
    });
  });
}

/**
 * Global Presence stats — count up when the numbers enter the viewport.
 */
function initPresenceCounters() {
  const values = document.querySelectorAll('[data-count-to]');
  if (values.length === 0) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = 3000;

  function formatValue(el, current) {
    const suffix = el.dataset.countSuffix || '';
    el.textContent = `${current}${suffix}`;
  }

  function animate(el) {
    const target = Number(el.dataset.countTo);
    if (!Number.isFinite(target)) return;

    if (reduceMotion) {
      formatValue(el, target);
      return;
    }

    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      formatValue(el, Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  values.forEach((el) => animate(el));
}

/**
 * Global Presence map — pin selection, location picker, and next-location control.
 */
function initPresenceMap() {
  const root = document.querySelector('[data-presence-map]');
  if (!root) return;

  const pinsEl = root.querySelector('[data-presence-pins]');
  const zoomEl = root.querySelector('[data-presence-zoom]');
  const currentEl = root.querySelector('[data-presence-current]');
  const selectBtn = root.querySelector('[data-presence-select]');
  const menuEl = root.querySelector('[data-presence-menu]');
  const goBtn = root.querySelector('[data-presence-go]');
  if (!pinsEl || !currentEl || !selectBtn || !menuEl || !goBtn) return;

  const TYPE_ORDER = ['client', 'office', 'hub'];
  const grouped = TYPE_ORDER.flatMap((type) =>
    PRESENCE_LOCATIONS.filter((loc) => loc.type === type).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  );
  let activeId = PRESENCE_LOCATIONS.some((loc) => loc.id === 'south-africa')
    ? 'south-africa'
    : grouped[0].id;
  let zoomed = false;

  pinsEl.innerHTML = PRESENCE_LOCATIONS.map(
    (loc) => `
      <button
        type="button"
        class="presence-map__pin presence-map__pin--${loc.type}"
        style="left: ${loc.x}%; top: ${loc.y}%;"
        data-presence-pin
        data-id="${loc.id}"
        aria-label="${loc.name} — ${PRESENCE_TYPES[loc.type].label}"
      ></button>
    `
  ).join('');

  menuEl.innerHTML = TYPE_ORDER.map((type) => {
    const items = grouped.filter((loc) => loc.type === type);
    const { label } = PRESENCE_TYPES[type];
    return `
      <li class="presence-map__group-heading" role="presentation">
        <span class="presence-map__group-dot presence-map__group-dot--${type}"></span>
        ${label}
      </li>
      ${items
        .map(
          (loc) => `
            <li role="none">
              <button
                type="button"
                class="presence-map__option"
                role="option"
                data-presence-option
                data-id="${loc.id}"
              >
                ${loc.name}
              </button>
            </li>
          `
        )
        .join('')}
    `;
  }).join('');

  function zoomLevel() {
    return window.matchMedia('(max-width: 48rem)').matches ? 2.15 : 2.45;
  }

  function applyZoom(zoom, panX, panY) {
    if (!zoomEl) return;
    zoomEl.style.setProperty('--zoom', String(zoom));
    zoomEl.style.setProperty('--pan-x', `${panX}px`);
    zoomEl.style.setProperty('--pan-y', `${panY}px`);
  }

  function zoomTo(loc) {
    if (!zoomEl || !loc) return;
    const width = zoomEl.offsetWidth;
    const height = zoomEl.offsetHeight;
    if (!width || !height) return;

    const zoom = zoomLevel();
    let panX = width / 2 - (loc.x / 100) * width * zoom;
    let panY = height / 2 - (loc.y / 100) * height * zoom;

    const minX = width - width * zoom;
    const minY = height - height * zoom;
    panX = Math.min(0, Math.max(minX, panX));
    panY = Math.min(0, Math.max(minY, panY));

    applyZoom(zoom, panX, panY);
    zoomed = true;
  }

  function zoomToWorld() {
    applyZoom(1, 0, 0);
    zoomed = false;
  }

  function setActive(id, { zoom = true } = {}) {
    const loc = PRESENCE_LOCATIONS.find((item) => item.id === id);
    if (!loc) return;
    activeId = id;
    currentEl.textContent = loc.name;
    pinsEl.querySelectorAll('[data-presence-pin]').forEach((pin) => {
      const isActive = pin.dataset.id === id;
      pin.classList.toggle('is-active', isActive);
      if (isActive) pin.setAttribute('aria-current', 'true');
      else pin.removeAttribute('aria-current');
    });
    menuEl.querySelectorAll('[data-presence-option]').forEach((option) => {
      option.setAttribute('aria-selected', option.dataset.id === id ? 'true' : 'false');
    });
    if (zoom) zoomTo(loc);
  }

  function closeMenu() {
    menuEl.hidden = true;
    selectBtn.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    menuEl.hidden = false;
    selectBtn.setAttribute('aria-expanded', 'true');
    const selected = menuEl.querySelector('[aria-selected="true"]');
    selected?.focus();
  }

  selectBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    if (menuEl.hidden) openMenu();
    else closeMenu();
  });

  menuEl.addEventListener('click', (event) => {
    const option = event.target.closest('[data-presence-option]');
    if (!option) return;
    setActive(option.dataset.id);
    closeMenu();
    selectBtn.focus();
  });

  pinsEl.addEventListener('click', (event) => {
    const pin = event.target.closest('[data-presence-pin]');
    if (!pin) return;
    if (pin.dataset.id === activeId && zoomed) zoomToWorld();
    else setActive(pin.dataset.id);
    closeMenu();
  });

  goBtn.addEventListener('click', () => {
    const index = grouped.findIndex((loc) => loc.id === activeId);
    const next = grouped[(index + 1) % grouped.length];
    setActive(next.id);
    closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (!zoomed) return;
    const loc = PRESENCE_LOCATIONS.find((item) => item.id === activeId);
    if (loc) zoomTo(loc);
  });

  setActive(activeId, { zoom: false });
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
 * Scroll parallax for About collage and product-feature images.
 * About: disabled when the about stage is stacked (max-width: 75rem).
 * Products: disabled when product rows stack (max-width: 64rem).
 */
function initAboutParallax(lenis) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const aboutSection = document.querySelector('.about-section');
  const aboutFigures = aboutSection
    ? Array.from(aboutSection.querySelectorAll('[data-parallax]'))
    : [];
  const productFigures = Array.from(
    document.querySelectorAll('.product-feature [data-parallax]')
  );

  if (aboutFigures.length === 0 && productFigures.length === 0) return;

  const aboutStacked = window.matchMedia('(max-width: 75rem)');
  const productStacked = window.matchMedia('(max-width: 64rem)');

  const aboutItems = aboutFigures.map((figure) => ({
    figure,
    speed: Number.parseFloat(figure.dataset.parallaxSpeed) || 0.08,
  }));
  const productItems = productFigures.map((figure) => ({
    figure,
    speed: Number.parseFloat(figure.dataset.parallaxSpeed) || 0.08,
    article: figure.closest('.product-feature'),
  }));

  function clearTransforms(items) {
    items.forEach(({ figure }) => {
      figure.style.transform = '';
    });
  }

  function updateParallax() {
    if (aboutSection && aboutItems.length) {
      if (aboutStacked.matches) {
        clearTransforms(aboutItems);
      } else {
        const sectionTop = aboutSection.getBoundingClientRect().top;
        aboutItems.forEach(({ figure, speed }) => {
          figure.style.transform = `translate3d(0, ${sectionTop * speed}px, 0)`;
        });
      }
    }

    if (productItems.length) {
      if (productStacked.matches) {
        clearTransforms(productItems);
      } else {
        productItems.forEach(({ figure, speed, article }) => {
          const top = (article || figure).getBoundingClientRect().top;
          figure.style.transform = `translate3d(0, ${top * speed}px, 0)`;
        });
      }
    }
  }

  if (lenis) {
    lenis.on('scroll', updateParallax);
  } else {
    window.addEventListener('scroll', updateParallax, { passive: true });
  }

  window.addEventListener('resize', updateParallax, { passive: true });
  aboutStacked.addEventListener('change', updateParallax);
  productStacked.addEventListener('change', updateParallax);
  updateParallax();
}

/**
 * History section — GSAP ScrollTrigger pin (desktop, min-width 1025px).
 * Title + intro stay below the site header; the two card sets live in a
 * stage underneath so they never sit under the heading. Set 2 slides up
 * over set 1 while the section is pinned, then the pin releases intact.
 */
function initHistoryStack() {
  const section = document.querySelector('.history-section');
  const sets = gsap.utils.toArray('.history-section__set');
  if (!section || sets.length < 2) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) return;

  const header = document.querySelector('.site-header');

  function headerOffset() {
    return header?.getBoundingClientRect().height ?? 0;
  }

  const mm = gsap.matchMedia();

  mm.add('(min-width: 64.0625rem)', () => {
    section.classList.add('is-gsap');
    gsap.set(sets[1], { yPercent: 100 });

    const tween = gsap.to(sets[1], {
      yPercent: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: () => `top ${headerOffset()}px`,
        end: () => `+=${Math.round(window.innerHeight * 1.25)}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.55,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      section.classList.remove('is-gsap');
      gsap.set(sets[1], { clearProps: 'transform' });
    };
  });
}

/**
 * Founder message — reveal the second paragraph on Read More / hide on toggle.
 */
function initFounderReadMore() {
  const button = document.querySelector('.founder-section__button');
  const extra = document.getElementById('founder-message-more');
  if (!button || !extra) return;

  button.addEventListener('click', () => {
    const isOpen = extra.classList.toggle('is-open');
    extra.setAttribute('aria-hidden', String(!isOpen));
    button.setAttribute('aria-expanded', String(isOpen));
    button.textContent = isOpen ? 'Read Less' : 'Read More';
  });
}

/**
 * Policy certificates gallery — show / hide on button toggle.
 */
function initPolicyCertificates() {
  const button = document.querySelector('.policy-section__button');
  const gallery = document.getElementById('policy-certificates');
  if (!button || !gallery) return;

  button.addEventListener('click', () => {
    const isOpen = gallery.classList.toggle('is-open');
    gallery.setAttribute('aria-hidden', String(!isOpen));
    button.setAttribute('aria-expanded', String(isOpen));
    button.textContent = isOpen ? 'Hide Certificates' : 'Show Certificates';
  });

  const tabs = Array.from(gallery.querySelectorAll('[data-policy-tab]'));
  const panels = Array.from(gallery.querySelectorAll('[data-policy-panel]'));
  if (tabs.length === 0 || panels.length === 0) return;

  function showPanel(key) {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.policyTab === key;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.policyPanel === key;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => showPanel(tab.dataset.policyTab));
  });
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
 * R&D process carousel — image + step copy with centered dots.
 */
function initRndProcessSlider() {
  const root = document.querySelector('[data-rnd-process]');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.rnd-process__slide'));
  const panels = Array.from(root.querySelectorAll('.rnd-process__step-panel'));
  const dots = Array.from(root.querySelectorAll('.rnd-process__dot'));
  if (slides.length === 0) return;

  let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;

  let autoplayTimer = null;
  const AUTOPLAY_MS = 5000;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setDotState(dot, isActive) {
    if (!dot) return;
    dot.classList.toggle('is-active', isActive);
    if (isActive) {
      dot.setAttribute('aria-current', 'true');
    } else {
      dot.removeAttribute('aria-current');
    }
  }

  function goToSlide(index) {
    const nextIndex = ((index % slides.length) + slides.length) % slides.length;
    if (nextIndex === activeIndex) return;

    slides[activeIndex].classList.remove('is-active');
    slides[activeIndex].setAttribute('aria-hidden', 'true');
    panels[activeIndex]?.classList.remove('is-active');
    panels[activeIndex]?.setAttribute('aria-hidden', 'true');
    setDotState(dots[activeIndex], false);

    slides[nextIndex].classList.add('is-active');
    slides[nextIndex].setAttribute('aria-hidden', 'false');
    panels[nextIndex]?.classList.add('is-active');
    panels[nextIndex]?.setAttribute('aria-hidden', 'false');
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

  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget)) startAutoplay();
  });

  root.addEventListener('keydown', (event) => {
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

  slides.forEach((slide, index) => {
    slide.setAttribute('aria-hidden', String(index !== activeIndex));
  });
  panels.forEach((panel, index) => {
    panel.setAttribute('aria-hidden', String(index !== activeIndex));
  });
  dots.forEach((dot, index) => setDotState(dot, index === activeIndex));

  root.setAttribute('tabindex', '0');
  startAutoplay();
}

/**
 * About page hero slider — subtle crossfade with centered dot navigation
 */
function initAboutHeroSlider() {
  const slider = document.querySelector('.about-hero-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.about-hero-slider__slide'));
  const dots = Array.from(slider.querySelectorAll('.about-hero-slider__dot'));
  const caption = slider.querySelector('[data-hero-caption]');

  if (slides.length === 0) return;

  let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;

  let autoplayTimer = null;
  let captionTimer = null;
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

  function applyCaption(index) {
    if (!caption) return;

    const slide = slides[index];
    const source = slide.querySelector('.about-hero-slider__caption-source');
    const color = slide.dataset.captionColor === 'black' ? 'black' : 'white';

    caption.classList.remove(
      'about-hero-slider__caption--white',
      'about-hero-slider__caption--black'
    );
    caption.classList.add(`about-hero-slider__caption--${color}`);
    caption.innerHTML = source ? source.innerHTML : '';
  }

  function syncCaption(index, { animate = true } = {}) {
    if (!caption) return;

    if (captionTimer !== null) {
      window.clearTimeout(captionTimer);
      captionTimer = null;
    }

    if (!animate || prefersReducedMotion) {
      applyCaption(index);
      caption.classList.add('is-visible');
      return;
    }

    caption.classList.remove('is-visible');
    captionTimer = window.setTimeout(() => {
      applyCaption(index);
      caption.classList.add('is-visible');
      captionTimer = null;
    }, TRANSITION_MS * 0.35);
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
    syncCaption(activeIndex);
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
  syncCaption(activeIndex, { animate: false });

  slider.setAttribute('tabindex', '0');

  if (prefersReducedMotion) {
    document.documentElement.style.setProperty('--slider-transition-duration', '0ms');
  } else {
    document.documentElement.style.setProperty('--slider-transition-duration', `${TRANSITION_MS}ms`);
    startAutoplay();
  }
}

/**
 * Market segments — each page loads its own industries panel; tabs navigate between pages.
 */
function initMarketSegments() {
  const tabsNav = document.querySelector('[data-segment-tabs]');
  const panel = document.querySelector('[data-segment-panel]');
  const introEl = document.querySelector('[data-segment-intro]');
  const heroImage = document.querySelector('[data-segment-hero]');
  const segmentAttrs = Array.from(document.querySelectorAll('[data-segment-attrs]'));
  if (!tabsNav || !panel) return;

  const categoriesEl = panel.querySelector('[data-segment-categories]');
  const gallery = panel.querySelector('[data-segment-gallery]');
  const slides = gallery ? Array.from(gallery.querySelectorAll('.segment-panel__slide')) : [];
  const dots = gallery ? Array.from(gallery.querySelectorAll('.segment-panel__dot')) : [];

  if (!categoriesEl || !gallery || slides.length === 0) return;

  const tabLinks = Array.from(tabsNav.querySelectorAll('[data-segment]'));
  const AUTOPLAY_MS = 4000;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const assetRoot = document.body.dataset.assetRoot || '';

  let activeIndex = 0;
  let autoplayTimer = null;

  function assetUrl(path) {
    if (!path || !assetRoot) return path;
    if (/^(?:https?:)?\/\//.test(path) || path.startsWith('/') || path.startsWith('../')) {
      return path;
    }
    return `${assetRoot}${path}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function setDotState(dot, isActive) {
    if (!dot) return;
    dot.classList.toggle('is-active', isActive);
    if (isActive) {
      dot.setAttribute('aria-current', 'true');
    } else {
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

  function stopAutoplay() {
    if (autoplayTimer !== null) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    if (prefersReducedMotion || slides.length < 2) return;
    stopAutoplay();
    autoplayTimer = window.setInterval(nextSlide, AUTOPLAY_MS);
  }

  function setGalleryImages(imagePaths, { alt = '' } = {}) {
    const paths = imagePaths.filter(Boolean);
    if (paths.length === 0) return;

    slides.forEach((slide, index) => {
      const img = slide.querySelector('.segment-panel__image');
      if (!img) return;
      img.src = assetUrl(paths[index % paths.length]);
      img.alt = alt;
    });

    if (activeIndex !== 0) {
      slides[activeIndex].classList.remove('is-active');
      slides[activeIndex].setAttribute('aria-hidden', 'true');
      setDotState(dots[activeIndex], false);

      slides[0].classList.add('is-active');
      slides[0].setAttribute('aria-hidden', 'false');
      setDotState(dots[0], true);
      activeIndex = 0;
    }

    startAutoplay();
  }

  function clearCategoryActiveState() {
    categoriesEl.querySelectorAll('.segment-panel__item, .segment-panel__option').forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-pressed', 'false');
    });
  }

  function renderCategories(segment) {
    const useDropdowns = segment.categories.some((category) => Array.isArray(category.options));

    categoriesEl.classList.toggle('segment-panel__list--dropdowns', useDropdowns);

    categoriesEl.innerHTML = segment.categories
      .map((category, index) => {
        const images = category.images.join('|');
        const isActive = index === 0;
        const hasOptions = Array.isArray(category.options);
        const isOpen = isActive && hasOptions && category.options.length > 0;

        if (!hasOptions) {
          return `
            <li>
              <button
                type="button"
                class="segment-panel__item${isActive ? ' is-active' : ''}"
                aria-pressed="${isActive ? 'true' : 'false'}"
                data-images="${escapeHtml(images)}"
              >
                ${escapeHtml(category.label)}
              </button>
            </li>
          `;
        }

        const optionsMarkup = category.options
          .map((option, optionIndex) => {
            const optionImages = option.images.join('|');
            const optionActive = isActive && optionIndex === 0;
            return `
              <li>
                <button
                  type="button"
                  class="segment-panel__option${optionActive ? ' is-active' : ''}"
                  aria-pressed="${optionActive ? 'true' : 'false'}"
                  data-images="${escapeHtml(optionImages)}"
                >
                  ${escapeHtml(option.label)}
                </button>
              </li>
            `;
          })
          .join('');

        return `
          <li class="segment-panel__dropdown${isOpen ? ' is-open' : ''}">
            <button
              type="button"
              class="segment-panel__item segment-panel__item--trigger${isActive ? ' is-active' : ''}"
              aria-expanded="${isOpen ? 'true' : 'false'}"
              aria-pressed="${isActive ? 'true' : 'false'}"
              data-images="${escapeHtml(images)}"
            >
              <span class="segment-panel__item-label">${escapeHtml(category.label)}</span>
              <span class="segment-panel__chevron" aria-hidden="true"></span>
            </button>
            <div class="segment-panel__submenu-wrap">
              <ul class="segment-panel__submenu" aria-hidden="${isOpen ? 'false' : 'true'}">
                ${optionsMarkup}
              </ul>
            </div>
          </li>
        `;
      })
      .join('');

    categoriesEl.querySelectorAll('.segment-panel__item').forEach((button) => {
      button.addEventListener('click', () => {
        const dropdown = button.closest('.segment-panel__dropdown');

        if (dropdown) {
          const wasOpen = dropdown.classList.contains('is-open');
          const canOpen = (dropdown.querySelector('.segment-panel__submenu')?.children.length || 0) > 0;

          categoriesEl.querySelectorAll('.segment-panel__dropdown').forEach((item) => {
            const trigger = item.querySelector('.segment-panel__item--trigger');
            const menu = item.querySelector('.segment-panel__submenu');
            const open = canOpen && item === dropdown && !wasOpen;
            item.classList.toggle('is-open', open);
            if (trigger) trigger.setAttribute('aria-expanded', String(open));
            if (menu) menu.setAttribute('aria-hidden', String(!open));
          });

          clearCategoryActiveState();
          button.classList.add('is-active');
          button.setAttribute('aria-pressed', 'true');

          const images = (button.dataset.images || '')
            .split('|')
            .map((path) => path.trim())
            .filter(Boolean);
          setGalleryImages(images, {
            alt: `${segment.title} — ${button.querySelector('.segment-panel__item-label')?.textContent.trim() || button.textContent.trim()}`,
          });
          return;
        }

        if (button.classList.contains('is-active')) return;

        clearCategoryActiveState();
        button.classList.add('is-active');
        button.setAttribute('aria-pressed', 'true');

        const images = (button.dataset.images || '')
          .split('|')
          .map((path) => path.trim())
          .filter(Boolean);
        setGalleryImages(images, { alt: `${segment.title} — ${button.textContent.trim()}` });
      });
    });

    categoriesEl.querySelectorAll('.segment-panel__option').forEach((optionButton) => {
      optionButton.addEventListener('click', () => {
        const dropdown = optionButton.closest('.segment-panel__dropdown');
        const trigger = dropdown?.querySelector('.segment-panel__item--trigger');

        clearCategoryActiveState();
        optionButton.classList.add('is-active');
        optionButton.setAttribute('aria-pressed', 'true');
        if (trigger) {
          trigger.classList.add('is-active');
          trigger.setAttribute('aria-pressed', 'true');
        }

        const images = (optionButton.dataset.images || '')
          .split('|')
          .map((path) => path.trim())
          .filter(Boolean);
        setGalleryImages(images, {
          alt: `${segment.title} — ${optionButton.textContent.trim()}`,
        });
      });
    });
  }

  function setActiveTab(segmentKey) {
    tabLinks.forEach((link) => {
      const isActive = link.dataset.segment === segmentKey;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function showSegment(segmentKey) {
    const segment = SEGMENT_DATA[segmentKey];
    if (!segment) return;

    setActiveTab(segmentKey);

    panel.id = segment.id;
    if (introEl) introEl.textContent = segment.intro || '';
    if (heroImage && segment.hero) {
      heroImage.src = assetUrl(segment.hero);
      heroImage.alt = `Market segment — ${segment.title}`;
    }

    renderCategories(segment);
    const firstCategory = segment.categories[0];
    const initialImages =
      firstCategory?.options?.[0]?.images || firstCategory?.images || [];
    const initialLabel = firstCategory?.options?.[0]?.label || firstCategory?.label || '';
    setGalleryImages(initialImages, {
      alt: `${segment.title} — ${initialLabel}`.trim(),
    });

    segmentAttrs.forEach((el) => {
      const isActive = el.dataset.segmentAttrs === segmentKey;
      el.hidden = !isActive;
      if (isActive) el.classList.add('aos-animate');
    });
    window.AOS?.refresh();
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = Number(dot.dataset.slideTo);
      if (Number.isNaN(target) || target >= slides.length) return;
      goToSlide(target);
      startAutoplay();
    });
  });

  gallery.addEventListener('mouseenter', stopAutoplay);
  gallery.addEventListener('mouseleave', startAutoplay);
  gallery.addEventListener('focusin', stopAutoplay);
  gallery.addEventListener('focusout', (event) => {
    if (!gallery.contains(event.relatedTarget)) startAutoplay();
  });

  slides.forEach((slide, index) => {
    slide.setAttribute('aria-hidden', String(index !== 0));
  });
  dots.forEach((dot, index) => setDotState(dot, index === 0));

  const initialKey =
    document.body.dataset.segmentPage ||
    tabLinks.find((link) => link.classList.contains('is-active'))?.dataset.segment ||
    'furnishing';
  showSegment(initialKey);
}

/**
 * Plants page — Jaitpura is featured by default; other two plants render as cards.
 */
function initPlants() {
  const page = document.querySelector('[data-plants-page]');
  if (!page) return;

  const featured = page.querySelector('[data-plants-featured]');
  const grid = page.querySelector('[data-plants-grid]');
  if (!featured || !grid) return;

  const imageEl = featured.querySelector('[data-plant-image]');
  const nameEl = featured.querySelector('[data-plant-name]');
  const locationEl = featured.querySelector('[data-plant-location]');
  const copyEl = featured.querySelector('[data-plant-copy]');
  const DEFAULT_PLANT = 'jaitpura';

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function activePlantId() {
    const plantId = new URLSearchParams(window.location.search).get('plant');
    return PLANT_DATA[plantId] ? plantId : DEFAULT_PLANT;
  }

  function renderFeatured(plant) {
    if (imageEl) {
      imageEl.src = plant.main;
      imageEl.alt = plant.name;
      imageEl.style.objectPosition = plant.objectPosition || 'center';
    }
    if (nameEl) nameEl.textContent = plant.name;
    if (locationEl) locationEl.textContent = plant.location;
    if (copyEl) {
      copyEl.innerHTML = plant.paragraphs
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join('');
    }

    featured.setAttribute('aria-labelledby', 'plants-featured-title');
    document.title = `${plant.name} — Mayur Uniquoters`;
  }

  function renderCards(activeId) {
    const others = PLANT_ORDER.map((id) => PLANT_DATA[id]).filter(
      (plant) => plant && plant.id !== activeId
    );

    grid.innerHTML = others
      .map(
        (plant) => `
          <article class="plants-card">
            <div class="plants-card__media">
              <img
                src="${escapeHtml(plant.thumb)}"
                alt="${escapeHtml(plant.name)} exterior"
                class="plants-card__image"
                width="820"
                height="480"
                loading="lazy"
              />
            </div>
            <h2 class="plants-card__title">${escapeHtml(plant.name)}</h2>
            <a href="plants.html?plant=${escapeHtml(plant.id)}#plant" class="plants-card__button">Read More</a>
          </article>
        `
      )
      .join('');
  }

  const plantId = activePlantId();
  renderFeatured(PLANT_DATA[plantId]);
  renderCards(plantId);
}

