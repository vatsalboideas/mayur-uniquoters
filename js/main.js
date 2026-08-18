/**
 * Main application entry point
 */

import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.2.3/+esm';
import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/ScrollTrigger.js';
import { SEGMENT_DATA } from './segment-data.js';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  const lenis = initLenis();
  bindLenisToGsap(lenis);
  initCopyrightYear();
  initSiteHeader();
  initAboutHeroSlider();
  initMarketSegments();
  initBoardSlider();
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
 * Disabled when the about stage is stacked (max-width: 75rem) so transforms
 * do not fight the static document-flow layout.
 */
function initAboutParallax(lenis) {
  const section = document.querySelector('.about-section');
  const figures = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!section || figures.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stackedLayout = window.matchMedia('(max-width: 75rem)');

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
 * History section — GSAP ScrollTrigger pin.
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

  mm.add('(min-width: 40.0625rem)', () => {
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
 * Market segments — tabs swap panel categories + products (same layout, different data)
 */
function initMarketSegments() {
  const tabsNav = document.querySelector('[data-segment-tabs]');
  const panel = document.querySelector('[data-segment-panel]');
  const productsSection = document.querySelector('[data-segment-products]');
  if (!tabsNav || !panel || !productsSection) return;

  const titleEl = panel.querySelector('[data-segment-title]');
  const categoriesEl = panel.querySelector('[data-segment-categories]');
  const gallery = panel.querySelector('[data-segment-gallery]');
  const slides = gallery ? Array.from(gallery.querySelectorAll('.segment-panel__slide')) : [];
  const dots = gallery ? Array.from(gallery.querySelectorAll('.segment-panel__dot')) : [];

  const picker = document.getElementById('product-picker');
  const wrapper = picker?.querySelector('.swiper-wrapper');
  const feature = productsSection.querySelector('[data-product-feature]');
  const imageEl = feature?.querySelector('[data-product-image]');
  const nameEl = feature?.querySelector('[data-product-name]');
  const descEl = feature?.querySelector('[data-product-desc]');
  const traitsEl = feature?.querySelector('[data-product-traits]');

  const panelInner = panel.querySelector('.segment-panel__inner');
  const panelContent = panel.querySelector('.segment-panel__content');

  if (!categoriesEl || !gallery || slides.length === 0 || !picker || !wrapper || !feature) return;

  const tabLinks = Array.from(tabsNav.querySelectorAll('[data-segment]'));
  const AUTOPLAY_MS = 4000;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let activeIndex = 0;
  let autoplayTimer = null;
  let productSwiper = null;
  let activeSegmentKey = 'furnishing';

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function syncDropdownListHeight() {
    if (!panelInner || !panelContent || !gallery || !categoriesEl) return;

    if (!categoriesEl.classList.contains('segment-panel__list--dropdowns')) {
      panelInner.style.removeProperty('--segment-panel-gallery-height');
      categoriesEl.style.removeProperty('max-height');
      categoriesEl.removeAttribute('data-lenis-prevent');
      panelContent.removeAttribute('data-lenis-prevent');
      return;
    }

    categoriesEl.setAttribute('data-lenis-prevent', '');
    panelContent.setAttribute('data-lenis-prevent', '');

    const galleryHeight = gallery.getBoundingClientRect().height;
    const titleHeight = titleEl ? titleEl.getBoundingClientRect().height : 0;
    const stacked = window.matchMedia('(max-width: 64rem)').matches;
    const cap = stacked ? Math.min(window.innerHeight * 0.55, 420) : galleryHeight;

    if (galleryHeight > 0 || stacked) {
      panelInner.style.setProperty(
        '--segment-panel-gallery-height',
        `${Math.round(stacked ? cap : galleryHeight)}px`
      );
      categoriesEl.style.maxHeight = `${Math.max(120, Math.round(cap - titleHeight))}px`;
    }
  }

  /* Keep wheel/trackpad scroll on the list — Lenis otherwise steals it */
  categoriesEl.addEventListener(
    'wheel',
    (event) => {
      if (!categoriesEl.classList.contains('segment-panel__list--dropdowns')) return;
      if (categoriesEl.scrollHeight <= categoriesEl.clientHeight + 1) return;
      event.stopPropagation();
    },
    { passive: true, capture: true }
  );

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
      img.src = paths[index % paths.length];
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
    const useDropdowns = segment.id === 'automotive';

    categoriesEl.classList.toggle('segment-panel__list--dropdowns', useDropdowns);
    if (useDropdowns) {
      categoriesEl.setAttribute('data-lenis-prevent', '');
    } else {
      categoriesEl.removeAttribute('data-lenis-prevent');
    }

    categoriesEl.innerHTML = segment.categories
      .map((category, index) => {
        const images = category.images.join('|');
        const isActive = index === 0;
        const hasOptions = useDropdowns && Array.isArray(category.options) && category.options.length > 0;

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
          <li class="segment-panel__dropdown${isActive ? ' is-open' : ''}">
            <button
              type="button"
              class="segment-panel__item segment-panel__item--trigger${isActive ? ' is-active' : ''}"
              aria-expanded="${isActive ? 'true' : 'false'}"
              aria-pressed="${isActive ? 'true' : 'false'}"
              data-images="${escapeHtml(images)}"
            >
              <span class="segment-panel__item-label">${escapeHtml(category.label)}</span>
              <span class="segment-panel__chevron" aria-hidden="true"></span>
            </button>
            <ul class="segment-panel__submenu" ${isActive ? '' : 'hidden'}>
              ${optionsMarkup}
            </ul>
          </li>
        `;
      })
      .join('');

    categoriesEl.querySelectorAll('.segment-panel__item').forEach((button) => {
      button.addEventListener('click', () => {
        const dropdown = button.closest('.segment-panel__dropdown');

        if (dropdown) {
          const wasOpen = dropdown.classList.contains('is-open');
          const submenu = dropdown.querySelector('.segment-panel__submenu');

          categoriesEl.querySelectorAll('.segment-panel__dropdown').forEach((item) => {
            const trigger = item.querySelector('.segment-panel__item--trigger');
            const menu = item.querySelector('.segment-panel__submenu');
            const open = item === dropdown && !wasOpen;
            item.classList.toggle('is-open', open);
            if (trigger) trigger.setAttribute('aria-expanded', String(open));
            if (menu) menu.hidden = !open;
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
          syncDropdownListHeight();
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

  function applyProduct(slide) {
    if (!slide) return;

    const name = slide.dataset.name || '';
    const desc = slide.dataset.desc || '';
    const image = slide.dataset.image || '';
    const traits = (slide.dataset.traits || '').split('|').filter(Boolean);

    if (imageEl && image) {
      imageEl.src = image;
      imageEl.alt = name || 'Product';
    }
    if (nameEl) nameEl.textContent = name;
    if (descEl) descEl.textContent = desc;
    if (traitsEl) {
      traitsEl.innerHTML = traits
        .map((trait) => `<li class="segment-products__trait">${escapeHtml(trait)}</li>`)
        .join('');
    }

    wrapper.querySelectorAll('.segment-products__pick').forEach((pick) => {
      const isActive = pick === slide;
      pick.classList.toggle('is-active', isActive);
      pick.setAttribute('aria-pressed', String(isActive));
    });
  }

  function renderProducts(segment) {
    const products = [...segment.products, ...segment.products, ...segment.products];

    if (productSwiper) {
      productSwiper.destroy(true, true);
      productSwiper = null;
    }

    wrapper.innerHTML = products
      .map((product, index) => {
        const traits = product.traits.join('|');
        return `
          <button
            type="button"
            class="swiper-slide segment-products__pick${index === 0 ? ' is-active' : ''}"
            data-product-index="${index}"
            data-name="${escapeHtml(product.name)}"
            data-desc="${escapeHtml(product.desc)}"
            data-image="${escapeHtml(product.image)}"
            data-traits="${escapeHtml(traits)}"
            aria-label="${escapeHtml(product.name)}"
            aria-pressed="${index === 0 ? 'true' : 'false'}"
          >
            <span class="segment-products__pick-thumb">
              <img
                src="${escapeHtml(product.image)}"
                alt=""
                class="segment-products__pick-image"
                width="100"
                height="100"
                loading="lazy"
              />
            </span>
            <span class="segment-products__pick-label">${escapeHtml(product.name)}</span>
          </button>
        `;
      })
      .join('');

    productSwiper = new Swiper(picker, {
      slidesPerView: 7,
      slidesPerGroup: 4,
      spaceBetween: 24,
      speed: 500,
      grabCursor: true,
      watchOverflow: true,
      pagination: {
        el: picker.querySelector('.segment-products__pagination'),
        clickable: true,
      },
      breakpoints: {
        0: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 16 },
        640: { slidesPerView: 4, slidesPerGroup: 3, spaceBetween: 20 },
        900: { slidesPerView: 5, slidesPerGroup: 4, spaceBetween: 22 },
        1200: { slidesPerView: 7, slidesPerGroup: 4, spaceBetween: 24 },
      },
    });

    productSwiper.on('slideChangeTransitionEnd', () => {
      const activeSlide = productSwiper.slides[productSwiper.activeIndex];
      if (activeSlide) applyProduct(activeSlide);
    });

    applyProduct(wrapper.querySelector('.segment-products__pick'));
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

    activeSegmentKey = segmentKey;
    setActiveTab(segmentKey);

    panel.id = segment.id;
    if (titleEl) titleEl.textContent = segment.title;

    renderCategories(segment);
    const firstCategory = segment.categories[0];
    const initialImages =
      firstCategory?.options?.[0]?.images || firstCategory?.images || [];
    const initialLabel = firstCategory?.options?.[0]?.label || firstCategory?.label || '';
    setGalleryImages(initialImages, {
      alt: `${segment.title} — ${initialLabel}`.trim(),
    });
    renderProducts(segment);
    requestAnimationFrame(() => {
      syncDropdownListHeight();
      requestAnimationFrame(syncDropdownListHeight);
    });
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

  wrapper.addEventListener('click', (event) => {
    const slide = event.target.closest('.segment-products__pick');
    if (!slide || !wrapper.contains(slide)) return;
    applyProduct(slide);
  });

  tabLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const key = link.dataset.segment;
      if (!key || key === activeSegmentKey) return;
      showSegment(key);
    });
  });

  slides.forEach((slide, index) => {
    slide.setAttribute('aria-hidden', String(index !== 0));
  });
  dots.forEach((dot, index) => setDotState(dot, index === 0));

  const initialKey =
    tabLinks.find((link) => link.classList.contains('is-active'))?.dataset.segment || 'furnishing';
  showSegment(initialKey);

  window.addEventListener('resize', syncDropdownListHeight);
}

