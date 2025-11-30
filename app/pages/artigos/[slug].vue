<template>
  <div class="article-detail container">
    <div v-if="pending" class="loading">Carregando artigo...</div>
    <div v-else-if="error || !article" class="error">
      {{ error ? 'Erro ao carregar artigo: ' + error.message : 'Artigo não encontrado.' }}
    </div>
    
    <article v-else class="content">
      <header class="article-header">
        <h1>{{ article.titulo }}</h1>
        <div class="meta">
          <span v-if="article.secao" class="section">{{ article.secao }}</span>
          <span v-if="article.data_de_publicacao" class="date">
            {{ new Date(article.data_de_publicacao).toLocaleDateString('pt-BR') }}
          </span>
        </div>
        <div class="authors" v-if="article.autores?.length">
          Por: 
          <span v-for="(autor, index) in article.autores" :key="autor.id">
            <NuxtLink :to="`/autores/${autor.slug}`">{{ autor.nome }}</NuxtLink>
            <span v-if="index < article.autores.length - 1">, </span>
          </span>
        </div>
      </header>

      <div class="abstract" v-if="article.resumo">
        <h2>Resumo</h2>
        <BlocksRenderer :content="article.resumo" />
      </div>

      <div class="keywords" v-if="article.palavras_chave?.length">
        <h3>Palavras-chave:</h3>
        <ul>
          <li v-for="kw in article.palavras_chave" :key="kw.id">
            {{ kw.texto }} <!-- Assuming 'texto' is the field in 'simples.texto' component -->
          </li>
        </ul>
      </div>

      <div class="download" v-if="article.arquivo">
        <a :href="getStrapiMedia(article.arquivo.url)" target="_blank" class="btn-download">
          Baixar PDF
        </a>
      </div>
    </article>
  </div>
</template>

<script setup>
const route = useRoute()
const { find } = useStrapi()
const config = useRuntimeConfig()

// Helper to get full URL for media
const getStrapiMedia = (url) => {
  if (url.startsWith('http')) return url
  return `${config.public.strapi.url}${url}`
}

const { data, pending, error } = await useAsyncData(
  `artigo-${route.params.slug}`, 
  () => find('artigos', {
    filters: {
      slug: route.params.slug
    },
    populate: ['autores', 'arquivo', 'palavras_chave']
  })
)

const article = computed(() => {
  if (data.value?.data?.length > 0) {
    return data.value.data[0]
  }
  return null
})
</script>

<style scoped>
.article-detail {
  max-width: 800px;
}

.article-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.meta {
  color: #666;
  margin: 0.5rem 0;
}

.section {
  font-weight: bold;
  color: var(--secondary-color);
  margin-right: 1rem;
}

.authors a {
  font-weight: bold;
}

.abstract {
  margin-bottom: 2rem;
  line-height: 1.8;
}

.keywords {
  margin-bottom: 2rem;
}

.keywords ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keywords li {
  background-color: #eee;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.btn-download {
  display: inline-block;
  background-color: var(--secondary-color);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
}

.btn-download:hover {
  background-color: #6a1630;
}
</style>
