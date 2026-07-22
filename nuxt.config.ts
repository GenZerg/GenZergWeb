// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    lastfmApiKey: '',
    tmdbApiKey: '',
    public: {
      lastfmUser: 'GenZerg',
      anilistUser: 'GenZerg',
      letterboxdUser: 'genzerg',
      steamUser: 'GenZerG',
      githubUser: 'GenZerg',
    },
  },

  nitro: {
    preset: 'cloudflare_module',

    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },

  modules: ['nitro-cloudflare-dev'],
})
