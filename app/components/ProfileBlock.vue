<script setup lang="ts">
import type { ProfileMediaItem, ProfileStat } from '../../shared/types/profile'

defineProps<{
  title: string
  stats?: ProfileStat[]
  items?: ProfileMediaItem[]
  empty?: string
}>()
</script>

<template>
  <section class="block">
    <div class="block__head">
      <h2>{{ title }}</h2>
      <ul v-if="stats?.length" class="block__stats">
        <li v-for="stat in stats" :key="stat.label">
          <strong>{{ stat.value }}</strong>
          <span>{{ stat.label }}</span>
          <em v-if="stat.hint">{{ stat.hint }}</em>
        </li>
      </ul>
    </div>

    <ul v-if="items?.length" class="block__grid">
      <li v-for="item in items" :key="item.id">
        <a :href="item.url" target="_blank" rel="noopener noreferrer">
          <span class="block__media">
            <img v-if="item.image" :src="item.image" :alt="item.title" loading="lazy" decoding="async">
            <span v-else class="block__fallback" aria-hidden="true">{{ item.subtitle || '·' }}</span>
          </span>
          <span class="block__meta">
            <span v-if="item.subtitle" class="block__sub">{{ item.subtitle }}</span>
            <span class="block__title">{{ item.title }}</span>
            <span v-if="item.meta" class="block__hint">{{ item.meta }}</span>
          </span>
        </a>
      </li>
    </ul>
    <p v-else-if="empty" class="block__empty">{{ empty }}</p>
    <slot />
  </section>
</template>

<style scoped>
.block {
  margin-bottom: clamp(1.75rem, 4vw, 2.75rem);
}

.block__head {
  display: grid;
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.block__head h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 3vw, 1.8rem);
}

.block__stats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
  gap: 0.65rem;
}

.block__stats li {
  display: grid;
  gap: 0.1rem;
}

.block__stats strong {
  font-family: var(--font-display);
  font-size: 1.35rem;
  line-height: 1;
}

.block__stats span {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--primary);
}

.block__stats em {
  font-style: normal;
  font-size: 0.8rem;
  color: var(--muted);
}

.block__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
  gap: 0.85rem;
}

.block__grid a {
  display: grid;
  gap: 0.45rem;
  text-decoration: none;
}

.block__media {
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border-radius: 0.25rem;
  background: oklch(0.28 0.05 145);
}

.block__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s var(--ease-out);
}

.block__grid a:hover .block__media img {
  transform: scale(1.05);
}

.block__fallback {
  display: grid;
  place-items: center;
  height: 100%;
  color: oklch(0.92 0.03 145 / 0.7);
  font-family: var(--font-display);
  font-size: 0.8rem;
  text-align: center;
  padding: 0.5rem;
}

.block__meta {
  display: grid;
  gap: 0.12rem;
}

.block__sub,
.block__hint {
  font-size: 0.75rem;
  color: var(--muted);
}

.block__sub {
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--primary);
}

.block__title {
  font-family: var(--font-display);
  font-size: 0.95rem;
  line-height: 1.15;
  text-wrap: balance;
}

.block__empty {
  margin: 0;
  color: var(--muted);
}
</style>
