<template>
  <div class="edition-detail container">
    <LoadingSpinner v-if="pending" :text="$t('editions.detail.loading')" />
    <div v-else-if="error || !edition" class="error">
      {{ error ? $t('editions.detail.error_loading', { message: error.message }) : $t('editions.detail.not_found') }}
    </div>
    
    <div v-else class="content">
      <header class="edition-header">
        <div class="cover-wrapper" v-if="edition.capa">
          <img :src="getStrapiMedia(edition.capa.url)" :alt="$t('editions.detail.cover_alt')">
        </div>
        <div class="edition-info">
          <h1>
            <span v-if="edition.numero">nº {{ edition.numero }} /</span>
            V. {{ edition.volume }}
          </h1>
          <p class="period">{{ formatPeriod(edition.periodo) }}</p>
          <p class="date" v-if="edition.data_de_publicacao">
            {{ $t('editions.detail.published_at', { date: new Date(edition.data_de_publicacao).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR', {timeZone: 'UTC'}) }) }}
          </p>
          <div v-if="displayTitle" class="edition-title">
            <h2>{{ displayTitle }}</h2>
          </div>
          <p v-if="edition.descricao" class="description">{{ edition.descricao }}</p>
          
          <div v-if="edition.apresentacao" class="presentation-link">
            <a :href="getStrapiMedia(edition.apresentacao.url)" target="_blank" class="btn-download">
              {{ $t('editions.detail.presentation') }}
            </a>
          </div>

          <div class="editorial" v-if="edition.editorial">
            <div v-if="edition.editorial.arquivo" class="editorial-file">
              <a :href="getStrapiMedia(edition.editorial.arquivo.url)" target="_blank" class="btn-download">
                {{ $t('editions.detail.editorial', { title: edition.editorial.titulo }) }}
              </a>
            </div>
            <div v-else>
              <h3>{{ $t('editions.detail.editorial', { title: edition.editorial.titulo }) }}</h3>
              <div class="editorial-content" v-if="edition.editorial.texto">
                <BlocksRenderer :content="edition.editorial.texto" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section class="content-tabs">
        <div class="tabs-header">
          <button 
            :class="{ active: currentTab === 'publications' }" 
            @click="currentTab = 'publications'"
          >
            {{ $t('publications.title') }}
          </button>
          <button 
            :class="{ active: currentTab === 'authors' }" 
            @click="currentTab = 'authors'"
          >
            {{ $t('authors.title') }}
          </button>
        </div>

        <div v-if="currentTab === 'publications'" class="tab-content">
          <div class="search-bar">
            <SearchInput 
              v-model="searchInput" 
              :placeholder="$t('editions.detail.search_placeholder')"
              @clear="handleClear"
            />
          </div>

          <div v-if="filteredArticles?.length">
            <div v-for="(articles, secao) in articlesBySection" :key="secao" class="section-group">
              <h3 class="section-title">
                {{ secao }}
              </h3>
              <ArticleCard 
                v-for="article in articles" 
                :key="article.id" 
                :article="article"
                :show-section="false"
              />
            </div>
          </div>
          <p v-else-if="searchQuery && !pending">{{ $t('editions.detail.no_results_query', { query: searchQuery }) }}</p>
          <p v-else-if="!pending">{{ $t('editions.detail.no_results') }}</p>
        </div>

        <div v-if="currentTab === 'authors'" class="tab-content fade-in">
          <div class="authors-grid">
            <NuxtLink 
              v-for="author in editionAuthors" 
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
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
    <ScrollToTop />
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const { find } = useStrapi()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const searchInput = ref('')
const searchQuery = ref('')
const searchTimeout = ref(null)

const getStrapiMedia = (url) => {
  if (url.startsWith('http')) return url
  return `${config.public.strapi.url}${url}`
}

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
  searchQuery.value = ''
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
}

// Parse the issue parameter (e.g., "25-1" -> volume: 25, numero: 1)
const [numero, volume] = route.params.issue.split('-').map(Number)

const { data, pending, error } = await useAsyncData(
  `edicao-${route.params.issue}`, 
  () => find('edicoes', {
    filters: {
      volume: volume,
      numero: numero
    },
    populate: {
      capa: true,
      apresentacao: true,
      editorial: {
        populate: ['arquivo']
      },
      artigos: {
        populate: {
          autores: {
            populate: ['foto']
          },
          arquivo: true,
          palavras_chave: true
        }
      }
    }
  })
)

const edition = computed(() => {
  if (data.value?.data?.length > 0) {
    return data.value.data[0]
  }
  return null
})

const displayTitle = computed(() => {
  if (!edition.value) return ''
  
  if (locale.value === 'en' && edition.value.titulo_en) {
    return edition.value.titulo_en
  }
  if (locale.value === 'es' && edition.value.titulo_es) {
    return edition.value.titulo_es
  }
  return edition.value.titulo
})

const currentTab = ref(route.query.tab?.toString() || 'publications')

watch(currentTab, () => {
  router.push({
    query: {
      ...route.query,
      tab: currentTab.value
    }
  })
})

watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    currentTab.value = newTab.toString()
  }
})

