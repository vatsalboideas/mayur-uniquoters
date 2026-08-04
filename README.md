# Mayur Uniquoters

Corporate website for [Mayur Uniquoters Limited](https://www.mayur.biz) — a static, front-end marketing site focused on the About experience (hero carousel, image collage with parallax, Vision, and Mission).

## Tech stack

- **HTML** — single-page layout (`index.html`)
- **CSS** — custom styles plus [Tailwind CSS](https://tailwindcss.com/) via CDN
- **JavaScript (ES modules)** — header nav, hero slider, Lenis smooth scroll, scroll parallax
- **[Lenis](https://github.com/darkroomengineering/lenis)** — smooth scrolling (CDN)
- **Prettier** — code formatting

No build step or package manager is required to run the site.

## Project structure

```
├── index.html          # About page
├── css/
│   ├── fonts.css       # Local font faces (SF Pro, Canela)
│   └── style.css       # Layout & section styles
├── js/
│   └── main.js         # App entry (Lenis, header, slider, parallax)
└── assets/
    ├── logo.svg
    ├── favicon/
    ├── fonts/
    └── images/about/   # Carousel, collage, vision & mission imagery
```

## Getting started

Serve the project root over HTTP (ES modules and absolute-relative asset paths work best that way).

```bash
# Python
python3 -m http.server 8080

# Node (if you have npx)
npx serve .
```

Then open [http://localhost:8080](http://localhost:8080).

You can also open `index.html` directly in a browser; some features may be limited depending on browser module/CORS rules.

## Features

- Responsive site header with mobile menu
- About hero image carousel with dot navigation
- Desktop image collage with scroll-linked parallax (disabled on stacked layouts and when `prefers-reduced-motion` is set)
- Vision and Mission sections
- Footer with contact links and dynamic copyright year
- Brand theme colors (`tan`, `red`) configured in Tailwind

## Formatting

Prettier is configured via `.prettierrc`. Format from an editor with the Prettier extension, or:

```bash
npx prettier --write .
```

## Contact

- Phone: +91-1423-224001
- Email: info@mayur.biz
