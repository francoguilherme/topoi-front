<template>
  <Transition name="fade">
    <button 
      v-if="showButton" 
      @click="scrollToTop" 
      class="scroll-to-top"
      aria-label="Voltar ao topo"
    >
      <i class="fa-solid fa-arrow-up"></i>
    </button>
  </Transition>
</template>

<script setup>
const showButton = ref(false)

const handleScroll = () => {
  showButton.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: none;
  background-color: var(--secondary-color);
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
  z-index: 99;
}

.scroll-to-top:hover {
  transform: translateY(-5px);
  background-color: var(--secondary-color-dark);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
