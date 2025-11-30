<template>
  <div class="home-page container">
    <div v-if="pending" class="loading">Carregando...</div>
    <div v-else-if="error" class="error">Erro ao carregar dados: {{ error.message }}</div>
    <div v-else class="content">
      <!--<h1>{{ data?.data?.displayName || 'Revista Topoi' }}</h1>-->
      <BlocksRenderer v-if="data?.data?.pagina?.conteudo" :content="data.data.pagina.conteudo" />
      
      <!-- Featured Edition -->
      <section v-if="featuredEdition" class="featured-edition">
        <div class="edition-header">
          <h2>Edição em Destaque</h2>
          <NuxtLink :to="`/edicoes/${featuredEdition.numero}-${featuredEdition.volume}`" class="view-all">
            Ver Edição Completa →
          </NuxtLink>
        </div>
        
        <div class="edition-info">
          <h3>nº {{ featuredEdition.numero }} / V. {{ featuredEdition.volume }}</h3>
          <p v-if="featuredEdition.periodo">{{ featuredEdition.periodo }}</p>
        </div>

        <!-- Articles grouped by section -->
        <div v-for="(articles, secao) in articlesBySection" :key="secao" class="section-group">
          <h4 class="section-title">
            {{ secao === 'Tradução'? 'Traduções': secao+'s' }}
          </h4>
          <div class="articles-list">
            <ArticleCard 
              v-for="article in articles" 
              :key="article.id" 
              :article="article" 
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const { find } = useStrapi()

const { data, pending, error } = await useAsyncData('home', () => find('home', {
  populate: {
    pagina: {
      populate: {
        edicao: {
          populate: {
            artigos: {
              populate: ['autores']
            }
          }
        }
      }
    }
  }
}))

const featuredEdition = computed(() => data.value?.data?.pagina?.edicao)

const articlesBySection = computed(() => {
  const articles = featuredEdition.value?.artigos
  if (!articles?.length) return {}
  
  // Group articles by section (secao)
  const grouped = {}
  articles.forEach(article => {
    const secao = article.secao || 'Outros'
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
