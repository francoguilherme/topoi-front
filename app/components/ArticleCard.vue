<template>
  <div class="article-card" @click="navigateToArticle">
    <h3>
      <NuxtLink :to="localePath(`/publicacoes/${article.slug}`)" @click.stop>
        {{ displayTitle }}
      </NuxtLink>
    </h3>
    <div class="meta">
      <span v-if="article.secao && showSection" class="section">{{ $t(`publications.sections.${article.secao}`) }}</span>
      <span 
        v-if="showEdition && article.edicao" 
        class="edition clickable"
        @click.prevent.stop="navigateToEdition"
      >
        <span v-if="article.edicao.numero">nº {{ article.edicao.numero }} /</span>
         V. {{ article.edicao.volume }}
      </span>
      <span v-if="article.data_de_publicacao" class="date">
        {{ formatDate(article.data_de_publicacao) }}
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
      <span v-for="(autor, index) in article.autores" :key="autor.id" >
        <span v-if="index > 0 && index === article.autores.length - 1">{{ $t('common.and')+' ' }} </span>
        <span 
          class="author-name clickable" 
          @click.prevent.stop="navigateToAuthor(autor.slug)"
        >
          {{ autor.nome }}
        </span>
        <span v-if="autor.instituicao"> - {{ autor.instituicao }}</span>
        <span v-if="index < article.autores.length - 1">; </span>
      </span>
    </div>
    <div 
      v-if="displayAbstract" 
      class="summary" 
      :class="{ expanded: isExpanded }"
    >
      <div class="summary-content" ref="contentRef">
        <BlocksRenderer :content="displayAbstract" />
      </div>
      <span v-show="isClient && !isExpanded && hasOverflow" class="more-indicator" @click.prevent.stop="toggleExpand">
        {{ $t('common.more') }} 
        <i class="fa-solid fa-angle-down"></i>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
const { gtag } = useGtag()

const props = defineProps({
  article: {
    type: Object,
    required: true
  },
  showEdition: {
    type: Boolean,
    default: false
  },
  showSection: {
    type: Boolean,
    default: true
  }
})

const config = useRuntimeConfig()
const router = useRouter()
const { locale } = useI18n()
const localePath = useLocalePath()
const isExpanded = ref(false)
const isDownloading = ref(false)
const isClient = ref(false)
const hasOverflow = ref(false)
const contentRef = ref(null)

const displayTitle = computed(() => {
  if (locale.value === 'en' && props.article.titulo_en) {
    return props.article.titulo_en
  }
  if (locale.value === 'es' && props.article.titulo_es) {
    return props.article.titulo_es
  }
  return props.article.titulo
})

const displayAbstract = computed(() => {
  if (locale.value === 'en' && props.article.resumo_en) {
    return props.article.resumo_en
  }
  if (locale.value === 'es' && props.article.resumo_es) {
    return props.article.resumo_es
  }
  return props.article.resumo
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const checkOverflow = () => {
  if (contentRef.value) {
    hasOverflow.value = contentRef.value.scrollHeight > contentRef.value.clientHeight
  }
}

let resizeObserver = null

onMounted(() => {
  isClient.value = true
  checkOverflow()
  if (contentRef.value) {
    resizeObserver = new ResizeObserver(checkOverflow)
    resizeObserver.observe(contentRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(() => displayAbstract.value, () => {
  if (isClient.value) {
    nextTick(checkOverflow)
  }
})

const getStrapiMedia = (url) => {
  if (url.startsWith('http')) return url
  return `${config.public.strapi.url}${url}`
}

const navigateToArticle = () => {
  router.push(localePath(`/publicacoes/${props.article.slug}`))
}

const navigateToEdition = () => {
  if (props.article.edicao) {
    router.push(localePath(`/edicoes/${props.article.edicao.numero}-${props.article.edicao.volume}`))
  }
}

const navigateToAuthor = (slug) => {
  if (slug) {
    router.push(localePath(`/autores/${slug}`))
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

    gtag('event', 'file_download', {
      file_name: filename,
      file_extension: 'pdf',
      transport_type: 'beacon'
    })
  } catch (error) {
    console.error('Download failed:', error)
    // Fallback to opening in new tab if fetch fails
    window.open(getStrapiMedia(props.article.arquivo.url), '_blank')
  } finally {
    isDownloading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (date.getUTCMonth() === 0 && date.getUTCDate() === 1) {
    return date.getUTCFullYear().toString()
  }
  return date.toLocaleDateString(locale.value === 'en' ? 'en-US' : locale.value === 'es' ? 'es-ES' : 'pt-BR', {timeZone: 'UTC'})
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
  cursor: pointer;
}

.article-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

h3 a {
  text-decoration: none;
  color: var(--primary-color);
}

h3 a:hover {
  text-decoration: underline;
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

.author-name.clickable {
  cursor: pointer;
  color: #555;
  font-weight: 500;
}

.author-name.clickable:hover {
  text-decoration: underline;
  color: var(--primary-color);
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
  text-align: justify;
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

.more-indicator:hover {
  text-decoration: underline;
}
</style>
