<template>
  <NuxtLink :to="`/artigos/${article.slug}`" class="article-card">
    <h3>
      {{ article.titulo }}
    </h3>
    <div class="meta">
      <span v-if="article.secao" class="section">{{ article.secao }}</span>
      <span v-if="article.data_de_publicacao" class="date">
        {{ new Date(article.data_de_publicacao).toLocaleDateString('pt-BR') }}
      </span>
    </div>
    <div class="authors" v-if="article.autores?.length">
      Por: 
      <span v-for="(autor, index) in article.autores" :key="autor.id">
        <span v-if="index > 0 && index === article.autores.length - 1">e </span>
        {{ autor.nome }} ({{ autor.instituicao }})<span v-if="index < article.autores.length - 1">; </span>
      </span>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  article: {
    type: Object,
    required: true
  }
})
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
}

.section {
  font-weight: bold;
  color: var(--secondary-color);
}

.authors {
  font-size: 0.95rem;
  font-style: italic;
}
</style>
