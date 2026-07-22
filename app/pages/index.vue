<script setup lang="ts">
import type { WatchingResponse } from '../../shared/types/anilist'
import type { FilmsResponse } from '../../shared/types/letterboxd'
import type { MusicResponse } from '../../shared/types/lastfm'
import type { MusicActivityPoint, ShowcaseItem, ShowcaseZone } from '../../shared/types/showcase'

useSeoMeta({
  title: 'GenZerg — Look up',
  description: 'A living canopy showcase of GenZerg’s anime, films, and music.',
  ogTitle: 'GenZerg',
  ogDescription: 'There’s a story here worth exploring.',
})

const activeZone = ref<ShowcaseZone>('all')
const musicPeriod = ref<'weekly' | 'monthly'>('weekly')
const reducedMotion = ref(false)

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

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

const counts = computed(() => ({
  anime: watching.value?.watching?.length ?? 0,
  films: films.value?.films?.length ?? 0,
  music: musicPeriod.value === 'weekly'
    ? (music.value?.topWeekly?.length ?? 0)
    : (music.value?.topMonthly?.length ?? 0),
}))
</script>

<template>
  <div class="home">
    <section class="hero" aria-label="GenZerg canopy">
      <CanopyHero :reduced-motion="reducedMotion" />

      <div class="hero__frame">
        <header class="hero__top">
          <nav class="hero__nav" aria-label="Primary">
            <NuxtLink to="/about">Story</NuxtLink>
            <a href="https://anilist.co/user/GenZerg/" target="_blank" rel="noopener noreferrer">AniList</a>
            <a href="https://letterboxd.com/genzerg/films/" target="_blank" rel="noopener noreferrer">Films</a>
            <a href="https://www.last.fm/user/GenZerg" target="_blank" rel="noopener noreferrer">Last.fm</a>
          </nav>
        </header>

        <div class="hero__copy">
          <p class="hero__brand">GenZerg</p>
          <h1>There’s a story here worth exploring.</h1>
          <p class="hero__support">
            Look up through the canopy — anime, films, and music grow in one playful grove.
          </p>
          <div class="hero__cta">
            <a class="cta cta--primary" href="#exhibit">Explore the grove</a>
            <NuxtLink class="cta cta--ghost" to="/about">The story</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <ShowcaseExhibit
      v-model:active-zone="activeZone"
      v-model:music-period="musicPeriod"
      :items="showcaseItems"
      :activity="activity"
      :counts="counts"
    />
  </div>
</template>

<style scoped>
.home {
  background: var(--bg);
}

.hero {
  position: relative;
  min-height: 100dvh;
  min-height: 100svh;
  color: oklch(0.98 0.01 145);
  overflow: clip;
}

.hero__frame {
  position: relative;
  z-index: 2;
  min-height: 100dvh;
  min-height: 100svh;
  display: grid;
  grid-template-rows: auto 1fr;
  padding: clamp(1rem, 3vw, 1.75rem) clamp(1rem, 4vw, 2.5rem) clamp(1.5rem, 4vw, 2.5rem);
  pointer-events: none;
}

.hero__top,
.hero__nav a,
.hero__cta a {
  pointer-events: auto;
}

.hero__top {
  display: flex;
  justify-content: flex-end;
}

.hero__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.9rem;
}

.hero__nav a {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  opacity: 0.92;
  text-shadow: 0 1px 8px oklch(0.12 0.04 145 / 0.55);
  transition: color 0.2s var(--ease-out), opacity 0.2s var(--ease-out);
}

.hero__nav a:hover {
  color: var(--accent);
  opacity: 1;
}

.hero__copy {
  align-self: end;
  max-width: 38rem;
  animation: rise-in 0.9s var(--ease-out) both;
}

.hero__brand {
  margin: 0 0 0.35rem;
  font-family: var(--font-display);
  font-size: clamp(3rem, 10vw, 5.5rem);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-shadow:
    0 3px 0 oklch(0.18 0.05 145 / 0.45),
    0 12px 28px oklch(0.12 0.04 145 / 0.35);
}

.hero__copy h1 {
  margin: 0 0 0.7rem;
  font-family: var(--font-display);
  font-size: clamp(1.45rem, 3.6vw, 2.15rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
  text-wrap: balance;
  text-shadow: 0 2px 16px oklch(0.12 0.04 145 / 0.55);
}

.hero__support {
  margin: 0 0 1.25rem;
  max-width: 34ch;
  color: oklch(0.94 0.02 145);
  text-wrap: pretty;
  text-shadow: 0 2px 12px oklch(0.12 0.04 145 / 0.5);
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.cta {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0.65rem 1.15rem;
  border-radius: 0.35rem;
  font-weight: 700;
  text-decoration: none;
  border: 2px solid transparent;
  transition:
    transform 0.2s var(--ease-spring),
    filter 0.2s var(--ease-out),
    background 0.2s var(--ease-out);
}

.cta:active {
  transform: translateY(1px);
}

.cta--primary {
  background: var(--accent);
  border-color: oklch(0.7 0.14 95);
  color: oklch(0.22 0.05 145);
}

.cta--primary:hover {
  filter: brightness(1.05);
}

.cta--ghost {
  background: oklch(0.16 0.04 145 / 0.45);
  border-color: oklch(0.92 0.03 145 / 0.35);
  color: oklch(0.98 0.01 145);
  backdrop-filter: blur(6px);
}

.cta--ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 720px) {
  .hero__nav {
    gap: 0.65rem;
    font-size: 0.9rem;
  }

  .hero__support {
    max-width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__copy {
    animation: none;
  }
}
</style>
