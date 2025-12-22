<template>
  <div>
    <div class="banner-img">
      <img src="/topoi.gif" alt="Topoi" />
      <div>
        {{ $t('home.banner_title') }}
        <br>
        {{ $t('home.banner_subtitle') }}
      </div>
    </div>

    <div class="home-page container">
      <div v-if="pending" class="skeleton-featured-edition">
        <div class="skeleton-page-content skeleton-loading"></div>

        <div class="edition-header">
          <div class="skeleton-title skeleton-loading"></div>
          <div class="skeleton-link skeleton-loading"></div>
        </div>

        <div class="skeleton-dossier-title skeleton-loading"></div>

        <div class="section-group" v-for="i in 2" :key="i">
          <div class="skeleton-section-title skeleton-loading"></div>
          <div class="articles-list">
             <div class="article-card skeleton-card" v-for="j in 3" :key="j">
               <div class="skeleton-card-title skeleton-loading"></div>
               <div class="skeleton-card-meta skeleton-loading"></div>
               <div class="skeleton-card-abstract skeleton-loading"></div>
             </div>
          </div>
        </div>
      </div>
      <div v-else-if="error" class="error">{{ $t('common.error_loading', { message: error.message }) }}</div>
      <div v-else class="content">
        <BlocksRenderer v-if="data?.data?.pagina?.conteudo" :content="data.data.pagina.conteudo" />
        
        <section v-if="featuredEdition" class="featured-edition">
          <div class="edition-header">
            <h2>
              <span v-if="featuredEdition.numero">nº {{ featuredEdition.numero }} /</span>
              V. {{ featuredEdition.volume }}
              <span v-if="featuredEdition.periodo">— {{ featuredEdition.periodo }}</span>
            </h2>
            <NuxtLink :to="localePath(`/edicoes/${featuredEdition.numero}-${featuredEdition.volume}`)" class="view-all">
              {{ $t('home.view_full_edition') }}
            </NuxtLink>
          </div>

          <h2 v-if="featuredEdition.titulo" class="dossier-title">
            {{ getEditionTitle(featuredEdition) }}
          </h2>

          <div v-for="group in dossierArticlesBySection" :key="group.secao" class="section-group">
            <h4 class="section-title">
              {{ $t(`common.sections.${group.secao}`) }}
            </h4>
            <div class="articles-list">
              <ArticleCard 
                v-for="article in group.articles" 
                :key="article.id" 
                :article="article" 
                :show-section="false"
              />
            </div>
          </div>

          <h2 v-if="hasContinuous && hasDossier" class="dossier-title">
            {{ $t('home.continuous') }}
          </h2>

          <div v-for="group in continuousArticlesBySection" :key="group.secao" class="section-group">
            <h4 class="section-title">
              {{ $t(`common.sections.${group.secao}`) }}
            </h4>
            <div class="articles-list">
              <ArticleCard 
                v-for="article in group.articles" 
                :key="article.id" 
                :article="article" 
                :show-section="false"
              />
            </div>
          </div>
        </section>
      </div>
      <ScrollToTop />
    </div>
</div>
</template>

<script setup>
const { find } = useStrapi()
const { locale } = useI18n()
const localePath = useLocalePath()

const { data, pending, error } = await useLazyAsyncData('home', () => find('home', {
  locale: locale.value,
  populate: {
    pagina: {
      populate: {
        edicao: {
          populate: {
            artigos: {
              populate: ['autores', 'arquivo']
            }
          }
        }
      }
    }
  }
}), {
  watch: [locale]
})

const featuredEdition = computed(() => data.value?.data?.pagina?.edicao)

const getEditionTitle = (edition) => {
  if (!edition) return ''
  
  if (locale.value === 'en' && edition.titulo_en) {
    return edition.titulo_en
  }
  if (locale.value === 'es' && edition.titulo_es) {
    return edition.titulo_es
  }
  return edition.titulo
}

