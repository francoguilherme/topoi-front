<template>
  <div class="app-layout">
    <AppHeader />
    <main class="main-content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>  
const { locale } = useI18n()

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} – Topoi. Revista de História`
      : 'Topoi. Revista de História'
  },
  meta: [
    {
      name: 'description',
      content: 'Revista do Programa de Pós-Graduação em História Social da UFRJ. Divulgação científica de alto nível: Qualis A1.'
    }
  ],
  htmlAttrs: {
    lang: locale.value
  },
  ink: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest' }
  ]
})
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}
</style>
