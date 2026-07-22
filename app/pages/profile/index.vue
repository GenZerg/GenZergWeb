<script setup lang="ts">
import type { ProfileResponse } from '../../../shared/types/profile'

useSeoMeta({
  title: 'Profile — GenZerg',
  description: 'GenZerg profile overview across anime, films, music, games, and code.',
})

const { data: profile } = await useFetch<ProfileResponse>('/api/profile', {
  lazy: true,
  default: () => null,
})

const maxGenre = computed(() =>
  Math.max(1, ...(profile.value?.genres.map((entry) => entry.count) ?? [1])),
)
</script>

<template>
  <main class="page">
    <ProfileShell v-if="profile" :profile="profile" active="overview">
      <ProfileBlock title="At a glance" :stats="profile.highlights.map((h) => ({ label: h.label, value: h.value, hint: h.hint }))" />

      <div class="overview">
        <section>
          <h2>Categories</h2>
          <ul class="overview__cats">
            <li v-for="category in profile.categories.filter((c) => c.id !== 'overview')" :key="category.id">
              <NuxtLink :to="category.href">
                <strong>{{ category.label }}</strong>
                <span>{{ category.blurb }}</span>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <section v-if="profile.genres.length">
          <h2>Genre soil</h2>
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
        title="AniList favorites"
        :items="profile.details.anime.favorites"
        empty="Favorites loading…"
      />

      <ProfileBlock title="Find GenZerg">
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

.overview {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 900px) {
  .overview {
    grid-template-columns: 1.1fr 0.9fr;
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
  gap: 0.5rem;
}

.overview__cats a {
  display: grid;
  gap: 0.2rem;
  padding: 0.75rem 0.85rem;
  border: 2px solid oklch(0.35 0.06 145 / 0.18);
  border-radius: 0.35rem;
  text-decoration: none;
  background: oklch(1 0.01 145 / 0.55);
}

.overview__cats a:hover {
  border-color: var(--primary);
}

.overview__cats strong {
  font-family: var(--font-display);
}

.overview__cats span {
  color: var(--muted);
  font-size: 0.9rem;
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
