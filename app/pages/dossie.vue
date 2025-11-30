<template>
  <div class="dossie-page container">
    <div v-if="pending" class="loading">Carregando...</div>
    <div v-else-if="error" class="error">Erro ao carregar dados: {{ error.message }}</div>
    <div v-else class="content">
      <h1>{{ data?.data?.displayName || 'Dossiê' }}</h1>
      <BlocksRenderer v-if="data?.data?.pagina?.conteudo" :content="data.data.pagina.conteudo" />
    </div>
  </div>
</template>

<script setup>
const { find } = useStrapi()

const { data, pending, error } = await useAsyncData('dossie', () => find('dossie', {
  populate: ['pagina']
}))
</script>

<style scoped>

</style>
