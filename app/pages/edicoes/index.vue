<template>
  <div class="editions-page container">
    <h1>{{ $t('editions.title') }}</h1>
    
    <div v-if="pending" class="loading">{{ $t('editions.loading') }}</div>
    <div v-else-if="error" class="error">{{ $t('editions.error_loading', { message: error.message }) }}</div>
    
    <div v-else class="editions-grid">
      <div v-for="edition in data?.data" :key="edition.id" class="edition-card">
        <NuxtLink :to="localePath(`/edicoes/${edition.numero}-${edition.volume}`)">
          <div class="cover" v-if="edition.capa">
            <img :src="getStrapiMedia(edition.capa.url)" :alt="$t('editions.cover_alt', { volume: edition.volume })">
          </div>
          <div class="info">
            <h2>
              <span v-if="edition.numero">nº {{ edition.numero }} /</span>
              V. {{ edition.volume }}
            </h2>
            <p class="period">{{ edition.periodo }}</p>
            <!--<p class="date" v-if="edition.data_de_publicacao">
              {{ new Date(edition.data_de_publicacao).getFullYear() }}
            </p>-->
          </div>
        </NuxtLink>
      </div>
    </div>
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

const { data, pending, error } = await useAsyncData('edicoes', () => find('edicoes', {
  locale: "pt-BR",
  sort: ['volume:desc', 'numero:desc'],
  pagination: {
    page: 1,
    pageSize: 100
  },
  populate: ['capa']
}), {
  watch: [locale]
})
</script>

<style scoped>


.editions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
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

.info {
  padding: 1rem;
  text-align: center;
}

.info h2 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
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
  
  .info h2 {
    font-size: 1rem;
  }
}
</style>
