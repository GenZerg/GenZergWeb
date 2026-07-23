<script setup lang="ts">
import type { ProfileCategoryId, ProfileResponse } from '../../shared/types/profile'

const props = defineProps<{
  profile: ProfileResponse | null
}>()

type DeckTab = Exclude<ProfileCategoryId, 'overview'>

const tabs: Array<{ id: DeckTab; label: string }> = [
  { id: 'anime', label: 'Anime' },
  { id: 'films', label: 'Films' },
  { id: 'music', label: 'Music' },
  { id: 'games', label: 'Games' },
  { id: 'code', label: 'Code' },
]

const active = ref<DeckTab>('anime')

const activeMeta = computed(() =>
  props.profile?.categories.find((category) => category.id === active.value),
)

const cover = computed(() =>
  activeMeta.value?.cover || props.profile?.banner || props.profile?.avatar || null,
)

const mosaic = computed(() => {
  const covers = [
    ...(props.profile?.details.anime.favorites.map((item) => item.image) ?? []),
    ...(props.profile?.details.films.topRated.map((item) => item.image) ?? []),
    ...(props.profile?.details.anime.topRated.map((item) => item.image) ?? []),
  ].filter(Boolean) as string[]
  return [...new Set(covers)].slice(0, 8)
})

function selectTab(id: DeckTab) {
  active.value = id
}
</script>

<template>
  <section v-if="profile" id="profile" class="deck" aria-labelledby="deck-title">
    <div class="deck__banner" aria-hidden="true">
      <img v-if="cover" :src="cover" alt="" decoding="async">
      <div class="deck__banner-fade" />
    </div>

    <div class="deck__inner">
      <div class="deck__intro">
        <p class="deck__kicker">Profile</p>
        <h2 id="deck-title">{{ profile.handle }}</h2>
        <p v-if="profile.location" class="deck__place">{{ profile.location }}</p>
        <p class="deck__tagline">{{ profile.tagline }}</p>

        <ul class="deck__stats">
          <li v-for="item in profile.highlights" :key="item.label">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
            <em v-if="item.hint">{{ item.hint }}</em>
          </li>
        </ul>
      </div>

      <div v-if="mosaic.length" class="deck__mosaic" aria-hidden="true">
        <img
          v-for="(src, index) in mosaic"
          :key="`${src}-${index}`"
          :src="src"
          alt=""
          loading="lazy"
          decoding="async"
        >
      </div>

      <nav class="deck__tabs" aria-label="Profile categories">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :class="{ active: active === tab.id }"
          @click="selectTab(tab.id)"
        >
          <img
            v-if="profile.categories.find((c) => c.id === tab.id)?.cover"
            :src="profile.categories.find((c) => c.id === tab.id)!.cover!"
            alt=""
            loading="lazy"
          >
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <p v-if="activeMeta" class="deck__blurb">
        {{ activeMeta.blurb }}
        <a :href="activeMeta.sourceUrl" target="_blank" rel="noopener noreferrer">
          {{ activeMeta.sourceLabel }} ↗
        </a>
      </p>

      <div class="deck__panel">
        <template v-if="active === 'anime'">
          <ProfileBlock title="Stats" :stats="profile.details.anime.stats" />
          <ProfileBlock title="Favorites" :items="profile.details.anime.favorites" large />
          <ProfileBlock
            v-if="profile.details.anime.mangaFavorite"
            title="Manga favorite"
            :items="[profile.details.anime.mangaFavorite]"
          />
          <ProfileBlock title="Scored 9–10" :items="profile.details.anime.topRated" large />
          <div class="split">
            <section>
              <h3>Formats</h3>
              <ul>
                <li v-for="format in profile.details.anime.formats" :key="format.format">
                  <span>{{ format.format }}</span>
                  <strong>{{ format.count }}</strong>
                </li>
              </ul>
            </section>
            <section>
              <h3>Tags</h3>
              <ul>
                <li v-for="tag in profile.details.anime.tags" :key="tag.tag">
                  <span>{{ tag.tag }}</span>
                  <strong>{{ tag.count }}</strong>
                </li>
              </ul>
            </section>
          </div>
        </template>

        <template v-else-if="active === 'films'">
          <ProfileBlock title="Diary" :stats="profile.details.films.stats" />
          <ProfileBlock title="High scores" :items="profile.details.films.topRated" large />
        </template>

        <template v-else-if="active === 'music'">
          <ProfileBlock title="Pulse" :stats="profile.details.music.stats" />
          <section class="artist-grid" aria-label="Top artists">
            <h3>Top artists</h3>
            <ul>
              <li v-for="(artist, index) in profile.details.music.artists" :key="artist.name">
                <span class="artist-grid__rank">{{ index + 1 }}</span>
                <div>
                  <strong>{{ artist.name }}</strong>
                  <span>{{ artist.detail }}</span>
                </div>
                <em v-if="artist.plays">{{ artist.plays }}</em>
              </li>
            </ul>
          </section>
          <section class="list-block">
            <h3>Loved</h3>
            <ul>
              <li v-for="track in profile.details.music.lovedTracks" :key="`${track.artist}-${track.name}`">
                <div>
                  <strong>{{ track.name }}</strong>
                  <span>{{ track.artist }}</span>
                </div>
              </li>
            </ul>
          </section>
        </template>

        <template v-else-if="active === 'games'">
          <ProfileBlock title="Steam" :stats="profile.details.games.stats" />
          <section class="game-strip">
            <h3>Recently played</h3>
            <ul>
              <li v-for="game in profile.details.games.recentGames" :key="game">
                <strong>{{ game }}</strong>
              </li>
            </ul>
            <p v-for="note in profile.details.games.notes" :key="note" class="note">{{ note }}</p>
          </section>
        </template>

        <template v-else-if="active === 'code'">
          <ProfileBlock title="GitHub" :stats="profile.details.code.stats" />
          <section class="list-block">
            <h3>Repos</h3>
            <ul>
              <li v-for="repo in profile.details.code.repos" :key="repo.name">
                <a :href="repo.url" target="_blank" rel="noopener noreferrer">
                  <div>
                    <strong>{{ repo.name }}</strong>
                    <span>{{ repo.description || 'No description' }}</span>
                  </div>
                  <em>{{ repo.language || 'Repo' }}</em>
                </a>
              </li>
            </ul>
          </section>
        </template>
      </div>

      <section class="deck__links" aria-label="Elsewhere">
        <h3>Elsewhere</h3>
        <ul>
          <li v-for="link in profile.links" :key="link.id">
            <a :href="link.url" target="_blank" rel="noopener noreferrer">
              <span>{{ link.label }}</span>
              <span>{{ link.detail }}</span>
            </a>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<style scoped>
