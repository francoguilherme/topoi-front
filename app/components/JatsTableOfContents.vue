<script setup lang="ts">
import type { TocItem } from '~/utils/jats/toc'

defineProps<{
  items: TocItem[]
}>()

const { t } = useI18n()

const panelOpen = ref(false)
const panelRef = ref<HTMLElement | null>(null)

const closePanel = () => {
  panelOpen.value = false
}

const openPanel = () => {
  panelOpen.value = true
}

const onLinkClick = () => {
  if (window.matchMedia('(max-width: 1099px)').matches) {
    closePanel()
  }
}

const itemIndent = (level: number) => ({
  paddingLeft: `${Math.max(0, level - 1) * 0.75}rem`,
})

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && panelOpen.value) {
    closePanel()
  }
}

watch(panelOpen, (open) => {
  if (open) {
    nextTick(() => panelRef.value?.focus())
  }
})

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <aside class="jats-toc jats-toc--desktop" aria-labelledby="jats-toc-heading-desktop">
    <h2 id="jats-toc-heading-desktop" class="jats-toc__title">{{ t('publications.detail.reader_toc') }}</h2>
    <nav class="jats-toc__nav" :aria-label="t('publications.detail.reader_toc')">
      <ul class="jats-toc__list">
        <li
          v-for="item in items"
          :key="item.id"
          class="jats-toc__item"
          :style="itemIndent(item.level)"
        >
          <a :href="`#${item.id}`" class="jats-toc__link" @click="onLinkClick">{{ item.label }}</a>
        </li>
      </ul>
    </nav>
  </aside>

  <button
    type="button"
    class="jats-toc-fab"
    :aria-label="t('publications.detail.reader_toc_open')"
    :aria-expanded="panelOpen"
    @click="openPanel"
  >
    <i class="fa-solid fa-list" aria-hidden="true" />
  </button>

  <Teleport to="body">
    <div v-if="panelOpen" class="jats-toc-overlay" @click.self="closePanel">
      <div
        ref="panelRef"
        class="jats-toc-panel"
        role="dialog"
        aria-modal="true"
        :aria-label="t('publications.detail.reader_toc')"
        tabindex="-1"
      >
        <header class="jats-toc-panel__header">
          <h2 class="jats-toc__title">{{ t('publications.detail.reader_toc') }}</h2>
          <button
            type="button"
            class="jats-toc-panel__close"
            :aria-label="t('publications.detail.reader_toc_close')"
            @click="closePanel"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>
        <nav class="jats-toc__nav" :aria-label="t('publications.detail.reader_toc')">
          <ul class="jats-toc__list">
            <li
              v-for="item in items"
              :key="`panel-${item.id}`"
              class="jats-toc__item"
              :style="itemIndent(item.level)"
            >
              <a :href="`#${item.id}`" class="jats-toc__link" @click="onLinkClick">{{ item.label }}</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.jats-toc__title {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 0.75rem;
}

.jats-toc__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.jats-toc__item {
  margin: 0.35rem 0;
  line-height: 1.3;
}

.jats-toc__link {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  color: var(--text-color);
  text-decoration: none;
}

.jats-toc__link:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

.jats-toc--desktop {
  display: none;
}

.jats-toc-fab {
  display: flex;
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: none;
  background-color: var(--primary-color);
  color: #fff;
  font-size: 1.15rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 98;
}

.jats-toc-fab:hover {
  background-color: var(--primary-color-dark);
}

.jats-toc-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.jats-toc-panel {
  width: 100%;
  max-height: 70vh;
  background: #fff;
  border-radius: 12px 12px 0 0;
  padding: 1rem 1.25rem 1.5rem;
  overflow-y: auto;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
}

.jats-toc-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.jats-toc-panel__close {
  border: none;
  background: #eee;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
}

@media (min-width: 1100px) {
  .jats-toc--desktop {
    display: block;
    position: sticky;
    top: var(--app-header-offset);
    align-self: start;
    max-height: calc(100vh - var(--app-header-offset));
    overflow-y: auto;
    padding-left: 0.5rem;
  }

  .jats-toc-fab,
  .jats-toc-overlay {
    display: none;
  }
}
</style>
