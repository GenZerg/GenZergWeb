<script setup lang="ts">
import type { ProfileResponse } from '../../shared/types/profile'

useSeoMeta({
  title: 'Story — GenZerg',
  description: 'Who GenZerg is: Pathumthani lists, Steam nights, and public builds.',
})

const { data: profile } = await useFetch<ProfileResponse>('/api/profile', {
  lazy: true,
  default: () => null,
})

const primaryLink = computed(() =>
  profile.value?.links.find((link) => link.id === 'anilist')
  || profile.value?.links[0]
  || null,
)
</script>

<template>
  <main class="about">
    <div class="about__banner" aria-hidden="true">
      <img
        v-if="profile?.banner"
        :src="profile.banner"
        alt=""
        decoding="async"
      >
      <div class="about__banner-fade" />
    </div>

    <header class="about__top">
      <NuxtLink class="about__brand" to="/">GenZerg</NuxtLink>
      <nav class="about__nav">
        <NuxtLink to="/profile">Profile</NuxtLink>
        <NuxtLink to="/">Home</NuxtLink>
      </nav>
    </header>

    <article class="about__body">
      <div v-if="profile?.avatar" class="about__identity">
        <img
          :src="profile.avatar"
          alt=""
          width="72"
          height="72"
          decoding="async"
        >
        <div>
          <p class="about__kicker">Story</p>
          <p v-if="profile.location" class="about__place">{{ profile.location }}</p>
        </div>
      </div>
      <template v-else>
        <p class="about__kicker">Story</p>
      </template>

      <h1 class="about__title">The lists are the bio.</h1>
      <p>
        GenZerg is a Pathumthani handle with a long AniList, a Letterboxd diary past 500,
        Last.fm scrobbling since 2023, and a Steam account from 2013.
      </p>
      <p>
        Favorites stay locked: Hunter × Hunter, Fullmetal Alchemist: Brotherhood,
        Yu Yu Hakusho, GTO, Hinamatsuri. Playlists swing ONE OK ROCK to Sakurazaka46.
        No pitch deck. Just the public trail.
      </p>

      <ul v-if="profile?.highlights?.length" class="about__facts">
        <li v-for="item in profile.highlights" :key="item.label">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </li>
      </ul>

      <div v-if="profile?.details.anime.favorites?.length" class="about__covers">
        <a
          v-for="fav in profile.details.anime.favorites"
          :key="fav.id"
          :href="fav.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img v-if="fav.image" :src="fav.image" :alt="fav.title" loading="lazy">
        </a>
      </div>

      <p class="about__cta-row">
        <NuxtLink class="btn" to="/profile">Open profile</NuxtLink>
        <a
          v-if="primaryLink"
          class="btn btn--quiet"
          :href="primaryLink.url"
          target="_blank"
          rel="noopener noreferrer"
        >{{ primaryLink.label }}</a>
      </p>

      <ul v-if="profile?.links?.length" class="about__links">
        <li v-for="link in profile.links" :key="link.id">
          <a :href="link.url" target="_blank" rel="noopener noreferrer">
            <span>{{ link.label }}</span>
            <span>{{ link.detail }}</span>
          </a>
        </li>
      </ul>
    </article>
  </main>
</template>

<style scoped>
.about {
  position: relative;
  min-height: 100dvh;
  background: var(--bg);
  color: var(--ink);
  overflow: clip;
}

.about__banner {
  position: absolute;
  inset: 0 0 auto;
  height: clamp(12rem, 32vw, 18rem);
  overflow: hidden;
  background: oklch(0.22 0.05 145);
}

.about__banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
}

.about__banner-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, oklch(0.14 0.04 145 / 0.2), var(--bg) 90%);
}

.about__top {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1.25rem, 4vw, 3rem);
  color: oklch(0.98 0.01 145);
  text-shadow: 0 1px 8px oklch(0.12 0.04 145 / 0.4);
}

.about__brand {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: -0.02em;
  color: inherit;
}

.about__nav {
  display: flex;
  gap: 0.9rem;
}

.about__nav a {
  font-weight: 600;
  text-decoration: none;
  color: inherit;
}

.about__nav a:hover {
  color: var(--accent);
}

.about__body {
  position: relative;
  z-index: 1;
  max-width: 40rem;
  margin: clamp(3rem, 10vw, 6rem) auto 0;
  padding: 0 clamp(1.25rem, 4vw, 3rem) var(--space-5);
  animation: rise 0.7s var(--ease-out) both;
}

.about__identity {
  display: flex;
  gap: 0.9rem;
  align-items: center;
  margin-bottom: var(--space-2);
}

.about__identity img {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 0.35rem;
  object-fit: cover;
  border: 2px solid oklch(0.98 0.01 145);
}

.about__kicker {
  margin: 0 0 0.2rem;
  font-family: var(--font-display);
  font-size: 0.95rem;
  color: var(--primary);
}

.about__place {
  margin: 0;
  font-weight: 700;
  color: var(--muted);
}

.about__title {
  margin: 0 0 var(--space-3);
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.about__body > p {
  margin: 0 0 var(--space-3);
  max-width: 58ch;
  text-wrap: pretty;
  color: var(--muted);
}

.about__body > .about__title + p {
  color: var(--ink);
  font-size: 1.125rem;
}

.about__facts {
  list-style: none;
  margin: 0 0 var(--space-3);
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.about__facts li {
  display: grid;
  gap: 0.15rem;
}

.about__facts strong {
  font-family: var(--font-display);
  font-size: 1.45rem;
  line-height: 1;
}

.about__facts span {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--primary);
}

.about__covers {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.4rem;
  margin: 0 0 var(--space-3);
}

.about__covers img {
  aspect-ratio: 2 / 3;
  width: 100%;
  object-fit: cover;
  border-radius: 0.2rem;
  background: oklch(0.28 0.05 145);
}

.about__cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: var(--space-4) !important;
}

.about__links {
  list-style: none;
  margin: var(--space-4) 0 0;
  padding: 0;
  display: grid;
  gap: 0.35rem;
}

.about__links a {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid oklch(0.35 0.05 145 / 0.14);
  text-decoration: none;
  font-weight: 700;
}

.about__links a span:last-child {
  font-weight: 500;
  color: var(--muted);
  text-align: right;
}

.about__links a:hover {
  color: var(--primary);
}

.btn {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0.65rem 1.15rem;
  border-radius: 0.35rem;
  font-weight: 700;
  text-decoration: none;
  background: var(--primary);
  color: oklch(0.99 0.01 145);
  border: 2px solid oklch(0.38 0.12 145);
  transition: filter 0.2s var(--ease-out), transform 0.2s var(--ease-spring);
}

.btn--quiet {
  background: transparent;
  color: var(--ink);
  border-color: oklch(0.35 0.06 145 / 0.35);
}

.btn:hover {
  filter: brightness(1.05);
}

.btn:active {
  transform: translateY(1px);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .about__body {
    animation: none;
  }
}
</style>
