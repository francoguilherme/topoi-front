<script setup lang="ts">
import { computed, defineComponent, watch } from 'vue'

import '~/assets/css/jats-article.css'
import { renderArticle } from '~/utils/jats/article'
import { resolveFigureHref } from '~/utils/jats/figures'
import { parseJatsXml } from '~/utils/jats/parse'

const props = defineProps<{
  xml: string
  images: Record<string, string>
}>()

const emit = defineEmits<{
  parseError: [error: Error]
}>()

const state = computed(() => {
  try {
    const doc = parseJatsXml(props.xml)
    const imageMap = new Map(Object.entries(props.images))
    return {
      vnode: renderArticle(doc, (href) => resolveFigureHref(href, imageMap)),
      error: null as Error | null,
    }
  } catch (error) {
    return { vnode: null, error: error as Error }
  }
})

watch(
  () => state.value.error,
  (error) => {
    if (error) emit('parseError', error)
  },
  { immediate: true },
)

const articleView = computed(() => {
  const vnode = state.value.vnode
  return defineComponent({
    name: 'JatsArticleView',
    setup() {
      return () => vnode
    },
  })
})
</script>

<template>
  <component :is="articleView" v-if="state.vnode" />
</template>
