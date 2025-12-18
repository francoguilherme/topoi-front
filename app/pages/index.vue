<template>
  <div>
    <div class="banner-img">
      <div>
        <img src="/topoi.gif" alt="Topoi" />
      </div>
      <div>
        REVISTA DE HISTÓRIA
        <br>
        Programa de Pós-Graduação em História Social da UFRJ
      </div>
    </div>

    <div class="home-page container">
      <LoadingSpinner v-if="pending" :text="$t('common.loading')" />
      <div v-else-if="error" class="error">{{ $t('common.error_loading', { message: error.message }) }}</div>
      <div v-else class="content">
        <!--<h1>{{ data?.data?.displayName || 'Revista Topoi' }}</h1>-->
        <BlocksRenderer v-if="data?.data?.pagina?.conteudo" :content="data.data.pagina.conteudo" />
        
        <!-- Featured Edition -->
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
            {{ $t('dossier.default_title') }}:
            {{ getEditionTitle(featuredEdition) }}
          </h2>

          <!-- Articles grouped by section -->
          <div v-for="(articles, secao) in articlesBySection" :key="secao" class="section-group">
            <h4 class="section-title">
              {{ secao }}
            </h4>
            <div class="articles-list">
              <ArticleCard 
                v-for="article in articles" 
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

const { data, pending, error } = await useAsyncData('home', () => find('home', {
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

const articlesBySection = computed(() => {
  const articles = featuredEdition.value?.artigos
  if (!articles?.length) return {}
  const SECTION_ORDER = ["Artigo", "Resenha", "Entrevista", "Documento"];

  // Group articles by section (secao)
  const grouped = {}
  articles
  .sort((a, b) => SECTION_ORDER.indexOf(a.secao) - SECTION_ORDER.indexOf(b.secao))
  .forEach(article => {
    const secao = $t(`common.sections.${article.secao}`)
    if (!grouped[secao]) {
      grouped[secao] = []
    }
    grouped[secao].push(article)
  })
  
  return grouped
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
  width: fit-content;
}

@media (max-width: 840px) {
  .banner-img {
    height: 130px;
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
  margin-bottom: 2rem;
}

.section-group {
  margin-bottom: 3rem;
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
</style>