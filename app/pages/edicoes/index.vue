<template>
  <div class="editions-page container">
    <h1>{{ $t('editions.title') }}</h1>
    
    <div class="editions-list-container">
      <div class="editions-grid">
        <div v-for="edition in data?.data" :key="edition.id" class="edition-card">
          <NuxtLink :to="localePath(`/edicoes/${edition.numero}-${edition.volume}`)">
            <div class="cover" v-if="edition.capa">
              <img :src="getStrapiMedia(edition.capa.url)" :alt="$t('editions.cover_alt', { volume: edition.volume })">
            </div>
            <div class="cover placeholder" v-else>
              <span>Revista Topoi</span>
              <p>
                <span v-if="edition.numero">nº {{ edition.numero }} /</span>
                V. {{ edition.volume }}
              </p>
            </div>
            <div class="info">
              <h1 v-if="edition.titulo">
                {{ getEditionTitle(edition) }}
              </h1>
              <h2>
                <span v-if="edition.numero">nº {{ edition.numero }} /</span>
                V. {{ edition.volume }}
              </h2>
              <p v-if="edition.periodo" class="period">{{ formatPeriod(edition.periodo) }}</p>
              <!--<p class="date" v-if="edition.data_de_publicacao">
                {{ new Date(edition.data_de_publicacao).getFullYear() }}
              </p>-->
            </div>
          </NuxtLink>
        </div>
      </div>
      
      <Pagination 
        v-model="page" 
        :totalPages="data?.meta?.pagination?.pageCount" 
      />
    </div>
    <ScrollToTop />
  </div>
</template>

<script setup>
const { find } = useStrapi()
const { locale } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const getStrapiMedia = (url) => {
  if (url.startsWith('http')) return url
  return `${config.public.strapi.url}${url}`
}

const route = useRoute()
const router = useRouter()
const page = ref(Number(route.query.page) || 1)
const pageSize = 10

const { data, pending, error } = await useAsyncData(`edicoes-${locale.value}`, () => find('edicoes', {
  sort: ['volume:desc', 'numero:desc'],
  pagination: {
    page: page.value,
    pageSize
  },
  populate: ['capa']
}), {
  watch: [page, locale]
})

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

const formatPeriod = (periodo) => {
  if (!periodo) return ''
  
  // Regex for "Month a Month Year" (Portuguese)
  const match = periodo.match(/^([a-zA-ZçÇ]+)\s+-\s+([a-zA-ZçÇ]+)\s+(\d{4})$/i)
  
  if (!match) return periodo
  
  const [, startMonthPt, endMonthPt, year] = match
  
  const ptMonths = {
    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
    'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
  }
  
  const startIdx = ptMonths[startMonthPt.toLowerCase()]
  const endIdx = ptMonths[endMonthPt.toLowerCase()]
  
  if (startIdx === undefined || endIdx === undefined) return periodo
  
  // Helper to localize month
  const getLocMonth = (idx) => {
    // using UTC dates to avoid timezone shifts, setting day to 15 in middle of month
    const date = new Date(Date.UTC(Number(year), idx, 15))
    return date.toLocaleString(locale.value, { month: 'long', timeZone: 'UTC' })
  }
  
  const startMonthLoc = getLocMonth(startIdx)
  const endMonthLoc = getLocMonth(endIdx)
  
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
  
  return `${cap(startMonthLoc)} - ${cap(endMonthLoc)} ${year}`
}
</script>

<style scoped>


.editions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  align-items: start;
}

.edition-card {
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fff;
  transition: box-shadow 0.2s;
  overflow: hidden;
}

.edition-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.edition-card a {
  text-decoration: none;
  color: inherit;
}

.cover img {
  width: 100%;
  height: auto;
  display: block;
}

.cover.placeholder {
  background-color: var(--secondary-color-light);
  color: var(--secondary-color-dark);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 0.7;
  padding: 1rem;
  text-align: center;
  font-weight: bold;
  font-family: var(--font-serif);
  font-size: 1.2rem;
}

.info {
  padding: 1rem;
  height: 100%;
}

.info h1 {
  font-size: 1rem;
  line-height: 1.4;
  font-weight: 400;
}

.info h2 {
  font-size: 0.9rem;
  margin-bottom: 0;
}

.period {
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 480px) {
  .editions-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .info h1 {
    font-size: 0.9rem;
  }
  .info h2 {
    font-size: 0.8rem;
  }
}
</style>
