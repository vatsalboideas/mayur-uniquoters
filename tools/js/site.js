/**
 * Mayur Uniquoters — site behaviour (vanilla ES module, no dependencies).
 */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.documentElement.classList.add('js');

/* Header ---------------------------------------------------------------- */
function initHeader() {
  const header = $('[data-site-header]');
  if (!header) return;
  const burger = $('[data-burger]', header);
  const progress = $('[data-scroll-progress]', header);

  const setMenu = (open) => {
    header.classList.toggle('is-menu-open', open);
    burger?.setAttribute('aria-expanded', String(open));
    burger?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('is-locked', open);
  };

  burger?.addEventListener('click', () => setMenu(!header.classList.contains('is-menu-open')));

  $$('.main-nav__link', header).forEach((link) =>
    link.addEventListener('click', () => {
      if (!link.parentElement.classList.contains('has-menu')) setMenu(false);
    })
  );
  $$('.submenu a, .main-nav .btn', header).forEach((link) =>
    link.addEventListener('click', () => setMenu(false))
  );

  $$('.main-nav__caret', header).forEach((btn) =>
    btn.addEventListener('click', () => {
      const item = btn.closest('.has-menu');
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    })
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setMenu(false);
      $$('.has-menu.is-open', header).forEach((i) => i.classList.remove('is-open'));
    }
  });

  window.matchMedia('(min-width: 1121px)').addEventListener('change', () => setMenu(false));

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  $('[data-to-top]')?.addEventListener('click', () => {
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

/* Reveal on scroll ------------------------------------------------------ */
function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window) || reduceMotion) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  items.forEach((el) => io.observe(el));
}

/* Count-up numbers ------------------------------------------------------ */
function initCounters() {
  const els = $$('[data-count-to]');
  if (!els.length) return;

  const format = (el, n) => {
    const { countPrefix = '', countSuffix = '', countFormat } = el.dataset;
    el.textContent = `${countPrefix}${countFormat === 'comma' ? n.toLocaleString('en-US') : n}${countSuffix}`;
  };

  const run = (el) => {
    const target = Number(el.dataset.countTo);
    if (reduceMotion) return format(el, target);
    const duration = 2200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      format(el, Math.round(target * (1 - Math.pow(1 - p, 4))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  els.forEach((el) => format(el, 0));
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      }),
    { threshold: 0.4 }
  );
  els.forEach((el) => io.observe(el));
}

