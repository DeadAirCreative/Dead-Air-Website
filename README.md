# Dead Air — Website

A 5-page marketing site for Dead Air Creative Media: `index.html` (Home), `services.html`, `portfolio.html`, `about.html`, `contact.html`. Static HTML + Tailwind CSS, no framework, no backend required.

## Quick start

```bash
npm install          # one-time
npm run build:css    # compile css/output.css from css/input.css
npm run serve        # serves the site at http://localhost:8080
```

While editing styles, run `npm run watch:css` instead of `build:css` to rebuild automatically on save. **Never edit `css/output.css` directly** — it's generated and will be overwritten.

If you change `tailwind.config.js` or add new utility classes in the HTML, re-run `npm run build:css` before deploying.

## What needs your input before launch

This is the most important section — the site is fully built and functional. Real photos now populate the homepage hero, the portfolio grid, the services page, and the About founder photo (see below); a few spots are still generic copy or placeholders.

### 1. Real photo & video assets — mostly done
Real client work from `Images:Video/Dead Air Creative Media - Portfolio/` has been curated, resized and dropped into `images/portfolio/`:

| File | Used on | Source project |
|---|---|---|
| `home-hero.webp` | Home hero background | Landscape — "Windmills on Fire 2" |
| `nevuary.webp`, `riverridge.webp`, `ulster-rally.webp`, `moo-town.webp`, `portrait.webp`, `landscape.webp`, `event.webp`, `fresh-pop.webp`, `flawless-finesse.webp`, `ni-hospice.webp` | Portfolio grid (10 projects) + Home "Selected Work" teaser | Nevuary, RiverRidge, Ulster Rally, Moo Town Creamery, Portrait, Landscape, Event, Fresh Pop, Flawless Finesse Detailing, RiverRidge × NI Hospice |
| `service-video.webp`, `service-photography.webp` | Services page | Nevuary (video still), Felix portrait shoot |
| `about-founder.webp` | About page | Portrait/Mateusz.jpg |

All are WebP now (see **Media compression** below) — originally delivered as JPG, converted once real photo counts made file weight worth optimising.

Still placeholder (no source assets exist yet):
| Placeholder file | Used on | Replace with |
|---|---|---|
| `service-design.svg` | Services page | 4:5 graphic design sample — **no design work was in the supplied content**, this needs a real asset |
| `og-image.svg` | Social share previews | **Export a 1200×630 PNG/JPG** — most platforms (Facebook, LinkedIn, iMessage) don't render SVG `og:image` reliably |

The "Design" filter on the portfolio page currently shows nothing when clicked, for the same reason — add a design project once you have one to show.

### 1b. Portfolio project pages (every photo, not a curated few)
Clicking a project card on `portfolio.html` opens a full-page takeover — title, description, and **every photo/video from that project's source folder** in a masonry gallery (291 items total across the 10 projects; Nevuary alone has 184). This is generated, not hand-written:

- `scripts/process-galleries.sh` — resizes every photo per project from `Images:Video/Dead Air Creative Media - Portfolio/` into `images/portfolio/full/<project>/NNN.webp`
- `scripts/process-videos.sh` — compresses every video per project (via `avconvert`) into `images/portfolio/video/full/<project>/NNN.mp4`
- `scripts/generate-manifest.py` — scans both folders and writes `js/portfolio-data.js` (the `PORTFOLIO_PROJECTS` object: title, category tag, description, full media list). **Re-run this after adding new photos/videos to a project folder** rather than hand-editing `portfolio-data.js`.

Grid thumbnails for the 4 video-tagged projects (Nevuary, Fresh Pop, Flawless Finesse Detailing, NI Hospice) autoplay a short muted loop (`images/portfolio/video/*-preview.mp4`, ~1.5MB each, only plays while scrolled into view — pauses off-screen, respects `prefers-reduced-motion`).

