<script setup lang="ts">
useHead({
  title: 'GenZerg',
  htmlAttrs: { lang: 'en' },
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Pixelify+Sans:wght@500;600;700&display=swap',
    },
  ],
  meta: [
    {
      name: 'description',
      content: 'A living showcase of GenZerg’s work, voice, and vibe.',
    },
  ],
})
</script>

<template>
  <div class="shell">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<style scoped>
.shell {
  min-height: 100dvh;
}
</style>
