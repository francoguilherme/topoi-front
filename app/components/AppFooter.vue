<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <!-- Top Row: Information and Links -->
      <div class="footer-row top-row">
        <!-- Info Column -->
        <div class="footer-column info">
          <p class="title">{{ $t('footer.title') }}</p>
          <p class="subtitle">{{ $t('footer.subtitle') }}</p>
        </div>

        <!-- Shortcuts Column -->
        <div class="footer-column links">
          <h3>{{ $t('nav.shortcuts') }}</h3>
          <ul>
            <li><NuxtLink :to="localePath('/')">{{ $t('nav.home') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/dossie-tematico')">{{ $t('nav.dossier') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/publicacoes')">{{ $t('nav.publications') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/edicoes')">{{ $t('nav.editions') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/autores')">{{ $t('nav.authors') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/anuncios')">{{ $t('nav.announcements') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/submissao')">{{ $t('nav.submission') }}</NuxtLink></li>
          </ul>
        </div>

        <!-- About Column -->
        <div class="footer-column links">
          <h3>{{ $t('nav.about') }}</h3>
          <ul>
            <li><NuxtLink :to="localePath('/a-topoi')">{{ $t('nav.the_journal') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/corpo-editorial')">{{ $t('nav.editorial_board') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/principios-eticos')">{{ $t('nav.ethics') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/contatos')">{{ $t('nav.contacts') }}</NuxtLink></li>
          </ul>
        </div>
      </div>
      
      <!-- Bottom Row: Meta and Social -->
      <div class="footer-row bottom-row">
        <div class="footer-section social">
          <a href="https://instagram.com/revistatopoi" target="_blank" aria-label="Instagram">
            <i class="fa-brands fa-instagram"></i>
          </a>
          <a href="https://www.facebook.com/revistatopoi" target="_blank" aria-label="Facebook">
            <i class="fa-brands fa-facebook"></i>
          </a>
        </div>

        <div class="footer-section meta">
          <div class="logos">
            <img src="/creative-commons.png" alt="Creative Commons" class="footer-logo">
            <img src="/open-access.png" alt="Open Access" class="footer-logo">
          </div>
          <p class="issn">ISSN 2237-101X</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const localePath = useLocalePath()
</script>

<style scoped>
.app-footer {
  background-color: var(--primary-color);
  color: #fff;
  padding: 3rem 0 2rem;
  margin-top: 1rem;
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* Top Row Styles */
.top-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 2rem;
}

.footer-column h3 {
  color: var(--secondary-color); /* To contrast slightly or keep white? Design choice. usually white on dark bg */
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid rgba(255,255,255,0.2);
  padding-bottom: 0.5rem;
  display: inline-block;
}

.info .title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #fff;
}

.info .subtitle {
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.5;
  color: #fff;
  max-width: 400px;
}

.links ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s;
  font-size: 0.95rem;
}

.links a:hover {
  color: #fff;
  text-decoration: underline;
}

/* Bottom Row Styles */
.bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logos {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.footer-logo {
  height: 32px;
  width: auto;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 2px;
  border-radius: 4px;
}

.issn {
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  opacity: 0.8;
}

.social {
  display: flex;
  gap: 1.5rem;
}

.social a {
  color: #fff;
  font-size: 1.8rem;
  transition: opacity 0.2s, transform 0.2s;
}

.social a:hover {
  opacity: 1;
  transform: translateY(-2px);
}

/* Responsive Styles */
@media (max-width: 900px) {
  .top-row {
    grid-template-columns: 1fr 1fr;
  }
  
  .info {
    grid-column: 1 / -1;
    margin-bottom: 1rem;
  }
}

@media (max-width: 600px) {
  .top-row {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }

  .info .subtitle {
    margin: 0 auto;
  }

  .bottom-row {
    flex-direction: column;
    gap: 1.5rem;
  }

  .meta {
    flex-direction: column;
  }
}
</style>