const SECTION_ORDER = ["Artigo", "Resenha", "Entrevista", "Documento"];

const hasDossier = computed(() => featuredEdition.value?.artigos?.some(a => a.dossie))
const hasContinuous = computed(() => featuredEdition.value?.artigos?.some(a => !a.dossie))

const dossierArticlesBySection = computed(() => {
  const articles = featuredEdition.value?.artigos.filter(article => article.dossie)
  if (!articles?.length) return []
  
  const groupedMap = {}
  articles
  .sort((a, b) => SECTION_ORDER.indexOf(a.secao) - SECTION_ORDER.indexOf(b.secao))
  .forEach(article => {
    const secao = article.secao
    if (!groupedMap[secao]) {
      groupedMap[secao] = []
    }
    groupedMap[secao].push(article)
  })
  
  return Object.entries(groupedMap).map(([secao, articles]) => ({
    secao,
    articles
  })).sort((a, b) => SECTION_ORDER.indexOf(a.secao) - SECTION_ORDER.indexOf(b.secao))
})

const continuousArticlesBySection = computed(() => {
  const articles = featuredEdition.value?.artigos.filter(article => !article.dossie)
  if (!articles?.length) return []
  
  const groupedMap = {}
  articles
  .sort((a, b) => SECTION_ORDER.indexOf(a.secao) - SECTION_ORDER.indexOf(b.secao))
  .forEach(article => {
    const secao = article.secao
    if (!groupedMap[secao]) {
      groupedMap[secao] = []
    }
    groupedMap[secao].push(article)
  })
  
  return Object.entries(groupedMap).map(([secao, articles]) => ({
    secao,
    articles
  })).sort((a, b) => SECTION_ORDER.indexOf(a.secao) - SECTION_ORDER.indexOf(b.secao))
})
</script>

<style scoped>
.banner-img {
  padding: 12px;
  height: 180px;
  width: 100%;
  background-image: url('/banner-topoi.jpg');
  background-size: cover;
  background-position: center;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: 'Alegreya', ui-serif;
  font-weight: bold;
  color: #f5f5f5;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
}

.banner-img img {
  height: 100px;
  margin: 0 auto
}

@media (max-width: 840px) {
  .banner-img {
    height: 140px;
  }
  .banner-img img {
    height: 50px;
  }
}

.featured-edition {
  margin-top: 3rem;
}

.edition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid var(--primary-color);
}

.edition-header h2 {
  margin: 0;
  color: var(--primary-color);
}

.view-all {
  color: var(--secondary-color);
  font-size: 1.2rem;
  font-weight: 500;
  text-align: right;
  transition: color 0.2s;
}

.view-all:hover {
  color: var(--secondary-color-dark);
}

.dossier-title {
  font-size: 1.6rem;
  margin-bottom: 2rem;
  font-style: italic;
}

.section-group {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
  padding-left: 1rem;
  border-left: 4px solid var(--secondary-color);
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Skeleton Loading Styles */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-loading {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(to right, #f0f0f0 4%, #e0e0e0 25%, #f0f0f0 36%);
  background-size: 1000px 100%;
  border-radius: 4px;
}

.skeleton-page-content {
  height: 2.5rem;
  width: 300px;
  margin-top: 1rem;
  margin-bottom: 3rem;
}

.skeleton-title {
  height: 2.5rem;
  width: 250px;
}

.skeleton-link {
  height: 1.5rem;
  width: 100px;
}

.skeleton-dossier-title {
  height: 2rem;
  width: 60%;
  margin-bottom: 2rem;
}

.skeleton-section-title {
  height: 2rem;
  width: 150px;
  margin-bottom: 1rem;
}

.skeleton-card {
  height: 180px;
  border: 1px solid #eee;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-card-title {
  height: 1.5rem;
  width: 80%;
}

.skeleton-card-meta {
  height: 1rem;
  width: 50%;
}

.skeleton-card-abstract {
  height: 4rem;
  width: 100%;
  flex-grow: 1;
}
</style>