# Vipul Ajay Sontakke — Portfolio

AWS Cloud Engineer & AWS Administrator. A long-scroll portfolio: portrait hero, project archive with a
dialog, a pinned "three pillars" chapter, a skills bento, a FinOps before/after slider, an automation
diagram, a pinned credentials rail, a spotlight build, a journey accordion, a scroll-speed marquee and a
contact section. A Motion switch in the header stills every animation.

## Run it

```
npm install
npm run build     # bundles src/ into Asset/dist/ with esbuild
npm run dev       # builds, then serves the folder
```

The built site is already in `Asset/dist/`, so any static server (or static host) can serve the folder as is.

## Stack

React 19, Framer Motion 12 and lucide-react, bundled by esbuild (`scripts/build.mjs`). There is no Vite or
GSAP in this codebase: scroll animation is Framer Motion.

## Where things live

| What | Where |
| --- | --- |
| Contact details (email, phone, GitHub, location) | constants at the top of `src/app.jsx` (and `GITHUB`, `EMAIL` at the top of `src/extras.jsx`) |
| Hero, ticker, work archive, tools rail, FinOps slider, about, journey, contact, footer, dialog | `src/app.jsx` |
| Three pillars, skills bento, automation diagram, credentials rail, spotlight, marquee | `src/extras.jsx` |
| Projects (title, description, tags, link, preview image) | `src/data/projects.json` |
| Tools rail | `src/data/brands.json` + `Asset/svg/brand/` |
| Certifications and awards | `certifications` and `awards` in `src/extras.jsx`, cards in `Asset/img/credentials/` |
| Journey timeline | `experiences` in `src/app.jsx` |
| Portrait, favicon | `Asset/img/vipul-portrait.png` (transparent cut-out, 2:3), `Asset/img/favicon.svg` |
| Colours and type | custom properties at the top of `src/styles.css`, Google Fonts link in `index.html` |

## Things to replace when you have them

- **GitHub links**: every project points at `https://github.com/vipulsontakke`. Set each project's `media`
  in `src/data/projects.json` to its own repository URL.
- **Project previews**: `Asset/img/work/*.svg` are generated illustrations. Swap in real screenshots and
  point `image` at them.
- **Credential cards**: `Asset/img/credentials/*.svg` are generic cards, not the issuers' official badges.
  Add a verification link per credential if you want one.
- **Automation diagram** (`STAGES` in `src/extras.jsx`) and **How I run a cloud** (`processSteps` in
  `src/app.jsx`): written from the CV as a general pattern. Edit them to match the real builds.
- **Spotlight phone**: a CSS concept illustration, labelled as such on the page.

## Motion

Every animated component reads `MotionContext`. The header button stores the choice in localStorage
(`vs-motion`) and sets `html[data-motion]`; the OS reduced-motion setting turns motion off too.
