<template>

  <div class="article-reader container">

    <LoadingSpinner v-if="pending" :text="$t('publications.detail.reader_loading')" />

    <div v-else-if="error || !article" class="error">

      {{ error ? $t('publications.detail.error_loading', { message: error.message }) : $t('publications.detail.not_found') }}

    </div>

    <template v-else>

      <p class="back">

        <NuxtLink :to="localePath(`/publicacoes/${article.slug}`)">

          {{ $t('publications.detail.reader_back') }}

        </NuxtLink>

      </p>



      <LoadingSpinner v-if="xmlPending" :text="$t('publications.detail.reader_loading')" />

      <div v-else-if="xmlError" class="error">

        {{ $t('publications.detail.reader_error', { message: xmlError.message }) }}

      </div>

      <div v-else-if="!xmlText" class="error">

        {{ $t('publications.detail.reader_no_xml') }}

      </div>

      <div v-else class="reader-layout">

        <div class="reader-main">

          <ClientOnly>

            <JatsArticle :xml="xmlText" :images="images" @parse-error="onParseError" />

            <p v-if="parseError" class="error">{{ parseError.message }}</p>

            <template #fallback>

              <LoadingSpinner :text="$t('publications.detail.reader_loading')" />

            </template>

          </ClientOnly>

        </div>

        <JatsTableOfContents v-if="toc.length" :items="toc" />

      </div>

    </template>

  </div>

</template>



<script setup lang="ts">

import { buildImageMap, type StrapiImageFile } from '~/utils/jats/figures'

import { parseJatsXml } from '~/utils/jats/parse'

import { extractArticleToc } from '~/utils/jats/toc'



const route = useRoute()

const { find } = useStrapi()

const { locale, t } = useI18n()

const localePath = useLocalePath()

const config = useRuntimeConfig()



const getStrapiMedia = (url: string) => {

  if (url.startsWith('http')) return url

  return `${config.public.strapi.url}${url}`

}



const statusOf = (err: unknown): number | undefined => {

  if (!err || typeof err !== 'object') return undefined

  const value = err as { statusCode?: number; status?: number }

  return value.statusCode ?? value.status

}



const { data, pending, error } = await useAsyncData(

  () => `artigo-ler-${route.params.slug}`,

  () => find('artigos', {

    filters: { slug: route.params.slug },

    populate: ['imagens'],

  }),

)



const article = computed(() => {

  if (data.value?.data?.length > 0) {

    return data.value.data[0]

  }

  return null

})



const { data: xmlText, error: xmlError, pending: xmlPending } = await useAsyncData(

  () => `artigo-xml-${route.params.slug}`,

  async () => {

    try {

      return await $fetch<string>(`/publicacoes/${encodeURIComponent(String(route.params.slug))}/xml`, {

        responseType: 'text',

      })

    } catch (err) {

      if (statusOf(err) === 404) return null

      throw err

    }

  },

)



const images = computed(() =>

  buildImageMap(article.value?.imagens as StrapiImageFile[] | undefined, getStrapiMedia),

)



const parseError = ref<Error | null>(null)

const onParseError = (error: Error) => {

  parseError.value = error

}



watch(xmlText, () => {

  parseError.value = null

})



const tocLabels = computed(() => ({
  abstract: t('publications.detail.reader_toc_abstract'),
  footnotes: t('publications.detail.reader_toc_footnotes'),
  references: t('publications.detail.reader_toc_references'),
}))



const toc = computed(() => {

  if (!xmlText.value) return []

  try {

    return extractArticleToc(parseJatsXml(xmlText.value), tocLabels.value)

  } catch {

    return []

  }

})



const title = computed(() => {

  if (!article.value) return ''

  if (locale.value === 'en' && article.value.titulo_en) return article.value.titulo_en

  if (locale.value === 'es' && article.value.titulo_es) return article.value.titulo_es

  return article.value.titulo || ''

})



useSeoMeta({

  title,

  description: title,

})

</script>



<style scoped>

.article-reader {

  max-width: 1200px;

}



.back {

  margin-bottom: 1.5rem;

}



.error {

  font-size: 1.1rem;

}



.reader-layout {

  display: grid;

  grid-template-columns: minmax(0, 820px) minmax(200px, 260px);

  gap: 2rem;

  justify-content: start;

  align-items: start;

}



.reader-main {

  min-width: 0;

}



@media (max-width: 1099px) {

  .reader-layout {

    grid-template-columns: minmax(0, 1fr);

  }

}

</style>


