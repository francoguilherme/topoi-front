<template>
  <div class="articles-page container">
    <h1>Artigos</h1>

    <div class="filters-container">
      <div class="search-bar">
        <input 
          v-model="searchInput" 
          type="text" 
          placeholder="Buscar por título ou autor..."
        >
      </div>
      
      <div class="section-filter">
        <select v-model="selectedSection">
          <option value="">Todas as seções</option>
          <option v-for="section in sections" :key="section" :value="section">
            {{ section }}
          </option>
        </select>
      </div>
    </div>
    
    <div v-if="pending" class="loading">Carregando artigos...</div>
    <div v-else-if="error" class="error">Erro ao carregar artigos: {{ error.message }}</div>
    
    <div v-else class="articles-list">
      <ArticleCard 
        v-for="article in data?.data" 
        :key="article.id" 
        :article="article" 
        :showEdition="true"
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
const selectedSection = ref('')
let searchTimeout

const sections = ['Artigo', 'Resenha', 'Entrevista', 'Documento', 'Tradução']

const { find } = useStrapi()

const { data, pending, error } = await useAsyncData(
  'artigos', 
  () => {
    const filters = {}
    
    if (search.value) {
      filters.$or = [
        { titulo: { $containsi: search.value } },
        { autores: { nome: { $containsi: search.value } } }
      ]
    }
    
    if (selectedSection.value) {
      filters.secao = selectedSection.value
    }

    return find('artigos', {
      populate: ['autores', 'edicao', 'arquivo'],
      sort: ['data_de_publicacao:desc'],
      pagination: {
        page: page.value,
        pageSize
      },
      filters
    })
  },
  {
    watch: [page, search, selectedSection]
  }
)

watch(searchInput, (newVal) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    search.value = newVal
    page.value = 1
  }, 500)
})

watch(selectedSection, () => {
  page.value = 1
})
</script>

<style scoped>
.filters-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.search-bar {
  flex: 1;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.section-filter select {
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  min-width: 200px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
  }
  
  .section-filter select {
    width: 100%;
  }
}
</style>
