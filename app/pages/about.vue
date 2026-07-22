<script setup lang="ts">
import type { ProfileResponse } from '../../shared/types/profile'

useSeoMeta({
  title: 'The story — GenZerg',
  description: 'Who GenZerg is: Thailand-rooted anime, film, music, and Steam culture.',
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
    <div class="about__glow" aria-hidden="true" />

    <header class="about__top">
      <NuxtLink class="about__brand" to="/">GenZerg</NuxtLink>
      <NuxtLink class="about__back" to="/">Back to canopy</NuxtLink>
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
          <p class="about__kicker">The story</p>
          <p v-if="profile.location" class="about__place">{{ profile.location }}</p>
        </div>
      </div>
      <template v-else>
        <p class="about__kicker">The story</p>
      </template>

      <h1 class="about__title">There’s a story here worth exploring.</h1>
      <p>
        GenZerg is a living showcase — work, voice, and vibe for creators who feel something before they read a bio.
        Playful, bold, curious. More like looking up through a forest than scrolling a pitch deck.
      </p>
      <p>
        The public trail is already thick: hundreds of anime on AniList, a deep Letterboxd diary,
        Last.fm scrobbles since 2023, and a Steam account that’s been growing since 2013.
        Favorites lean Hunter × Hunter, Fullmetal Alchemist: Brotherhood, Yu Yu Hakusho, GTO, and Hinamatsuri —
        action and heart with room for comedy.
      </p>
      <p>
        Playlists swing from ONE OK ROCK and Pierce the Veil to Yorushika, ZUTOMAYO, and Sakurazaka46.
        The canopy keeps changing. Come back for the next growth.
      </p>

      <ul v-if="profile?.highlights?.length" class="about__facts">
        <li v-for="item in profile.highlights" :key="item.label">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </li>
      </ul>

      <p class="about__cta-row">
        <a
          v-if="primaryLink"
          class="btn"
          :href="primaryLink.url"
          target="_blank"
          rel="noopener noreferrer"
        >{{ primaryLink.label }}</a>
        <a
          class="btn"
          href="https://github.com/GenZerg"
          target="_blank"
          rel="noopener noreferrer"
        >GitHub</a>
        <NuxtLink class="btn btn--quiet" to="/#exhibit">Browse the grove</NuxtLink>
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
  background:
    radial-gradient(ellipse 70% 50% at 80% 0%, oklch(0.72 0.12 145 / 0.25), transparent 60%),
    radial-gradient(ellipse 50% 40% at 0% 100%, oklch(0.85 0.1 95 / 0.18), transparent 55%),
    var(--bg);
  color: var(--ink);
  overflow: clip;
}

.about__glow {
  position: absolute;
  inset: auto -10% 40% auto;
  width: min(28rem, 70vw);
  height: min(28rem, 70vw);
  background: radial-gradient(circle, oklch(0.85 0.12 95 / 0.22), transparent 70%);
  animation: drift 12s ease-in-out infinite;
  pointer-events: none;
}

.about__top {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1.25rem, 4vw, 3rem);
}

.about__brand {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: -0.02em;
}

.about__back {
  font-weight: 600;
  text-decoration: none;
  color: var(--primary);
}

.about__back:hover {
  color: oklch(0.4 0.14 145);
}

.about__body {
  position: relative;
  z-index: 1;
  max-width: 40rem;
  margin: 0 auto;
  padding: var(--space-4) clamp(1.25rem, 4vw, 3rem) var(--space-5);
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
  border: 2px solid oklch(0.35 0.06 145 / 0.2);
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

@keyframes drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-24px, 18px, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .about__body,
  .about__glow {
    animation: none;
  }
}
</style>