### Media compression
`images/` is **~124MB** (was ~289MB before compression — the ~580MB figure quoted earlier in this project came from `du` on this drive's exFAT filesystem, which rounds every file up to the cluster size and was never the real transfer weight; macOS also litters exFAT volumes with hidden `._*` AppleDouble sidecar files, one per real file, which are harmless but are excluded from git via `.gitignore`).

- **Photos**: all full-res gallery images and the top-level curated images are WebP at quality 82 (`cwebp -q 82`), converted from the `sips`-resized JPEG intermediates. Cut file size by 45–80% (average ~60%) with no visible quality loss at any size tested — verified by side-by-side comparison, not just file-size math. WebP has near-universal browser support (Safari 14+, all evergreen browsers), so there's no JPEG `<picture>` fallback — this was a deliberate simplicity trade-off, revisit only if analytics ever show meaningful traffic from browsers that predate WebP support.
- **Video**: the handful of source clips that were supplied at high bitrate/low compression (Nevuary's two heaviest clips, Fresh Pop's `fp1`, Flawless Finesse Detailing, RiverRidge, NI Hospice — 6 files, ~121MB combined) were re-encoded with `avconvert -p PresetMediumQuality`, cutting 75–90% off each at full source resolution with quality confirmed by frame-by-frame visual check. The other 11 clips were already compressed via `Preset640x480` when first added and were left alone — re-encoding an already-compressed video is a second lossy pass for a smaller return, not worth the quality risk. `scripts/process-videos.sh` now encodes all 17 from original source with the right preset for each, so it's the authoritative regen path if source footage ever changes.

None of this loads on first page visit either way — gallery images use `loading="lazy"`, videos use `preload="none"` until a visitor actually opens that project — so it never hurt page-load performance, but the smaller weight matters for git repo size and for anyone on a slow connection who does open a gallery. Still worth [Git LFS](https://git-lfs.com) for `images/portfolio/full/` and `images/portfolio/video/` if this repo grows further or you deploy via a git-connected host with strict size limits.

### 2. Contact details
Search-and-replace the following placeholder values across all five HTML files:
- `hello@deadaircreative.co.uk` → real email
- `01234 567 890` / `tel:+441234567890` → real phone
- `[Your Town/Region]` → the actual area(s) you serve (appears in the footer and contact page — this also matters for local SEO)
- Social links (`#` hrefs in the footer) → real Instagram/TikTok/Facebook/LinkedIn URLs
- `https://www.deadaircreative.co.uk/` → your real domain, in every `<link rel="canonical">`, `sitemap.xml`, and `robots.txt`

### 3. Contact form backend
The form on `contact.html` currently validates client-side only and shows a success message without actually sending anywhere (see `js/main.js`, `#contact-form` handler). Before launch, wire it to a real submission handler — easiest options:
- [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com) — add their endpoint as the form's `action` and remove the `preventDefault` fake-success logic
- A serverless function if you're deploying on Netlify/Vercel

### 4. Privacy policy (important — not optional)
The contact form collects personal data (name, email, phone) from UK visitors, so **UK GDPR requires a privacy policy** before this goes live, plus a link to it near the form. This wasn't in the original 5-page scope — flag it if you'd like it added as a 6th page.

### 5. Pricing
Retainer packages on `services.html` (Starter / Growth / Bold) deliberately don't show £ figures — copy says pricing is confirmed on the free audit call. Add real prices there if you'd rather show them upfront.

## Brand mark

The real Dead Air logo (from `Logo/DeadAir.LogoBLK.png`) now replaces the plain text+dot wordmark in every header and footer. `images/brand/logo-mark.png` is a colour-keyed, transparency-processed export of the "DA" skull mark (background removed with ImageMagick, `-fuzz 5% -transparent black`), with a small glowing `.bg-signal` dot absolutely-positioned over the skull's eye socket. The dot position (`left-[51.8%] top-[59.2%]` on the icon wrapper) was calculated precisely, not eyeballed: crop the eye region, isolate the connected white component via alpha-channel flood fill (so it doesn't get confused with the surrounding letter strokes), take its bounding-box centre. Re-run that if the mark is ever re-cropped or re-exported and the dot needs re-tuning.

The favicon is now also the real "DA" skull mark (previously a simplified text placeholder, which was the right call at the time but the client asked for the real mark once they saw it at full size). `images/favicon-master.png` is the 1024×1024 source — mark composited onto a solid `#0A0A0A` square with the same glowing red eye baked in as a static dot (no CSS animation possible in a favicon) — downscaled to `favicon.ico` (16/32/48 multi-size), `favicon-16.png`, `favicon-32.png`, and `apple-touch-icon.png` (180×180). Tested at actual 16×16/32×32 render size before finalizing — the bold D+A silhouette stays legible even though the skull/eye detail mostly disappears at that size, which is expected and fine. Regenerate all sizes from `favicon-master.png` with ImageMagick if the mark ever changes: `magick favicon-master.png -resize <N>x<N> favicon-<N>.png`.

## Design system

- **Colours**: near-black `#0A0A0A` background, warm off-white `#F6F5F1` text, signal red `#FF3B2F` as the single accent (all defined in `tailwind.config.js` under `theme.extend.colors`)
- **Type**: **Devil Breeze** is the real brand typeface (client-supplied, `Logo/Font/*.ttf` → copied to `fonts/`) and is now the site's primary display font (`font-display` in Tailwind), used for every heading, button, nav link and the header/footer wordmark — it's the same face used in the actual logo artwork, replacing the earlier Michroma/Archivo approximations. Five weights are loaded via `@font-face` in `css/input.css`: Light 300, Book 400, Medium 500, Demi 600, Bold 700 — **there is no 800/900 weight**, so anywhere you're tempted to reach for `font-black`/`font-extrabold` on `font-display` text, use `font-bold` (700) instead, or the browser will synthetically (and badly) embolden it. The nav/footer wordmark specifically uses `font-normal` (Book) to match the lighter stroke weight of the logo's actual lettering, while headlines use `font-bold` for impact. Body copy stays on Inter (`font-body`) since Devil Breeze's display-oriented letterforms aren't built for long-form reading; JetBrains Mono (`font-mono`) still handles small tracked labels/eyebrows; Fraunces (`font-serif`) is an editorial italic accent for pull-quote-style copy (portfolio subhead, project descriptions).
- **Reusable component classes** (in `css/input.css` under `@layer components`): `.btn-primary`, `.btn-outline`, `.card`, `.tag`, `.eyebrow`, `.nav-link`, `.reveal` (scroll-in animation), `.portfolio-card` + `.portfolio-card--wide` (asymmetric 2-col featured tiles) + `.portfolio-thumb` + `.portfolio-card-scrim/-caption/-expand` (grid tiles), `.spotlight` (cursor-tracked hover glow, see below)
- **Spotlight hover glow**: a soft brand-red radial glow that follows the cursor over cards and thumbnail frames, plus a matching border-colour shift. Applies automatically to every `.card` and `.portfolio-card`, and to any other element given the `.spotlight` class (used on a handful of raw thumbnail-frame `<div>`s on the Home/Services/About pages that aren't already `.card`/`.portfolio-card`). Mechanism: one global `pointermove` listener in `js/main.js` writes the cursor position to `--x`/`--y` custom properties on `:root` in viewport px; every spotlit element reads the same pair via `background-attachment: fixed` on a `::after` pseudo-element, so the glow works for any number of elements without per-element JS. The glow pseudo-element paints on top of card content and is clipped to the card's own box (`inset: 0`, plus `overflow-hidden` on `.portfolio-card`) — earlier versions tried to confine it to a precise 1px border ring with `mask-composite: exclude`, which is spec-correct but rendered as fully invisible in testing despite correct computed styles, so that approach was dropped for this simpler, more reliably-rendering one. Skipped entirely on touch devices (`(hover: hover) and (pointer: fine)`) and under `prefers-reduced-motion`, since neither has a meaningful hover/cursor to track.
- **Layout language**: `portfolio.html` deliberately breaks from the uniform grid the rest of the site uses — rotated 90° side labels (`-rotate-90 origin-left/right`), a full-bleed colour-block statement band interrupting the grid, and two oversized `--wide` cards — inspired by nomadstudio.com's mix of clean grids and bolder asymmetric moments. Reuse this pattern (rotated label + full-bleed band) sparingly elsewhere if you want more of that energy; overusing it will dilute the effect.

**Minor future optimisation, not urgent**: the Devil Breeze files in `fonts/` are raw `.ttf` (~6MB total for 5 weights). Converting to `.woff2` (e.g. via [fonttools](https://github.com/fonttools/fonttools) `fonttools varLib.instancer` or an online converter) would cut that by roughly 60-70% with zero visual difference — worth doing before a real production launch, not blocking anything now since fonts cache after first load.

## Deployment

Any static host works — no build step needed at deploy time beyond `npm run build:css`. Simplest options:
- **Netlify / Vercel**: drag-and-drop the folder, or connect the repo (build command `npm run build:css`, publish directory `/`)
- **GitHub Pages**: push to a repo, enable Pages on the main branch

## Accessibility & performance notes

- Skip-to-content link, semantic headings, visible focus states, 4.5:1+ text contrast throughout
- Reduced-motion respected (animations disable via `prefers-reduced-motion`)
- Scroll-reveal animation has a safety net: if anything ever prevents it from triggering, content force-reveals after 4s rather than staying invisible
- All interactive icons use inline SVG (no icon fonts, no emoji-as-icon)
