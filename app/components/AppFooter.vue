<template>
  <footer class="app-footer">
    <div class="container">
      <p class="title">Revista Topoi</p>
      <p class="subtitle">Publicação de acesso aberto do Programa de Pós-graduação em História Social da Universidade Federal do Rio de Janeiro</p>
      <!--<p class="copyright">&copy; {{ new Date().getFullYear() }} Todos os direitos reservados.</p>-->
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
