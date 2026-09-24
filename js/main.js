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
  initRndProcessSlider();
  initScrubTimeline({
    timelineSelector: '.rnd-qa__timeline',
    stepSelector: '.rnd-qa__step',
    bodySelector: '.rnd-qa__body',
    extraSelector: '.rnd-qa__num',
    extraOffset: 0.14,
    extraDuration: 0.28,
    extraY: 12,
    drawVar: '--qa-draw',
  });
  initScrubTimeline({
    timelineSelector: '.sust-pillars__timeline',
    stepSelector: '.sust-pillars__step',
    bodySelector: '.sust-pillars__body',
    extraSelector: '.sust-pillars__icon-wrap',
    extraOffset: 0.08,
    extraDuration: 0.34,
    extraY: 16,
    drawVar: '--pillar-draw',
  });
  initMarketSegments(lenis);
  initPlants();
  initBoardSlider();
  initLifeSlider();
  initOpeningsForm();
  initPresenceMap();
  initPresenceCounters();
  // initTestimonialsSlider();
  initAboutParallax(lenis);
  initAboutHero();
  initHistoryScroll();
  initClientsMarquee();
  initFounderReadMore();
  initPillarDialog(lenis);
  initPolicyCertificates();
  initDrawIcons({
    sectionSelector: '.values-section',
    itemSelector: '.values-section__item',
    iconSelector: 'img.values-section__icon',
    iconClass: 'values-section__icon',
    idPrefix: 'values-icon',
  });
  initDrawIcons({
    sectionSelector: '.careers-culture',
    itemSelector: '.careers-culture__value',
    iconSelector: 'img.careers-culture__icon',
    iconClass: 'careers-culture__icon',
    idPrefix: 'careers-culture-icon',
  });
  initDrawIcons({
    sectionSelector: '.why-mayur',
    itemSelector: '.why-mayur__item',
    iconSelector: 'img.why-mayur__icon',
    iconClass: 'why-mayur__icon',
    idPrefix: 'why-mayur-icon',
    delayStep: 0.45,
  });
  initAOS();
  initSustFramework();
  initNewsMotion();
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
 * Line-draw then fill SVG icons when their item enters view (Values, Why Mayur).
 */