const editionAuthors = computed(() => {
  if (!edition.value?.artigos) return []
  
  const authorsMap = new Map()
  
  edition.value.artigos.forEach(article => {
    if (article.autores) {
      article.autores.forEach(autor => {
        if (!authorsMap.has(autor.id)) {
          authorsMap.set(autor.id, autor)
        }
      })
    }
  })
  
  return Array.from(authorsMap.values()).sort((a, b) => a.nome.localeCompare(b.nome))
})

const filteredArticles = computed(() => {
  if (!edition.value?.artigos) return []
  
  if (!searchQuery.value) return edition.value.artigos

  const query = searchQuery.value.toLowerCase()
  
  return edition.value.artigos.filter(article => {
    const titleMatch = article.titulo?.toLowerCase().includes(query) || 
                       article.titulo_en?.toLowerCase().includes(query) || 
                       article.titulo_es?.toLowerCase().includes(query)
    const authorMatch = article.autores?.some(autor => 
      autor.nome?.toLowerCase().includes(query)
    )
    const keywordMatch = article.palavras_chave?.some(k => 
      k.texto?.toLowerCase().includes(query)
    )
    
    return titleMatch || authorMatch || keywordMatch
  })
})

const articlesBySection = computed(() => {
  if (!filteredArticles.value?.length) return {}
  
  const grouped = {}
  filteredArticles.value.forEach(article => {
    const secao = $t(`common.sections.${article.secao}`)
    if (!grouped[secao]) {
      grouped[secao] = []
    }
    grouped[secao].push(article)
  })
  
  return grouped
})

watch(searchInput, (newVal) => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    searchQuery.value = newVal
  }, 500)
})

const formatPeriod = (periodo) => {
  if (!periodo) return ''
  
  const match = periodo.match(/^([a-zA-ZçÇ]+)\s+-\s+([a-zA-ZçÇ]+)\s+(\d{4})$/i)
  
  if (!match) return periodo
  
  const [, startMonthPt, endMonthPt, year] = match
  
  const ptMonths = {
    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
    'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
  }
  
  const startIdx = ptMonths[startMonthPt.toLowerCase()]
  const endIdx = ptMonths[endMonthPt.toLowerCase()]
  
  if (startIdx === undefined || endIdx === undefined) return periodo
  
  const getLocMonth = (idx) => {
    const date = new Date(Date.UTC(Number(year), idx, 15))
    return date.toLocaleString(locale.value, { month: 'long', timeZone: 'UTC' })
  }
  
  const startMonthLoc = getLocMonth(startIdx)
  const endMonthLoc = getLocMonth(endIdx)
  
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
  
  return `${cap(startMonthLoc)} - ${cap(endMonthLoc)} ${year}`
}
</script>

<style scoped>

.edition-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.edition-title {
  margin-top: 1rem;
}

.presentation-link {
  margin: 1rem 0;
}

.cover-wrapper {
  flex: 0 0 200px;
}

.cover-wrapper img {
  width: 100%;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.edition-info {
  flex: 1;
}

.articles-list h2 {
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.search-bar {
  margin-bottom: 1.5rem;
}

.section-group {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
  padding-left: 1rem;
  border-left: 4px solid var(--secondary-color);
}

@media (max-width: 768px) {
  .edition-header {
    flex-direction: column;
    align-items: center;
  }
  
  .cover-wrapper {
    flex: 0 0 auto;
    width: 100%;
    max-width: 300px;
  }
}
.tabs-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.tabs-header button {
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  font-weight: 500;
  transition: all 0.2s;
}

.tabs-header button:hover {
  color: var(--primary-color);
  background-color: #f9f9f9;
}

.tabs-header button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.authors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.author-card {
  display: block;
  text-decoration: none;
  color: inherit;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fff;
  transition: all 0.2s;
  overflow: hidden;
}

.author-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.avatar-container {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: #fff;
  font-weight: bold;
  font-size: 1.2rem;
  letter-spacing: 1px;
}

.info-container {
  flex: 1;
  min-width: 0; 
}

.info-container h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: var(--primary-color);
  font-weight: 600;
  line-height: 1.3;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.85rem;
  color: #666;
}

.institution {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .tabs-header {
    overflow-x: auto;
  }
}
</style>
