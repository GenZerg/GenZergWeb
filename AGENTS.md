# AGENTS.md

## Cursor Cloud specific instructions

GenZergWeb is a single **Nuxt 4 + Vue 3** app (package manager: **Bun**) that renders an
interactive Three.js "canopy" showcasing anime/films/music. Data is fetched by Nitro
server routes under `server/api/*`. There is no database and no separate backend service —
the only local process is the Nuxt dev server.

Standard commands live in `README.md` and `package.json` `scripts` (don't duplicate them):
`bun run dev` (dev server on `http://localhost:3000`), `bun run build`, `bun run preview`.
There is **no lint or test tooling** configured in this repo (no ESLint/Prettier/Vitest, no
CI). Don't invent one; type-checking is handled by `nuxt prepare` (runs automatically via
`postinstall`).

Non-obvious things worth knowing:

- **Env keys are optional.** `/api/watching` (AniList) and `/api/films` (Letterboxd) work
  with no API keys. `/api/music` returns `configured: false` and TMDB posters are skipped
  unless `NUXT_LASTFM_API_KEY` / `NUXT_TMDB_API_KEY` are set (see `.env.example`). Copy
  `.env.example` to `.env` only if you want to exercise those optional integrations.
- **The `/api/*` routes call the public internet** (AniList GraphQL, Letterboxd HTML
  scraping). They need outbound network access; if a route returns empty data, suspect
  egress/network rather than a code bug.
- **The 3D canopy on `/` does NOT initialize on a hard page load / full refresh.** A cold
  load or `Ctrl+R` shows only the blue gradient background (the Three.js init in
  `ShowcaseWorld.client.vue`'s `onMounted` does not run on first SSR hydration). It renders
  correctly after a **client-side (SPA) navigation into `/`** — e.g. open `/about` then click
  "Return home", or navigate away and back. When testing the 3D scene, always reach `/` via
  in-app navigation, not a direct URL/refresh. Once initialized: move the mouse (especially
  over the lower part of the viewport) to steer the camera, click the zone filter buttons
  (All/Anime/Films/Music) to refocus, and click a floating poster to open its detail card.
- **Browser WebGL / Three.js:** this VM's Chrome runs software WebGL via SwiftShader. The
  Chrome launcher wrapper (`/usr/local/bin/google-chrome`) was given the
  `--enable-unsafe-swiftshader` flag, which Chrome 138+ requires to allow software WebGL for
  page content; without it `canvas.getContext('webgl')` returns `null` and the canopy stays
  blank. This is a system/browser setting (already in the VM snapshot), not a repo change.