/* Hero image parallax --------------------------------------------------- */
function initHeroParallax() {
  const hero = $('.page-hero');
  const media = $('.page-hero__media img', hero || document);
  if (!hero || !media || reduceMotion) return;
  let ticking = false;
  const update = () => {
    const y = Math.min(window.scrollY, hero.offsetHeight);
    media.style.setProperty('--parallax', `${y * 0.16}px`);
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
}

/* Home hero: each layer travels on its own, staggered (as in the original) -- */
function initHeroSlider() {
  const root = $('[data-hero]');
  if (!root) return;
  const slides = $$('[data-hero-slide]', root);
  const dots = $$('[data-hero-dot]', root);
  const title = $('.hero-home__title', root);
  const line2 = $('.hero-home__line--2', root);
  const line3 = $('.hero-home__line--3', root);
  if (slides.length < 2) return;

  const TITLE = [
    { top: '11%', left: '11%', l2: '4.15em', l3: '8.35em' },
    { top: '5%', left: '9%', l2: '3.15em', l3: '5.35em' },
  ];
  const HOLD = 5000;
  const EXIT = 1400;
  const ENTER = 1400;
  const STAGGER = 80;
  const EASE = 'cubic-bezier(0.455, 0.03, 0.515, 0.955)'; // power2.inOut
  const desktop = window.matchMedia('(min-width: 64.0625rem)');

  let active = 0;
  let busy = false;
  let timer = null;
  let hovered = false;
  let running = [];

  const layersOf = (slide) => $$('[data-layer]', slide);
  const travel = () => Math.round(root.getBoundingClientRect().width * 1.15);
  const place = (slide, x) => layersOf(slide).forEach((l) => (l.style.transform = `translate3d(${x}px, 0, 0)`));

  const setDots = (i) =>
    dots.forEach((d, n) => {
      d.classList.toggle('is-active', n === i);
      d.setAttribute('aria-selected', String(n === i));
    });

  const settle = (i) => {
    running.forEach((a) => a.cancel());
    running = [];
    slides.forEach((slide, n) => {
      slide.classList.toggle('is-active', n === i);
      slide.classList.remove('is-leaving', 'is-entering');
      slide.style.zIndex = '';
      slide.setAttribute('aria-hidden', String(n !== i));
      place(slide, n === i ? 0 : travel());
    });
    root.classList.toggle('is-slide-2', i === 1);
    [title, line2, line3].forEach((el) => el && (el.style.cssText = ''));
    setDots(i);
    active = i;
    busy = false;
  };

  const animate = (el, from, to, duration, delay) => {
    const anim = el.animate([from, to], { duration, delay, easing: EASE, fill: 'both' });
    running.push(anim);
    return anim;
  };

  const go = (target) => {
    const next = (target + slides.length) % slides.length;
    if (next === active || busy) return;
    if (reduceMotion) return settle(next);
    busy = true;
    stop();

    const out = slides[active];
    const inc = slides[next];
    const dist = travel();
    place(out, 0);
    place(inc, dist);
    out.classList.add('is-leaving');
    inc.classList.add('is-entering');
    inc.setAttribute('aria-hidden', 'false');
    out.style.zIndex = '2';
    inc.style.zIndex = '1';

    let last = null;
    layersOf(out).forEach((l, i) =>
      animate(l, { transform: 'translate3d(0,0,0)' }, { transform: `translate3d(${-dist}px,0,0)` }, EXIT, i * STAGGER)
    );
    layersOf(inc).forEach((l, i) => {
      last = animate(l, { transform: `translate3d(${dist}px,0,0)` }, { transform: 'translate3d(0,0,0)' }, ENTER, 220 + i * STAGGER);
    });

    if (desktop.matches && title) {
      const from = getComputedStyle(title);
      const t = TITLE[next];
      animate(title, { top: from.top, left: from.left }, { top: t.top, left: t.left }, ENTER, 220);
      if (line2) animate(line2, { marginLeft: getComputedStyle(line2).marginLeft }, { marginLeft: t.l2 }, ENTER, 220);
      if (line3) animate(line3, { marginLeft: getComputedStyle(line3).marginLeft }, { marginLeft: t.l3 }, ENTER, 220);
    }

    (last || { finished: Promise.resolve() }).finished.then(() => {
      settle(next);
      if (!hovered) start();
    }).catch(() => {});
  };

  const start = () => {
    if (reduceMotion) return;
    stop();
    timer = setInterval(() => go(active + 1), HOLD);
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  dots.forEach((dot) =>
    dot.addEventListener('click', () => {
      const n = Number(dot.dataset.heroDot);
      if (!Number.isNaN(n)) go(n);
    })
  );
  root.addEventListener('mouseenter', () => {
    hovered = true;
    stop();
  });
  root.addEventListener('mouseleave', () => {
    hovered = false;
    if (!busy) start();
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(active + 1);
    if (e.key === 'ArrowLeft') go(active - 1);
  });
  window.addEventListener('resize', () => !busy && settle(active));

  settle(0);

  // Entrance: layers of the first slide fly in one by one once the intro is done
  const enter = () => {
    if (reduceMotion) return start();
    const dist = travel();
    layersOf(slides[0]).forEach((l, i) => {
      l.animate(
        [{ transform: `translate3d(${dist * 0.55}px,0,0)`, opacity: 0 }, { transform: 'translate3d(0,0,0)', opacity: 1 }],
        { duration: 1500, delay: i * 140, easing: EASE, fill: 'backwards' }
      );
    });
    start();
  };
  if (root.classList.contains('hero-home')) {
    layersOf(slides[0]).forEach((l) => (l.style.opacity = '0'));
    const wait = setInterval(() => {
      if (!document.documentElement.classList.contains('is-ready')) return;
      clearInterval(wait);
      layersOf(slides[0]).forEach((l) => (l.style.opacity = ''));
      enter();
    }, 60);
  }
}

/* Scroll-spy for in-page sub navigation --------------------------------- */
function initSpyNav() {
  const nav = $('[data-spy-nav]');
  if (!nav) return;
  const links = $$('a[href^="#"]', nav);
  const map = new Map();
  links.forEach((a) => {
    const target = $(a.getAttribute('href'));
    if (target) map.set(target, a);
  });

  const setActive = (link) => {
    links.forEach((l) => l.classList.toggle('is-active', l === link));
    if (link) {
      const list = link.closest('.subnav__list');
      if (list) {
        const left = link.offsetLeft - list.clientWidth / 2 + link.clientWidth / 2;
        list.scrollTo({ left, behavior: 'smooth' });
      }
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(map.get(entry.target));
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  map.forEach((_, section) => io.observe(section));
}

/* Tabs ------------------------------------------------------------------ */
function initTabs() {
  $$('[data-tabs]').forEach((root) => {
    const tabs = $$('[role="tab"]', root);
    const panels = $$('[role="tabpanel"]', root);

    const select = (tab, focus = false) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => {
        const on = p.id === tab.getAttribute('aria-controls');
        p.hidden = !on;
        p.classList.toggle('is-active', on);
      });
      if (focus) tab.focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const key = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 }[e.key];
        if (!key) return;
        e.preventDefault();
        select(tabs[(i + key + tabs.length) % tabs.length], true);
      });
    });
  });
}

