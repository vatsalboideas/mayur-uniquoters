"""Data + renderer for the four market-segment pages."""
import html

A = 'assets/images/market-segment'

SEGMENTS = {
    'furnishing': {
        'title': 'Furnishing',
        'hero': f'{A}/furnishing/carousel/image1.webp',
        'category_image': f'{A}/furnishing/category-images/image1.webp',
        'intro': 'Material solutions designed for indoor and outdoor spaces, bringing together comfort, performance and design versatility across residential, commercial and recreational environments.',
        'categories': [
            ('Residential', ['Upholstery', 'Chairs', 'Barstools', 'Couches', 'More Applications']),
            ('Work Place', []),
            ('Restaurants & Retails', []),
            ('Spas', []),
            ('Stadiums & Theatre', []),
            ('Poolside & Outdoors', []),
        ],
        'areas': [
            ('Upholstery', 'upholstery.png'),
            ('Chairs', 'chairs.png'),
            ('Couches', 'couches.png'),
            ('Bar Stools', 'bar-stools.png'),
            ('More Applications', 'more-applications.png'),
        ],
        'areas_text': "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers att. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers attLorem Ipsum has been the industry's standard dummy text ever since 1966, when",
        'perf': [
            ('Performance', [('Layer_1-2.svg', 'Hydrolysis Resistance'), ('Layer_1-1.svg', 'Stain Protection'), ('Group-1.svg', 'Dye-Resistant Options')]),
            ('Comfort', [('Group-3.svg', 'Water Resistance'), ('Layer_1-3.svg', 'Skin Friendly'), ('Group-2.svg', 'Non Allergenic'), ('Layer_1.svg', 'Odourless')]),
            ('Functionality', [('Group.svg', 'UV Resistance'), ('Layer_1-4.svg', 'Antimicrobial Protection (in select styles)')]),
            ('Design', [('Layer_1-5.svg', 'Design-Forward Selections')]),
        ],
    },
    'automotive': {
        'title': 'Automotive',
        'hero': f'{A}/automotive/hero.webp',
        'category_image': f'{A}/automotive/category-images/image1.webp',
        'intro': 'Engineered material solutions for automotive interiors and accessories, serving both OEM and aftermarket requirements across a wide range of mobility applications.',
        'categories': [
            ('Cars', ['Seating', 'Headrests', 'Steering Wheels', 'Armrests', 'Door Panels', 'Consoles', 'Instrument Panels', 'Gear Boots', 'Tool Boxes', 'Sunvisors', 'Boot Trays']),
            ('3 Wheelers', ['Auto Hoods', 'Seats']),
            ('2 Wheelers', ['Seats', 'Helmets', 'Bike Gloves']),
            ('Commercial Vehicles', ['Seats']),
            ('Trains', ['Seats']),
            ('Marine', ['Seats']),
            ('Tractors', []),
        ],
        'perf': [
            (None, [('Group-5.svg', 'Abrasion Resistance'), ('Group-6.svg', 'Hydrolysis Resistance'), ('Group.svg', 'Flexible Fitting'), ('Group-7.svg', 'Colour Fastness')]),
            (None, [('Group-1.svg', 'Crocking Resistance'), ('Group-4.svg', 'Flame Retardant'), ('Group-2.svg', 'Low VOC Emission'), ('Group-3.svg', 'Optimised Backing Fabric')]),
            (None, [('Group-13.svg', 'Heat Resistance'), ('Group-12.svg', 'Scratch Resistance'), ('Group-9.svg', 'Weather Resistance'), ('Group-10.svg', 'Slip Stick')]),
            (None, [('Group-11.svg', 'UV Protection'), ('Group-8.svg', 'REACH Compliant'), ('Group-14.svg', 'VDA 6.3')]),
        ],
    },
    'footwear': {
        'title': 'Footwear',
        'hero': f'{A}/footwear/hero.webp',
        'category_image': f'{A}/footwear/category-images/image1.webp',
        'intro': 'Versatile PVC and PU material solutions developed for different parts of footwear, balancing everyday performance with the flexibility to respond to changing design and market requirements.',
        'categories': [
            ('Upper', ['Both-Side Coated', 'Single-Side Coated', 'PVC', 'PU']),
            ('Lining', []),
            ('Insole', []),
        ],
        'perf': [
            (None, [('Group-3.svg', 'Abrasion Resistance'), ('Group-5.svg', 'Easy to Clean'), ('Group-2.svg', 'Flexible Fitting'), ('Group-4.svg', 'Colour Fastness')]),
            (None, [('Layer_1.svg', 'Stain Protection'), ('Group-6.svg', 'Flame Retardant'), ('Group-1.svg', 'Scratch Resistance'), ('Group.svg', 'Optimised Backing Fabric'), ('Layer_1-1.svg', 'Rapid Design Development')]),
        ],
    },
    'leather-goods': {
        'title': 'Leather Goods',
        'hero': f'{A}/leather-goods/hero.webp',
        'category_image': f'{A}/leather-goods/category-images/image1-new.webp',
        'intro': 'Material solutions created for fashion, lifestyle and speciality applications, offering the flexibility in finish, colour and surface design needed to respond to evolving product and market trends.',
        'categories': [
            ('Bags', []),
            ('Apparel', []),
            ('Fashion Accessories', ['Belts', 'Wallets', 'Phone Covers', 'Jewellery Boxes', 'Watch Straps', 'Table Furnishings', 'Diary Covers']),
            ('Sports', ['Gloves', 'Leg Guards', 'Hockey Grips', 'Volleyballs', 'Footballs', 'Saddlery']),
            ('Medical Equipment', []),
        ],
        'perf': [
            (None, [('Group-5.svg', 'Easy to Clean'), ('Layer_1-1.svg', 'Stain Protection'), ('Group-4.svg', 'Flexible Fitting'), ('Group-3.svg', 'Colour Fastness')]),
            (None, [('Layer_1.svg', 'Rapid Design Development'), ('Group-2.svg', 'Flame Retardant'), ('Group-1.svg', 'Scratch Resistance'), ('Group.svg', 'Optimised Backing Fabric')]),
            (None, [('Layer_1-2.svg', 'In-House Embossing'), ('Layer_1-3.svg', 'Extensive Grain Library'), ('Layer_1-4.svg', 'Guaranteed Colour Matching'), ('Layer_1-5.svg', 'Digital Print Capabilities')]),
        ],
    },
}