function initDrawIcons({
  sectionSelector,
  itemSelector,
  iconSelector,
  iconClass,
  idPrefix,
  delayStep = 0.28,
  autoObserve = true,
  groupObserve = false,
}) {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const images = Array.from(section.querySelectorAll(iconSelector));

  function uniquifyIds(svg, prefix) {
    const xlink = 'http://www.w3.org/1999/xlink';
    const attrs = ['clip-path', 'fill', 'stroke', 'mask', 'filter', 'href'];

    svg.querySelectorAll('[id]').forEach((el) => {
      const oldId = el.id;
      const nextId = `${prefix}-${oldId}`;

      svg.querySelectorAll('*').forEach((node) => {
        attrs.forEach((attr) => {
          const value = node.getAttribute(attr);
          if (value && value.includes(`#${oldId}`)) {
            node.setAttribute(attr, value.replaceAll(`#${oldId}`, `#${nextId}`));
          }
        });

        const xlinkHref = node.getAttributeNS(xlink, 'href');
        if (xlinkHref && xlinkHref.includes(`#${oldId}`)) {
          node.setAttributeNS(xlink, 'href', xlinkHref.replaceAll(`#${oldId}`, `#${nextId}`));
        }
      });

      el.id = nextId;
    });
  }

  function prepareSvg(svg, index) {
    svg.classList.add(iconClass);
    svg.setAttribute('aria-hidden', 'true');
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    uniquifyIds(svg, `${idPrefix}-${index}`);

    svg.querySelectorAll('rect[stroke]').forEach((rect) => {
      if (!rect.closest('defs')) rect.remove();
    });

    let hasVectors = false;
    svg.querySelectorAll('path, circle, ellipse').forEach((el) => {
      if (el.closest('defs')) return;
      hasVectors = true;
      el.setAttribute('pathLength', '1');
    });

    if (!hasVectors) svg.classList.add(`${iconClass}--bitmap`);
  }

  async function inlineIcon(img, index) {
    try {
      const response = await fetch(img.currentSrc || img.src);
      if (!response.ok) return;
      const markup = (await response.text()).replace(/<script[\s\S]*?<\/script>/gi, '');
      const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
      const svg = parsed.querySelector('svg');
      if (!svg || parsed.querySelector('parsererror')) return;
      prepareSvg(svg, index);
      img.replaceWith(svg);
    } catch {
      /* Keep the static image if fetch fails */
    }
  }

  function startDraw(targets) {
    const list = Array.isArray(targets) ? targets : [targets];
    requestAnimationFrame(() => {
      list.forEach((item) => item.classList.add('is-drawn'));
    });
  }

  Promise.all(images.map((img, index) => inlineIcon(img, index))).then(() => {
    const items = Array.from(section.querySelectorAll(itemSelector));

    if (prefersReducedMotion) {
      items.forEach((item) => item.classList.add('is-drawn'));
      return;
    }

    if (!autoObserve) {
      ScrollTrigger.refresh();
      return;
    }

    items.forEach((item, index) => {
      item.style.setProperty('--draw-delay', `${index * delayStep}s`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (groupObserve) {
            startDraw(items);
            observer.disconnect();
            return;
          }
          startDraw(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: groupObserve ? 0.28 : 0.4, rootMargin: '0px 0px -6% 0px' }
    );

    if (groupObserve) {
      observer.observe(section);
    } else {
      items.forEach((item) => observer.observe(item));
    }
  });
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
 * 5P wheel — hub first, then one card at a time clockwise.
 * Labels stay in their final place so they do not travel with the wedge.
 */
function initSustFramework() {
  const root = document.querySelector('.sust-5p');
  if (!root) return;

  const wheel = root.querySelector('.sust-5p__wheel');
  const hub = root.querySelector('.sust-5p__hub');
  const deckEl = root.querySelector('.sust-5p__deck');
  const segments = Array.from(root.querySelectorAll('.sust-5p__segment'));
  const cardNames = ['planet', 'purpose', 'product', 'prosperity', 'people'];
  const cards = cardNames.map((name) => root.querySelector(`.sust-5p__card--${name}`));
  if (!wheel || !hub || !deckEl || segments.length !== cards.length || cards.some((card) => !card)) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.remove('sust-5p--play');
    return;
  }

  function placeCard(index, deal) {
    cards[index].setAttribute(
      'transform',
      `translate(200 200) rotate(${deal.toFixed(3)}) translate(-200 -200)`,
    );
  }

  gsap.set(hub, { autoAlpha: 0, scale: 0.72, xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' });
  gsap.set(segments, { autoAlpha: 0 });
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    if (index > 0) placeCard(index, -72);
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wheel,
      start: 'top 78%',
      once: true,
    },
    onComplete() {
      root.classList.remove('sust-5p--play');
      deckEl.style.removeProperty('visibility');
      cards.forEach((card) => {
        card.removeAttribute('transform');
        card.style.removeProperty('opacity');
      });
    },
  });

  tl.to(hub, {
    autoAlpha: 1,
    scale: 1,
    xPercent: -50,
    yPercent: -50,
    duration: 0.62,
    ease: 'power2.out',
  });

  tl.call(() => {
    deckEl.style.visibility = 'visible';
    cards[0].style.opacity = '1';
  }, null, '+=0.1');
  tl.to(segments[0], { autoAlpha: 1, duration: 0.35, ease: 'power1.out' }, '<');

  cards.forEach((card, index) => {
    if (index === 0) return;
    const motion = { deal: -72 };
    tl.to(motion, {
      deal: 0,
      duration: 0.82,
      ease: 'power2.inOut',
      onStart() {
        card.style.opacity = '1';
        card.parentNode.appendChild(card);
      },
      onUpdate() {
        placeCard(index, motion.deal);
      },
      onComplete() {
        card.removeAttribute('transform');
      },
    }, '+=0.08');
    tl.to(segments[index], { autoAlpha: 1, duration: 0.35, ease: 'power1.out' }, '-=0.22');
  });
}

/**
 * News page — arrow reveals downward, then the title and panel.
 * Latest cards fade in from above or below to match their stagger.
 */
function initNewsMotion() {
  const feature = document.querySelector('.news-feature');
  const latest = document.querySelector('.news-latest');
  if (!feature && !latest) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    feature?.classList.remove('news-feature--play');
    latest?.classList.remove('news-latest--play');
    return;
  }

  if (feature) {
    const arrow = feature.querySelector('.news-feature__arrow');
    const title = feature.querySelector('.news-feature__title');
    const panel = feature.querySelector('.news-feature__panel');

    gsap.set(arrow, { autoAlpha: 0, clipPath: 'inset(0% 0% 100% 0%)' });
    gsap.set([title, panel], { autoAlpha: 0, y: 28 });

    const intro = gsap.timeline({ paused: true });

    intro
      .to(arrow, {
        autoAlpha: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.05,
        ease: 'power2.out',
      })
      .to(title, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.28')
      .to(panel, { autoAlpha: 1, y: 0, duration: 0.85, ease: 'power2.out' }, '-=0.4');

    whenNewsInView(feature, 0.9, () => intro.play());
  }

  if (!latest) return;

  const items = Array.from(latest.querySelectorAll('.news-latest__item'));
  if (items.length === 0) return;

  items.forEach((item, index) => {
    const fromTop = index % 2 === 0;
    gsap.set(item, { autoAlpha: 0, y: fromTop ? -42 : 42 });

    const reveal = gsap.timeline({ paused: true });

    reveal.to(item, {
      autoAlpha: 1,
      y: 0,
      duration: 1.45,
      ease: 'power2.out',
    });

    whenNewsInView(item, 0.92, () => reveal.play());
  });

  latest.classList.remove('news-latest--play');
}

function whenNewsInView(target, start, play) {
  let played = false;
  const tryPlay = () => {
    if (played) return;
    if (target.getBoundingClientRect().top > window.innerHeight * start) return;
    played = true;
    window.removeEventListener('scroll', tryPlay);
    play();
  };

  tryPlay();
  window.addEventListener('scroll', tryPlay, { passive: true });
  requestAnimationFrame(tryPlay);
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
 * Count-up stats — animate when the parent card (or the number) enters the viewport.
 */
function initPresenceCounters() {
  const values = document.querySelectorAll('[data-count-to]');
  if (values.length === 0) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = 3000;

  function formatValue(el, current) {
    const prefix = el.dataset.countPrefix || '';
    const suffix = el.dataset.countSuffix || '';
    const formatted =
      el.dataset.countFormat === 'comma' ? current.toLocaleString('en-US') : String(current);
    el.textContent = `${prefix}${formatted}${suffix}`;
  }

  function animate(el) {
    if (el.dataset.countStarted === 'true') return;
    el.dataset.countStarted = 'true';

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

  const groups = new Map();
  values.forEach((el) => {
    formatValue(el, 0);
    const root =
      el.closest('.sust-csr__feature, .sust-csr__stats, .presence-hero__stats') || el;
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(el);
  });

  function playGroup(root) {
    (groups.get(root) || []).forEach(animate);
  }

  if (!('IntersectionObserver' in window)) {
    groups.forEach((_, root) => playGroup(root));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        playGroup(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.35, rootMargin: '0px 0px -8% 0px' }
  );

  groups.forEach((_, root) => observer.observe(root));
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
 * About hero — layered image slides. Current set exits left, then the next
 * set enters from the right. Headline eases into the matching layout.
 */
function initAboutHero() {
  const root = document.querySelector('[data-about-hero]');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.about-hero__slide'));
  const dots = Array.from(root.querySelectorAll('.about-hero__dot'));
  const title = root.querySelector('.about-hero__title');
  const titleLine2 = title?.querySelector('.about-hero__title-line--2');
  const titleLine3 = title?.querySelector('.about-hero__title-line--3');
  if (slides.length < 2) return;

  const TITLE_LAYOUT = [
    { top: '11%', left: '11%', line2: '4.15em', line3: '8.35em' },
    { top: '5%', left: '9%', line2: '3.15em', line3: '5.35em' },
  ];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HOLD_MS = 5000;
  const EXIT_S = 1.4;
  const ENTER_S = 1.4;
  const STAGGER = 0.08;

  let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;
  let animating = false;
  let autoplayTimer = null;
  let activeTween = null;
  let hovered = false;

  function layersOf(slide) {
    return Array.from(slide.querySelectorAll('[data-layer]'));
  }

  function travel() {
    return Math.round(root.getBoundingClientRect().width * 1.15);
  }

  function titleLayout(index) {
    return TITLE_LAYOUT[index] || TITLE_LAYOUT[0];
  }

  function setDots(index) {
    dots.forEach((dot, i) => {
      const on = i === index;
      dot.classList.toggle('is-active', on);
      if (on) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function setSlideClasses(index) {
    slides.forEach((slide, i) => {
      const on = i === index;
      slide.classList.toggle('is-active', on);
      slide.classList.remove('is-leaving', 'is-entering');
      slide.style.zIndex = '';
      slide.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    root.classList.toggle('is-slide-2', index === 1);
    setDots(index);
  }

  function placeLayers(slide, x) {
    gsap.set(layersOf(slide), { x, y: 0, opacity: 1, force3D: true });
  }

  function applyTitle(index, tween, position, duration) {
    if (!title) return;
    const layout = titleLayout(index);
    if (!tween) {
      root.classList.toggle('is-slide-2', index === 1);
      gsap.set([title, titleLine2, titleLine3].filter(Boolean), {
        clearProps: 'top,left,marginLeft,transform',
      });
      return;
    }
    tween.to(title, { top: layout.top, left: layout.left, duration, ease: 'power2.inOut' }, position);
    if (titleLine2) {
      tween.to(titleLine2, { marginLeft: layout.line2, duration, ease: 'power2.inOut' }, position);
    }
    if (titleLine3) {
      tween.to(titleLine3, { marginLeft: layout.line3, duration, ease: 'power2.inOut' }, position);
    }
  }

  function finishTo(index) {
    setSlideClasses(index);
    const dist = travel();
    slides.forEach((slide, i) => {
      placeLayers(slide, i === index ? 0 : dist);
    });
    applyTitle(index);
    activeIndex = index;
    animating = false;
    activeTween = null;
  }

  finishTo(activeIndex);

  function goToSlide(index) {
    const nextIndex = ((index % slides.length) + slides.length) % slides.length;
    if (nextIndex === activeIndex || animating) return;

    if (prefersReducedMotion) {
      finishTo(nextIndex);
      return;
    }

    animating = true;
    stopAutoplay();
    if (activeTween) activeTween.kill();

    const outgoing = slides[activeIndex];
    const incoming = slides[nextIndex];
    const outLayers = layersOf(outgoing);
    const inLayers = layersOf(incoming);
    const dist = travel();

    placeLayers(outgoing, 0);
    placeLayers(incoming, dist);

    outgoing.classList.add('is-leaving');
    incoming.classList.add('is-entering');
    incoming.setAttribute('aria-hidden', 'false');
    outgoing.style.zIndex = '2';
    incoming.style.zIndex = '1';

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut', force3D: true },
      onComplete() {
        finishTo(nextIndex);
        if (!hovered) startAutoplay();
      },
    });
    activeTween = tl;

    outLayers.forEach((layer, i) => {
      tl.to(
        layer,
        { x: -dist, duration: EXIT_S, ease: 'power2.inOut' },
        i * STAGGER
      );
    });

    inLayers.forEach((layer, i) => {
      tl.fromTo(
        layer,
        { x: dist, y: 0 },
        { x: 0, y: 0, duration: ENTER_S, ease: 'power2.inOut', immediateRender: true },
        0.22 + i * STAGGER
      );
    });

    applyTitle(nextIndex, tl, 0.22, ENTER_S);
  }

  function nextSlide() {
    goToSlide(activeIndex + 1);
  }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    autoplayTimer = window.setInterval(nextSlide, HOLD_MS);
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
    });
  });

  root.addEventListener('focusin', () => {
    hovered = true;
    stopAutoplay();
  });
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget)) {
      hovered = false;
      if (!animating) startAutoplay();
    }
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToSlide(activeIndex + 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToSlide(activeIndex - 1);
    }
  });

  startAutoplay();
}