/* Expand / collapse ----------------------------------------------------- */
function initExpand() {
  $$('[data-expand-toggle]').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', () => {
      const open = panel.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? btn.dataset.openLabel : btn.dataset.closedLabel;
    });
  });
}

/* Horizontal scroller (drag, arrows, progress) -------------------------- */
function initScrollers() {
  $$('[data-scroller]').forEach((track) => {
    const name = track.dataset.scroller;
    const controls = $(`[data-scroller-controls="${name}"]`);
    const prev = controls && $('[data-scroller-prev]', controls);
    const next = controls && $('[data-scroller-next]', controls);
    const bar = $(`[data-scroller-progress="${name}"]`);

    const step = () => {
      const item = track.querySelector('li, article');
      return item ? item.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const ratio = max > 0 ? track.scrollLeft / max : 1;
      if (bar) bar.style.transform = `scaleX(${Math.max(0.08, track.clientWidth / track.scrollWidth + ratio * (1 - track.clientWidth / track.scrollWidth))})`;
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max - 4;
    };

    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') track.scrollBy({ left: step(), behavior: 'smooth' });
      if (e.key === 'ArrowLeft') track.scrollBy({ left: -step(), behavior: 'smooth' });
    });

    // Mouse drag
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) {
        moved = true;
        track.classList.add('is-dragging');
      }
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      track.classList.remove('is-dragging');
    });
    track.addEventListener('click', (e) => moved && e.preventDefault(), true);
  });
}

/* Lightbox -------------------------------------------------------------- */
function initLightbox() {
  const root = $('[data-lightbox-root]');
  if (!root) return;
  const img = $('.lightbox__img', root);
  let opener = null;

  const close = () => {
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    opener?.focus();
  };
  const open = (src, alt, trigger) => {
    opener = trigger;
    img.src = src;
    img.alt = alt || '';
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    $('[data-lightbox-close]', root).focus();
  };

  $$('[data-lightbox]').forEach((el) =>
    el.addEventListener('click', () => open(el.dataset.lightbox, el.dataset.alt, el))
  );
  root.addEventListener('click', (e) => {
    if (e.target === root || e.target.closest('[data-lightbox-close]')) close();
  });
  document.addEventListener('keydown', (e) => e.key === 'Escape' && root.classList.contains('is-open') && close());
}

/* Industries explorer (market segments) -------------------------------- */
function initExplorer() {
  $$('[data-explorer]').forEach((root) => {
    const rows = $$('.explorer__row', root);
    const media = $('.explorer__media', root);
    const title = $('[data-explorer-title]', root);
    const sub = $('[data-explorer-sub]', root);

    rows.forEach((row) => {
      const btn = $('[data-explorer-item]', row);
      btn.addEventListener('click', () => {
        if (row.classList.contains('is-active')) return;
        rows.forEach((r) => {
          const on = r === row;
          r.classList.toggle('is-active', on);
          $('[data-explorer-item]', r).setAttribute('aria-expanded', String(on));
        });
        title.textContent = btn.dataset.title;
        sub.textContent = btn.dataset.sub;
        media.classList.remove('is-swapping');
        void media.offsetWidth;
        media.classList.add('is-swapping');
      });
    });
  });
}