.deck {
  position: relative;
  padding: 0 0 clamp(3rem, 8vw, 5rem);
  background: var(--bg);
  color: var(--ink);
  overflow: clip;
}

.deck__banner {
  height: clamp(10rem, 28vw, 16rem);
  overflow: hidden;
  background: oklch(0.22 0.05 145);
}

.deck__banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
}

.deck__banner-fade {
  position: absolute;
  inset: 0 0 auto;
  height: clamp(10rem, 28vw, 16rem);
  background: linear-gradient(to bottom, oklch(0.14 0.04 145 / 0.2), var(--bg) 92%);
  pointer-events: none;
}

.deck__inner {
  position: relative;
  z-index: 1;
  max-width: 72rem;
  margin: -3.5rem auto 0;
  padding: 0 clamp(1rem, 4vw, 2.5rem);
}

.deck__intro {
  margin-bottom: 1.25rem;
}

.deck__kicker {
  margin: 0 0 0.25rem;
  font-family: var(--font-display);
  color: var(--primary);
}

.deck__intro h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 6vw, 3.4rem);
  line-height: 0.95;
  letter-spacing: -0.03em;
}

.deck__place {
  margin: 0.4rem 0 0;
  font-weight: 700;
  color: var(--primary);
}

.deck__tagline {
  margin: 0.65rem 0 1rem;
  max-width: 46ch;
  color: var(--muted);
  text-wrap: pretty;
}

.deck__stats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr));
  gap: 0.65rem;
}

.deck__stats li {
  display: grid;
  gap: 0.1rem;
}

.deck__stats strong {
  font-family: var(--font-display);
  font-size: 1.35rem;
  line-height: 1;
}

