<script setup lang="ts">
import type { MusicActivityPoint, ShowcaseItem, ShowcaseZone } from '../../shared/types/showcase'

const props = defineProps<{
  items: ShowcaseItem[]
  activity: MusicActivityPoint[]
  activeZone: ShowcaseZone
  musicPeriod: 'weekly' | 'monthly'
  counts: { anime: number; films: number; music: number }
}>()

const emit = defineEmits<{
  'update:activeZone': [zone: ShowcaseZone]
  'update:musicPeriod': [period: 'weekly' | 'monthly']
}>()

const selected = ref<ShowcaseItem | null>(null)
const railRef = ref<HTMLElement | null>(null)

const filtered = computed(() => {
  if (props.activeZone === 'all') return props.items
  if (props.activeZone === 'anime') return props.items.filter((item) => item.kind === 'anime')
  if (props.activeZone === 'films') return props.items.filter((item) => item.kind === 'film')
  return props.items.filter((item) => item.kind === 'track')
})

const maxActivity = computed(() => Math.max(1, ...props.activity.map((point) => point.count)))

function selectItem(item: ShowcaseItem) {
  selected.value = selected.value?.id === item.id ? null : item
}

function openSelected() {
  if (!selected.value?.url) return
  window.open(selected.value.url, '_blank', 'noopener,noreferrer')
}

function scrollRail(direction: -1 | 1) {
  const el = railRef.value
  if (!el) return
  el.scrollBy({ left: direction * Math.min(420, el.clientWidth * 0.7), behavior: 'smooth' })
}

watch(
  () => props.activeZone,
  () => {
    selected.value = null
    nextTick(() => {
      railRef.value?.scrollTo({ left: 0, behavior: 'smooth' })
    })
  },
)
</script>

<template>
  <section id="exhibit" class="exhibit" aria-labelledby="exhibit-title">
    <div class="exhibit__head">
      <div>
        <p class="exhibit__kicker">Living exhibit</p>
        <h2 id="exhibit-title">What’s rustling in the canopy</h2>
        <p class="exhibit__lede">
          Anime on AniList, films on Letterboxd, music on Last.fm — same grove, different leaves.
        </p>
      </div>

      <div class="exhibit__controls">
        <div class="exhibit__zones" role="toolbar" aria-label="Showcase zones">
          <button
            type="button"
            :class="{ active: activeZone === 'all' }"
            @click="emit('update:activeZone', 'all')"
          >
            All
          </button>
          <button
            type="button"
            :class="{ active: activeZone === 'anime' }"
            @click="emit('update:activeZone', 'anime')"
          >
            Anime <span>{{ counts.anime }}</span>
          </button>
          <button
            type="button"
            :class="{ active: activeZone === 'films' }"
            @click="emit('update:activeZone', 'films')"
          >
            Films <span>{{ counts.films }}</span>
          </button>
          <button
            type="button"
            :class="{ active: activeZone === 'music' }"
            @click="emit('update:activeZone', 'music')"
          >
            Music <span>{{ counts.music }}</span>
          </button>
        </div>

        <div
          v-if="activeZone === 'music' || activeZone === 'all'"
          class="exhibit__period"
          role="group"
          aria-label="Music period"
        >
          <button
            type="button"
            :class="{ active: musicPeriod === 'weekly' }"
            @click="emit('update:musicPeriod', 'weekly')"
          >
            Weekly
          </button>
          <button
            type="button"
            :class="{ active: musicPeriod === 'monthly' }"
            @click="emit('update:musicPeriod', 'monthly')"
          >
            Monthly
          </button>
        </div>
      </div>
    </div>

    <div class="exhibit__stage">
      <div class="exhibit__nav">
        <button type="button" aria-label="Scroll showcase left" @click="scrollRail(-1)">‹</button>
        <button type="button" aria-label="Scroll showcase right" @click="scrollRail(1)">›</button>
      </div>

      <div ref="railRef" class="exhibit__rail" tabindex="0" aria-label="Showcase items">
        <button
          v-for="(item, index) in filtered"
          :key="item.id"
          type="button"
          class="panel"
          :class="[
            `panel--${item.kind}`,
            { 'panel--active': selected?.id === item.id },
          ]"
          :style="{ '--delay': `${Math.min(index, 12) * 40}ms` }"
          @click="selectItem(item)"
        >
          <span class="panel__media">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.title"
              loading="lazy"
              decoding="async"
            >
            <span v-else class="panel__fallback" aria-hidden="true">{{ item.kind }}</span>
          </span>
          <span class="panel__meta">
            <span class="panel__kind">{{ item.kind }}</span>
            <span class="panel__title">{{ item.title }}</span>
            <span class="panel__sub">{{ item.subtitle }}</span>
          </span>
        </button>

        <p v-if="filtered.length === 0" class="exhibit__empty">
          Nothing in this branch yet — check back after the next growth.
        </p>
      </div>
    </div>

    <div class="exhibit__footer">
      <aside v-if="selected" class="focus" aria-live="polite">
        <p class="focus__kind">{{ selected.kind }}</p>
        <h3>{{ selected.title }}</h3>
        <p>{{ selected.subtitle }}</p>
        <p class="focus__meta">{{ selected.meta }}</p>
        <button type="button" class="focus__open" @click="openSelected">Open source</button>
      </aside>

      <div v-if="activity.length" class="activity" aria-label="Listening activity">
        <p class="activity__label">Listening pulse · {{ musicPeriod }}</p>
        <ul>
          <li v-for="point in activity" :key="point.label">
            <span>{{ point.label }}</span>
            <span
              class="activity__bar"
              :style="{ '--fill': `${(point.count / maxActivity) * 100}%` }"
              :title="`${point.count} plays`"
            />
            <span class="activity__count">{{ point.count }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.exhibit {
  position: relative;
  padding: clamp(2.5rem, 7vw, 5rem) clamp(1rem, 4vw, 2.5rem) clamp(3rem, 8vw, 5.5rem);
  background:
    radial-gradient(ellipse 80% 50% at 10% 0%, oklch(0.75 0.1 145 / 0.22), transparent 55%),
    radial-gradient(ellipse 60% 40% at 90% 20%, oklch(0.85 0.08 95 / 0.18), transparent 50%),
    linear-gradient(180deg, oklch(0.94 0.02 145), oklch(0.97 0.015 145));
  color: var(--ink);
  overflow: clip;
}

.exhibit::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 5.5rem;
  background: linear-gradient(to bottom, oklch(0.14 0.05 145 / 0.42), transparent);
  pointer-events: none;
}