/**
 * Customer logos — two full-bleed rows drifting in opposite directions.
 * Each row is duplicated until the loop can travel half its width without a gap.
 */
function initClientsMarquee() {
  const root = document.querySelector('.clients-logos');
  if (!root) return;

  const rows = Array.from(root.querySelectorAll('[data-clients-marquee]'));
  if (rows.length === 0) return;

  const seeds = rows.map((row) => row.innerHTML);
  let tweens = [];

  function appendCopies(row, nodes) {
    nodes.forEach((node) => {
      const clone = node.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      row.appendChild(clone);
    });
  }

  function build() {
    tweens.forEach((tween) => tween.kill());
    tweens = [];

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    rows.forEach((row, index) => {
      row.innerHTML = seeds[index];
      gsap.set(row, { clearProps: 'transform' });

      const seedNodes = Array.from(row.children);
      let guard = 0;
      while (row.scrollWidth < window.innerWidth && guard < 8) {
        appendCopies(row, seedNodes);
        guard += 1;
      }

      appendCopies(row, Array.from(row.children));
      if (reduceMotion) return;

      /* Shift by the start of the cloned half, including the gap before it.
         Half the row width is not the same distance, and that mismatch snaps
         the loop. */
      const half = row.children[row.children.length / 2];
      const distance = half ? half.offsetLeft : 0;
      if (!distance) return;

      const pixelsPerSecond = 8;
      const duration = distance / pixelsPerSecond;
      const toRight = row.dataset.clientsMarquee === 'right';
      const tween = toRight
        ? gsap.fromTo(
            row,
            { x: -distance },
            { x: 0, duration, ease: 'none', repeat: -1 }
          )
        : gsap.to(row, { x: -distance, duration, ease: 'none', repeat: -1 });

      tweens.push(tween);
    });
  }

  build();

  let resizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(build, 200);
  });
}