/* Material layers: scroll-driven image sequence ------------------------ */
function initMaterial() {
  const root = $('[data-material]');
  const canvas = $('[data-material-canvas]', root || document);
  if (!root || !canvas) return;
  const ctx = canvas.getContext('2d');
  const count = Number(canvas.dataset.frameCount);
  const base = canvas.dataset.frameBase;
  const layers = $$('.material__layers li', root);
  const frames = new Array(count);
  let loaded = false;
  let current = -1;

  const src = (i) => `${base}0${count - i}.webp`;
  const load = (i) =>
    new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        frames[i] = img;
        resolve();
      };
      img.onerror = resolve;
      img.src = src(i);
    });

  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (w && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
      current = -1;
    }
  };

  const draw = (i) => {
    let img = frames[i];
    for (let d = 1; !img && d < count; d++) img = frames[i - d] || frames[i + d];
    if (!img || i === current) return;
    size();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    current = i;
  };

  const update = () => {
    const rect = root.getBoundingClientRect();
    const total = root.offsetHeight - window.innerHeight;
    const p = Math.min(Math.max(-rect.top / total, 0), 1);
    const fp = reduceMotion ? 1 : Math.min(p / 0.8, 1);
    draw(Math.round(fp * (count - 1)));
    root.classList.toggle('is-started', p > 0.03);
    layers.forEach((li, i) => li.classList.toggle('is-on', fp >= 1 && p >= 0.8 + i * 0.045 || reduceMotion));
  };

  const start = async () => {
    if (loaded) return;
    loaded = true;
    await load(0);
    update();
    await Promise.all(Array.from({ length: count - 1 }, (_, k) => load(k + 1)));
    update();
  };

  new IntersectionObserver(
    (entries) => entries[0].isIntersecting && start(),
    { rootMargin: '900px 0px' }
  ).observe(root);

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', () => {
    current = -1;
    update();
  });
}