ORDER = ['furnishing', 'automotive', 'footwear', 'leather-goods']
for key in ORDER:
    SEGMENTS[key]['key'] = key

e = html.escape


def render_segment(seg):
    key = seg['key']
    R = '{{R}}'
    idx = ORDER.index(key)
    nxt = SEGMENTS[ORDER[(idx + 1) % len(ORDER)]]

    tabs = ''.join(
        '<li><a class="subnav__link%s" href="%s.html"%s>%s</a></li>'
        % (
            ' is-active' if k == key else '',
            k,
            ' aria-current="page"' if k == key else '',
            SEGMENTS[k]['title'],
        )
        for k in ORDER
    )

    # Industries explorer ---------------------------------------------------
    items = []
    for i, (label, options) in enumerate(seg['categories']):
        chips = ''.join('<li>%s</li>' % e(o) for o in options)
        opts = (
            '<div class="explorer__opts"><ul class="chips">%s</ul></div>' % chips if options else ''
        )
        items.append(
            f'''<li class="explorer__row{' is-active' if i == 0 else ''}">
          <button class="explorer__item" type="button" aria-expanded="{'true' if i == 0 else 'false'}" data-explorer-item data-title="{e(label)}" data-sub="{e(' · '.join(options))}">
            <span class="explorer__num">{i + 1:02d}</span>
            <span class="explorer__label">{e(label)}</span>
            <svg class="explorer__icon" width="22" height="22"><use href="#i-plus"/></svg>
          </button>
          {opts}
        </li>'''
        )
    first_label, first_opts = seg['categories'][0]

    explorer = f'''
<section class="section" id="industries" aria-labelledby="industries-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow reveal">{e(seg['title'])}</p>
      <h2 id="industries-title" class="reveal">Industries</h2>
    </div>
    <div class="explorer" data-explorer>
      <ul class="explorer__list reveal">
        {''.join(items)}
      </ul>
      <figure class="explorer__media reveal reveal--scale">
        <img src="{R}{seg['category_image']}" alt="{e(seg['title'])} applications" width="940" height="871" loading="lazy" />
        <figcaption class="explorer__caption">
          <p class="explorer__cap-title" data-explorer-title>{e(first_label)}</p>
          <p class="explorer__cap-sub" data-explorer-sub>{e(' · '.join(first_opts))}</p>
        </figcaption>
      </figure>
    </div>
  </div>
</section>'''

    # Area of application (furnishing only) ---------------------------------
    areas = ''
    if seg.get('areas'):
        cards = ''.join(
            f'''<li class="area-card">
          <figure class="frame"><img src="{R}{A}/furnishing/areas-of-application/{img}" alt="{e(name)}" width="520" height="640" loading="lazy" /></figure>
          <p class="area-card__label">{e(name)}</p>
        </li>'''
            for name, img in seg['areas']
        )
        areas = f'''
<section class="section section--alt areas" id="applications" aria-labelledby="areas-title">
  <div class="container">
    <div class="areas__head">
      <div class="section-head">
        <p class="eyebrow reveal">Applications</p>
        <h2 id="areas-title" class="reveal">Area of Application</h2>
        <p class="lead reveal">{e(seg['areas_text'])}</p>
      </div>
      <div class="scroller-controls" data-scroller-controls="areas">
        <button class="icon-btn" type="button" data-scroller-prev aria-label="Previous"><svg><use href="#i-arrow-left"/></svg></button>
        <button class="icon-btn" type="button" data-scroller-next aria-label="Next"><svg><use href="#i-arrow"/></svg></button>
      </div>
    </div>
  </div>
  <div class="areas__track" data-scroller="areas" tabindex="0" aria-label="Areas of application">
    <ul class="areas__list">{cards}</ul>
  </div>
</section>'''

    # Performance attributes -------------------------------------------------
    grouped = any(g for g, _ in seg['perf'])
    if grouped:
        groups = ''.join(
            f'''<article class="perf-group card reveal" style="--i: {i}">
          <h3>{e(g)}</h3>
          <ul>{''.join(f'<li><img src="{R}{A}/{key}/performance-attributes/{icon}" alt="" width="40" height="40" loading="lazy" /><span>{e(label)}</span></li>' for icon, label in items)}</ul>
        </article>'''
            for i, (g, items) in enumerate(seg['perf'])
        )
        perf_body = f'<div class="perf-groups">{groups}</div>'
    else:
        tiles = ''.join(
            f'<li class="perf-tile reveal" style="--i: {n % 4}"><img src="{R}{A}/{key}/performance-attributes/{icon}" alt="" width="48" height="48" loading="lazy" /><span>{e(label)}</span></li>'
            for n, (icon, label) in enumerate(i for _, items in seg['perf'] for i in items)
        )
        perf_body = f'<ul class="perf-tiles">{tiles}</ul>'

    perf = f'''
<section class="section{'' if areas else ' section--alt'}" id="performance" aria-labelledby="perf-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow reveal">Capabilities</p>
      <h2 id="perf-title" class="reveal">Performance Attributes</h2>
    </div>
    {perf_body}
  </div>
</section>'''

    next_card = f'''
<section class="section section--tight" aria-label="Next market segment">
  <div class="container">
    <a class="next-card reveal" href="{ORDER[(idx + 1) % len(ORDER)]}.html">
      <img src="{R}{nxt['hero']}" alt="" width="1920" height="900" loading="lazy" />
      <div class="next-card__body">
        <p class="eyebrow eyebrow--light">Next Market Segment</p>
        <p class="next-card__title">{e(nxt['title'])}</p>
      </div>
      <span class="next-card__arrow"><svg width="26" height="26"><use href="#i-arrow"/></svg></span>
    </a>
  </div>
</section>'''

    body = f'''
<section class="page-hero" aria-labelledby="seg-title">
  <div class="page-hero__media"><img src="{R}{seg['hero']}" alt="Market segment — {e(seg['title'].lower())}" width="1920" height="900" fetchpriority="high" /></div>
  <div class="page-hero__shade"></div>
  <div class="container page-hero__body">
    <p class="eyebrow eyebrow--light">Market Segment</p>
    <h1 id="seg-title">{e(seg['title'])}</h1>
    <p class="page-hero__lead">{e(seg['intro'])}</p>
  </div>
  <span class="page-hero__scroll" aria-hidden="true">Scroll<i></i></span>
</section>

<nav class="subnav" aria-label="Market segments">
  <div class="container"><ul class="subnav__list">{tabs}</ul></div>
</nav>
{explorer}
{areas}
{perf}
{next_card}
'''
    meta = {
        'out': f'market-segment/{key}.html',
        'nav': 'segment',
        'header': 'over',
        'title': f"{seg['title']} — Market Segment — Mayur Uniquoters",
        'desc': seg['intro'],
        'body': 'page-segment',
    }
    return meta, body
