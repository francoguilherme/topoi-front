<template>
  <div class="error-page">
    <div class="content">
      <h1 class="error-code">{{ error.statusCode }}</h1>
      <p class="error-message">Ocorreu um erro inesperado.</p>
      <button @click="handleError" class="back-button">
        Voltar para o início
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })
</script>

<style scoped>
.error-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color, #f9f9f9);
  font-family: var(--font-main, sans-serif);
  text-align: center;
  padding: 1rem;
}

.content {
  max-width: 600px;
  width: 100%;
}

.error-code {
  font-size: 6rem;
  font-weight: 700;
  color: var(--primary-color, #324332);
  margin: 0;
  line-height: 1;
}

.error-message {
  font-size: 1.5rem;
  color: var(--text-color, #333);
  margin: 1rem 0 2rem;
}

.back-button {
  background-color: var(--primary-color, #324332);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: var(--primary-color-dark, #1a231a);
}
</style>
