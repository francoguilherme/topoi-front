<template>
  <div class="container">
    <LoadingSpinner v-if="pending" :text="$t('common.loading')" />
    <div v-else-if="error" class="error">{{ $t('common.error_loading', { message: error.message }) }}</div>
    <div v-else class="content">
      <BlocksRenderer v-if="data?.data?.pagina?.conteudo" :content="data.data.pagina.conteudo" class="text-justify" />
    </div>
    <ScrollToTop />
  </div>
</template>

<script setup>
useSeoMeta({
  title: $t('nav.about'),
  description: 'Leia mais sobre a revista Topoi.'
})

const { find } = useStrapi()
const { locale } = useI18n()

const { data, pending, error } = await useAsyncData('sobre', () => find('sobre', {
  locale: locale.value,
  populate: ['pagina']
}), {
  watch: [locale]
})
</script>

<style scoped>

</style>
