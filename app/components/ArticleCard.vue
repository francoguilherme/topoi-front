<template>
  <NuxtLink :to="localePath(`/publicacoes/${article.slug}`)" class="article-card">
    <h3>
      {{ article.titulo }}
    </h3>
    <div class="meta">
      <span v-if="article.secao" class="section">{{ $t(`publications.sections.${article.secao}`) }}</span>
      <span 
        v-if="showEdition && article.edicao" 
        class="edition clickable"
        @click.prevent.stop="navigateToEdition"
      >
        nº {{ article.edicao.numero }} / V. {{ article.edicao.volume }}
      </span>
      <span v-if="article.data_de_publicacao" class="date">
        {{ new Date(article.data_de_publicacao).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR') }}
      </span>
      <a 
        v-if="article.arquivo" 
        href="#"
        class="download-link"
        @click.prevent.stop="handleDownload"
      >
        {{ $t('common.download') }}
      </a>
    </div>
    <div class="authors" v-if="article.autores?.length">
      {{ $t('common.by') }} 
      <span v-for="(autor, index) in article.autores" :key="autor.id">
        <span v-if="index > 0 && index === article.autores.length - 1">{{ $t('common.and') }} </span>
        {{ autor.nome }} ({{ autor.instituicao }})<span v-if="index < article.autores.length - 1">; </span>
      </span>
    </div>
    <div 
      v-if="article.resumo" 
      class="summary" 
      :class="{ expanded: isExpanded }"
      @click.prevent.stop="toggleExpand"
    >
      <div class="summary-content">
        <BlocksRenderer :content="article.resumo" />
      </div>
      <span v-if="!isExpanded" class="more-indicator">
        {{ $t('common.more') }} 
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  article: {
    type: Object,
    required: true
  },
  showEdition: {
    type: Boolean,
    default: false
  }
})

const config = useRuntimeConfig()
const router = useRouter()
const { locale } = useI18n()
const localePath = useLocalePath()
const isExpanded = ref(false)
const isDownloading = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const getStrapiMedia = (url) => {
  if (url.startsWith('http')) return url
  return `${config.public.strapi.url}${url}`
}

const navigateToEdition = () => {
  if (props.article.edicao) {
    router.push(localePath(`/edicoes/${props.article.edicao.numero}-${props.article.edicao.volume}`))
  }
}

const handleDownload = async () => {
  if (isDownloading.value) return
  
  try {
    isDownloading.value = true
    const url = getStrapiMedia(props.article.arquivo.url)
    const filename = `${props.article.slug}.pdf`
    
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Download failed:', error)
    // Fallback to opening in new tab if fetch fails
    window.open(getStrapiMedia(props.article.arquivo.url), '_blank')
  } finally {
    isDownloading.value = false
  }
}
</script>

<style scoped>
.article-card {
  display: block;
  text-decoration: none;
  color: inherit;
  border: 1px solid #eee;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  background-color: #fff;
  transition: box-shadow 0.2s;
}

.article-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

h3 {
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  color: var(--primary-color);
}

.meta {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.section {
  font-weight: bold;
  color: var(--secondary-color);
}

.edition {
  font-weight: 500;
  color: var(--primary-color);
  background-color: #f0f0f0;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

.edition.clickable {
  cursor: pointer;
  transition: background-color 0.2s;
}

.edition.clickable:hover {
  background-color: #e0e0e0;
  text-decoration: underline;
}

.download-link {
  color: var(--secondary-color);
  font-weight: bold;
  text-decoration: none;
  margin-left: auto; /* Push to the right if flex container allows, or just spacing */
}

.download-link:hover {
  text-decoration: underline;
}

.authors {
  font-size: 0.95rem;
  font-style: italic;
  margin-bottom: 0.5rem;
}

.summary {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: #444;
  line-height: 1.5;
  cursor: pointer;
  position: relative;
}

.summary-content {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
}

.summary :deep(p) {
  margin: 0;
  display: inline;
}

.summary.expanded .summary-content {
  -webkit-line-clamp: unset;
  line-clamp: unset;
}

.more-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  background: linear-gradient(to right, transparent, #fff 15%);
  padding-left: 1.5rem;
  padding-right: 0;
  color: var(--primary-color);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.85rem;
}

.summary:hover .summary-content {
  color: #000;
}
</style>
