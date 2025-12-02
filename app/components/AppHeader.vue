<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <NuxtLink to="/">
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
          <li><NuxtLink to="/" @click="closeMenu">Home</NuxtLink></li>
          <li><NuxtLink to="/dossie" @click="closeMenu">Dossiê</NuxtLink></li>
          <li><NuxtLink to="/publicacoes" @click="closeMenu">Publicações</NuxtLink></li>
          <li><NuxtLink to="/edicoes" @click="closeMenu">Edições</NuxtLink></li>
          <li><NuxtLink to="/autores" @click="closeMenu">Autores</NuxtLink></li>
          <li><NuxtLink to="/assuntos" @click="closeMenu">Assuntos</NuxtLink></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
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
  
  nav li {
    border-bottom: 1px solid #eee;
  }
  
  nav a {
    display: block;
    padding: 1rem;
  }
}
</style>
