#!/usr/bin/env python3
"""
Static site builder for the Mayur Uniquoters redesign (served at /v2/).

  python3 tools/build.py

The original site at the repository root is left untouched. This script writes
the redesigned site into ./v2 and shares ./assets with the original.

- tools/pages/*.html     page sources (front-matter + <main> content)
- tools/partials/*.html  shared header / footer
- tools/css/*.css        stylesheet parts, concatenated into v2/css/site.css
- tools/js, fonts.css    copied into v2/js and v2/css
- tools/segments.py      data for the four market-segment pages

The output (HTML + css/site.css) is plain static files — no build step is
needed to *run* the site, only to regenerate it after editing these sources.
"""
import html
import pathlib
import shutil
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOOLS = ROOT / 'tools'
OUT = ROOT / 'v2'
sys.path.insert(0, str(TOOLS))

from segments import SEGMENTS, render_segment  # noqa: E402

SITE = 'Mayur Uniquoters'
NAV_KEYS = ['about', 'segment', 'plants', 'products', 'sustainability', 'presence', 'news']

HEAD = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content="{desc}" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{desc}" />
    <meta property="og:type" content="website" />
    <meta name="theme-color" content="#FBF8F3" />

    <!--INLINE-->

    <link rel="icon" type="image/svg+xml" href="{R}assets/favicon/favicon.svg" />
    <link rel="icon" type="image/png" href="{R}assets/favicon/favicon-96x96.png" sizes="96x96" />
    <link rel="shortcut icon" href="{R}assets/favicon/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="{R}assets/favicon/apple-touch-icon.png" />
    <link rel="manifest" href="{R}assets/favicon/site.webmanifest" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap"
    />
    <link rel="stylesheet" href="{R}css/fonts.css" />
    <link rel="stylesheet" href="{R}css/site.css" />
  </head>
  <body class="{body}">
    <div class="preloader" aria-hidden="true">
      <div class="preloader__inner">
        <img class="preloader__logo" src="{R}assets/logo-white.svg" alt="" width="184" height="76" />
        <span class="preloader__bar"><i></i></span>
        <span class="preloader__count" data-preload-count>0</span>
      </div>
    </div>
    <div class="curtain" aria-hidden="true"></div>
    <div class="cursor" aria-hidden="true"><span class="cursor__ring"></span><span class="cursor__dot"></span></div>
"""

TAIL = """
    <script src="{R}js/vendor/lenis.min.js"></script>
    <script type="module" src="{R}js/site.js"></script>
  </body>
</html>
"""


INLINE = """    <script>
      (function () {
        var d = document.documentElement;
        d.classList.add('js');
        try {
          if (!sessionStorage.getItem('mu-seen')) d.classList.add('is-loading');
          if (sessionStorage.getItem('mu-nav')) d.classList.add('is-arriving');
        } catch (e) {}
        setTimeout(function () { d.classList.remove('is-loading', 'is-arriving'); d.classList.add('is-ready'); }, 4000);
      })();
    </script>
"""


def read(p):
    return pathlib.Path(p).read_text(encoding='utf-8')


def parse_page(text):
    m = re.match(r'---\n(.*?)\n---\n(.*)', text, re.S)
    meta, body = {}, text
    if m:
        for line in m.group(1).splitlines():
            if ':' in line:
                k, v = line.split(':', 1)
                meta[k.strip()] = v.strip()
        body = m.group(2)
    return meta, body


def render(meta, content):
    out = meta['out']
    depth = out.count('/')
    V = '../' * depth          # root of the v2 site
    A = '../' * (depth + 1)    # repository root (shared assets live here)
    R = '{{R}}'
    key = meta.get('nav', '')

    header = read(TOOLS / 'partials' / 'header.html')
    footer = read(TOOLS / 'partials' / 'footer.html')
    header_class = 'is-over' if meta.get('header') == 'over' else ''
    header = header.replace('{{HEADER_CLASS}}', header_class)
    for k in NAV_KEYS:
        header = header.replace('{{ACTIVE_%s}}' % k, ' is-active' if k == key else '')
        header = header.replace('{{CURRENT_%s}}' % k, ' aria-current="page"' if k == key else '')

    page = HEAD.format(
        title=html.escape(meta['title']),
        desc=html.escape(meta.get('desc', ''), quote=True),
        body=meta.get('body', ''),
        R=R,
    ).replace('<!--INLINE-->', INLINE.strip())
    cta = '' if meta.get('cta') == 'none' else read(TOOLS / 'partials' / 'cta.html')
    page += header + '\n    <main id="main">\n' + content + '\n    </main>\n' + cta + footer + TAIL.format(R=R)
    page = page.replace('{{R}}assets/', A + 'assets/').replace('{{R}}', V)
    return out, page


def build_css():
    parts = sorted((TOOLS / 'css').glob('*.css'))
    css = '/* Mayur Uniquoters — generated from tools/css/*.css by tools/build.py */\n'
    for p in parts:
        css += '\n/* ===== %s ===== */\n' % p.name + read(p)
    (OUT / 'css').mkdir(parents=True, exist_ok=True)
    (OUT / 'css' / 'site.css').write_text(css, encoding='utf-8')
    shutil.copy(TOOLS / 'fonts.css', OUT / 'css' / 'fonts.css')
    print('v2/css/site.css  (%d parts, %d KB)' % (len(parts), len(css) // 1024))


def copy_js():
    (OUT / 'js' / 'vendor').mkdir(parents=True, exist_ok=True)
    shutil.copy(TOOLS / 'js' / 'site.js', OUT / 'js' / 'site.js')
    shutil.copy(TOOLS / 'js' / 'vendor' / 'lenis.min.js', OUT / 'js' / 'vendor' / 'lenis.min.js')
    shutil.copy(ROOT / 'js' / 'presence-data.js', OUT / 'js' / 'presence-data.js')
    print('v2/js  (site.js, presence-data.js, vendor)')


def main():
    build_css()
    copy_js()

    for src in sorted((TOOLS / 'pages').glob('*.html')):
        meta, body = parse_page(read(src))
        out, page = render(meta, body)
        (OUT / out).parent.mkdir(parents=True, exist_ok=True)
        (OUT / out).write_text(page, encoding='utf-8')
        print(out)

    for seg in SEGMENTS.values():
        meta, body = render_segment(seg)
        out, page = render(meta, body)
        (OUT / out).parent.mkdir(parents=True, exist_ok=True)
        (OUT / out).write_text(page, encoding='utf-8')
        print('v2/' + out)


if __name__ == '__main__':
    main()
