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
  description: computed(() => `GenZerg ${active.value} profile category with live public data.`),
})
</script>

<template>
  <main class="page">
    <ProfileShell v-if="profile" :profile="profile" :active="active">
      <template v-if="active === 'anime'">
        <ProfileBlock title="Anime stats" :stats="profile.details.anime.stats" />
        <ProfileBlock title="Favorites" :items="profile.details.anime.favorites" />
        <ProfileBlock
          v-if="profile.details.anime.mangaFavorite"
          title="Manga favorite"
          :items="[profile.details.anime.mangaFavorite]"
        />
        <ProfileBlock title="Currently watching" :items="profile.details.anime.watching" />
        <ProfileBlock title="Score peaks (9–10)" :items="profile.details.anime.topRated" />

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
        <ProfileBlock title="Film diary" :stats="profile.details.films.stats" />
        <ProfileBlock title="Five-star & high rates" :items="profile.details.films.topRated" />
        <ProfileBlock title="Recent watches" :items="profile.details.films.recent" />
      </template>

      <template v-else-if="active === 'music'">
        <ProfileBlock title="Listening pulse" :stats="profile.details.music.stats" />

        <section class="list-block">
          <h2>Top artists (recent window)</h2>
          <ul>
            <li v-for="artist in profile.details.music.artists" :key="artist.name">
              <div>
                <strong>{{ artist.name }}</strong>
                <span>{{ artist.detail }}</span>
              </div>
              <em v-if="artist.plays">{{ artist.plays }} plays</em>
            </li>
          </ul>
        </section>

        <div class="split">
          <section class="list-block">
            <h2>Recent tracks</h2>
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
        <ProfileBlock title="Steam profile" :stats="profile.details.games.stats" />
        <section class="list-block">
          <h2>Recent activity</h2>
          <ul>
            <li v-for="game in profile.details.games.recentGames" :key="game">
              <div>
                <strong>{{ game }}</strong>
                <span>Recently played</span>
              </div>
            </li>
          </ul>
          <p v-for="note in profile.details.games.notes" :key="note" class="note">{{ note }}</p>
        </section>
      </template>

      <template v-else-if="active === 'code'">
        <ProfileBlock title="GitHub" :stats="profile.details.code.stats" />
        <section class="list-block">
          <h2>Public repos</h2>
          <ul>
            <li v-for="repo in profile.details.code.repos" :key="repo.name">
              <a :href="repo.url" target="_blank" rel="noopener noreferrer">
                <div>
                  <strong>{{ repo.name }}</strong>
                  <span>{{ repo.description || 'No description yet' }}</span>
                </div>
                <em>{{ repo.language || 'Repo' }}</em>
              </a>
            </li>
          </ul>
        </section>
      </template>
    </ProfileShell>

    <p v-else class="page__loading">Gathering the canopy…</p>
  </main>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  background:
    radial-gradient(ellipse 70% 40% at 90% 0%, oklch(0.78 0.1 145 / 0.2), transparent 55%),
    radial-gradient(ellipse 50% 35% at 0% 30%, oklch(0.88 0.1 95 / 0.16), transparent 50%),
    var(--bg);
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
.list-block h2 {
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
.split strong {
  font-family: var(--font-display);
}

.list-block span,
.note {
  color: var(--muted);
  font-size: 0.9rem;
}

.list-block em {
  font-style: normal;
  font-variant-numeric: tabular-nums;
  color: var(--primary);
  font-weight: 700;
}

.note {
  margin: 0.85rem 0 0;
}
</style>
