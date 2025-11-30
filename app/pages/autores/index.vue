<template>
  <div class="authors-page container">
    <h1>Autores</h1>

    <div class="search-bar">
      <input 
        v-model="searchInput" 
        type="text" 
        placeholder="Buscar por nome, instituição, email ou ORCID..."
      >
    </div>
    
    <div v-if="pending" class="loading">Carregando autores...</div>
    <div v-else-if="error" class="error">Erro ao carregar autores: {{ error.message }}</div>
    
    <div v-else class="authors-list">
      <ul>
        <li v-for="author in data?.data" :key="author.id">
          <NuxtLink :to="`/autores/${author.slug}`">
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

const { data, pending, error } = await useAsyncData(
  'autores', 
  () => find('autores', {
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
