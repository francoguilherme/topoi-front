<template>
  <div class="pagination" v-if="totalPages > 1">
    <button 
      class="nav-btn"
      :disabled="modelValue === 1" 
      @click="changePage(modelValue - 1)"
      :aria-label="$t('pagination.previous')"
    >
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    
    <div class="pages">
      <template v-for="page in visiblePages" :key="page.key">
        <span v-if="page.type === 'ellipsis'" class="ellipsis">...</span>
        <button 
          v-else
          class="page-btn"
          :class="{ active: modelValue === page.value }"
          @click="changePage(page.value)"
        >
          {{ page.value }}
        </button>
      </template>
    </div>

    <button 
      class="nav-btn"
      :disabled="modelValue === totalPages" 
      @click="changePage(modelValue + 1)"
      :aria-label="$t('pagination.next')"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const changePage = (page) => {
  emit('update:modelValue', page)
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const visiblePages = computed(() => {
  const total = props.totalPages
  const current = props.modelValue
  const maxVisible = 5 // As requested

  if (total <= maxVisible + 2) {
    // If we have few pages, just show all
    // Threshold is slightly higher because showing 1 ... 4 5 6 7 ... 10 takes space anyway
    // If total is small enough, the complex logic below might result in overlaps or redundancy.
    return Array.from({ length: total }, (_, i) => ({ type: 'page', value: i + 1, key: i + 1 }))
  }

  const pages = []
  
  // Window logic
  // Center the current page
  let start = current - Math.floor(maxVisible / 2)
  if (start < 1) start = 1
  
  let end = start + maxVisible - 1
  
  // Constraint: Prevent window from exceeding total
  if (end >= total) {
    end = total
    start = Math.max(1, end - maxVisible + 1)
  }
  
  // Build the array
  
  // 1. Head (First page + Ellipsis)
  if (start > 1) {
    pages.push({ type: 'page', value: 1, key: 1 })
    if (start > 2) {
      pages.push({ type: 'ellipsis', key: 'ell-start' })
    }
  }
  
  // 2. Window Body
  for (let i = start; i <= end; i++) {
    // Avoid duplicating 1 if we already added it
    if (i === 1 && start > 1) continue 
    
    pages.push({ type: 'page', value: i, key: i })
  }
  
  // 3. Tail (Ellipsis + Last page)
  if (end < total) {
    if (end < total - 1) {
      pages.push({ type: 'ellipsis', key: 'ell-end' })
    }
    pages.push({ type: 'page', value: total, key: total })
  }
  
  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.2rem;
  margin-top: 2rem;
}

.pages {
  display: flex;
  gap: 0.2rem;
  align-items: center;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #666;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  font-size: 0.9rem;
}

button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.page-btn:hover:not(.active) {
  background-color: #eee;
}

.nav-btn:hover:not(:disabled) {
  background-color: #eee;
}

.active {
  background-color: var(--secondary-color);
  color: white;
  font-weight: bold;
}

.ellipsis {
  color: #666;
  padding: 0 0.25rem;
}
</style>