/* Global presence map --------------------------------------------------- */
async function initPresence() {
  const root = $('[data-presence]');
  if (!root) return;
  const { PRESENCE_LOCATIONS: LOCS, PRESENCE_TYPES: TYPES, PRESENCE_ADDRESSES: ADDR } = await import('./presence-data.js');

  const zoomEl = $('[data-map-zoom]', root);
  const pinsEl = $('[data-map-pins]', root);
  const listEl = $('[data-map-list]', root);
  const fullBtn = $('[data-map-full]', root);
  const detailsEl = $('[data-map-details]', root);
  const detailsTitle = $('[data-map-details-title]', root);
  const cardsEl = $('[data-map-cards]', root);
  const filterBtns = $$('[data-filter]', root);
  const ORDER = ['client', 'office', 'hub'];

  const esc = (v) =>
    String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const cid = (l) => l.countryId || l.id;

  // One entry per country (prefer the primary pin)
  const countries = [];
  const seen = new Set();
  LOCS.forEach((loc) => {
    const id = cid(loc);
    if (seen.has(id)) return;
    if (!loc.primary && LOCS.some((o) => cid(o) === id && o.primary)) return;
    seen.add(id);
    countries.push({ id, name: loc.country || loc.name, type: loc.type, pinId: loc.id });
  });
  const sorted = ORDER.flatMap((t) =>
    countries.filter((c) => c.type === t).sort((a, b) => a.name.localeCompare(b.name))
  );
  const byId = (id) => sorted.find((c) => c.id === id);

  pinsEl.innerHTML = LOCS.map(
    (l) =>
      `<button type="button" class="pin pin--${l.type}" style="left:${l.x}%;top:${l.y}%" data-pin="${l.id}" data-country="${cid(l)}" aria-label="${esc(l.name)} — ${esc(TYPES[l.type].label)}"><span class="pin__tip">${esc(l.name)}</span></button>`
  ).join('');

  let filter = 'all';
  let activeId = null;
  let zoomed = false;
  let focusLoc = null;

  const renderList = () => {
    const html = ORDER.map((type) => {
      if (filter !== 'all' && filter !== type) return '';
      const items = sorted.filter((c) => c.type === type);
      if (!items.length) return '';
      return (
        `<li class="presence__group" role="presentation">${esc(TYPES[type].label)}</li>` +
        items
          .map(
            (c) =>
              `<li><button type="button" class="country${c.id === activeId ? ' is-active' : ''}" data-country-btn="${c.id}">${esc(c.name)}<svg><use href="#i-arrow"/></svg></button></li>`
          )
          .join('')
      );
    }).join('');
    listEl.innerHTML = html;
  };

  const cardHtml = (a, i) => {
    const meta = [];
    (a.phones || []).forEach((p) => meta.push(`<a href="tel:${esc(p.replace(/[^\d+]/g, ''))}">Phone ${esc(p)}</a>`));
    (a.faxes || []).forEach((f) => meta.push(`<span>Fax ${esc(f)}</span>`));
    (a.emails || []).forEach((m) => meta.push(`<a href="mailto:${esc(m)}">${esc(m)}</a>`));
    (a.websites || []).forEach((w) => meta.push(`<a href="${esc(w.href)}" target="_blank" rel="noopener noreferrer">${esc(w.label)}</a>`));
    return `<li class="addr" style="--i:${i}"><p class="addr__label">${esc(a.label)}</p><p class="addr__title">${esc(a.title)}</p><address>${a.lines.map(esc).join('<br />')}</address>${meta.length ? `<p class="addr__meta">${meta.join('')}</p>` : ''}</li>`;
  };

  const renderAddresses = (country) => {
    const seenKey = new Set();
    const list = (ADDR[country.id] || []).filter((a) => {
      const key = [a.title, ...(a.lines || [])].join(' ').toLowerCase();
      if (seenKey.has(key)) return false;
      seenKey.add(key);
      return true;
    });
    if (!list.length) {
      detailsEl.hidden = true;
      cardsEl.innerHTML = '';
      return;
    }
    detailsTitle.textContent = `Locations in ${country.name}`;
    cardsEl.innerHTML = list.map(cardHtml).join('');
    detailsEl.hidden = false;
  };

  const zoomTo = (loc) => {
    const w = zoomEl.offsetWidth;
    const h = zoomEl.offsetHeight;
    if (!w || !h || !loc) return;
    const z = window.matchMedia('(max-width: 720px)').matches ? 2.2 : 2.6;
    const px = Math.min(0, Math.max(w - w * z, w / 2 - (loc.x / 100) * w * z));
    const py = Math.min(0, Math.max(h - h * z, h / 2 - (loc.y / 100) * h * z));
    zoomEl.style.setProperty('--zoom', z);
    zoomEl.style.setProperty('--pan-x', `${px}px`);
    zoomEl.style.setProperty('--pan-y', `${py}px`);
    zoomed = true;
    fullBtn.classList.remove('is-active');
    fullBtn.setAttribute('aria-pressed', 'false');
  };

  const zoomOut = () => {
    zoomEl.style.setProperty('--zoom', 1);
    zoomEl.style.setProperty('--pan-x', '0px');
    zoomEl.style.setProperty('--pan-y', '0px');
    zoomed = false;
    fullBtn.classList.add('is-active');
    fullBtn.setAttribute('aria-pressed', 'true');
  };

  const paintPins = () => {
    $$('.pin', pinsEl).forEach((pin) => {
      pin.classList.toggle('is-active', pin.dataset.country === activeId);
      const type = LOCS.find((l) => l.id === pin.dataset.pin).type;
      pin.classList.toggle('is-dim', filter !== 'all' && type !== filter);
    });
  };

  const select = (id, { zoom = true, pinId = null, scroll = false } = {}) => {
    const country = byId(id);
    if (!country) return;
    activeId = id;
    focusLoc = LOCS.find((l) => l.id === (pinId || country.pinId));
    paintPins();
    renderList();
    renderAddresses(country);
    if (zoom) zoomTo(focusLoc);
    if (scroll && !detailsEl.hidden) {
      detailsEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  };

  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-country-btn]');
    if (btn) select(btn.dataset.countryBtn, { scroll: false });
  });

  pinsEl.addEventListener('click', (e) => {
    const pin = e.target.closest('.pin');
    if (!pin) return;
    if (pin.dataset.country === activeId && zoomed && focusLoc && focusLoc.id === pin.dataset.pin) zoomOut();
    else select(pin.dataset.country, { pinId: pin.dataset.pin });
    $(`[data-country-btn="${pin.dataset.country}"]`, listEl)?.scrollIntoView({ block: 'nearest' });
  });

  fullBtn.addEventListener('click', zoomOut);

  filterBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      filterBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      paintPins();
      renderList();
    })
  );

  window.addEventListener('resize', () => zoomed && zoomTo(focusLoc));

  select('india', { zoom: false });
}

