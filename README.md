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
| `about-mateusz.webp`, `about-ciaran.webp` | About page founder portraits | Client-supplied B&W studio portraits against the DA mural (`DA Website Portraits-Mateusz/Ciaran.jpg`), centre-cropped 4088² → 4:5 |

All are WebP now (see **Media compression** below) — originally delivered as JPG, converted once real photo counts made file weight worth optimising.

Both founders now have real portraits (the earlier `about-founder.webp` / `about-founder.svg` placeholder are retired and can be deleted).

Still placeholder (no source assets exist yet):
| Placeholder file | Used on | Replace with |
|---|---|---|
| `service-design.svg` | Services page | 4:5 graphic design sample — **no design work was in the supplied content**, this needs a real asset |
| `og-image.svg` | Social share previews | **Export a 1200×630 PNG/JPG** — most platforms (Facebook, LinkedIn, iMessage) don't render SVG `og:image` reliably |

The "Design" filter on the portfolio page currently shows nothing when clicked, for the same reason — add a design project once you have one to show.

### 1b. Portfolio project pages (every photo, not a curated few)
Clicking a project card on `portfolio.html` opens a full-page takeover with the title, description, and **every photo/video from that project's source folder** (291 items total across the 10 projects; Nevuary alone has 184). The gallery adapts to project size (all logic in the `#lightbox` block of `js/main.js`, styles under `@layer components` in `css/input.css`):

- **Large projects (13+ items)** render a dense square **mosaic** contact sheet (`.lightbox-mosaic`, up to 5 columns) so a 184-item set doesn't take forever to scroll. Most tiles are `object-cover` squares; a 2x2 feature tile drops in on a fixed cadence (`i % 11 === 5`) and videos become tall portrait tiles, so it never reads as a flat grid. Key CSS detail: a 2-column-wide feature square is exactly as tall as two stacked square rows plus the gap, so features line up with the implicit grid with no measuring. Tall tiles use an explicit `aspect-ratio: 1/2` (not `auto`) because consecutive unloaded `<video>` tiles would otherwise collapse their rows to zero height.
- **Small projects (12 or fewer)** keep the roomy uncropped 3-column masonry (`.lightbox-columns`), where each image shows at full natural aspect.
- **Full-size viewer**: because mosaic thumbnails are cropped, clicking any tile (either layout) opens `#media-viewer`, a full-screen overlay showing the uncropped original with prev/next arrows, a `N / total` counter, keyboard nav (arrows step, Esc closes just the viewer), wrap-around, and click-outside-to-close. Videos play there with controls, autoplay and loop. The threshold constant is `MOSAIC_MIN` in `js/main.js`.

Generated, not hand-written:

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
Current values across all five HTML files:
- Email: `hello@deadaircreative.net` (confirmed real)
- Region: "Serving businesses across Ireland & Northern Ireland" (footer + contact page)
- `01234 567 890` / `tel:+441234567890` → still placeholder, replace with the real phone number
- Social links (`#` hrefs in the footer) → still placeholder, replace with real Instagram/TikTok/Facebook/LinkedIn URLs
- Canonical domain is `https://www.deadaircreative.net/` (matched to the email domain) in every `<link rel="canonical">`, `sitemap.xml` and `robots.txt` — **confirm this is the site's final domain** before launch and swap if not

### 2b. Copy rules (client-set, apply to all future copy)
- **No em dashes anywhere in site copy.** Rephrase with commas, colons, full stops or parentheses.
- **Never describe the audience as "local" or "small" businesses.** They are the main customer base but the site must read as serving businesses of every size and kind.
- **No pre-made packages/tiers.** Dead Air sells a one of one package built per client. Copy should reinforce that every brand gets a custom plan.

### 3. Contact form backend
The form on `contact.html` currently validates client-side only and shows a success message without actually sending anywhere (see `js/main.js`, `#contact-form` handler). Before launch, wire it to a real submission handler — easiest options:
- [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com) — add their endpoint as the form's `action` and remove the `preventDefault` fake-success logic
- A serverless function if you're deploying on Netlify/Vercel

### 4. Privacy policy (important — not optional)
The contact form collects personal data (name, email, phone) from visitors in Ireland and Northern Ireland, so **GDPR (EU) and UK GDPR both require a privacy policy** before this goes live, plus a link to it near the form. This wasn't in the original 5-page scope — flag it if you'd like it added as a 6th page.

