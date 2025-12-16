<template>
  <div class="subjects-page container">
    <h1>{{ $t('subjects.title') }}</h1>
    
    <LoadingSpinner v-if="pending" :text="$t('subjects.loading')" />
    <div v-else-if="error" class="error">{{ $t('subjects.error_loading', { message: error.message }) }}</div>
    
    <div v-else class="subjects-list">
      <ul>
        <li v-for="subject in data?.data" :key="subject.id">
          <!-- Linking to articles page with query param for filtering could be a nice touch -->
          <NuxtLink :to="localePath(`/publicacoes?assunto=${subject.slug}`)">
            {{ subject.nome }}
          </NuxtLink>
          <div class="description" v-if="subject.descricao">
             <!-- Render description blocks if needed -->
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const { find } = useStrapi()
const { locale } = useI18n()
const localePath = useLocalePath()

const { data, pending, error } = await useAsyncData('assuntos', () => find('assuntos', {
  locale: locale.value,
  sort: ['nome:asc'],
  pagination: {
    limit: 100
  }
}), {
  watch: [locale]
})
</script>

<style scoped>


.subjects-list ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.subjects-list li {
  background-color: #f0f0f0;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: background-color 0.2s;
}

.subjects-list li:hover {
  background-color: #e0e0e0;
}

.subjects-list a {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
}
</style>
