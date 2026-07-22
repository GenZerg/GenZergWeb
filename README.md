# GenZergWeb

Nuxt 4 app configured for **Cloudflare Workers** (Workers Assets), managed with **Bun**.

## Setup

```bash
bun install
```

## Development

```bash
bun run dev
```

Starts the Nuxt dev server at `http://localhost:3000`.

## Build

```bash
bun run build
```

Produces Cloudflare-ready output under `.output/` (`cloudflare_module` Nitro preset).

## Preview (local Workers runtime)

```bash
bun run preview
```

## Deploy to Cloudflare Workers

1. Log in to Cloudflare (one-time):

```bash
bunx wrangler login
```

2. Deploy:

```bash
bun run deploy
```

That builds the app and deploys it to a `*.workers.dev` URL. You can attach a custom domain later in the Cloudflare dashboard.

## Useful scripts

| Script | Purpose |
| --- | --- |
| `bun run dev` | Local Nuxt development |
| `bun run build` | Production build for Workers |
| `bun run preview` | Build + local Wrangler preview |
| `bun run deploy` | Build + deploy with Wrangler |
| `bun run cf-typegen` | Regenerate `worker-configuration.d.ts` |

## Canopy showcase

The home page is a full-viewport canopy experience (CSS + pixel art — no WebGL):

- **Hero** — full-bleed forest canopy with light, dust, and parallax
- **Anime** from AniList (`/api/watching`)
- **Film** from Letterboxd (`/api/films`) + TMDB posters
- **Music** from Last.fm (`/api/music`) with weekly/monthly pulse
- **Roots** from `/api/profile` — AniList stats/favorites, Letterboxd totals, Steam, GitHub, listening flavor

Scroll into the grove, filter by zone, and open a panel for the source link.

## Stack

- Bun · Nuxt 4 · Cloudflare Workers
- CSS canopy showcase (no Three.js)
- AniList GraphQL · Letterboxd · Last.fm · TMDB posters
- Env keys: `NUXT_LASTFM_API_KEY`, `NUXT_TMDB_API_KEY` (see `.env.example`)