.exhibit::after {
  content: "";
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1.25rem;
  background:
    radial-gradient(ellipse 8px 10px at 8% 0, oklch(0.32 0.08 145) 0 55%, transparent 60%),
    radial-gradient(ellipse 10px 12px at 18% 0, oklch(0.38 0.1 145) 0 55%, transparent 60%),
    radial-gradient(ellipse 7px 9px at 29% 0, oklch(0.3 0.08 145) 0 55%, transparent 60%),
    radial-gradient(ellipse 11px 13px at 42% 0, oklch(0.36 0.09 145) 0 55%, transparent 60%),
    radial-gradient(ellipse 8px 10px at 55% 0, oklch(0.33 0.08 145) 0 55%, transparent 60%),
    radial-gradient(ellipse 10px 12px at 68% 0, oklch(0.37 0.1 145) 0 55%, transparent 60%),
    radial-gradient(ellipse 7px 9px at 80% 0, oklch(0.31 0.08 145) 0 55%, transparent 60%),
    radial-gradient(ellipse 11px 13px at 93% 0, oklch(0.35 0.09 145) 0 55%, transparent 60%);
  pointer-events: none;
  opacity: 0.55;
}

.exhibit__head {
  display: grid;
  gap: 1.5rem;
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
  max-width: 72rem;
  margin-inline: auto;
}

@media (min-width: 900px) {
  .exhibit__head {
    grid-template-columns: 1.2fr 1fr;
    align-items: end;
  }
}

.exhibit__kicker {
  margin: 0 0 0.4rem;
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--primary);
}