### 5. Pricing
There are deliberately **no packages or tiers** on `services.html` (the earlier Starter / Growth / Bold cards were removed at the client's request). The section now sells a "one of one" custom plan through a three-step process (The Audit → The Call → Your Package, mirroring the "What Happens Next" steps on the contact page), and pricing is only ever discussed on the free audit call. Don't reintroduce fixed tiers or prices without checking with the client.

## Brand mark

The real Dead Air logo (from `Logo/DeadAir.LogoBLK.png`) now replaces the plain text+dot wordmark in every header and footer. `images/brand/logo-mark.png` is a colour-keyed, transparency-processed export of the "DA" skull mark (background removed with ImageMagick, `-fuzz 5% -transparent black`), with a small glowing `.bg-signal` dot absolutely-positioned over the skull's eye socket. The dot position (`left-[51.8%] top-[59.2%]` on the icon wrapper) was calculated precisely, not eyeballed: crop the eye region, isolate the connected white component via alpha-channel flood fill (so it doesn't get confused with the surrounding letter strokes), take its bounding-box centre. Re-run that if the mark is ever re-cropped or re-exported and the dot needs re-tuning.

The favicon is now also the real "DA" skull mark (previously a simplified text placeholder, which was the right call at the time but the client asked for the real mark once they saw it at full size). `images/favicon-master.png` is the 1024×1024 source — mark composited onto a solid `#0A0A0A` square with the same glowing red eye baked in as a static dot (no CSS animation possible in a favicon) — downscaled to `favicon.ico` (16/32/48 multi-size), `favicon-16.png`, `favicon-32.png`, and `apple-touch-icon.png` (180×180). Tested at actual 16×16/32×32 render size before finalizing — the bold D+A silhouette stays legible even though the skull/eye detail mostly disappears at that size, which is expected and fine. Regenerate all sizes from `favicon-master.png` with ImageMagick if the mark ever changes: `magick favicon-master.png -resize <N>x<N> favicon-<N>.png`.

## Design system

