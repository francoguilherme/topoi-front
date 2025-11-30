<template>
  <div class="articles-page container">
    <h1>Artigos</h1>

    <div class="search-bar">
      <input 
        v-model="searchInput" 
        type="text" 
        placeholder="Buscar por título ou autor..."
      >
    </div>
    
    <div v-if="pending" class="loading">Carregando artigos...</div>
    <div v-else-if="error" class="error">Erro ao carregar artigos: {{ error.message }}</div>
    
    <div v-else class="articles-list">
      <ArticleCard 
        v-for="article in data?.data" 
        :key="article.id" 
        :article="article" 
      />
      
      <div v-if="data?.data?.length === 0" class="no-results">
        Nenhum artigo encontrado.
      </div>

      <!-- Pagination -->
      <Pagination 
        v-model="page" 
        :totalPages="data?.meta?.pagination?.pageCount" 
      />
    </div>
  </div>
</template>

<script setup>
const page = ref(1)
const pageSize = 10
const search = ref('')
const searchInput = ref('')
let searchTimeout

const { find } = useStrapi()

const { data, pending, error } = await useAsyncData(
  'artigos', 
  () => find('artigos', {
    populate: ['autores'],
    sort: ['data_de_publicacao:desc'],
    pagination: {
      page: page.value,
      pageSize
    },
    filters: search.value ? {
      $or: [
        { titulo: { $containsi: search.value } },
        { autores: { nome: { $containsi: search.value } } }
      ]
    } : undefined
  }),
  {
    watch: [page, search]
  }
)

watch(searchInput, (newVal) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    search.value = newVal
    page.value = 1
  }, 500)
})
</script>

<style scoped>
.search-bar {
  margin-bottom: 2rem;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
