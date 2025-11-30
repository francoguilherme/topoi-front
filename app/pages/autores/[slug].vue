<template>
  <div class="author-detail container">
    <div v-if="pendingAuthor" class="loading">Carregando autor...</div>
    <div v-else-if="errorAuthor || !author" class="error">
      {{ errorAuthor ? 'Erro ao carregar autor: ' + errorAuthor.message : 'Autor não encontrado.' }}
    </div>
    
    <div v-else class="content">
      <header class="author-header">
        <div class="photo" v-if="author.foto">
          <img :src="getStrapiMedia(author.foto.url)" :alt="author.nome">
        </div>
        <div class="info">
          <h1>{{ author.nome }}</h1>
          <p v-if="author.instituicao">{{ author.instituicao }}</p>
          <p v-if="author.departamento">{{ author.departamento }}</p>
          <p v-if="author.email"><a :href="`mailto:${author.email}`">{{ author.email }}</a></p>
          <p v-if="author.orcid">
            <a :href="author.orcid" target="_blank" rel="noopener noreferrer">ORCID</a>
          </p>
        </div>
      </header>

      <section class="bio" v-if="author.biografia">
        <h2>Biografia</h2>
        <BlocksRenderer :content="author.biografia" />
      </section>

      <section class="author-articles">
        <h2>Artigos Publicados</h2>
        
        <div v-if="pendingArticles" class="loading">Carregando artigos...</div>
        <div v-else-if="articlesData?.data?.length">
          <ArticleCard 
            v-for="article in articlesData.data" 
            :key="article.id" 
            :article="article" 
          />
          
          <Pagination 
            v-model="page" 
            :totalPages="articlesData?.meta?.pagination?.pageCount" 
          />
        </div>
        <p v-else>Nenhum artigo encontrado.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { find } = useStrapi()
const config = useRuntimeConfig()

const getStrapiMedia = (url) => {
  if (url.startsWith('http')) return url
  return `${config.public.strapi.url}${url}`
}

const page = ref(1)
const pageSize = 5

const { data: authorData, pending: pendingAuthor, error: errorAuthor } = await useAsyncData(
  `autor-${route.params.slug}`, 
  () => find('autores', {
    filters: {
      slug: route.params.slug
    },
    populate: ['foto']
  })
)

const author = computed(() => {
  if (authorData.value?.data?.length > 0) {
    return authorData.value.data[0]
  }
  return null
})

const { data: articlesData, pending: pendingArticles, error: errorArticles } = await useAsyncData(
  `autor-artigos-${route.params.slug}`,
  () => find('artigos', {
    filters: {
      autores: {
        slug: route.params.slug
      }
    },
    populate: ['autores'],
    sort: ['data_de_publicacao:desc'],
    pagination: {
      page: page.value,
      pageSize
    }
  }),
  {
    watch: [page]
  }
)
</script>

<style scoped>


.author-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: center;
}

.photo img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.info h1 {
  margin-bottom: 0.5rem;
}

.bio {
  margin-bottom: 3rem;
  line-height: 1.6;
}

.author-articles h2 {
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .author-header {
    flex-direction: column;
    text-align: center;
  }
  
  .photo img {
    width: 120px;
    height: 120px;
  }
}
</style>
