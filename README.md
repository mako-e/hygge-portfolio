# HYGGE — The Block Puffer, No. 07

Concept product page for a fictional outerwear brand. Plain HTML, CSS and JavaScript — no build step.

- **GSAP 3.12.5 + ScrollTrigger**: hero shutter reveal, stepped line wipes, text scramble, parallax, pinned horizontal scroll
- **Lenis 1.1.20**: smooth scrolling, synced to ScrollTrigger
- **Fonts**: Inter (headings), Space Mono (labels), self-hosted in `fonts/`, Latin subset only
- **Photos**: Unsplash (credited in the footer), served as WebP at display size

## Structure

```
index.html
favicon.svg
_headers     cache rules for Cloudflare Pages
css/style.css
js/main.js
js/vendor/   gsap, ScrollTrigger, lenis
fonts/       Inter and Space Mono (woff2)
img/         photos as WebP; hero.jpg is kept for the social share preview
```

## Run locally

Open `index.html`, or serve the folder:

```
npx serve .
```

## Deploy

Live at **https://hygge.gmte.dev** on Cloudflare Pages:

1. Workers & Pages → Create → Pages → Upload assets, and drop this folder in.
2. Custom domains → add `hygge.gmte.dev`.

The share preview (`og:image`, `og:url` in `index.html`) points at that address; update both if the site moves.

Animations switch off automatically when the visitor's system is set to reduce motion.