/* Forms (front-end only, as before) ----------------------------------- */
function initForms() {
  $$('[data-form]').forEach((form) => {
    const status = $('[data-form-status]', form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.reset();
      if (status) {
        status.hidden = false;
        status.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
    form.addEventListener('input', () => status && (status.hidden = true));
  });
}

/* ======================================================================
   Motion layer
   ====================================================================== */
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

/* Preloader + page transitions ------------------------------------------ */
function initIntro() {
  const pre = $('.preloader');
  const curtain = $('.curtain');
  const ready = () => {
    root.classList.remove('is-loading');
    root.classList.add('is-ready');
  };

  const safe = (fn) => {
    try {
      fn();
    } catch (e) {}
  };

  // Arriving via internal link: curtain is covering, slide it away
  if (root.classList.contains('is-arriving') && curtain) {
    safe(() => sessionStorage.removeItem('mu-nav'));
    curtain.style.transform = 'translateY(0)';
    void curtain.offsetWidth;
    curtain.style.transition = 'transform 0.9s cubic-bezier(0.76, 0, 0.24, 1)';
    curtain.style.transform = 'translateY(-101%)';
    root.classList.remove('is-arriving');
    setTimeout(() => {
      curtain.style.transition = 'none';
      curtain.style.transform = '';
    }, 1000);
    setTimeout(ready, 300);
  } else if (root.classList.contains('is-loading') && pre) {
    safe(() => sessionStorage.setItem('mu-seen', '1'));
    const minimum = reduceMotion ? 200 : 1700;
    setTimeout(() => {
      pre.classList.add('is-done');
      setTimeout(ready, 450);
      setTimeout(() => (pre.style.display = 'none'), 1300);
    }, minimum);
  } else {
    requestAnimationFrame(ready);
  }

  // Leaving: cover screen, then navigate
  if (!curtain || reduceMotion) return;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    safe(() => sessionStorage.setItem('mu-nav', '1'));
    curtain.style.transition = 'transform 0.7s cubic-bezier(0.76, 0, 0.24, 1)';
    curtain.style.transform = 'translateY(0)';
    setTimeout(() => (location.href = a.href), 720);
  });

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      curtain.style.transition = 'none';
      curtain.style.transform = '';
      root.classList.remove('is-arriving');
    }
  });
}

/* Kinetic headings ------------------------------------------------------- */
function splitNode(node, counter) {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === 3) {
      const parts = child.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '));
          return;
        }
        const outer = document.createElement('span');
        outer.className = 'sw';
        const inner = document.createElement('span');
        inner.className = 'sw__i';
        inner.style.setProperty('--wi', counter.n++);
        inner.textContent = part;
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      child.replaceWith(frag);
    } else if (child.nodeType === 1 && !child.classList.contains('sw')) {
      splitNode(child, counter);
    }
  });
}

function initSplitText() {
  const heads = $$('main h1, main h2').filter((h) => !h.closest('.explorer__caption'));
  if (!heads.length) return;
  const targets = [];
  heads.forEach((h) => {
    const label = h.textContent.replace(/\s+/g, ' ').trim();
    h.setAttribute('aria-label', label);
    splitNode(h, { n: 0 });
    $$('.sw', h).forEach((w) => w.setAttribute('aria-hidden', 'true'));
    h.classList.remove('reveal', 'reveal--left', 'reveal--right', 'reveal--scale');
    h.classList.add('kinetic');
    targets.push(h);
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach((h) => h.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        const fire = () => el.classList.add('is-in');
        // hero titles wait for the intro to finish
        if (el.closest('.page-hero, .hero-home, .page-intro') && !root.classList.contains('is-ready')) {
          const t = setInterval(() => {
            if (root.classList.contains('is-ready')) {
              clearInterval(t);
              fire();
            }
          }, 60);
        } else fire();
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -5% 0px' }
  );
  targets.forEach((h) => io.observe(h));
}

/* Scroll-scrubbed paragraphs ---------------------------------------------- */
function initScrub() {
  const blocks = $$('[data-scrub]');
  if (!blocks.length) return;
  const items = blocks.map((el) => {
    const words = el.textContent.replace(/\s+/g, ' ').trim().split(' ');
    el.setAttribute('aria-label', words.join(' '));
    el.textContent = '';
    const spans = words.map((w, i) => {
      const span = document.createElement('span');
      span.className = 'scw';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = w;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      return span;
    });
    return { el, spans };
  });
  if (reduceMotion) return;

  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    items.forEach(({ el, spans }) => {
      const r = el.getBoundingClientRect();
      const p = Math.min(Math.max((vh * 0.88 - r.top) / (r.height + vh * 0.35), 0), 1);
      const lit = p * spans.length * 1.25;
      spans.forEach((sp, i) => {
        sp.style.setProperty('--o', Math.min(Math.max((lit - i) / 1.6, 0), 1) * 0.84 + 0.16);
      });
    });
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  window.addEventListener('resize', update);
  update();
}

/* Image parallax ------------------------------------------------------------ */
function initFrameParallax() {
  if (reduceMotion) return;
  const frames = $$('.frame').filter((f) => f.querySelector('img') && !f.closest('.explorer__media'));
  if (!frames.length) return;
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
  }, { rootMargin: '15% 0px' });
  frames.forEach((f) => io.observe(f));

  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    visible.forEach((f) => {
      const r = f.getBoundingClientRect();
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      const amp = Math.min(r.height * 0.07, 46);
      $('img', f).style.setProperty('--py', `${(-p * amp).toFixed(1)}px`);
    });
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  update();
}

