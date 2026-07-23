<script setup lang="ts">
import type { ProfileResponse } from '../../shared/types/profile'

useSeoMeta({
  title: 'Features — GenZerg',
  description: 'Everything on GenZergWeb in one place: canopy hero, now-playing rail, profile tabs, and live lists.',
})

const { data: profile } = await useFetch<ProfileResponse>('/api/profile', {
  lazy: true,
  default: () => null,
})

const features = [
  {
    id: 'canopy',
    title: 'Canopy hero',
    body: 'Full-bleed pixel forest. Brand first. No WebGL — CSS light, dust, and pointer parallax.',
  },
  {
    id: 'now',
    title: 'Now playing',
    body: 'One rail for what’s current: AniList watching, Letterboxd diary, Last.fm scrobbles. Filter by zone.',
  },
  {
    id: 'covers',
    title: 'Real covers',
    body: 'AniList art, Letterboxd CDN posters, Steam avatar. No empty gray boxes when the lists are alive.',
  },
  {
    id: 'profile',
    title: 'Profile deck',
    body: 'In-page tabs for Anime, Films, Music, Games, and Code. Stats, favorites, high scores — without a second site.',
  },
  {
    id: 'live',
    title: 'Live sources',
    body: 'Public APIs and scrapes: AniList GraphQL, Letterboxd, Last.fm, Steam XML/HTML, GitHub repos.',
  },
  {
    id: 'spa',
    title: 'One home page',
    body: 'Hero → Now → Profile. Old /about and /profile routes redirect home so content isn’t copied three times.',
  },
]

const uses = [
  'Scan the vibe in ten seconds',
  'Check what GenZerg is watching',
  'Deep-dive favorites and 9–10 scores',
  'Peek Steam / GitHub without leaving',
  'Share one URL, not five profiles',
  'Creator peer check, not a pitch deck',
]

const why = [
  {
    title: 'Lists are the bio',
    body: '652 anime, 506 films, 42k scrobbles, Steam since 2013. Numbers you can verify.',
  },
  {
    title: 'No app install',
    body: 'Open the site. Scroll. Click a cover. Sources open in a new tab.',
  },
  {
    title: 'Craft over dashboard',
    body: 'Pixel canopy, cover mosaics, zone filters — built to feel like a game brand, not SaaS.',
  },
  {
    title: 'Pathumthani, public trail',
    body: 'Same handles everywhere: GenZerg on AniList / Last.fm / GitHub, genzerg on Letterboxd, GenZerG on Steam.',
  },
]

const steps = [
  {
    title: 'Land on the canopy',
    body: 'Brand, headline, two jumps: Now or Profile.',
  },
  {
    title: 'Filter what’s on',
    body: 'All / Anime / Films / Music. Click a panel to open the source.',
  },
  {
    title: 'Open the profile deck',
    body: 'Switch tabs for favorites, high scores, Steam, repos.',
  },
  {
    title: 'Leave with a link',
    body: 'Elsewhere list points at AniList, Letterboxd, Last.fm, Steam, GitHub.',
  },
]

const faqs = [
  {
    q: 'Is this a bill-splitter like Harntung?',
    a: 'No. Harntung splits group expenses. GenZergWeb is a personal showcase: anime, films, music, Steam, and code.',
  },
  {
    q: 'Where does the data come from?',
    a: 'Public profiles only — AniList, Letterboxd, Last.fm, Steam, and GitHub. Music charts need NUXT_LASTFM_API_KEY for full live tracks.',
  },
  {
    q: 'Why one page?',
    a: 'So the story, the now rail, and the profile don’t repeat across /about and /profile. Features live here; the experience lives on /.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. Browse as a guest. Links out to the source sites if you want to follow.',
  },
  {
    q: 'Mobile?',
    a: 'Yes. Hero, rail, and profile tabs reflow. Prefer reduced motion is respected.',
  },
]

const openFaq = ref<number | null>(0)

