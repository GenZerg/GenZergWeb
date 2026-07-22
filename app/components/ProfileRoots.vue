<script setup lang="ts">
import type { ProfileResponse } from '../../shared/types/profile'

const props = defineProps<{
  profile: ProfileResponse | null
}>()

const maxGenre = computed(() =>
  Math.max(1, ...(props.profile?.genres.map((entry) => entry.count) ?? [1])),
)
</script>

<template>
  <section v-if="profile" class="roots" aria-labelledby="roots-title">
    <div class="roots__inner">
      <div class="roots__intro">
        <p class="roots__kicker">The roots</p>
        <h2 id="roots-title">Who’s under the canopy</h2>
        <p class="roots__lede">{{ profile.tagline }}</p>
        <p v-if="profile.location" class="roots__place">{{ profile.location }}</p>

        <ul class="roots__highlights">
          <li v-for="item in profile.highlights" :key="item.label">
            <span class="roots__value">{{ item.value }}</span>
            <span class="roots__label">{{ item.label }}</span>
            <span v-if="item.hint" class="roots__hint">{{ item.hint }}</span>
          </li>
        </ul>
      </div>

      <div class="roots__panels">
        <div v-if="profile.favorites.length" class="roots__block">
          <h3>AniList favorites</h3>
          <ul class="roots__favs">
            <li v-for="fav in profile.favorites" :key="fav.id">
              <a :href="fav.url" target="_blank" rel="noopener noreferrer">
                <img v-if="fav.cover" :src="fav.cover" :alt="fav.title" loading="lazy" decoding="async">
                <span>{{ fav.title }}</span>
              </a>
            </li>
          </ul>
        </div>

        <div v-if="profile.genres.length" class="roots__block">
          <h3>Genre soil</h3>
          <ul class="roots__genres">
            <li v-for="genre in profile.genres" :key="genre.genre">
              <span>{{ genre.genre }}</span>
              <span
                class="roots__bar"
                :style="{ '--fill': `${(genre.count / maxGenre) * 100}%` }"
                :title="`${genre.count} titles`"
              />
              <span class="roots__count">{{ genre.count }}</span>
            </li>
          </ul>
        </div>

        <div class="roots__block">
          <h3>Listening flavor</h3>
          <ul class="roots__listen">
            <li v-for="artist in profile.listeningFlavor" :key="artist.name">
              <strong>{{ artist.name }}</strong>
              <span>{{ artist.detail }}</span>
            </li>
          </ul>
        </div>

        <div class="roots__block">
          <h3>Browse by category</h3>
          <ul class="roots__links">
            <li v-for="category in profile.categories.filter((c) => c.id !== 'overview')" :key="category.id">
              <NuxtLink :to="category.href">
                <span class="roots__link-label">{{ category.label }}</span>
                <span class="roots__link-detail">{{ category.blurb }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.roots {
  padding: clamp(2.5rem, 7vw, 4.5rem) clamp(1rem, 4vw, 2.5rem);
  background:
    radial-gradient(ellipse 60% 50% at 100% 0%, oklch(0.82 0.1 95 / 0.2), transparent 55%),
    linear-gradient(180deg, oklch(0.97 0.015 145), oklch(0.93 0.025 145));
  color: var(--ink);
}

.roots__inner {
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  gap: clamp(1.75rem, 4vw, 2.75rem);
}

@media (min-width: 960px) {
  .roots__inner {
    grid-template-columns: minmax(16rem, 0.9fr) 1.2fr;
    align-items: start;
  }
}

.roots__kicker {
  margin: 0 0 0.4rem;
  font-family: var(--font-display);
  font-size: 0.95rem;
  color: var(--primary);
}

.roots__intro h2 {
  margin: 0 0 0.55rem;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.roots__lede {
  margin: 0 0 0.75rem;
  max-width: 36ch;
  color: var(--muted);
  text-wrap: pretty;
}

.roots__place {
  margin: 0 0 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

.roots__highlights {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.roots__highlights li {
  display: grid;
  gap: 0.15rem;
}

.roots__value {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  line-height: 1;
  letter-spacing: -0.02em;
}

.roots__label {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--primary);
}

.roots__hint {
  font-size: 0.85rem;
  color: var(--muted);
}

.roots__panels {
  display: grid;
  gap: 1.25rem;
}

@media (min-width: 720px) {
  .roots__panels {
    grid-template-columns: 1fr 1fr;
  }
}

.roots__block h3 {
  margin: 0 0 0.7rem;
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--primary);
}

.roots__favs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}

.roots__favs a {
  display: grid;
  grid-template-columns: 2.75rem 1fr;
  gap: 0.65rem;
  align-items: center;
  text-decoration: none;
  font-family: var(--font-display);
  font-size: 0.95rem;
  line-height: 1.2;
}

.roots__favs img {
  width: 2.75rem;
  height: 3.9rem;
  object-fit: cover;
  border-radius: 0.2rem;
  background: oklch(0.28 0.05 145);
}

.roots__favs a:hover {
  color: var(--primary);
}

.roots__genres,
.roots__listen,
.roots__links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}

.roots__genres li {
  display: grid;
  grid-template-columns: 6.5rem 1fr 2.5rem;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.85rem;
}

.roots__bar {
  position: relative;
  height: 0.5rem;
  border-radius: 999px;
  background: oklch(0.35 0.05 145 / 0.12);
  overflow: hidden;
}

.roots__bar::after {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--fill);
  background: linear-gradient(90deg, oklch(0.5 0.14 145), oklch(0.78 0.15 95));
  border-radius: inherit;
}

.roots__count {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.roots__listen li,
.roots__links a {
  display: grid;
  gap: 0.1rem;
}

.roots__listen strong {
  font-family: var(--font-display);
}

.roots__listen span,
.roots__link-detail {
  font-size: 0.85rem;
  color: var(--muted);
}

.roots__links a,
.roots__links :deep(a) {
  display: grid;
  gap: 0.1rem;
  text-decoration: none;
  padding: 0.45rem 0;
  border-bottom: 1px solid oklch(0.35 0.05 145 / 0.12);
  color: inherit;
}

.roots__links a:hover .roots__link-label,
.roots__links :deep(a:hover) .roots__link-label {
  color: var(--primary);
}

.roots__link-label {
  font-weight: 700;
}
</style>
