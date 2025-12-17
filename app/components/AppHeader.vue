<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <NuxtLink :to="localePath('/')">
          <img src="/logo-topoi.png" alt="Revista Topoi" class="logo-img" />
        </NuxtLink>
      </div>
      
      <button class="hamburger" ref="hamburgerRef" @click="toggleMenu" :class="{ active: isMenuOpen }" :aria-label="$t('nav.menu')">
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <nav ref="navMenuRef" :class="{ open: isMenuOpen }">
        <ul class="nav-list">
          <li><NuxtLink :to="localePath('/')" @click="closeMenu">{{ $t('nav.home') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/dossie-tematico')" @click="closeMenu">{{ $t('nav.dossier') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/publicacoes')" @click="closeMenu">{{ $t('nav.publications') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/edicoes')" @click="closeMenu">{{ $t('nav.editions') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/autores')" @click="closeMenu">{{ $t('nav.authors') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/anuncios')" @click="closeMenu">{{ $t('nav.announcements') }}</NuxtLink></li>
          <li class="submission-item"><NuxtLink :to="localePath('/submissao')" @click="closeMenu">{{ $t('nav.submission') }}</NuxtLink></li>
          <li class="dropdown-item">
            <div class="dropdown-wrapper" ref="aboutSelectorRef">
              <button @click="toggleAboutMenu" class="nav-link-btn" :class="{ active: isAboutMenuOpen }">
                {{ $t('nav.about') }}
                <i class="fa-solid" :class="{ 'fa-angle-up': isAboutMenuOpen, 'fa-angle-down': !isAboutMenuOpen }"></i>
              </button>
              <ul v-if="isAboutMenuOpen" class="dropdown-list">
                <li><NuxtLink :to="localePath('/a-topoi')" @click="handleLinkClick">{{ $t('nav.the_journal') }}</NuxtLink></li>
                <li><NuxtLink :to="localePath('/corpo-editorial')" @click="handleLinkClick">{{ $t('nav.editorial_board') }}</NuxtLink></li>
                <li><NuxtLink :to="localePath('/principios-eticos')" @click="handleLinkClick">{{ $t('nav.ethics') }}</NuxtLink></li>
                <li><NuxtLink :to="localePath('/contatos')" @click="handleLinkClick">{{ $t('nav.contacts') }}</NuxtLink></li>
              </ul>
            </div>
          </li>
          <li class="locale-selector-item">
            <div class="locale-selector" ref="localeSelectorRef">
              <button @click="toggleLocaleMenu" class="locale-btn">
                <i class="fa-solid fa-globe"></i>
                <!--<span class="flag" v-if="flags[currentLocale.code]">{{ flags[currentLocale.code] }}</span>
                {{ currentLocale.name }}
                <span class="arrow" :class="{ up: isLocaleMenuOpen }">▼</span>-->
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
const isAboutMenuOpen = ref(false)
const localeSelectorRef = ref(null)
const aboutSelectorRef = ref(null)
const navMenuRef = ref(null)
const hamburgerRef = ref(null)

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

const toggleAboutMenu = () => {
  isAboutMenuOpen.value = !isAboutMenuOpen.value
}

const closeAboutMenu = () => {
  isAboutMenuOpen.value = false
}

const handleLinkClick = () => {
  closeMenu()
  closeAboutMenu()
}

// Close dropdowns and menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    // Close locale dropdown
    if (localeSelectorRef.value && !localeSelectorRef.value.contains(event.target)) {
      isLocaleMenuOpen.value = false
    }
    // Close about dropdown
    if (aboutSelectorRef.value && !aboutSelectorRef.value.contains(event.target)) {
      isAboutMenuOpen.value = false
    }
    // Close mobile menu
    if (isMenuOpen.value && 
        navMenuRef.value && !navMenuRef.value.contains(event.target) && 
        hamburgerRef.value && !hamburgerRef.value.contains(event.target)) {
      isMenuOpen.value = false
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
  gap: 1rem;
  position: relative;
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

.nav-list {
  align-items: center;
}

.submission-item {
  min-width: 86px;
}

.fa-globe {
  font-size: 18px;
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

/* Dropdown Styles */
.dropdown-wrapper {
  position: relative;
}

.nav-link-btn {
  background: none;
  border: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
  font-size: 1rem; /* Match nav a font size usually inherited or explicit */
  font-weight: 500;
  color: var(--text-color);
  padding: 0;
}

.nav-link-btn:hover, .nav-link-btn.active {
  color: var(--secondary-color);
}

.dropdown-list {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  min-width: 150px;
  margin-top: 0.5rem;
  display: flex !important; /* Override nav ul display flex default if needed, but flex-direction column here */
  flex-direction: column;
  gap: 0;
  padding: 0.5rem 0;
  z-index: 102;
}

.dropdown-list li {
  width: 100%;
  border-bottom: none; /* Reset if inherited */
  text-align: right;
}

.dropdown-list a {
  display: block;
  padding: 0.5rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  font-weight: 400;
  transition: background-color 0.2s;
}

.dropdown-list a:hover {
  background-color: #f5f5f5;
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
@media (max-width: 840px) {
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
    height: 100dvh;
    background-color: #fff;
    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    transition: right 0.3s ease;
    padding-top: 5rem;
    overflow-y: auto;
  }
  
  nav.open {
    right: 0;
  }
  
  nav ul {
    flex-direction: column;
    gap: 0;
    padding: 1rem;
  }

  .fa-globe {
    font-size: 22px;
  }

  .nav-list {
    align-items: flex-start;
  }

  .nav-list li {
    width: 100%;
  }

  .dropdown-list li {
    text-align: left;
  }

  .locale-selector {
    width: 100%;
  }
  
  .locale-selector-item {
    width: 100%;
    padding: 0.5rem;
    order: -1;
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

  .dropdown-wrapper {
    width: 100%;
  }

  .nav-link-btn {
    width: 100%;
    justify-content: space-between;
    padding: 1rem;
  }

  .dropdown-list {
    position: static;
    width: 100%;
    box-shadow: none;
    border: none;
    border-top: 1px solid #eee;
    background-color: #f9f9f9;
    padding: 0;
    margin-top: 0;
  }

  .dropdown-list a {
    padding-left: 2rem; /* Indent nested items */
  }
}
</style>
