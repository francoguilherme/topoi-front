<template>
  <div class="authors-page container">
    <h1>{{ $t('authors.title') }}</h1>

    <div class="search-bar">
      <SearchInput 
        v-model="searchInput" 
        :placeholder="$t('authors.search_placeholder')"
        @clear="handleClear"
      />
    </div>
    
    <div class="authors-list">
      <div v-if="data?.data?.length > 0" class="authors-grid">
        <NuxtLink 
          v-for="author in data?.data" 
          :key="author.id"
          :to="localePath(`/autores/${author.slug}`)"
          class="author-card"
        >
          <div class="card-content">
            <div class="avatar-container">
              <img 
                v-if="author.foto" 
                :src="getStrapiMedia(author.foto.url)" 
                :alt="author.nome"
                class="avatar-image"
              >
              <div v-else class="avatar-placeholder">
                {{ getInitials(author.nome) }}
              </div>
            </div>
            <div class="info-container">
              <h3>
                {{ author.nome }}
              </h3>
              <div class="meta">
                <p v-if="author.instituicao" class="institution">
                  {{ author.instituicao }}
                </p>
                <p v-if="author.artigos" class="article-count">
                  {{ author.artigos.count }} {{ author.artigos.count < 2 ? $t('authors.detail.publication') : $t('authors.detail.publications') }}
                </p>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
      <p v-else-if="search && !pending">{{ $t('authors.detail.no_results', { query: search }) }}</p>
      <p v-else-if="!pending">{{ $t('authors.detail.no_results') }}</p>

      <LoadingSpinner v-if="pending" :text="$t('authors.loading')" />

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
const page = ref(Number(route.query.page) || 1)
const pageSize = 20
const search = ref(route.query.q?.toString() || '')
const searchInput = ref(route.query.q?.toString() || '')
const searchTimeout = ref(null)
const config = useRuntimeConfig();

const getStrapiMedia = (url) => {
  if (url.startsWith('http')) return url
  return `${config.public.strapi.url}${url}`
}

const { find } = useStrapi()
const { locale } = useI18n()
const localePath = useLocalePath()

const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .filter(word => word && word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase())
    .map(word => word[0])
    .join('')
    .slice(0, 2)
}

const handleClear = () => {
  search.value = ''
  searchInput.value = ''
  page.value = 1
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
}

const { data, pending, error } = await useAsyncData(
  'autores', 
  () => find('autores', {
    locale: locale.value,
    sort: ['nome:asc'],
    populate: {
      artigos: {
        count: true
      },
      foto: true
    },
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
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    search.value = newVal
    page.value = 1
  }, 500)
})

// Sync state to URL
watch([page, search], () => {
  router.push({
    query: {
      ...route.query,
      page: page.value,
      q: search.value || undefined
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
})
</script>

<style scoped>
.search-bar {
  margin-bottom: 2rem;
}

.authors-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .authors-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .authors-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.author-card {
  display: block;
  text-decoration: none;
  color: inherit;
  border: 1px solid #eee;
  padding: 1.5rem;
  border-radius: 4px;
  background-color: #fff;
  transition: box-shadow 0.2s;
  height: 100%;
}

.card-content {
  display: flex;
  gap: 1rem;
  height: 100%;
}

.avatar-container {
  flex-shrink: 0;
}

.avatar-image, .avatar-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  letter-spacing: 1px;
}

.info-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.author-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.author-card h3 {
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  color: var(--primary-color);
  margin-top: 0;
}

.meta {
  font-size: 0.9rem;
  color: #666;
  margin-top: auto;
}

.article-count {
  text-transform: lowercase;
}
</style>
