<template>
  <div class="home-page container">
    <LoadingSpinner v-if="pending" :text="$t('common.loading')" />
    <div v-else-if="error" class="error">{{ $t('common.error_loading', { message: error.message }) }}</div>
    <div v-else class="content">
      <!--<h1>{{ data?.data?.displayName || 'Revista Topoi' }}</h1>-->
      <BlocksRenderer v-if="data?.data?.pagina?.conteudo" :content="data.data.pagina.conteudo" />
      
      <!-- Featured Edition -->
      <section v-if="featuredEdition" class="featured-edition">
        <div class="edition-header">
          <h2>{{ $t('home.featured_edition') }}</h2>
          <NuxtLink :to="localePath(`/edicoes/${featuredEdition.numero}-${featuredEdition.volume}`)" class="view-all">
            {{ $t('home.view_full_edition') }} <i class="fa-solid fa-arrow-right"></i>
          </NuxtLink>
        </div>
        
        <div class="edition-info">
          <h3>
            <span v-if="featuredEdition.numero">nº {{ featuredEdition.numero }} /</span>
            V. {{ featuredEdition.volume }}
          </h3>
          <p v-if="featuredEdition.periodo">{{ featuredEdition.periodo }}</p>
        </div>

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
</template>

<script setup>
const { find } = useStrapi()
const { locale } = useI18n()
const localePath = useLocalePath()

const { data, pending, error } = await useAsyncData('home', async () => {
  const currentLocale = locale.value

  // Case 1: If current locale is pt-BR, fetch everything in one go
  if (currentLocale === 'pt-BR') {
    return find('home', {
      locale: 'pt-BR',
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
    })
  }

  // Case 2: Mixed locales - fetch content in current locale, but edition/articles from pt-BR
  const [localHome, ptHome] = await Promise.all([
    // Fetch content in current locale
    find('home', {
      locale: currentLocale,
      populate: {
        pagina: {
          populate: '*'
        }
      }
    }),
    // Fetch edition/articles from pt-BR
    find('home', {
      locale: 'pt-BR',
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
    })
  ])

  // Merge the pt-BR edition into the localized response
  if (localHome.data?.pagina && ptHome.data?.pagina?.edicao) {
    localHome.data.pagina.edicao = ptHome.data.pagina.edicao
  }

  return localHome
}, {
  watch: [locale]
})

const featuredEdition = computed(() => data.value?.data?.pagina?.edicao)

const articlesBySection = computed(() => {
  const articles = featuredEdition.value?.artigos
  if (!articles?.length) return {}
  
  // Group articles by section (secao)
  const grouped = {}
  articles.forEach(article => {
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

.featured-edition {
  margin-top: 3rem;
}

.edition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.view-all:hover {
  color: var(--primary-color);
}

.edition-info {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  width: fit-content;
}

.edition-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
}

.edition-info p {
  margin: 0;
  color: #666;
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
