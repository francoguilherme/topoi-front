<template>
  <div class="author-detail container">
    <LoadingSpinner v-if="pendingAuthor" :text="$t('authors.detail.loading')" />
    <div v-else-if="errorAuthor || !author" class="error">
      {{ errorAuthor ? $t('authors.detail.error_loading', { message: errorAuthor.message }) : $t('authors.detail.not_found') }}
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
        <h2>{{ $t('authors.detail.biography') }}</h2>
        <BlocksRenderer :content="author.biografia" />
      </section>

      <section class="author-articles">
        <h2>{{ $t('authors.detail.publications') }}</h2>
        
        <div v-if="articlesData?.data?.length">
          <ArticleCard 
            v-for="article in articlesData.data" 
            :key="article.id" 
            :article="article"
            :showEdition="true" 
          />
          
          <Pagination 
            v-model="page" 
            :totalPages="articlesData?.meta?.pagination?.pageCount" 
          />
        </div>
        <p v-else>{{ $t('authors.detail.no_publications') }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const { find } = useStrapi()
const { locale } = useI18n()
const config = useRuntimeConfig()

const getStrapiMedia = (url) => {
  if (url.startsWith('http')) return url
  return `${config.public.strapi.url}${url}`
}

const page = ref(Number(route.query.page) || 1)
const pageSize = 5

// Sync state to URL
watch(page, () => {
  router.push({
    query: {
      ...route.query,
      page: page.value
    }
  })
})

// Sync URL to state (for back/forward navigation)
watch(() => route.query.page, (newPage) => {
  if (newPage) {
    page.value = Number(newPage)
  }
})

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

useSeoMeta({
  title: `${author.value?.nome}`,
  description: 'Veja todas as publicações deste autor.'
})

const { data: articlesData, pending: pendingArticles, error: errorArticles } = await useAsyncData(
  `autor-artigos-${route.params.slug}-${locale.value}`,
  () => find('artigos', {
    filters: {
      autores: {
        slug: route.params.slug
      }
    },
    populate: ['autores', 'edicao', 'arquivo'],
    sort: ['data_de_publicacao:desc'],
    pagination: {
      page: page.value,
      pageSize
    }
  }),
  {
    watch: [page, locale]
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
