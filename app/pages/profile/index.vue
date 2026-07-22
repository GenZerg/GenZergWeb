<script setup lang="ts">
import type { ProfileResponse } from '../../../shared/types/profile'

useSeoMeta({
  title: 'Profile — GenZerg',
  description: 'GenZerg profile: anime, films, music, Steam, and code from Pathumthani.',
})

const { data: profile } = await useFetch<ProfileResponse>('/api/profile', {
  lazy: true,
  default: () => null,
})

const maxGenre = computed(() =>
  Math.max(1, ...(profile.value?.genres.map((entry) => entry.count) ?? [1])),
)

const mosaic = computed(() => {
  const covers = [
    ...(profile.value?.details.anime.favorites.map((item) => item.image) ?? []),
    ...(profile.value?.details.films.topRated.map((item) => item.image) ?? []),
    ...(profile.value?.details.anime.topRated.map((item) => item.image) ?? []),
  ].filter(Boolean) as string[]
  return [...new Set(covers)].slice(0, 8)
})
</script>

<template>
  <main class="page">
    <ProfileShell v-if="profile" :profile="profile" active="overview">
      <section v-if="mosaic.length" class="mosaic" aria-label="Cover mosaic">
        <img
          v-for="(src, index) in mosaic"
          :key="`${src}-${index}`"
          :src="src"
          alt=""
          loading="lazy"
          decoding="async"
        >
      </section>

      <ProfileBlock
        title="Snapshot"
        :stats="profile.highlights.map((h) => ({ label: h.label, value: h.value, hint: h.hint }))"
      />

      <div class="overview">
        <section>
          <h2>Jump in</h2>
          <ul class="overview__cats">
            <li
              v-for="category in profile.categories.filter((c) => c.id !== 'overview')"
              :key="category.id"
            >
              <NuxtLink :to="category.href">
                <span class="overview__cover">
                  <img v-if="category.cover" :src="category.cover" :alt="category.label" loading="lazy">
                </span>
                <span>
                  <strong>{{ category.label }}</strong>
                  <span>{{ category.blurb }}</span>
                </span>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <section v-if="profile.genres.length">
          <h2>Genres</h2>
          <ul class="overview__genres">
            <li v-for="genre in profile.genres" :key="genre.genre">
              <span>{{ genre.genre }}</span>
              <span class="bar" :style="{ '--fill': `${(genre.count / maxGenre) * 100}%` }" />
              <span>{{ genre.count }}</span>
            </li>
          </ul>
        </section>
      </div>

      <ProfileBlock
        title="Favorites"
        :items="profile.details.anime.favorites"
        empty="No favorites yet."
        large
      />

      <ProfileBlock title="Elsewhere">
        <ul class="overview__links">
          <li v-for="link in profile.links" :key="link.id">
            <a :href="link.url" target="_blank" rel="noopener noreferrer">
              <span>{{ link.label }}</span>
              <span>{{ link.detail }}</span>
            </a>
          </li>
        </ul>
      </ProfileBlock>
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

.mosaic {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.35rem;
  margin: 0 0 1.5rem;
  border-radius: 0.4rem;
  overflow: hidden;
}

.mosaic img {
  aspect-ratio: 2 / 3;
  width: 100%;
  object-fit: cover;
  background: oklch(0.28 0.05 145);
}

@media (max-width: 720px) {
  .mosaic {
    grid-template-columns: repeat(4, 1fr);
  }

  .mosaic img:nth-child(n + 5) {
    display: none;
  }
}

.overview {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 900px) {
  .overview {
    grid-template-columns: 1.15fr 0.85fr;
  }
}

.overview h2 {
  margin: 0 0 0.75rem;
  font-family: var(--font-display);
  font-size: 1.35rem;
}

.overview__cats,
.overview__genres,
.overview__links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}

.overview__cats a {
  display: grid;
  grid-template-columns: 3.4rem 1fr;
  gap: 0.75rem;
  align-items: center;
  padding: 0.45rem;
  border: 2px solid oklch(0.35 0.06 145 / 0.16);
  border-radius: 0.35rem;
  text-decoration: none;
  background: oklch(1 0.01 145 / 0.5);
}

.overview__cats a:hover {
  border-color: var(--primary);
}

.overview__cover {
  display: block;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border-radius: 0.2rem;
  background: oklch(0.28 0.05 145);
}

.overview__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overview__cats strong {
  display: block;
  font-family: var(--font-display);
  margin-bottom: 0.15rem;
}

.overview__cats a > span:last-child > span {
  color: var(--muted);
  font-size: 0.88rem;
}

.overview__genres li {
  display: grid;
  grid-template-columns: 7rem 1fr 2.5rem;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.85rem;
}

.bar {
  position: relative;
  height: 0.5rem;
  border-radius: 999px;
  background: oklch(0.35 0.05 145 / 0.12);
  overflow: hidden;
}

.bar::after {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--fill);
  background: linear-gradient(90deg, oklch(0.5 0.14 145), oklch(0.78 0.15 95));
}

.overview__links a {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid oklch(0.35 0.05 145 / 0.14);
  text-decoration: none;
  font-weight: 700;
}

.overview__links a span:last-child {
  font-weight: 500;
  color: var(--muted);
  text-align: right;
}

.overview__links a:hover {
  color: var(--primary);
}
</style>