.deck__stats span {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--primary);
}

.deck__stats em {
  font-style: normal;
  font-size: 0.8rem;
  color: var(--muted);
}

.deck__mosaic {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.35rem;
  margin: 0 0 1.25rem;
  border-radius: 0.35rem;
  overflow: hidden;
}

.deck__mosaic img {
  aspect-ratio: 2 / 3;
  width: 100%;
  object-fit: cover;
  background: oklch(0.28 0.05 145);
}

@media (max-width: 720px) {
  .deck__mosaic {
    grid-template-columns: repeat(4, 1fr);
  }

  .deck__mosaic img:nth-child(n + 5) {
    display: none;
  }
}

.deck__tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.45rem;
  margin-bottom: 0.85rem;
}

.deck__tabs button {
  position: relative;
  display: grid;
  align-content: end;
  min-height: 4.75rem;
  padding: 0.45rem 0.55rem;
  overflow: hidden;
  border: 2px solid oklch(0.35 0.06 145 / 0.18);
  border-radius: 0.3rem;
  background: oklch(0.22 0.05 145);
  color: oklch(0.98 0.01 145);
  font-weight: 700;
  cursor: pointer;
}

.deck__tabs img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
}

.deck__tabs span {
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 8px oklch(0.12 0.04 145 / 0.65);
}

.deck__tabs button::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, oklch(0.12 0.04 145 / 0.8), transparent 65%);
}

.deck__tabs button.active,
.deck__tabs button:hover {
  border-color: var(--accent);
}

.deck__blurb {
  margin: 0 0 1.25rem;
  color: var(--muted);
  max-width: 52ch;
}

.deck__blurb a {
  margin-left: 0.35rem;
  color: var(--primary);
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.split {
  display: grid;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 800px) {
  .split {
    grid-template-columns: 1fr 1fr;
  }
}

.split h3,
.list-block h3,
.artist-grid h3,
.game-strip h3,
.deck__links h3 {
  margin: 0 0 0.7rem;
  font-family: var(--font-display);
  font-size: 1.25rem;
}

.split ul,
.list-block ul,
.deck__links ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.4rem;
}

.split li,
.list-block li,
.list-block a,
.deck__links a {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
  padding: 0.5rem 0;
  border-bottom: 1px solid oklch(0.35 0.05 145 / 0.14);
}

.list-block a,
.deck__links a {
  text-decoration: none;
  color: inherit;
}

.list-block a:hover strong,
.deck__links a:hover {
  color: var(--primary);
}

.list-block div {
  display: grid;
  gap: 0.12rem;
}

.list-block strong,
.split strong,
.artist-grid strong,
.game-strip strong {
  font-family: var(--font-display);
}

.list-block span,
.note,
.deck__links a span:last-child {
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 500;
}

.list-block em,
.artist-grid em {
  font-style: normal;
  font-variant-numeric: tabular-nums;
  color: var(--primary);
  font-weight: 700;
}

.artist-grid {
  margin-bottom: 1.5rem;
}

.artist-grid ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}

.artist-grid li {
  display: grid;
  grid-template-columns: 2rem 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.65rem 0.7rem;
  border: 2px solid oklch(0.35 0.06 145 / 0.14);
  border-radius: 0.3rem;
  background: oklch(1 0.01 145 / 0.45);
}

.artist-grid__rank {
  font-family: var(--font-display);
  color: var(--primary);
}

.artist-grid div {
  display: grid;
  gap: 0.1rem;
}

.artist-grid span {
  color: var(--muted);
  font-size: 0.85rem;
}

.game-strip ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.55rem;
}

.game-strip li {
  min-height: 4.5rem;
  display: grid;
  place-items: center;
  padding: 0.75rem;
  border-radius: 0.3rem;
  text-align: center;
  color: oklch(0.98 0.01 145);
  background: linear-gradient(145deg, oklch(0.35 0.08 145), oklch(0.22 0.05 145));
}

.note {
  margin: 0.85rem 0 0;
}

.deck__links {
  margin-top: 1.5rem;
}

.deck__links a {
  font-weight: 700;
}

@media (max-width: 640px) {
  .deck__tabs {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
