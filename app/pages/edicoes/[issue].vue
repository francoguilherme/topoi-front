<template>
  <div class="edition-detail container">
    <div v-if="pending" class="loading">{{ $t('editions.detail.loading') }}</div>
    <div v-else-if="error || !edition" class="error">
      {{ error ? $t('editions.detail.error_loading', { message: error.message }) : $t('editions.detail.not_found') }}
    </div>
    
    <div v-else class="content">
      <header class="edition-header">
        <div class="cover-wrapper" v-if="edition.capa">
          <img :src="getStrapiMedia(edition.capa.url)" :alt="$t('editions.detail.cover_alt')">
        </div>
        <div class="edition-info">
          <h1>nº {{ edition.numero }} / V. {{ edition.volume }}</h1>
          <p class="period">{{ edition.periodo }}</p>
          <p class="date" v-if="edition.data_de_publicacao">
            {{ $t('editions.detail.published_at', { date: new Date(edition.data_de_publicacao).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR') }) }}
          </p>
          <div v-if="edition.titulo" class="edition-title">
            <h2>{{ edition.titulo }}</h2>
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

      <section class="articles-list">
        <h2>{{ $t('editions.detail.publications_in_issue') }}</h2>
        
        <div class="search-bar">
          <input 
            v-model="searchInput" 
            type="text" 
            :placeholder="$t('editions.detail.search_placeholder')"
          >
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
            />
          </div>
        </div>
        <p v-else-if="searchQuery">{{ $t('editions.detail.no_results_query', { query: searchQuery }) }}</p>
        <p v-else>{{ $t('editions.detail.no_results') }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { find } = useStrapi()
const { locale, t } = useI18n()
const config = useRuntimeConfig()

const searchInput = ref('')
const searchQuery = ref('')
let searchTimeout

const getStrapiMedia = (url) => {
  if (url.startsWith('http')) return url
  return `${config.public.strapi.url}${url}`
}

// Parse the issue parameter (e.g., "25-1" -> volume: 25, numero: 1)
const [numero, volume] = route.params.issue.split('-').map(Number)

const { data, pending, error } = await useAsyncData(
  `edicao-${route.params.issue}`, 
  () => find('edicoes', {
    locale: locale.value,
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
        populate: ['autores', 'arquivo']
      }
    }
  }), {
    watch: [locale]
  }
)

const edition = computed(() => {
  if (data.value?.data?.length > 0) {
    return data.value.data[0]
  }
  return null
})

const filteredArticles = computed(() => {
  if (!edition.value?.artigos) return []
  
  if (!searchQuery.value) return edition.value.artigos

  const query = searchQuery.value.toLowerCase()
  
  return edition.value.artigos.filter(article => {
    const titleMatch = article.titulo?.toLowerCase().includes(query)
    const authorMatch = article.autores?.some(autor => 
      autor.nome?.toLowerCase().includes(query)
    )
    
    return titleMatch || authorMatch
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
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchQuery.value = newVal
  }, 500)
})
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

.search-bar input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
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
</style>
