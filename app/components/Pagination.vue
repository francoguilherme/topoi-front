<template>
  <div class="pagination" v-if="totalPages > 1">
    <button 
      :disabled="modelValue === 1" 
      @click="$emit('update:modelValue', modelValue - 1)"
    >
      Anterior
    </button>
    <span>Página {{ modelValue }} de {{ totalPages }}</span>
    <button 
      :disabled="modelValue === totalPages" 
      @click="$emit('update:modelValue', modelValue + 1)"
    >
      Próxima
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
