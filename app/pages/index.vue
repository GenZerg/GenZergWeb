<script setup lang="ts">
import type { WatchingResponse } from '../../shared/types/anilist'
import type { FilmsResponse } from '../../shared/types/letterboxd'
import type { MusicResponse } from '../../shared/types/lastfm'
import type { MusicActivityPoint, ShowcaseItem, ShowcaseZone } from '../../shared/types/showcase'

useSeoMeta({
  title: 'GenZerg — Interactive canopy showcase',
  description: 'A living Three.js showcase of GenZerg’s anime, films, and music in the forest canopy.',
  ogTitle: 'GenZerg',
  ogDescription: 'There’s a story here worth exploring.',
})

const worldRef = ref<{ focusZone: (zone: ShowcaseZone) => void } | null>(null)
const activeZone = ref<ShowcaseZone>('all')
const selected = ref<ShowcaseItem | null>(null)
const hovered = ref<ShowcaseItem | null>(null)
const musicPeriod = ref<'weekly' | 'monthly'>('weekly')

const { data: watching } = await useFetch<WatchingResponse>('/api/watching', {
  lazy: true,
  default: () => ({
    user: 'GenZerg',
    profileUrl: 'https://anilist.co/user/GenZerg/',
    count: 0,
    watching: [],
  }),
})

const { data: films } = await useFetch<FilmsResponse>('/api/films', {
  lazy: true,
  default: () => ({
    user: 'GenZerg',
    profileUrl: 'https://letterboxd.com/genzerg/',
    filmsUrl: 'https://letterboxd.com/genzerg/films/',
    count: 0,
    films: [],
    source: 'letterboxd-html',
    posters: false,
  }),
})

const { data: music } = await useFetch<MusicResponse>('/api/music', {
  lazy: true,
  default: () => ({
    user: 'GenZerg',
    profileUrl: 'https://www.last.fm/user/GenZerg',
    configured: false,
    recent: [],
    topWeekly: [],
    topMonthly: [],
    weeklyActivity: [],
    monthlyActivity: [],
  }),
})

const showcaseItems = computed<ShowcaseItem[]>(() => {
  const anime: ShowcaseItem[] = (watching.value?.watching ?? []).slice(0, 18).map((entry) => ({
    id: `anime-${entry.id}`,
    kind: 'anime',
    title: entry.title,
    subtitle: 'AniList · watching',
    meta: entry.episodes
      ? `Ep ${entry.progress}/${entry.episodes}`
      : entry.progress > 0
        ? `Ep ${entry.progress}`
        : 'In progress',
    url: entry.url,
    image: entry.cover,
  }))

  const movieItems: ShowcaseItem[] = (films.value?.films ?? []).slice(0, 18).map((film) => ({
    id: `film-${film.id}`,
    kind: 'film',
    title: film.title,
    subtitle: film.year ? `Letterboxd · ${film.year}` : 'Letterboxd',
    meta: film.rating != null ? `${film.rating}/5` : 'Unrated',
    url: film.url,
    image: film.posterUrl,
  }))

  const tracksSource = musicPeriod.value === 'weekly'
    ? (music.value?.topWeekly ?? [])
    : (music.value?.topMonthly ?? [])

  const tracks: ShowcaseItem[] = tracksSource.slice(0, 12).map((track) => ({
    id: `track-${track.id}`,
    kind: 'track',
    title: track.name,
    subtitle: track.artist,
    meta: `${track.playcount} plays · ${musicPeriod.value === 'weekly' ? 'week' : 'month'}`,
    url: track.url,
    image: track.image,
  }))

  return [...anime, ...movieItems, ...tracks]
})

const activity = computed<MusicActivityPoint[]>(() => {
  const points = musicPeriod.value === 'weekly'
    ? (music.value?.weeklyActivity ?? [])
    : (music.value?.monthlyActivity ?? [])
  return points.map((point) => ({ label: point.label, count: point.count }))
})

const focusItem = computed(() => selected.value || hovered.value)

const counts = computed(() => ({
  anime: watching.value?.watching?.length ?? 0,
  films: films.value?.films?.length ?? 0,
  music: musicPeriod.value === 'weekly'
    ? (music.value?.topWeekly?.length ?? 0)
    : (music.value?.topMonthly?.length ?? 0),
}))

function setZone(zone: ShowcaseZone) {
  activeZone.value = zone
  worldRef.value?.focusZone(zone)
}

function openSelected() {
  if (!selected.value?.url) return
  window.open(selected.value.url, '_blank', 'noopener,noreferrer')
}

function onSelect(item: ShowcaseItem | null) {
  selected.value = item
}

function onHover(item: ShowcaseItem | null) {
  hovered.value = item
}
</script>

