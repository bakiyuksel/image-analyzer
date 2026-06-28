<div align="center">

# Image Analyzer

<a href="#english"><img src="https://img.shields.io/badge/lang-English-4a90d9?style=flat-square" /></a>
&nbsp;
<a href="#nederlands"><img src="https://img.shields.io/badge/lang-Nederlands-d79921?style=flat-square" /></a>

</div>

---

<h2 id="english">🇬🇧 English</h2>

**Test it out → [img.bakiyuksel.nl](https://img.bakiyuksel.nl)**

**Image Analyzer** is a web app for detecting photo manipulation and Photoshop edits. Upload any image to instantly generate 15 detection-focused processing views, an automatic analysis report, RGB histogram, and EXIF metadata breakdown — all 100% client-side with no server or data upload.

### Detection Views

| View | Purpose |
|---|---|
| ELA | Error Level Analysis — reveals inconsistent JPEG compression zones from retouching or compositing |
| JPEG Ghost | Multi-quality compression fingerprint — spliced regions from a different source light up in orange-red |
| Noise Map | High-pass filter isolates sensor noise — inpainted or cloned areas appear unnaturally smooth |
| Edge Detection | Sobel operator — exposes unnatural sharpness, halos, or hard cutouts from compositing |
| Clone Detect | Copy-move heuristic — flags 16×16 pixel blocks duplicated from elsewhere in the image |
| FFT Spectrum | 2D Fourier transform — reveals AI upscaling artifacts, tiling patterns, and periodic structures |
| Hue Channel | HSV hue as grayscale — highlights selective color corrections and abrupt hue shifts |
| Saturation Channel | HSV saturation as grayscale — exposes local saturation boosts and selective color edits |
| High Contrast | Extreme contrast — makes lighting inconsistencies and soft blending visible |
| Negative | Inverted tones — subtle retouching and blending seams can appear as tone differences |
| Grayscale | Pure luminance — compositing mismatches without color distraction |
| Red / Green / Blue Channel | Per-channel noise analysis — spliced elements from a different camera show a different noise profile |

### Analysis Panels

- **Auto-analysis** — scored predictions for ELA, Noise Map, and Edge Detection with threshold-based alerts
- **RGB Histogram** — gap detection for levels/curves adjustments (≥5 consecutive empty buckets)
- **EXIF Metadata** — software flags, capture vs file date timeline check, GPS vs EXIF date, embedded thumbnail comparison, GPS location map
- **Export** — download the full analysis as a JSON report (scores, file info, timestamps)

### Features

- **NL / EN** — full interface translation, switchable in the top bar
- **GPS map** — renders the photo's GPS coordinates on an interactive dark map (maplibre-gl + CARTO)
- **Privacy-first** — Sentry error monitoring only activates after explicit user consent (cookie banner)
- **404 page** — custom styled page; automatically reports the broken URL to Sentry

### Stack

- Vite 8 + React 19 + TypeScript 6
- Tailwind CSS v4 (CSS-first config, Gruvbox dark theme)
- Canvas API — 100% client-side image processing, no data leaves the browser
- `exifr` — client-side EXIF parsing
- `maplibre-gl` — GPS location map (CARTO dark-matter tiles)
- `@sentry/react` — error monitoring, session replay, profiling, logging (consent-gated)
- `@vercel/analytics` — page view analytics
- `posthog-js` — product analytics via PostHog EU Cloud

### Run locally

```sh
git clone https://github.com/bakiyuksel/image-analyzer.git
cd image-analyzer
npm install
npm run dev
```

Requires Node.js ≥ 20.19.

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|---|---|
| `VITE_SENTRY_DSN` | Sentry DSN — for local error monitoring |
| `VITE_POSTHOG_KEY` | PostHog project API key (`phc_...`) — for local analytics |

---

<h2 id="nederlands">🇳🇱 Nederlands</h2>

**Probeer het → [img.bakiyuksel.nl](https://img.bakiyuksel.nl)**

**Image Analyzer** is een webapplicatie voor het detecteren van fotomanipulatie en Photoshop-bewerkingen. Upload een afbeelding en genereer direct 15 detectie-views, een automatisch analyserapport, RGB-histogram en EXIF-metadata — volledig client-side, geen server, geen data-upload.

### Detectie-views

| View | Doel |
|---|---|
| ELA | Error Level Analysis — toont inconsistente JPEG-compressiezones door retouche of compositing |
| JPEG Ghost | Multi-kwaliteit compressie-fingerprint — ingeplakte gebieden van een andere bron lichten op in oranje-rood |
| Noise Map | High-pass filter isoleert sensorruis — ingeschilderde of geklonede gebieden zijn onnatuurlijk glad |
| Edge Detection | Sobel-operator — onthult onnatuurlijke scherpte, halo's of harde uitsnijdingen bij compositing |
| Clone Detect | Copy-move heuristiek — markeert 16×16 pixel blokken die elders in de afbeelding zijn gekopieerd |
| FFT Spectrum | 2D Fourier-transformatie — onthult AI-upscaling-artefacten, tilingpatronen en periodieke structuren |
| Hue Channel | HSV hue als grijswaarden — markeert selectieve kleurcorrecties en abrupte hue-verschuivingen |
| Saturation Channel | HSV saturatie als grijswaarden — onthult lokale verzadigingsaanpassingen en selective color |
| High Contrast | Extreem contrast — maakt belichtingsinconsistenties en zachte blending zichtbaar |
| Negative | Omgekeerde tonen — subtiele retouches en blending-naden kunnen als toonverschillen oplichten |
| Grayscale | Puur luminantie — compositingmismatch zonder kleurafleiding |
| Rood / Groen / Blauw kanaal | Per-kanaal ruis-analyse — ingeplakte elementen van een andere camera tonen een afwijkend ruispatroon |

### Analyse-panels

- **Automatische analyse** — scorede voorspellingen voor ELA, Noise Map en Edge Detection met drempelwaarden
- **RGB Histogram** — gap-detectie voor levels/curves-aanpassingen (≥5 opeenvolgende lege buckets)
- **EXIF Metadata** — softwareflags, tijdlijn-check (opnamedatum vs bestandsdatum), GPS vs EXIF-datum, thumbnail-vergelijking, GPS-locatiekaart
- **Export** — download de volledige analyse als JSON-rapport (scores, bestandsinfo, tijdstempels)

### Features

- **NL / EN** — volledige interfacevertaling, schakelbaar in de topbalk
- **GPS-kaart** — toont de GPS-coördinaten van de foto op een interactieve donkere kaart (maplibre-gl + CARTO)
- **Privacy-first** — Sentry-foutmonitoring activeert alleen na expliciete toestemming (consent banner)
- **404-pagina** — eigen gestijlde pagina; rapporteert de gebroken URL automatisch aan Sentry

### Stack

- Vite 8 + React 19 + TypeScript 6
- Tailwind CSS v4 (CSS-first config, Gruvbox dark theme)
- Canvas API — 100% client-side beeldverwerking, geen data verlaat de browser
- `exifr` — client-side EXIF-parsing
- `maplibre-gl` — GPS-locatiekaart (CARTO dark-matter tiles)
- `@sentry/react` — foutmonitoring, sessie-replay, profiling, logging (consent-vereist)
- `@vercel/analytics` — paginaweergave-analytics
- `posthog-js` — product analytics via PostHog EU Cloud

### Lokaal draaien

```sh
git clone https://github.com/bakiyuksel/image-analyzer.git
cd image-analyzer
npm install
npm run dev
```

Node.js ≥ 20.19 vereist.

Kopieer `.env.example` naar `.env` en vul in:

| Variabele | Beschrijving |
|---|---|
| `VITE_SENTRY_DSN` | Sentry DSN — voor lokale foutmonitoring |
| `VITE_POSTHOG_KEY` | PostHog project API key (`phc_...`) — voor lokale analytics |
