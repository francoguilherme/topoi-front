<template>
  <div class="subjects-page container">
    <h1>Assuntos</h1>
    
    <div v-if="pending" class="loading">Carregando assuntos...</div>
    <div v-else-if="error" class="error">Erro ao carregar assuntos: {{ error.message }}</div>
    
    <div v-else class="subjects-list">
      <ul>
        <li v-for="subject in data?.data" :key="subject.id">
          <!-- Linking to articles page with query param for filtering could be a nice touch -->
          <NuxtLink :to="`/artigos?assunto=${subject.slug}`">
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

const { data, pending, error } = await useAsyncData('assuntos', () => find('assuntos', {
  sort: ['nome:asc'],
  pagination: {
    limit: 100
  }
}))
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
