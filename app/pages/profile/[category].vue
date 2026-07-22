<script setup lang="ts">
import type { ProfileCategoryId, ProfileResponse } from '../../../shared/types/profile'

const route = useRoute()
const categoryParam = computed(() => String(route.params.category || ''))

const allowed = new Set<ProfileCategoryId>(['anime', 'films', 'music', 'games', 'code'])

if (!allowed.has(categoryParam.value as ProfileCategoryId)) {
  throw createError({ statusCode: 404, statusMessage: 'Profile category not found' })
}

const active = computed(() => categoryParam.value as Exclude<ProfileCategoryId, 'overview'>)

watch(categoryParam, (value) => {
  if (!allowed.has(value as ProfileCategoryId)) {
    throw createError({ statusCode: 404, statusMessage: 'Profile category not found' })
  }
})

const { data: profile } = await useFetch<ProfileResponse>('/api/profile', {
  lazy: true,
  default: () => null,
})

const titleMap: Record<Exclude<ProfileCategoryId, 'overview'>, string> = {
  anime: 'Anime — GenZerg',
  films: 'Films — GenZerg',
  music: 'Music — GenZerg',
  games: 'Games — GenZerg',
  code: 'Code — GenZerg',
}

useSeoMeta({
  title: computed(() => titleMap[active.value]),
  description: computed(() => `GenZerg ${active.value} — covers, stats, and source links.`),
})
</script>

<template>
  <main class="page">
    <ProfileShell v-if="profile" :profile="profile" :active="active">
      <template v-if="active === 'anime'">
        <ProfileBlock title="Stats" :stats="profile.details.anime.stats" />
        <ProfileBlock title="Favorites" :items="profile.details.anime.favorites" large />
        <ProfileBlock
          v-if="profile.details.anime.mangaFavorite"
          title="Manga favorite"
          :items="[profile.details.anime.mangaFavorite]"
        />
        <ProfileBlock title="Watching now" :items="profile.details.anime.watching" large />
        <ProfileBlock title="Scored 9–10" :items="profile.details.anime.topRated" large />

        <div class="split">
          <section>
            <h2>Formats</h2>
            <ul>
              <li v-for="format in profile.details.anime.formats" :key="format.format">
                <span>{{ format.format }}</span>
                <strong>{{ format.count }}</strong>
              </li>
            </ul>
          </section>
          <section>
            <h2>Tags</h2>
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
        <ProfileBlock title="Recent" :items="profile.details.films.recent" large />
      </template>

      <template v-else-if="active === 'music'">
        <ProfileBlock title="Pulse" :stats="profile.details.music.stats" />

        <section class="artist-grid" aria-label="Top artists">
          <h2>Top artists</h2>
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

        <div class="split">
          <section class="list-block">
            <h2>Recent</h2>
            <ul>
              <li v-for="track in profile.details.music.recentTracks" :key="`${track.artist}-${track.name}`">
                <div>
                  <strong>{{ track.name }}</strong>
                  <span>{{ track.artist }}</span>
                </div>
              </li>
            </ul>
          </section>
          <section class="list-block">
            <h2>Loved</h2>
            <ul>
              <li v-for="track in profile.details.music.lovedTracks" :key="`${track.artist}-${track.name}`">
                <div>
                  <strong>{{ track.name }}</strong>
                  <span>{{ track.artist }}</span>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </template>

      <template v-else-if="active === 'games'">
        <ProfileBlock title="Steam" :stats="profile.details.games.stats" />
        <section class="games-strip">
          <h2>Recently played</h2>
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
          <h2>Repos</h2>
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
    </ProfileShell>

    <p v-else class="page__loading">Loading profile…</p>
  </main>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  background: var(--bg);
  color: var(--ink);
}

.page__loading {
  margin: 0;
  padding: 4rem 1.5rem;
  text-align: center;
  color: var(--muted);
}

.split {
  display: grid;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

@media (min-width: 800px) {
  .split {
    grid-template-columns: 1fr 1fr;
  }
}

.split h2,
.list-block h2,
.artist-grid h2,
.games-strip h2 {
  margin: 0 0 0.75rem;
  font-family: var(--font-display);
  font-size: 1.35rem;
}

.split ul,
.list-block ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}

.split li,
.list-block li,
.list-block a {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
  padding: 0.55rem 0;
  border-bottom: 1px solid oklch(0.35 0.05 145 / 0.14);
}

.list-block a {
  text-decoration: none;
  color: inherit;
}

.list-block a:hover strong {
  color: var(--primary);
}

.list-block div {
  display: grid;
  gap: 0.15rem;
}

.list-block strong,
.split strong,
.artist-grid strong,
.games-strip strong {
  font-family: var(--font-display);
}

.list-block span,
.note {
  color: var(--muted);
  font-size: 0.9rem;
}

.list-block em,
.artist-grid em {
  font-style: normal;
  font-variant-numeric: tabular-nums;
  color: var(--primary);
  font-weight: 700;
}

.artist-grid {
  margin-bottom: 2rem;
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
  padding: 0.7rem 0.75rem;
  border: 2px solid oklch(0.35 0.06 145 / 0.14);
  border-radius: 0.35rem;
  background: oklch(1 0.01 145 / 0.45);
}

.artist-grid__rank {
  font-family: var(--font-display);
  font-size: 1.2rem;
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

.games-strip ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.55rem;
}

.game-strip li {
  min-height: 5rem;
  display: grid;
  place-items: center;
  padding: 0.85rem;
  border-radius: 0.35rem;
  text-align: center;
  color: oklch(0.98 0.01 145);
  background:
    linear-gradient(145deg, oklch(0.35 0.08 145), oklch(0.22 0.05 145));
  border: 2px solid oklch(0.45 0.08 145 / 0.35);
}

.note {
  margin: 0.85rem 0 0;
}
</style>
