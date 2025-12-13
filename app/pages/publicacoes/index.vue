<template>
  <div class="articles-page container">
    <h1>{{ $t('publications.title') }}</h1>

    <div class="filters-container">
      <div class="search-bar">
        <SearchInput 
          v-model="searchInput" 
          :placeholder="$t('publications.search_placeholder')"
          @clear="handleClear"
        />
      </div>
      
      <div class="section-filter">
        <select v-model="selectedSection">
          <option value="">{{ $t('publications.all_sections') }}</option>
          <option v-for="section in sections" :key="section" :value="section">
            {{ $t(`publications.sections.${section}`) }}
          </option>
        </select>
      </div>
    </div>
    
    <div v-if="pending" class="loading">{{ $t('publications.loading') }}</div>
    <div v-else-if="error" class="error">{{ $t('publications.error_loading', { message: error.message }) }}</div>
    
    <div v-else class="articles-list">
      <ArticleCard 
        v-for="article in data?.data" 
        :key="article.id" 
        :article="article" 
        :showEdition="true"
      />
      
      <div v-if="data?.data?.length === 0" class="no-results">
        {{ $t('publications.no_results') }}
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
const route = useRoute()
const router = useRouter()
const page = ref(1)
const pageSize = 10
const search = ref(route.query.q?.toString() || '')
const searchInput = ref(route.query.q?.toString() || '')
const selectedSection = ref('')
const searchTimeout = ref(null)

const sections = ['Artigo', 'Resenha', 'Entrevista', 'Documento', 'Tradução']

const { find } = useStrapi()
const { locale } = useI18n()

const handleClear = () => {
  search.value = ''
  page.value = 1
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
}

const { data, pending, error } = await useAsyncData(
  'artigos', 
  () => {
    const filters = {}
    
    if (search.value) {
      filters.$or = [
        { titulo: { $containsi: search.value } },
        { autores: { nome: { $containsi: search.value } } },
        { palavras_chave: { texto: { $containsi: search.value } } }
      ]
    }
    
    if (selectedSection.value) {
      filters.secao = selectedSection.value
    }

    return find('artigos', {
      locale: "pt-BR",
      populate: ['autores', 'edicao', 'arquivo'],
      sort: ['edicao.volume:desc', 'edicao.numero:desc'],
      pagination: {
        page: page.value,
        pageSize
      },
      filters
    })
  },
  {
    watch: [page, search, selectedSection, locale]
  }
)

watch(searchInput, (newVal) => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
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