- **Colours**: near-black `#0A0A0A` background, warm off-white `#F6F5F1` text, signal red `#FF3B2F` as the single accent (all defined in `tailwind.config.js` under `theme.extend.colors`)
- **Type**: **Devil Breeze** is the real brand typeface (client-supplied, `Logo/Font/*.ttf` → copied to `fonts/`) and is now the site's primary display font (`font-display` in Tailwind), used for every heading, button, nav link and the header/footer wordmark — it's the same face used in the actual logo artwork, replacing the earlier Michroma/Archivo approximations. Five weights are loaded via `@font-face` in `css/input.css`: Light 300, Book 400, Medium 500, Demi 600, Bold 700 — **there is no 800/900 weight**, so anywhere you're tempted to reach for `font-black`/`font-extrabold` on `font-display` text, use `font-bold` (700) instead, or the browser will synthetically (and badly) embolden it. The nav/footer wordmark specifically uses `font-normal` (Book) to match the lighter stroke weight of the logo's actual lettering, while headlines use `font-bold` for impact. Body copy stays on Inter (`font-body`) since Devil Breeze's display-oriented letterforms aren't built for long-form reading; JetBrains Mono (`font-mono`) still handles small tracked labels/eyebrows; Fraunces (`font-serif`) is an editorial italic accent for pull-quote-style copy (portfolio subhead, project descriptions).
- **Reusable component classes** (in `css/input.css` under `@layer components`): `.btn-primary`, `.btn-outline`, `.card`, `.tag`, `.eyebrow`, `.nav-link`, `.reveal` (scroll-in animation), `.portfolio-card` + `.portfolio-card--wide` (asymmetric 2-col featured tiles) + `.portfolio-thumb` + `.portfolio-card-scrim/-caption/-expand` (grid tiles), `.spotlight` (cursor-tracked hover glow, see below)
- **Spotlight outline glow**: a brand-red glow that lives **only in each box's outline** — no fill over the content (an earlier version washed the glow across the inside of the card, which read as tacky and was redesigned). As the cursor moves around a page, the edges of nearby cards/thumbnails light up where the cursor is closest; hovering a box grows its glow radius from 130px to 300px with an eased transition. Applies automatically to every `.card` and `.portfolio-card`, and to any other element given the `.spotlight` class (used on a handful of raw thumbnail-frame `<div>`s on the Home/Services/About pages). Mechanism: one global `pointermove` listener in `js/main.js` writes the cursor position into each box's own `--x`/`--y` in **element-local px**. (An earlier version wrote viewport coords once on `:root` and had boxes read them via `background-attachment: fixed` — but fixed-attachment backgrounds re-anchor to any transformed or filtered ancestor instead of the viewport, and `.reveal` leaves a permanent `translateY(0)` transform after animating in, so the glow silently landed in the wrong place on pages whose boxes sit inside revealed subtrees. Element-local coords are immune to transforms anywhere in the tree.) Two pseudo-elements are cut down to just the border ring with the standard gradient-border mask (`mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)` + `mask-composite: exclude`, with `-webkit-` twins): `::before` is a 4px blurred bloom, `::after` a crisp 1px core. The hover growth animates because `--glow-r` is a registered `@property` (top of `css/input.css`); browsers without `@property` still resize, just without the ease, and browsers without `mask-composite` get no glow at all (the rules sit inside `@supports`) rather than an unmasked full-box gradient. Skipped on touch devices (`(hover: hover) and (pointer: fine)`) and under `prefers-reduced-motion`.
- **Scroll-expansion hero** (`index.html`): the homepage opens on a small centred card autoplaying a muted, looping cut of the Nevuary Jacket 1 reel; scrolling through the tall `#hero-track` section (240vh) grows the card into a near-full-height frame while the headline **builds in word by word** (eyebrow first, then each word fades/rises on its own slice of scroll progress — `revealStart`/`revealSpan`/`wordWindow` in `js/main.js`) and the background photo fades out. The headline ends fully settled over the expanded reel — the scrim deepens slightly (0.25→0.4) as the text lands so white type stays legible over bright frames — then the subhead + CTAs fade in and the page continues normally. The h1 keeps its full sentence as an `aria-label` (word spans are `aria-hidden`), so screen readers hear one clean phrase. Implementation notes worth knowing before touching it:
  - Progress is driven by **scroll position** (a sticky viewport inside a tall track), *not* by hijacked wheel/touch events like the React component this was adapted from — so trackpad, touch, keyboard scrolling and scrollbar drags all behave identically, and no `preventDefault` can trap a visitor at the top of the page. All styles update synchronously in the scroll handler (`js/main.js`, `#hero-track` block); no `requestAnimationFrame`.
  - The media frame matches the reel's aspect as it expands (capped at 82vh / 92vw) so nothing gets cropped away. The current showreel is **16:9 landscape on desktop, cropped to 4:5 portrait on mobile** (a landscape strip is a sliver of a phone screen and the headline dwarfed it). The frame opens as a tall centre column (~38vw wide desktop, 62vw mobile) at ~90% of final height and expands out from the sides; object-cover means the collapsed state is a centre crop of the reel, so nothing ever looks tiny. Constants live in the `hwRatio`/`startW`/`startH` lines of the `#hero-track` block in `js/main.js`, mirrored by the `.hero-media` CSS default and its `max-width: 767px` override. Mobile also calms the overlay type (36px headline, no eyebrow dot, tighter hint tracking), moves the red eyebrow out of the centred title stack and into the black band above the frame (JS `heroUpdate` centres it between the header and the frame's top edge, clamped clear of the 80px header, so it never overlaps the video), and lifts the headline into the frame's upper third via its own `translateY` (not container padding, which would shift the absolute eyebrow's anchor) so the end-state subhead + stacked buttons never collide with the headline's last line. Change video orientation and these move together.
  - The CSS defaults in `css/input.css` (`.hero-media`, `.hero-copy`, `#hero-hint`) describe the **fully-expanded end state**; JS adds `.hero-anim` and interpolates from the collapsed state. With JS disabled the hero is simply static-expanded; under `prefers-reduced-motion` JS adds `.hero-static`, which also collapses the 240vh track so there's no dead scroll distance, and the video stays on its poster instead of autoplaying.
  - The video pauses while scrolled out of view (IntersectionObserver) and resumes on `visibilitychange` — browsers suspend muted autoplay in hidden tabs, so without that resume a visitor who opened the site in a background tab would land on a frozen frame.
  - `images/portfolio/video/home-hero.mp4` is the **full 20s "DA Hero Vid 1" showreel** (source in `Images:Video/`, 1920×1080 @ 49MB) encoded with `avconvert -p Preset960x540` (960×540 H.264, 10MB). The grainy, fast-cut footage inflates every quality-targeted preset: 720pHD came out 16MB and HEVC-1080 19MB, while 480pSD was 5.2MB but only 640×360 (too soft at hero size), so 540p is the sweet spot. `images/portfolio/home-hero-poster.webp` is the reel's first frame, so poster→playback is seamless. The video and poster URLs in `index.html` carry a `?v=` cache-bust param: **bump it whenever either file changes** or returning visitors keep the old video. Re-encode with the same preset if the reel is ever replaced.
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
