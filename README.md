# VEED × OpenArt — AI Influencer Demo

A static demo site showing VEED's API models on AI influencer content.
Live at https://jojopqt991.github.io/customer-demos-open-art/ — or open `index.html` locally. No build step.

## Folder structure

```
.
├── README.md
├── index.html            Overview page (cover + model grid)
├── .env                  API keys (VEED_API_KEY, FAL_KEY). Never committed or shipped.
├── pages/                One page per model + workflow pages
│   ├── fabric.html  lipsync.html  dubbing.html  subtitles.html
│   ├── background-removal.html  clean-audio.html  reframe.html
│   └── ready-to-post.html  coming-soon.html
├── assets/
│   ├── data.js           ALL page content: text, specs, prices, file paths
│   ├── render.js         Builds every page from data.js (nav, cards, prev/next)
│   ├── site.js           Turns media slots into <video>/<img>/<audio>; missing files show a placeholder
│   ├── site.css          Styles
│   └── brand/            VEED logos (black, green, white; PNG + SVG). Brand green #96FF1A
├── inputs/
│   ├── personas/         Character images (original Emma/Halley/Tony PNGs + web JPGs used by the pages)
│   ├── voices/           ElevenLabs v4 voice tracks + SCRIPTS.md (scripts and voice choices)
│   ├── videos/           interview-en-16x9 (Reframe example original), jordan-cafe-noisy (Fabric clip + café noise)
│   ├── backgrounds/      Generated scenes used for composites
│   └── sounds/           Café noise
├── outputs/              Results grouped by model
│   ├── fabric/
│   ├── lipsync/
│   ├── dubbing/
│   ├── subtitles/
│   ├── background-removal/  (background removal + green screen)
│   ├── clean-audio/
│   ├── reframe/                interview-es-9x16-captioned (Reframe isn't on the API yet)
│   └── ready-to-post/          final ads + steps/ (dubbed intermediates)
└── tools/                Python scripts that generate everything (cache in tools/.cache)
```

## Personas

| Persona | Source images | Voice (ElevenLabs v4) |
|---|---|---|
| Maya (Halley) | `maya-gym.jpg`, `maya-cafe.jpg` | Jessica |
| Freya (Emma) | `freya-home.jpg`, `freya-cafe.jpg`, `freya-closeup-16x9.jpg`, `freya-greenscreen.jpg` | Lily |
| Jordan (Tony) | `jordan-cafe.jpg`, `jordan-podcast-16x9.jpg` | Chris |

## Regenerating assets

Keys are read from `.env` at the root. Every script skips outputs that already exist, so delete a file to redo it.

```bash
python3 -I tools/tts.py                     # voices → inputs/voices/
python3 -I tools/fabric.py                  # Fabric clips → outputs/fabric/
python3 -I tools/pipeline.py lipsync dubs captions background greenscreen clean_audio final_ads podcast_h3
```

## Editing the site

- Text, prices, specs and file paths: `assets/data.js`.
- Partner shown in the header: `SITE.partner` in `assets/data.js` (set to `""` for VEED only).
- After changing CSS/JS, bump the `?v=` number in the HTML files so browsers reload them.

## Notes

- Prices are from the VEED API docs on November 11, 2026.
- Reframe example: `inputs/videos/interview-en-16x9.mp4` → dubbed to Spanish (`outputs/dubbing/interview-es-16x9.mp4`) → reframed to 9:16 with captions (`outputs/reframe/interview-es-9x16-captioned.mp4`). Reframe was run outside the API.