/* Pointer effects: cursor, magnetic, spotlight/tilt, hero depth ---------------- */
function initPointer() {
  if (!finePointer) return;

  // Cursor
  const cursor = $('.cursor');
  if (cursor) {
    const ring = $('.cursor__ring', cursor);
    const dot = $('.cursor__dot', cursor);
    let x = -100, y = -100, rx = -100, ry = -100;
    window.addEventListener('pointermove', (e) => {
      x = e.clientX;
      y = e.clientY;
      cursor.classList.add('is-on');
      const t = e.target;
      const link = t.closest('a, button, [data-lightbox], select, summary');
      const text = t.closest('input, textarea');
      let label = '';
      if (t.closest('.life__item, .cert')) label = 'View';
      else if (t.closest('[data-scroller]')) label = 'Drag';
      else if (t.closest('.next-card')) label = 'Next';
      else if (t.closest('.journey__card')) label = 'Open';
      if (ring.textContent !== label) ring.textContent = label;
      cursor.classList.toggle('is-label', !!label);
      cursor.classList.toggle('is-link', !!link && !label);
      cursor.classList.toggle('is-text', !!text);
      cursor.classList.toggle('is-dark', !!t.closest('.section--dark, .page-hero, .investors, .preloader'));
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  // Magnetic buttons
  $$('.btn, .icon-btn, .to-top, .next-card__arrow').forEach((el) => {
    el.setAttribute('data-magnetic', '');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.translate = `${dx * 0.22}px ${dy * 0.32}px`;
    });
    el.addEventListener('pointerleave', () => (el.style.translate = ''));
  });

  // Spotlight + tilt
  $$('.card, .perf-tile, .standards li').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      el.style.setProperty('--ry', `${((px - 0.5) * 6).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${((0.5 - py) * 5).toFixed(2)}deg`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });

  // Hero depth
  const stage = $('[data-hero-slides]');
  if (stage) {
    const area = stage.closest('.hero-home') || stage;
    const depth = { stand: 10, plant: 26, main: 14, box: 20 };
    const layers = $$('.hero-slide img', stage).map((img) => {
      const key = Object.keys(depth).find((k) => img.className.includes(`hero-slide__${k}`));
      img.style.transition += ', translate 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
      return { img, d: depth[key] || 10 };
    });
    area.addEventListener('pointermove', (e) => {
      const r = area.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach(({ img, d }) => (img.style.translate = `${-nx * d * 1.6}px ${-ny * d}px`));
    });
    area.addEventListener('pointerleave', () => layers.forEach(({ img }) => (img.style.translate = '')));
  }
}

