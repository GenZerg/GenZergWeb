<script setup lang="ts">
import type { ProfileCategoryId, ProfileCategoryMeta, ProfileResponse } from '../../shared/types/profile'

const props = defineProps<{
  profile: ProfileResponse
  active: ProfileCategoryId
}>()

const activeMeta = computed<ProfileCategoryMeta | undefined>(() =>
  props.profile.categories.find((category) => category.id === props.active),
)

const cover = computed(() => activeMeta.value?.cover || props.profile.banner || props.profile.avatar)
</script>

<template>
  <div class="shell">
    <div class="shell__banner" aria-hidden="true">
      <img
        v-if="cover"
        :src="cover"
        alt=""
        decoding="async"
        fetchpriority="high"
      >
      <div class="shell__banner-fade" />
    </div>

    <div class="shell__inner">
      <header class="shell__top">
        <NuxtLink class="shell__brand" to="/">GenZerg</NuxtLink>
        <nav class="shell__links" aria-label="Site">
          <NuxtLink to="/profile">Profile</NuxtLink>
          <NuxtLink to="/about">Story</NuxtLink>
          <NuxtLink to="/#exhibit">Now</NuxtLink>
        </nav>
      </header>

      <div class="shell__hero">
        <img
          v-if="profile.avatar"
          class="shell__avatar"
          :src="profile.avatar"
          alt=""
          width="112"
          height="112"
          decoding="async"
        >
        <div>
          <p class="shell__kicker">{{ activeMeta?.label || 'Profile' }}</p>
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
          <img v-if="category.cover" :src="category.cover" alt="" loading="lazy" decoding="async">
          <span>{{ category.label }}</span>
        </NuxtLink>
      </nav>

      <p v-if="activeMeta" class="shell__blurb">
        {{ activeMeta.blurb }}
        <a :href="activeMeta.sourceUrl" target="_blank" rel="noopener noreferrer">
          {{ activeMeta.sourceLabel }} ↗
        </a>
      </p>

      <slot />
    </div>
  </div>
</template>

<style scoped>
.shell {
  position: relative;
  min-height: 100dvh;
  color: var(--ink);
  background: var(--bg);
  overflow: clip;
}

.shell__banner {
  position: absolute;
  inset: 0 0 auto;
  height: clamp(14rem, 38vw, 22rem);
  overflow: hidden;
  background: oklch(0.22 0.05 145);
}

.shell__banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 28%;
  filter: saturate(1.05) contrast(1.05);
  transform: scale(1.04);
}

.shell__banner-fade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, oklch(0.14 0.04 145 / 0.15), oklch(0.96 0.02 145) 92%),
    linear-gradient(90deg, oklch(0.14 0.04 145 / 0.35), transparent 45%);
}

.shell__inner {
  position: relative;
  z-index: 1;
  max-width: 72rem;
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2.5rem) clamp(3rem, 8vw, 5rem);
}

.shell__top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: clamp(4.5rem, 14vw, 8rem);
  color: oklch(0.98 0.01 145);
  text-shadow: 0 1px 10px oklch(0.12 0.04 145 / 0.45);
}

.shell__brand {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: -0.02em;
  color: inherit;
}

.shell__links {
  display: flex;
  gap: 0.85rem;
}

.shell__links a {
  text-decoration: none;
  font-weight: 600;
  color: inherit;
  opacity: 0.92;
}

.shell__links a:hover {
  color: var(--accent);
}

.shell__hero {
  display: grid;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1.35rem;
}

@media (min-width: 640px) {
  .shell__hero {
    grid-template-columns: auto 1fr;
    gap: 1.25rem;
  }
}

.shell__avatar {
  width: 6.5rem;
  height: 6.5rem;
  border-radius: 0.45rem;
  object-fit: cover;
  border: 3px solid oklch(0.98 0.01 145);
  box-shadow: 0 10px 30px oklch(0.2 0.05 145 / 0.28);
  background: oklch(0.28 0.05 145);
}

.shell__kicker {
  margin: 0 0 0.2rem;
  font-family: var(--font-display);
  color: var(--primary);
}

.shell__hero h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 7vw, 4rem);
  line-height: 0.92;
  letter-spacing: -0.035em;
}

.shell__place {
  margin: 0.4rem 0 0;
  font-weight: 700;
  color: var(--primary);
}

.shell__tagline {
  margin: 0.65rem 0 0;
  max-width: 46ch;
  color: var(--muted);
  text-wrap: pretty;
}

.shell__cats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
  gap: 0.55rem;
  margin: 1.35rem 0 0.9rem;
}

.shell__cats a {
  position: relative;
  display: grid;
  align-content: end;
  min-height: 5.5rem;
  padding: 0.55rem 0.65rem;
  overflow: hidden;
  border: 2px solid oklch(0.35 0.06 145 / 0.18);
  border-radius: 0.35rem;
  text-decoration: none;
  color: oklch(0.98 0.01 145);
  font-weight: 700;
  background: oklch(0.22 0.05 145);
}

.shell__cats img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.72;
  transition: transform 0.4s var(--ease-out), opacity 0.3s var(--ease-out);
}

.shell__cats span {
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 8px oklch(0.12 0.04 145 / 0.65);
}

.shell__cats a::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, oklch(0.12 0.04 145 / 0.82), transparent 65%);
}

.shell__cats a.active,
.shell__cats a:hover {
  border-color: var(--accent);
}

.shell__cats a.active img,
.shell__cats a:hover img {
  opacity: 0.9;
  transform: scale(1.06);
}

.shell__blurb {
  margin: 0 0 1.6rem;
  color: var(--muted);
  max-width: 54ch;
}

.shell__blurb a {
  margin-left: 0.35rem;
  color: var(--primary);
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}
</style>