/**
 * History section — GSAP horizontal scroll (desktop, min-width 1025px).
 * Title + intro stay pinned below the site header. Timeline cards sit in
 * a single row (three visible) and translate on X as the user scrolls.
 */
function initHistoryScroll() {
  const section = document.querySelector('.history-section');
  const track = section?.querySelector('.history-section__timeline');
  const clip = section?.querySelector('.history-section__track');
  const items = gsap.utils.toArray('.history-section__item');
  if (!section || !track || !clip || items.length < 2) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) return;

  const header = document.querySelector('.site-header');

  function headerOffset() {
    return header?.getBoundingClientRect().height ?? 0;
  }

  function sizeItems() {
    const itemWidth = clip.clientWidth / 3;
    items.forEach((item) => {
      item.style.flex = `0 0 ${itemWidth}px`;
      item.style.width = `${itemWidth}px`;
      item.style.maxWidth = 'none';
    });
  }

  function getScrollDistance() {
    return Math.max(0, track.scrollWidth - clip.clientWidth);
  }

  const mm = gsap.matchMedia();

  mm.add('(min-width: 64.0625rem)', () => {
    section.classList.add('is-gsap');
    sizeItems();

    const tween = gsap.to(track, {
      x: () => {
        sizeItems();
        return -getScrollDistance();
      },
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: () => `top ${headerOffset()}px`,
        end: () => `+=${Math.round(getScrollDistance())}`,
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
      gsap.set(track, { clearProps: 'transform' });
      items.forEach((item) => {
        item.style.flex = '';
        item.style.width = '';
        item.style.maxWidth = '';
      });
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

const PILLAR_DIALOG_CONTENT = {
  purpose: {
    title: 'Purpose',
    lead: 'We integrate sustainability into our business strategy, governance and decision-making, supported by globally aligned practices and transparent reporting.',
    action:
      'In Action: Strengthened ESG governance and transparency through continued sustainability reporting and alignment with global frameworks such as the UN Global Compact and Sustainable Development Goals.',
  },
  people: {
    title: 'People',
    lead: 'Our approach focuses on employee well-being and development while extending our impact to communities through initiatives across education, healthcare and empowerment.',
    action:
      'In Action: Our community initiatives include education programmes such as Ujjwal Bhavishya, Avum Srijan and Addhyan Yojna, along with healthcare, nutrition and employee health & safety initiatives.',
  },
  planet: {
    title: 'Planet',
    lead: 'We continue to improve energy efficiency, adopt renewable energy, conserve water, manage waste and emissions, and strengthen environmentally responsible practices across our operations.',
    action:
      'In Action: Generated 868 MWh of renewable energy and planted 10,386 trees, alongside continued investments in water conservation, emission control and responsible waste management.',
  },
  prosperity: {
    title: 'Prosperity',
    lead: 'We pursue growth by continually investing in manufacturing capabilities, innovation, product development and responsible business practices that strengthen our long-term resilience.',
    action:
      'In Action: Continued investments across manufacturing, innovation and sustainable product development to build a stronger, future-ready business.',
  },
  product: {
    title: 'Product',
    lead: 'We continue to explore more sustainable materials and processes while maintaining the quality, functionality and performance our customers expect.',
    action:
      'In Action: Developed UNICO and PAVO, material families incorporating bio-based and recycled inputs as part of our growing sustainable product portfolio.',
  },
};

function initPillarDialog(lenis) {
  const root = document.querySelector('[data-pillar-dialog]');
  if (!root) return;

  const titleEl = root.querySelector('[data-pillar-title]');
  const leadEl = root.querySelector('[data-pillar-lead]');
  const actionEl = root.querySelector('[data-pillar-action]');
  const closeBtn = root.querySelector('[data-pillar-close]');
  const dismissEls = root.querySelectorAll('[data-pillar-dismiss], [data-pillar-close]');
  const triggers = document.querySelectorAll('[data-pillar-open]');
  if (!titleEl || !leadEl || !actionEl || triggers.length === 0) return;

  let lastFocus = null;

  function isOpen() {
    return root.classList.contains('is-open');
  }

  function openPillar(key) {
    const content = PILLAR_DIALOG_CONTENT[key];
    if (!content) return;

    titleEl.textContent = content.title;
    leadEl.textContent = content.lead;
    actionEl.textContent = content.action;

    lastFocus = document.activeElement;
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    root.inert = false;
    lenis?.stop();
    closeBtn?.focus();
  }

  function closeDialog() {
    if (!isOpen()) return;

    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    root.inert = true;
    lenis?.start();
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  root.inert = true;

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openPillar(trigger.dataset.pillarOpen);
    });
  });

  dismissEls.forEach((el) => {
    el.addEventListener('click', closeDialog);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      closeDialog();
    }
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
 * Scrubbed timeline — spine, cards, and extras reverse on scroll up (R&D QA, 5P pillars).
 */
function initScrubTimeline({
  timelineSelector,
  stepSelector,
  bodySelector,
  extraSelector,
  extraOffset = 0.14,
  extraDuration = 0.28,
  extraY = 12,
  drawVar,
}) {
  const timeline = document.querySelector(timelineSelector);
  if (!timeline) return;

  const steps = Array.from(timeline.querySelectorAll(stepSelector));
  if (steps.length === 0) return;

  const extras = extraSelector
    ? steps.map((step) => step.querySelector(extraSelector))
    : [];
  const bodies = steps.map((step) => step.querySelector(bodySelector));

  function setDraw(step, value) {
    step.style.setProperty(drawVar, String(value));
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    steps.forEach((step) => {
      setDraw(step, 1);
      step.classList.add('is-drawn');
    });
    gsap.set(extras.filter(Boolean), { autoAlpha: 1, y: 0 });
    gsap.set(bodies.filter(Boolean), { autoAlpha: 1, y: 0 });
    return;
  }

  steps.forEach((step) => {
    setDraw(step, 0);
    step.style.setProperty('--draw-delay', '0s');
  });
  gsap.set(extras.filter(Boolean), { autoAlpha: 0, y: extraY });
  gsap.set(bodies.filter(Boolean), { autoAlpha: 0, y: 20 });

  ScrollTrigger.create({
    trigger: timeline,
    start: 'top 85%',
    end: 'bottom 85%',
    scrub: 0.45,
    onUpdate: (self) => {
      const count = steps.length;
      steps.forEach((step, index) => {
        const start = index / count;
        const end = (index + 1) / count;
        const local = gsap.utils.clamp(0, 1, (self.progress - start) / (end - start));
        setDraw(step, local);

        const extra = extras[index];
        if (extra) {
          const shown = gsap.utils.clamp(0, 1, (local - extraOffset) / extraDuration);
          gsap.set(extra, { autoAlpha: shown, y: extraY * (1 - shown) });
        }

        const body = bodies[index];
        if (body) {
          const bodyShown = gsap.utils.clamp(0, 1, (local - 0.12) / 0.38);
          gsap.set(body, { autoAlpha: bodyShown, y: 20 * (1 - bodyShown) });
        }

        step.classList.toggle('is-drawn', local > 0.32);
      });
    },
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
 * Market segments — each page loads its own industries panel; tabs navigate between pages.
 */
function initMarketSegments(lenis) {
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
    categoriesEl.querySelectorAll('.segment-panel__item').forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-pressed', 'false');
    });
  }

  function parseItemApps(button) {
    const raw = button?.dataset.apps;
    if (!raw) return [];
    try {
      const parsed = JSON.parse(decodeURIComponent(raw));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function getVisibleAttrs() {
    return segmentAttrs.find((el) => !el.hidden) || segmentAttrs[0] || null;
  }

  function scrollToAppsSection() {
    const attrsEl = getVisibleAttrs();
    if (!attrsEl) return;

    const target = attrsEl.querySelector('[data-segment-apps]') || attrsEl;
    const headerOffset = -(document.querySelector('.site-header')?.offsetHeight || 0) - 16;

    requestAnimationFrame(() => {
      if (lenis) {
        lenis.scrollTo(target, {
          offset: headerOffset,
          duration: 1.05,
          easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        });
        return;
      }

      const top = target.getBoundingClientRect().top + window.scrollY + headerOffset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  }

  function syncAppsPanel(segment) {
    const attrsEl = getVisibleAttrs();
    if (!attrsEl) return;

    const appsEl = attrsEl.querySelector('[data-segment-apps]');
    const listEl = attrsEl.querySelector('[data-segment-apps-list]');
    if (!appsEl || !listEl) return;

    const activeItem = categoriesEl.querySelector('.segment-panel__item.is-active');
    const options = parseItemApps(activeItem);
    const shouldOpen = options.length > 0;
    const appsKey = options.map((option) => option.label).join('|');
    const wasOpen = attrsEl.classList.contains('is-apps-open');

    attrsEl.classList.toggle('is-apps-open', shouldOpen);
    appsEl.setAttribute('aria-hidden', String(!shouldOpen));

    if (!shouldOpen) return;

    const needsRender =
      listEl.dataset.appsKey !== appsKey || !wasOpen || listEl.childElementCount === 0;

    if (needsRender) {
      listEl.dataset.appsKey = appsKey;
      listEl.innerHTML = options
        .map((option, index) => {
          const isActive = index === 0;
          return `
            <li>
              <button
                type="button"
                class="perf-attrs__apps-item${isActive ? ' is-active' : ''}"
                data-apps-index="${index}"
                aria-pressed="${isActive ? 'true' : 'false'}"
              >
                ${escapeHtml(option.label)}
              </button>
            </li>
          `;
        })
        .join('');

      listEl.querySelectorAll('[data-apps-index]').forEach((button) => {
        button.addEventListener('click', () => {
          const index = Number(button.dataset.appsIndex);
          const option = options[index];
          if (!option) return;

          listEl.querySelectorAll('.perf-attrs__apps-item').forEach((item, itemIndex) => {
            const isActive = itemIndex === index;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-pressed', String(isActive));
          });

          const images = String(option.images || '')
            .split('|')
            .map((path) => path.trim())
            .filter(Boolean);
          setGalleryImages(images, {
            alt: `${segment.title} — ${option.label}`,
          });
        });
      });
    }
  }

  function renderCategories(segment) {
    categoriesEl.innerHTML = segment.categories
      .map((category, index) => {
        const images = category.images.join('|');
        const isActive = index === 0;
        const options = Array.isArray(category.options) ? category.options : [];
        const appsPayload = encodeURIComponent(
          JSON.stringify(
            options.map((option) => ({
              label: option.label,
              images: (option.images || []).join('|'),
            }))
          )
        );

        return `
          <li>
            <button
              type="button"
              class="segment-panel__item${isActive ? ' is-active' : ''}"
              aria-pressed="${isActive ? 'true' : 'false'}"
              data-images="${escapeHtml(images)}"
              data-apps="${escapeHtml(appsPayload)}"
            >
              ${escapeHtml(category.label)}
            </button>
          </li>
        `;
      })
      .join('');

    categoriesEl.querySelectorAll('.segment-panel__item').forEach((button) => {
      button.addEventListener('click', () => {
        if (!button.classList.contains('is-active')) {
          clearCategoryActiveState();
          button.classList.add('is-active');
          button.setAttribute('aria-pressed', 'true');

          const images = (button.dataset.images || '')
            .split('|')
            .map((path) => path.trim())
            .filter(Boolean);
          setGalleryImages(images, { alt: `${segment.title} — ${button.textContent.trim()}` });
          syncAppsPanel(segment);
        }

        scrollToAppsSection();
      });
    });

    syncAppsPanel(segment);
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

