<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <NuxtLink :to="localePath('/')">
          <img src="/logo-topoi.png" alt="Revista Topoi" class="logo-img" />
        </NuxtLink>
      </div>
      
      <button class="hamburger" @click="toggleMenu" :class="{ active: isMenuOpen }" aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <nav :class="{ open: isMenuOpen }">
        <ul>
          <li><NuxtLink :to="localePath('/')" @click="closeMenu">Home</NuxtLink></li>
          <li><NuxtLink :to="localePath('/dossie')" @click="closeMenu">Dossiê</NuxtLink></li>
          <li><NuxtLink :to="localePath('/publicacoes')" @click="closeMenu">Publicações</NuxtLink></li>
          <li><NuxtLink :to="localePath('/edicoes')" @click="closeMenu">Edições</NuxtLink></li>
          <li><NuxtLink :to="localePath('/autores')" @click="closeMenu">Autores</NuxtLink></li>
          <li><NuxtLink :to="localePath('/assuntos')" @click="closeMenu">Assuntos</NuxtLink></li>
          <li class="locale-selector-item">
            <div class="locale-selector" ref="localeSelectorRef">
              <button @click="toggleLocaleMenu" class="locale-btn">
                <span class="flag" v-if="flags[currentLocale.code]">{{ flags[currentLocale.code] }}</span>
                {{ currentLocale.name }}
                <span class="arrow" :class="{ up: isLocaleMenuOpen }">▼</span>
              </button>
              <ul v-if="isLocaleMenuOpen" class="locale-menu">
                <li v-for="loc in availableLocales" :key="loc.code">
                  <NuxtLink 
                    :to="switchLocalePath(loc.code)" 
                    @click="closeLocaleMenu"
                    :class="{ active: loc.code === locale }"
                  >
                    <span class="flag">{{ flags[loc.code] }}</span>
                    {{ loc.name }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
const isMenuOpen = ref(false)
const isLocaleMenuOpen = ref(false)
const localeSelectorRef = ref(null)

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()

const availableLocales = computed(() => {
  return locales.value
})

const currentLocale = computed(() => {
  return locales.value.find(l => l.code === locale.value) || { name: locale.value }
})

const flags = {
  'pt-BR': '🇧🇷',
  'en': '🇺🇸',
  'es': '🇪🇸'
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const toggleLocaleMenu = () => {
  isLocaleMenuOpen.value = !isLocaleMenuOpen.value
}

const closeLocaleMenu = () => {
  isLocaleMenuOpen.value = false
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    if (localeSelectorRef.value && !localeSelectorRef.value.contains(event.target)) {
      isLocaleMenuOpen.value = false
    }
  })
})
</script>

<style scoped>
.app-header {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.logo a {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 60px;
  width: auto;
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 101;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background-color: var(--primary-color);
  transition: all 0.3s;
  border-radius: 2px;
}

.hamburger.active span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

nav ul {
  display: flex;
  list-style: none;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
}

nav a {
  color: var(--text-color);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

nav a:hover, nav a.router-link-active {
  color: var(--secondary-color);
}

/* Locale Selector */
.locale-selector-item {
  display: flex;
  align-items: center;
}

.locale-selector {
  position: relative;
}

.locale-btn {
  background: none;
  border: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
  font-size: 1rem;
  color: var(--text-color);
}

.locale-btn:hover {
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.arrow {
  font-size: 0.7rem;
  transition: transform 0.2s;
}

.arrow.up {
  transform: rotate(180deg);
}

.locale-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  min-width: 150px;
  margin-top: 0.5rem;
  flex-direction: column;
  gap: 0;
  padding: 0.5rem 0;
  z-index: 102;
}

.locale-menu li {
  width: 100%;
}

.locale-menu a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  transition: background-color 0.2s;
}

.flag {
  font-size: 1.2em;
}

.locale-menu a:hover {
  background-color: #f5f5f5;
  color: var(--secondary-color);
}

.locale-menu a.active {
  font-weight: bold;
  color: var(--primary-color);
  background-color: #f9f9f9;
}

/* Mobile styles */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }
  
  nav {
    position: fixed;
    top: 0;
    right: -100%;
    width: 70%;
    max-width: 300px;
    height: 100vh;
    background-color: #fff;
    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    transition: right 0.3s ease;
    padding-top: 5rem;
  }
  
  nav.open {
    right: 0;
  }
  
  nav ul {
    flex-direction: column;
    gap: 0;
    padding: 1rem;
  }

  .locale-selector {
    width: 100%;
  }
  
  .locale-selector-item {
    width: 100%;
    padding: 0.5rem;
  }
  
  .locale-btn {
    width: 100%;
    justify-content: space-between;
  }
  
  .locale-menu {
    position: static;
    width: 100%;
    box-shadow: none;
    border: 1px solid #eee;
    margin-top: 0.5rem;
  }
  
  nav li {
    border-bottom: 1px solid #eee;
  }
  
  nav a {
    display: block;
    padding: 1rem;
  }
}
</style>
