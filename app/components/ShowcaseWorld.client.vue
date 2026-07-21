<script setup lang="ts">
import type { MusicActivityPoint, ShowcaseItem, ShowcaseZone } from '../../shared/types/showcase'
import { createShowcaseWorld, type ShowcaseWorldHandle } from '~/utils/showcaseWorld'

const props = defineProps<{
  items: ShowcaseItem[]
  activity: MusicActivityPoint[]
}>()

const emit = defineEmits<{
  select: [item: ShowcaseItem | null]
  hover: [item: ShowcaseItem | null]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let handle: ShowcaseWorldHandle | null = null

onMounted(() => {
  if (!canvasRef.value) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  handle = createShowcaseWorld(canvasRef.value, {
    reducedMotion: reduced,
    onSelect: (item) => emit('select', item),
    onHover: (item) => emit('hover', item),
  })
  handle.setItems(props.items)
  handle.setActivity(props.activity)
})

watch(
  () => props.items,
  (items) => handle?.setItems(items),
  { deep: true },
)

watch(
  () => props.activity,
  (activity) => handle?.setActivity(activity),
  { deep: true },
)

onBeforeUnmount(() => {
  handle?.dispose()
  handle = null
})

function focusZone(zone: ShowcaseZone) {
  handle?.focusZone(zone)
}

defineExpose({ focusZone })
</script>

<template>
  <div class="world" aria-hidden="true">
    <canvas ref="canvasRef" class="world__canvas" />
    <div class="world__vignette" />
  </div>
</template>

<style scoped>
.world {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: oklch(0.78 0.06 230);
}

.world__canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.world__vignette {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 70% at 50% 40%, transparent 35%, oklch(0.16 0.04 145 / 0.4) 100%),
    linear-gradient(to top, oklch(0.14 0.05 145 / 0.62) 0%, transparent 45%);
}
</style>