/* Pinned horizontal timeline ---------------------------------------------------- */
function initHistoryPin() {
  const sec = $('.history');
  const track = $('[data-scroller="history"]', sec || document);
  const sticky = $('.history__sticky', sec || document);
  if (!sec || !track || !sticky) return;
  const mq = window.matchMedia('(min-width: 960px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)');

  const setup = () => {
    if (!mq.matches) {
      sec.classList.remove('is-hscroll');
      sec.style.height = '';
      return;
    }
    sec.classList.add('is-hscroll');
    sec.style.height = '';
    const max = track.scrollWidth - track.clientWidth;
    sec.style.height = `${window.innerHeight + max * 1.15}px`;
    update();
  };
  const update = () => {
    if (!sec.classList.contains('is-hscroll')) return;
    const max = track.scrollWidth - track.clientWidth;
    const total = sec.offsetHeight - window.innerHeight;
    const p = Math.min(Math.max(-sec.getBoundingClientRect().top / total, 0), 1);
    track.scrollLeft = p * max;
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', setup);
  mq.addEventListener('change', setup);
  window.addEventListener('load', setup);
  setup();
}

/* Customer logos as a two-row marquee --------------------------------------------- */
function initLogoMarquee() {
  const list = $('.logos');
  if (!list || reduceMotion) return;
  const items = $$('li', list).map((li) => li.innerHTML);
  const half = Math.ceil(items.length / 2);
  const makeRow = (set) => {
    const ul = () => `<ul>${set.map((h) => `<li>${h}</li>`).join('')}</ul>`;
    return `<div class="lm__row">${ul()}${ul().replace('<ul>', '<ul aria-hidden="true">')}</div>`;
  };
  const wrap = document.createElement('div');
  wrap.className = 'lm reveal';
  wrap.setAttribute('role', 'list');
  wrap.innerHTML = makeRow(items.slice(0, half)) + makeRow(items.slice(half));
  list.replaceWith(wrap);
  $$('img', wrap).forEach((img) => img.removeAttribute('loading'));
}

/* Smooth inertial scrolling (Lenis) ----------------------------------------- */
function initSmooth() {
  if (!window.Lenis || reduceMotion) return;
  const lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
  window.__lenis = lenis;
  const raf = (t) => {
    lenis.raf(t);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  new MutationObserver(() => {
    if (document.body.classList.contains('is-locked')) lenis.stop();
    else lenis.start();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const sub = $('.subnav') ? 56 : 0;
    lenis.scrollTo(target, { offset: -(76 + sub + 8), duration: 1.5 });
    history.replaceState(null, '', id);
  });
}

/* Preloader counter -------------------------------------------------------------- */
function initPreloadCount() {
  const el = $('[data-preload-count]');
  if (!el || !root.classList.contains('is-loading')) return;
  const dur = reduceMotion ? 150 : 1500;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const n = Math.round((1 - Math.pow(1 - p, 3)) * 100);
    el.textContent = String(n).padStart(3, '0');
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* Text-roll hover ------------------------------------------------------------------ */
function initRoll() {
  $$('.main-nav__link, .site-footer__col a, .submenu a, .cta__mail').forEach((a) => {
    if (a.children.length || !a.textContent.trim()) return;
    const text = a.textContent.trim();
    a.textContent = '';
    const wrap = document.createElement('span');
    wrap.className = 'roll';
    wrap.innerHTML = `<span class="roll__a"></span><span class="roll__b" aria-hidden="true"></span>`;
    wrap.firstChild.textContent = text;
    wrap.lastChild.textContent = text;
    a.appendChild(wrap);
  });
}

/* Marquees react to scroll speed ---------------------------------------------------- */
function initTickerVelocity() {
  if (reduceMotion) return;
  const tracks = $$('.ticker__track');
  if (!tracks.length) return;
  let vel = 0;
  let lastY = window.scrollY;
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      vel += (y - lastY) * 0.1;
      vel = Math.max(Math.min(vel, 40), -40);
      lastY = y;
    },
    { passive: true }
  );
  const state = tracks.map((track) => ({ track, x: 0 }));
  const loop = () => {
    vel *= 0.93;
    state.forEach((s) => {
      const half = s.track.scrollWidth / 2;
      s.x -= 0.8 + vel;
      if (s.x <= -half) s.x += half;
      if (s.x > 0) s.x -= half;
      s.track.style.transform = `translate3d(${s.x.toFixed(2)}px, 0, 0)`;
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* Stacking product cards: previous cards recede ---------------------------------------- */
function initProductStack() {
  const cards = $$('.product');
  if (cards.length < 2 || reduceMotion) return;
  const mq = window.matchMedia('(min-width: 900px)');
  let ticking = false;
  const update = () => {
    ticking = false;
    if (!mq.matches) return;
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      const r = card.getBoundingClientRect();
      const n = next.getBoundingClientRect();
      const overlap = Math.min(Math.max((r.bottom - n.top) / r.height, 0), 1);
      card.style.setProperty('--ps', (1 - overlap * 0.05).toFixed(4));
      card.style.setProperty('--pb', (1 - overlap * 0.2).toFixed(3));
    });
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  update();
}

/* Footer year ----------------------------------------------------------- */
function initYear() {
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
}

/* Boot ------------------------------------------------------------------ */
const modules = [
  initSmooth,
  initPreloadCount,
  initIntro,
  initSplitText,
  initRoll,
  initScrub,
  initLogoMarquee,
  initHeader,
  initReveal,
  initCounters,
  initHeroParallax,
  initHeroSlider,
  initSpyNav,
  initTabs,
  initExpand,
  initScrollers,
  initLightbox,
  initExplorer,
  initMaterial,
  initPresence,
  initForms,
  initFrameParallax,
  initPointer,
  initHistoryPin,
  initTickerVelocity,
  initProductStack,
  initYear,
];

modules.forEach((fn) => {
  try {
    fn();
  } catch (error) {
    console.error(`[site] ${fn.name} failed`, error);
  }
});
