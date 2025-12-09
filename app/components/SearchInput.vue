<template>
  <div class="search-input-wrapper">
    <input
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
    />
    <i 
      v-if="modelValue"
      class="fa-regular fa-circle-xmark clear-icon"
      @click="$emit('update:modelValue', ''); $emit('clear')"
    ></i>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue', 'clear'])
</script>

<style scoped>
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

input {
  width: 100%;
  padding: 0.75rem;
  padding-right: 2.5rem; /* Space for icon */
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.clear-icon {
  position: absolute;
  right: 0.75rem;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.clear-icon:hover {
  color: #666;
}
</style>