function toggleFaq(index: number) {
  openFaq.value = openFaq.value === index ? null : index
}
</script>

<template>
  <main class="features">
    <div class="features__banner" aria-hidden="true">
      <img
        v-if="profile?.banner"
        :src="profile.banner"
        alt=""
        decoding="async"
        fetchpriority="high"
      >
      <div class="features__banner-fade" />
    </div>

    <header class="features__top">
      <NuxtLink class="features__brand" to="/">GenZerg</NuxtLink>
      <nav class="features__nav" aria-label="Primary">
        <a href="#key">Features</a>
        <a href="#how">How</a>
        <a href="#faq">FAQ</a>
        <NuxtLink to="/">Home</NuxtLink>
      </nav>
    </header>

    <section class="features__hero">
      <p class="features__kicker">Features</p>
      <h1>Everything the site does — one scroll.</h1>
      <p class="features__lede">
        Same idea as a product landing: what it is, what you get, how to use it.
        Built for GenZerg’s trail, not for splitting dinner bills.
      </p>
      <div class="features__cta">
        <NuxtLink class="btn" to="/#exhibit">Open Now</NuxtLink>
        <a class="btn btn--ghost" href="#key">See all features</a>
      </div>

      <ul v-if="profile?.highlights?.length" class="features__pulse">
        <li v-for="item in profile.highlights" :key="item.label">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </li>
      </ul>
    </section>

    <section id="story" class="features__section">
      <h2>What this is</h2>
      <p>
        Creators land here to feel who GenZerg is — not to fill a workflow.
        The canopy is the first hit. The lists are the proof. Profile tabs dig deeper
        without sending you to five different apps.
      </p>
    </section>

    <section id="key" class="features__section">
      <h2>Key features</h2>
      <p class="features__section-lede">All of them. On this page.</p>
      <ul class="features__grid">
        <li v-for="feature in features" :id="feature.id" :key="feature.id">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.body }}</p>
        </li>
      </ul>
    </section>

    <section id="uses" class="features__section">
      <h2>Use it for</h2>
      <ul class="features__tags">
        <li v-for="use in uses" :key="use">{{ use }}</li>
      </ul>
    </section>

    <section id="why" class="features__section">
      <h2>Why this shape</h2>
      <ul class="features__why">
        <li v-for="item in why" :key="item.title">
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </li>
      </ul>
    </section>

    <section id="how" class="features__section">
      <h2>How to use</h2>
      <ol class="features__steps">
        <li v-for="(step, index) in steps" :key="step.title">
          <span class="features__step-num">{{ index + 1 }}</span>
          <div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.body }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section id="faq" class="features__section">
      <h2>FAQ</h2>
      <ul class="features__faq">
        <li v-for="(item, index) in faqs" :key="item.q">
          <button type="button" :aria-expanded="openFaq === index" @click="toggleFaq(index)">
            {{ item.q }}
            <span aria-hidden="true">{{ openFaq === index ? '−' : '+' }}</span>
          </button>
          <p v-show="openFaq === index">{{ item.a }}</p>
        </li>
      </ul>
    </section>

    <section class="features__footer">
      <h2>Ready to look up</h2>
      <p>Home is the product. This page is the map.</p>
      <div class="features__cta">
        <NuxtLink class="btn" to="/">Back to canopy</NuxtLink>
        <NuxtLink class="btn btn--ghost" to="/#profile">Jump to profile</NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.features {
  position: relative;
  min-height: 100dvh;
  background: var(--bg);
  color: var(--ink);
  overflow: clip;
}

.features__banner {
  position: absolute;
  inset: 0 0 auto;
  height: clamp(12rem, 34vw, 20rem);
  overflow: hidden;
  background: oklch(0.22 0.05 145);
}

.features__banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 28%;
}

.features__banner-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, oklch(0.14 0.04 145 / 0.25), var(--bg) 88%);
}

.features__top {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2.5rem);
  color: oklch(0.98 0.01 145);
  text-shadow: 0 1px 8px oklch(0.12 0.04 145 / 0.45);
}

