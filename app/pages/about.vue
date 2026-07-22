<script setup lang="ts">
useSeoMeta({
  title: 'The story — GenZerg',
  description: 'Who GenZerg is, and why creators should care.',
})
</script>

<template>
  <main class="about">
    <div class="about__glow" aria-hidden="true" />

    <header class="about__top">
      <NuxtLink class="about__brand" to="/">GenZerg</NuxtLink>
      <NuxtLink class="about__back" to="/">Back to canopy</NuxtLink>
    </header>

    <article class="about__body">
      <p class="about__kicker">The story</p>
      <h1 class="about__title">There’s a story here worth exploring.</h1>
      <p>
        GenZerg is a living showcase — work, voice, and vibe for creators who feel something before they read a bio.
        Playful, bold, curious. More like looking up through a forest than scrolling a pitch deck.
      </p>
      <p>
        This chapter is just opening. Social proof, clips, and streams will take root here. Until then: wander the canopy, rustle the leaves, and come back for the next growth.
      </p>
      <p class="about__cta-row">
        <a
          class="btn"
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
        >Follow on social</a>
        <NuxtLink class="btn btn--quiet" to="/#exhibit">Browse the grove</NuxtLink>
      </p>
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
  max-width: 38rem;
  margin: 0 auto;
  padding: var(--space-4) clamp(1.25rem, 4vw, 3rem) var(--space-5);
  animation: rise 0.7s var(--ease-out) both;
}

.about__kicker {
  margin: 0 0 var(--space-1);
  font-family: var(--font-display);
  font-size: 0.95rem;
  color: var(--primary);
}

.about__title {
  margin: 0 0 var(--space-3);
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.about__body p {
  margin: 0 0 var(--space-3);
  max-width: 58ch;
  text-wrap: pretty;
  color: var(--muted);
}

.about__body .about__title + p {
  color: var(--ink);
  font-size: 1.125rem;
}

.about__cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: var(--space-4) !important;
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
