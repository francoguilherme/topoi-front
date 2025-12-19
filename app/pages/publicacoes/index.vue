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
    
    <div class="articles-list">
      <ArticleCard 
        v-for="article in data?.data" 
        :key="article.id" 
        :article="article" 
        :showEdition="true"
      />
      
      <div v-if="data?.data?.length === 0 && !pending" class="no-results">
        {{ $t('publications.no_results') }}
      </div>

      <!-- Pagination -->
      <Pagination 
        v-model="page" 
        :totalPages="data?.meta?.pagination?.pageCount" 
      />
    </div>
    <ScrollToTop />
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const page = ref(Number(route.query.page) || 1)
const pageSize = 10
const search = ref(route.query.q?.toString() || '')
const searchInput = ref(route.query.q?.toString() || '')
const selectedSection = ref(route.query.section?.toString() || '')
const searchTimeout = ref(null)

const sections = ['Artigo', 'Resenha', 'Entrevista', 'Documento', 'Tradução']

const { find } = useStrapi()
const { locale } = useI18n()

const handleClear = () => {
  search.value = ''
  searchInput.value = ''
  page.value = 1
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
}

watch(selectedSection, () => {
  page.value = 1
})

const { data, pending, error } = await useAsyncData(
  `artigos-${locale.value}`, 
  () => {
    const filters = {}
    
    if (search.value) {
      filters.$or = [
        { titulo: { $containsi: search.value } },
        { titulo_en: { $containsi: search.value } },
        { titulo_es: { $containsi: search.value } },
        { autores: { nome: { $containsi: search.value } } },
        { palavras_chave: { texto: { $containsi: search.value } } }
      ]
    }
    
    if (selectedSection.value) {
      if (selectedSection.value === 'Tradução') {
        filters.traducao = true
      } else {
        filters.secao = selectedSection.value
      }      
    }

    return find('artigos', {
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

// Sync state to URL
watch([page, search, selectedSection], () => {
  router.push({
    query: {
      ...route.query,
      page: page.value,
      q: search.value || undefined,
      section: selectedSection.value || undefined
    }
  })
})

// Sync URL to state (for back/forward navigation)
watch(() => route.query, (newQuery) => {
  if (newQuery.page) {
    page.value = Number(newQuery.page)
  }
  if (newQuery.q !== undefined && newQuery.q !== search.value) {
    search.value = newQuery.q?.toString() || ''
    searchInput.value = newQuery.q?.toString() || ''
  }
  if (newQuery.section !== undefined && newQuery.section !== selectedSection.value) {
    selectedSection.value = newQuery.section?.toString() || ''
  }
})
</script>

<style scoped>
.filters-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 2rem;
}

.search-bar {
  flex: 1;
}

.section-filter {
  position: relative;
}

.section-filter::after {
  content: "\f078"; /* Font Awesome chevron-down */
  font-family: "Font Awesome 7 Free";
  font-weight: 900;
  font-size: 0.8rem;
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
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
    align-items: end;
  }
  
  .section-filter select {
    width: 100%;
  }

  .search-bar {
    width: 100%;
  }
}
</style>
