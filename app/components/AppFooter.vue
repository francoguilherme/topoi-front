<template>
  <footer class="app-footer">
    <div class="container">
      <p>&copy; {{ new Date().getFullYear() }} Revista Topoi. Todos os direitos reservados.</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: var(--primary-color);
  color: #fff;
  padding: 2rem 0;
  margin-top: 3rem;
  text-align: center;
}
</style>
