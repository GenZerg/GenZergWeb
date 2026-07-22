<script setup lang="ts">
const props = withDefaults(defineProps<{
  reducedMotion?: boolean
}>(), {
  reducedMotion: false,
})

const root = ref<HTMLElement | null>(null)
const offsetX = ref(0)
const offsetY = ref(0)

function onPointerMove(event: PointerEvent) {
  if (props.reducedMotion || !root.value) return
  const rect = root.value.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - 0.5
  const y = (event.clientY - rect.top) / rect.height - 0.5
  offsetX.value = x * 18
  offsetY.value = y * 12
}

function onPointerLeave() {
  offsetX.value = 0
  offsetY.value = 0
}
</script>

<template>
  <div
    ref="root"
    class="canopy"
    aria-hidden="true"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <div
      class="canopy__art"
      :style="{
        transform: `translate3d(${offsetX * -0.6}px, ${offsetY * -0.6}px, 0) scale(1.08)`,
      }"
    >
      <img
        src="/concepts/canopy-day.png"
        alt=""
        width="1536"
        height="1024"
        decoding="async"
        fetchpriority="high"
      >
    </div>

    <div
      class="canopy__haze"
      :style="{
        transform: `translate3d(${offsetX * 0.35}px, ${offsetY * 0.25}px, 0)`,
      }"
    />

    <div class="canopy__rays" />
    <div class="canopy__dust" />
    <div class="canopy__vignette" />
  </div>
</template>

<style scoped>
.canopy {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: oklch(0.28 0.06 145);
}

.canopy__art {
  position: absolute;
  inset: -4%;
  transition: transform 0.45s var(--ease-out);
  will-change: transform;
}

.canopy__art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 42%;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.canopy__haze {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 55% 45% at 62% 28%, oklch(0.95 0.1 95 / 0.28), transparent 70%),
    radial-gradient(ellipse 70% 55% at 50% 55%, oklch(0.55 0.08 145 / 0.18), transparent 75%);
  mix-blend-mode: soft-light;
  pointer-events: none;
  transition: transform 0.5s var(--ease-out);
}

.canopy__rays {
  position: absolute;
  inset: 0;
  background:
    conic-gradient(
      from 210deg at 68% 18%,
      transparent 0deg,
      oklch(0.95 0.12 95 / 0.14) 8deg,
      transparent 16deg,
      transparent 28deg,
      oklch(0.95 0.1 95 / 0.1) 34deg,
      transparent 42deg,
      transparent 55deg,
      oklch(0.95 0.08 95 / 0.08) 60deg,
      transparent 70deg
    );
  mix-blend-mode: screen;
  animation: ray-breathe 8s ease-in-out infinite;
  pointer-events: none;
}

.canopy__dust {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1.5px 1.5px at 12% 30%, oklch(0.98 0.05 95 / 0.7) 0, transparent 100%),
    radial-gradient(1px 1px at 28% 62%, oklch(0.98 0.04 95 / 0.55) 0, transparent 100%),
    radial-gradient(1.5px 1.5px at 48% 22%, oklch(0.98 0.05 95 / 0.65) 0, transparent 100%),
    radial-gradient(1px 1px at 66% 48%, oklch(0.98 0.04 95 / 0.5) 0, transparent 100%),
    radial-gradient(1.5px 1.5px at 82% 35%, oklch(0.98 0.05 95 / 0.6) 0, transparent 100%),
    radial-gradient(1px 1px at 90% 70%, oklch(0.98 0.04 95 / 0.45) 0, transparent 100%);
  animation: dust-drift 14s linear infinite;
  pointer-events: none;
  opacity: 0.85;
}

.canopy__vignette {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, oklch(0.14 0.05 145 / 0.78) 0%, transparent 42%),
    linear-gradient(to bottom, oklch(0.16 0.04 145 / 0.35) 0%, transparent 28%),
    radial-gradient(ellipse 90% 80% at 50% 45%, transparent 40%, oklch(0.14 0.05 145 / 0.45) 100%);
  pointer-events: none;
}

@keyframes ray-breathe {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

@keyframes dust-drift {
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-12px, -18px, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .canopy__art,
  .canopy__haze {
    transition: none;
  }

  .canopy__rays,
  .canopy__dust {
    animation: none;
  }
}
</style>