.features__brand {
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 700;
  text-decoration: none;
  color: inherit;
}

.features__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  justify-content: flex-end;
}

.features__nav a {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
}

.features__nav a:hover {
  color: var(--accent);
}

.features__hero,
.features__section,
.features__footer {
  position: relative;
  z-index: 1;
  max-width: 52rem;
  margin: 0 auto;
  padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2.5rem);
}

.features__hero {
  padding-top: clamp(3rem, 10vw, 6rem);
}

.features__kicker {
  margin: 0 0 0.35rem;
  font-family: var(--font-display);
  color: var(--primary);
}

.features__hero h1,
.features__section h2,
.features__footer h2 {
  margin: 0 0 0.75rem;
  font-family: var(--font-display);
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.features__hero h1 {
  font-size: clamp(2rem, 5.5vw, 3.2rem);
  line-height: 1.05;
}

.features__section h2,
.features__footer h2 {
  font-size: clamp(1.6rem, 3.5vw, 2.2rem);
}

.features__lede,
.features__section > p,
.features__footer > p {
  margin: 0 0 1.25rem;
  max-width: 46ch;
  color: var(--muted);
  text-wrap: pretty;
}

.features__section-lede {
  margin-top: -0.35rem !important;
}

.features__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0.65rem 1.1rem;
  border-radius: 0.35rem;
  font-weight: 700;
  text-decoration: none;
  background: var(--primary);
  color: oklch(0.99 0.01 145);
  border: 2px solid oklch(0.38 0.12 145);
}

.btn--ghost {
  background: transparent;
  color: var(--ink);
  border-color: oklch(0.35 0.06 145 / 0.35);
}

.btn:hover {
  filter: brightness(1.05);
}

.features__pulse {
  list-style: none;
  margin: 1.5rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr));
  gap: 0.65rem;
}

.features__pulse li {
  display: grid;
  gap: 0.15rem;
}

.features__pulse strong {
  font-family: var(--font-display);
  font-size: 1.35rem;
  line-height: 1;
}

.features__pulse span {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--primary);
}

.features__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

@media (min-width: 720px) {
  .features__grid {
    grid-template-columns: 1fr 1fr;
  }
}

.features__grid li {
  padding: 1rem 1.05rem;
  border: 2px solid oklch(0.35 0.06 145 / 0.16);
  border-radius: 0.35rem;
  background: oklch(1 0.01 145 / 0.5);
  scroll-margin-top: 5rem;
}

.features__grid h3,
.features__why h3,
.features__steps h3 {
  margin: 0 0 0.4rem;
  font-family: var(--font-display);
  font-size: 1.15rem;
}

.features__grid p,
.features__why p,
.features__steps p {
  margin: 0;
  color: var(--muted);
  text-wrap: pretty;
}

.features__tags {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.features__tags li {
  padding: 0.45rem 0.75rem;
  border: 2px solid oklch(0.35 0.06 145 / 0.2);
  border-radius: 0.3rem;
  font-weight: 700;
  background: oklch(1 0.01 145 / 0.45);
}

.features__why {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.85rem;
}

.features__steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.85rem;
  counter-reset: none;
}

.features__steps li {
  display: grid;
  grid-template-columns: 2.4rem 1fr;
  gap: 0.75rem;
  align-items: start;
}

.features__step-num {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.3rem;
  font-family: var(--font-display);
  font-weight: 700;
  color: oklch(0.98 0.01 145);
  background: oklch(0.35 0.1 145);
}

.features__faq {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}

.features__faq button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 0.85rem 0;
  border: 0;
  border-bottom: 1px solid oklch(0.35 0.05 145 / 0.16);
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.features__faq button span {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--primary);
}

.features__faq p {
  margin: 0 0 0.85rem;
  color: var(--muted);
  text-wrap: pretty;
}

.features__footer {
  padding-bottom: clamp(3rem, 8vw, 5rem);
}
</style>