.exhibit__head h2 {
  margin: 0 0 0.55rem;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 2.75rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.exhibit__lede {
  margin: 0;
  max-width: 38ch;
  color: var(--muted);
  text-wrap: pretty;
}

.exhibit__controls {
  display: grid;
  gap: 0.65rem;
  justify-items: start;
}

.exhibit__zones,
.exhibit__period {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.exhibit__zones button,
.exhibit__period button,
.focus__open,
.exhibit__nav button {
  min-height: 2.4rem;
  padding: 0.4rem 0.85rem;
  border: 2px solid oklch(0.35 0.06 145 / 0.28);
  border-radius: 0.3rem;
  background: oklch(1 0.01 145 / 0.55);
  color: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    border-color 0.2s var(--ease-out),
    color 0.2s var(--ease-out),
    transform 0.2s var(--ease-spring);
}

.exhibit__zones button.active,
.exhibit__period button.active,
.exhibit__zones button:hover,
.exhibit__period button:hover,
.focus__open:hover,
.exhibit__nav button:hover {
  border-color: oklch(0.55 0.14 145);
  color: var(--primary);
}

.exhibit__zones button:active,
.exhibit__period button:active,
.exhibit__nav button:active {
  transform: translateY(1px);
}

.exhibit__zones span {
  margin-left: 0.3rem;
  opacity: 0.7;
  font-size: 0.85em;
}

.exhibit__stage {
  position: relative;
  max-width: 72rem;
  margin: 0 auto;
}

.exhibit__nav {
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.exhibit__nav button {
  width: 2.5rem;
  padding-inline: 0;
  font-size: 1.35rem;
  line-height: 1;
}

.exhibit__rail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(9.5rem, 12rem);
  gap: 0.85rem;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  padding: 0.35rem 0.15rem 1rem;
  scrollbar-width: thin;
  scrollbar-color: oklch(0.45 0.1 145) transparent;
}

.exhibit__rail:focus-visible {
  outline-offset: 6px;
}

.panel {
  position: relative;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  scroll-snap-align: start;
  animation: panel-rise 0.7s var(--ease-out) both;
  animation-delay: var(--delay);
}

.panel--anime {
  margin-top: 0.6rem;
}

.panel--film {
  margin-top: 0;
}

.panel--track {
  margin-top: 1.1rem;
}

.panel__media {
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border-radius: 0.2rem;
  background: oklch(0.28 0.05 145);
  box-shadow: 0 10px 0 oklch(0.28 0.05 145 / 0.12);
  transition:
    transform 0.35s var(--ease-spring),
    box-shadow 0.35s var(--ease-out);
}

.panel--track .panel__media {
  aspect-ratio: 1;
}

.panel__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s var(--ease-out);
}

.panel__fallback {
  display: grid;
  place-items: center;
  height: 100%;
  font-family: var(--font-display);
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: oklch(0.92 0.03 145 / 0.75);
}

.panel__meta {
  display: grid;
  gap: 0.15rem;
}

.panel__kind {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary);
}

.panel__title {
  font-family: var(--font-display);
  font-size: 1rem;
  line-height: 1.15;
  text-wrap: balance;
}

.panel__sub {
  font-size: 0.85rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel:hover .panel__media,
.panel--active .panel__media {
  transform: translateY(-6px) rotate(-0.6deg);
  box-shadow: 0 16px 0 oklch(0.28 0.05 145 / 0.14);
}

.panel:hover .panel__media img,
.panel--active .panel__media img {
  transform: scale(1.05);
}

.panel--active .panel__media {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.exhibit__empty {
  grid-column: 1 / -1;
  margin: 1rem 0;
  color: var(--muted);
}

.exhibit__footer {
  display: grid;
  gap: 1.25rem;
  max-width: 72rem;
  margin: 1.25rem auto 0;
}

@media (min-width: 800px) {
  .exhibit__footer {
    grid-template-columns: minmax(14rem, 22rem) 1fr;
    align-items: start;
  }
}

.focus {
  padding: 1rem 1.1rem;
  border: 2px solid oklch(0.35 0.06 145 / 0.25);
  border-radius: 0.35rem;
  background: oklch(1 0.01 145 / 0.72);
  backdrop-filter: blur(8px);
}

.focus__kind {
  margin: 0 0 0.25rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary);
}

.focus h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.35rem;
  line-height: 1.15;
  text-wrap: balance;
}

.focus p {
  margin: 0.35rem 0 0;
  color: var(--muted);
}

.focus__meta {
  font-weight: 600;
  color: var(--ink) !important;
}

.focus__open {
  margin-top: 0.85rem;
  background: var(--primary);
  border-color: oklch(0.38 0.12 145);
  color: oklch(0.99 0.01 145);
}

.activity {
  min-width: 0;
}

.activity__label {
  margin: 0 0 0.65rem;
  font-family: var(--font-display);
  font-size: 0.95rem;
  color: var(--primary);
}

.activity ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.4rem;
}

.activity li {
  display: grid;
  grid-template-columns: 4.5rem 1fr 2.25rem;
  gap: 0.55rem;
  align-items: center;
  font-size: 0.85rem;
}

.activity__bar {
  position: relative;
  height: 0.55rem;
  border-radius: 999px;
  background: oklch(0.35 0.05 145 / 0.12);
  overflow: hidden;
}

.activity__bar::after {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--fill);
  background: linear-gradient(90deg, oklch(0.5 0.14 145), oklch(0.78 0.15 95));
  border-radius: inherit;
  transition: width 0.45s var(--ease-out);
}

.activity__count {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

@keyframes panel-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .panel {
    animation: none;
  }
}
</style>
