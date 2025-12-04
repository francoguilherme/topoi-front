<template>
  <footer class="app-footer">
    <div class="container">
      <p class="title">{{ $t('footer.title') }}</p>
      <p class="subtitle">{{ $t('footer.subtitle') }}</p>
      <!--<p class="copyright">&copy; {{ new Date().getFullYear() }} {{ $t('footer.rights') }}</p>-->
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: var(--primary-color);
  color: #fff;
  padding: 1rem 0;
  margin-top: 3rem;
  text-align: center;
}

.title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.copyright {
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
