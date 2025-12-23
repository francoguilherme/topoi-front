// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/strapi', '@nuxtjs/i18n', 'nuxt-gtag'],
  i18n: {
    langDir: 'locales',
    locales: [
      { code: 'pt-BR', iso: 'pt-BR', name: 'Português', file: 'pt-BR.json' },
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'es', iso: 'es-ES', name: 'Español', file: 'es.json' }
    ],
    defaultLocale: 'pt-BR',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false
  },
  strapi: {
    url: process.env.STRAPI_URL || 'http://localhost:1337',
    prefix: '/api',
    version: 'v5'
  },
  gtag: {
    id: process.env.GTAG_ID,
    enabled: process.env.NODE_ENV === 'production',
    config: {
      anonymize_ip: true
    }
  },
  runtimeConfig: {
    public: {
      strapi: {
        url: process.env.STRAPI_URL
      }
    }
  },
  css: ['~/assets/css/main.css', '@fortawesome/fontawesome-free/css/all.css']
})