<template>
  <main class="stage" aria-label="GenZerg interactive showcase">
    <ClientOnly>
      <ShowcaseWorld
        ref="worldRef"
        class="stage__world"
        :items="showcaseItems"
        :activity="activity"
        @select="onSelect"
        @hover="onHover"
      />
      <template #fallback>
        <div class="stage__fallback">
          <img src="/concepts/canopy-day.png" alt="" width="1600" height="900">
        </div>
      </template>
    </ClientOnly>

    <div class="hud">
      <header class="hud__top">
        <p class="hud__brand">GenZerg</p>
        <nav class="hud__nav" aria-label="Primary">
          <NuxtLink to="/about">Story</NuxtLink>
          <a href="https://anilist.co/user/GenZerg/" target="_blank" rel="noopener noreferrer">AniList</a>
          <a href="https://letterboxd.com/genzerg/films/" target="_blank" rel="noopener noreferrer">Films</a>
          <a href="https://www.last.fm/user/GenZerg" target="_blank" rel="noopener noreferrer">Last.fm</a>
        </nav>
      </header>

      <div class="hud__intro">
        <h1>Look up. There’s a story in the canopy.</h1>
        <p>Click posters in the trees — anime, films, and music live in one interactive grove.</p>
      </div>

      <div class="hud__zones" role="toolbar" aria-label="Showcase zones">
        <button type="button" :class="{ active: activeZone === 'all' }" @click="setZone('all')">All</button>
        <button type="button" :class="{ active: activeZone === 'anime' }" @click="setZone('anime')">
          Anime <span>{{ counts.anime }}</span>
        </button>
        <button type="button" :class="{ active: activeZone === 'films' }" @click="setZone('films')">
          Films <span>{{ counts.films }}</span>
        </button>
        <button type="button" :class="{ active: activeZone === 'music' }" @click="setZone('music')">
          Music <span>{{ counts.music }}</span>
        </button>
      </div>

      <div class="hud__music" role="group" aria-label="Music period">
        <button
          type="button"
          :class="{ active: musicPeriod === 'weekly' }"
          @click="musicPeriod = 'weekly'"
        >
          Weekly
        </button>
        <button
          type="button"
          :class="{ active: musicPeriod === 'monthly' }"
          @click="musicPeriod = 'monthly'"
        >
          Monthly
        </button>
      </div>

      <aside v-if="focusItem" class="hud__card" aria-live="polite">
        <p class="hud__kind">{{ focusItem.kind }}</p>
        <h2>{{ focusItem.title }}</h2>
        <p class="hud__sub">{{ focusItem.subtitle }}</p>
        <p class="hud__meta">{{ focusItem.meta }}</p>
        <button v-if="selected" type="button" class="hud__open" @click="openSelected">
          Open
        </button>
      </aside>

      <p class="hud__hint">Move to look · click a panel · use zones to focus</p>
    </div>
  </main>
</template>

<style scoped>
.stage {
  position: relative;
  min-height: 100dvh;
  overflow: clip;
  background: oklch(0.2 0.05 145);
  color: oklch(0.98 0.01 145);
}

.stage__world,
.stage__fallback {
  position: absolute;
  inset: 0;
}

.stage__fallback img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.hud {
  position: relative;
  z-index: 2;
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  pointer-events: none;
  padding: clamp(1rem, 3vw, 1.75rem) clamp(1rem, 4vw, 2.5rem) clamp(1rem, 3vw, 1.5rem);
}

.hud__top,
.hud__zones,
.hud__music,
.hud__card,
.hud__intro a,
.hud__nav a,
.hud button {
  pointer-events: auto;
}

.hud__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.hud__brand {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.7rem, 4vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 0 oklch(0.2 0.05 145 / 0.45);
}

.hud__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.hud__nav a {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  opacity: 0.92;
}

.hud__nav a:hover {
  color: var(--accent);
}

.hud__intro {
  align-self: end;
  max-width: 34rem;
  margin-bottom: 1rem;
  text-shadow: 0 2px 14px oklch(0.12 0.04 145 / 0.55);
}

.hud__intro h1 {
  margin: 0 0 0.55rem;
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 4.5vw, 2.8rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

.hud__intro p {
  margin: 0;
  max-width: 36ch;
  color: oklch(0.93 0.02 145);
  text-wrap: pretty;
}

.hud__zones,
.hud__music {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
}

.hud__zones button,
.hud__music button,
.hud__open {
  min-height: 2.4rem;
  padding: 0.4rem 0.85rem;
  border: 2px solid oklch(0.92 0.03 145 / 0.35);
  border-radius: 0.35rem;
  background: oklch(0.16 0.04 145 / 0.55);
  color: inherit;
  font-family: var(--font-body);
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(6px);
}

.hud__zones button.active,
.hud__music button.active,
.hud__zones button:hover,
.hud__music button:hover,
.hud__open:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.hud__zones span {
  margin-left: 0.35rem;
  opacity: 0.75;
  font-size: 0.85em;
}

.hud__card {
  justify-self: start;
  max-width: min(22rem, 100%);
  padding: 0.85rem 1rem;
  border: 2px solid oklch(0.92 0.03 145 / 0.28);
  background: oklch(0.16 0.045 145 / 0.82);
  backdrop-filter: blur(8px);
}

.hud__kind {
  margin: 0 0 0.25rem;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}

.hud__card h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  line-height: 1.15;
  text-wrap: balance;
}

.hud__sub,
.hud__meta {
  margin: 0.35rem 0 0;
  color: oklch(0.84 0.03 145);
}

.hud__open {
  margin-top: 0.75rem;
  background: var(--primary);
  border-color: oklch(0.38 0.12 145);
  color: oklch(0.99 0.01 145);
}

.hud__hint {
  margin: 0.75rem 0 0;
  font-size: 0.8rem;
  opacity: 0.8;
}

@media (max-width: 720px) {
  .hud__intro {
    max-width: 100%;
  }

  .hud__nav {
    gap: 0.65rem;
    font-size: 0.9rem;
  }
}
</style>
