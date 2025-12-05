<template>
  <div class="container">
    <div v-if="pending" class="loading">{{ $t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ $t('common.error_loading', { message: error.message }) }}</div>
    <div v-else class="content">
      <BlocksRenderer v-if="data?.data?.pagina?.conteudo" :content="data.data.pagina.conteudo" />
    </div>
  </div>
</template>

<script setup>
const { find } = useStrapi()
const { locale } = useI18n()

const { data, pending, error } = await useAsyncData('etica', () => find('etica', {
  locale: locale.value,
  populate: ['pagina']
}), {
  watch: [locale]
})
</script>

<style scoped>

</style>
