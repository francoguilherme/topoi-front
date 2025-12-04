<template>
  <div class="authors-page container">
    <h1>{{ $t('authors.title') }}</h1>

    <div class="search-bar">
      <input 
        v-model="searchInput" 
        type="text" 
        :placeholder="$t('authors.search_placeholder')"
      >
    </div>
    
    <div v-if="pending" class="loading">{{ $t('authors.loading') }}</div>
    <div v-else-if="error" class="error">{{ $t('authors.error_loading', { message: error.message }) }}</div>
    
    <div v-else class="authors-list">
      <ul>
        <li v-for="author in data?.data" :key="author.id">
          <NuxtLink :to="localePath(`/autores/${author.slug}`)">
            {{ author.nome }}
          </NuxtLink>
          <span v-if="author.instituicao" class="institution">
            - {{ author.instituicao }}
          </span>
        </li>
      </ul>

      <Pagination 
        v-model="page" 
        :totalPages="data?.meta?.pagination?.pageCount" 
      />
    </div>
  </div>
</template>

<script setup>
const page = ref(1)
const pageSize = 20
const search = ref('')
const searchInput = ref('')
let searchTimeout

const { find } = useStrapi()
const { locale } = useI18n()
const localePath = useLocalePath()

const { data, pending, error } = await useAsyncData(
  'autores', 
  () => find('autores', {
    locale: locale.value,
    sort: ['nome:asc'],
    pagination: {
      page: page.value,
      pageSize
    },
    filters: search.value ? {
      $or: [
        { nome: { $containsi: search.value } },
        { instituicao: { $containsi: search.value } },
        { email: { $containsi: search.value } },
        { orcid: { $containsi: search.value } }
      ]
    } : undefined
  }),
  {
    watch: [page, search, locale]
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


.authors-list ul {
  list-style: none;
}

.authors-list li {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.authors-list a {
  font-weight: bold;
  font-size: 1.1rem;
}

.institution {
  color: #666;
  margin-left: 0.5rem;
}
</style>
