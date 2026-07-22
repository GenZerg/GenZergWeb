<script setup lang="ts">
import type { ProfileCategoryId, ProfileCategoryMeta, ProfileResponse } from '../../shared/types/profile'

const props = defineProps<{
  profile: ProfileResponse
  active: ProfileCategoryId
}>()

const activeMeta = computed<ProfileCategoryMeta | undefined>(() =>
  props.profile.categories.find((category) => category.id === props.active),
)
</script>

<template>
  <div class="shell">
    <header class="shell__top">
      <NuxtLink class="shell__brand" to="/">GenZerg</NuxtLink>
      <nav class="shell__links" aria-label="Site">
        <NuxtLink to="/profile">Profile</NuxtLink>
        <NuxtLink to="/about">Story</NuxtLink>
        <NuxtLink to="/#exhibit">Grove</NuxtLink>
      </nav>
    </header>

    <div class="shell__hero">
      <img
        v-if="profile.avatar"
        class="shell__avatar"
        :src="profile.avatar"
        alt=""
        width="88"
        height="88"
        decoding="async"
      >
      <div>
        <p class="shell__kicker">Profile</p>
        <h1>{{ profile.handle }}</h1>
        <p v-if="profile.location" class="shell__place">{{ profile.location }}</p>
        <p class="shell__tagline">{{ profile.tagline }}</p>
      </div>
    </div>

    <nav class="shell__cats" aria-label="Profile categories">
      <NuxtLink
        v-for="category in profile.categories"
        :key="category.id"
        :to="category.href"
        :class="{ active: category.id === active }"
      >
        {{ category.label }}
      </NuxtLink>
    </nav>

    <p v-if="activeMeta" class="shell__blurb">
      {{ activeMeta.blurb }}
      <a :href="activeMeta.sourceUrl" target="_blank" rel="noopener noreferrer">
        Open {{ activeMeta.sourceLabel }}
      </a>
    </p>

    <slot />
  </div>
</template>

<style scoped>
.shell {
  max-width: 72rem;
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 4vw, 2.5rem) clamp(3rem, 8vw, 5rem);
}

.shell__top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1.5rem;
}

.shell__brand {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: -0.02em;
}

.shell__links {
  display: flex;
  gap: 0.9rem;
}

.shell__links a {
  text-decoration: none;
  font-weight: 600;
  color: var(--primary);
}

.shell__hero {
  display: grid;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.25rem;
}

@media (min-width: 640px) {
  .shell__hero {
    grid-template-columns: auto 1fr;
    gap: 1.25rem;
  }
}

.shell__avatar {
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 0.4rem;
  object-fit: cover;
  border: 2px solid oklch(0.35 0.06 145 / 0.22);
}

.shell__kicker {
  margin: 0 0 0.2rem;
  font-family: var(--font-display);
  color: var(--primary);
}

.shell__hero h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 6vw, 3.4rem);
  line-height: 0.95;
  letter-spacing: -0.03em;
}

.shell__place {
  margin: 0.35rem 0 0;
  font-weight: 700;
  color: var(--primary);
}

.shell__tagline {
  margin: 0.55rem 0 0;
  max-width: 48ch;
  color: var(--muted);
  text-wrap: pretty;
}

.shell__cats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin: 1.25rem 0 0.85rem;
}

.shell__cats a {
  min-height: 2.35rem;
  padding: 0.4rem 0.85rem;
  border: 2px solid oklch(0.35 0.06 145 / 0.22);
  border-radius: 0.3rem;
  text-decoration: none;
  font-weight: 700;
  background: oklch(1 0.01 145 / 0.55);
}

.shell__cats a.active,
.shell__cats a:hover {
  border-color: oklch(0.55 0.14 145);
  color: var(--primary);
}

.shell__blurb {
  margin: 0 0 1.5rem;
  color: var(--muted);
}

.shell__blurb a {
  margin-left: 0.35rem;
  color: var(--primary);
  font-weight: 700;
  text-decoration: none;
}
</style>
