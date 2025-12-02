<template>
  <div class="article-detail container">
    <div v-if="pending" class="loading">Carregando publicação...</div>
    <div v-else-if="error || !article" class="error">
      {{ error ? 'Erro ao carregar publicação: ' + error.message : 'Publicação não encontrada.' }}
    </div>
    
    <article v-else class="content">
      <header class="article-header">
        <h1>{{ article.titulo }}</h1>
        <div class="meta">
          <span v-if="article.secao" class="section">{{ article.secao }}</span>
          <span v-if="article.data_de_publicacao" class="date">
            {{ new Date(article.data_de_publicacao).toLocaleDateString('pt-BR') }}
          </span>
        </div>
        <div class="authors" v-if="article.autores?.length">
          Por: 
          <span v-for="(autor, index) in article.autores" :key="autor.id">
            <NuxtLink :to="`/autores/${autor.slug}`">{{ autor.nome }}</NuxtLink>
            <span v-if="index < article.autores.length - 1">, </span>
          </span>
        </div>
      </header>

      <div class="abstract" v-if="article.resumo">
        <h2>Resumo</h2>
        <BlocksRenderer :content="article.resumo" />
      </div>

      <div class="keywords" v-if="article.palavras_chave?.length">
        <h3>Palavras-chave:</h3>
        <ul>
          <li v-for="kw in article.palavras_chave" :key="kw.id">
            {{ kw.texto }} <!-- Assuming 'texto' is the field in 'simples.texto' component -->
          </li>
        </ul>
      </div>

      <div class="download" v-if="article.arquivo">
        <a :href="getStrapiMedia(article.arquivo.url)" target="_blank" class="btn-download">
          Ver PDF
        </a>
      </div>

      <div class="citation-box" v-if="citation">
        <h3>Como citar este artigo</h3>
        <div class="citation-content">
          <p v-html="citation"></p>
          <button @click="copyCitation" class="btn-copy" title="Copiar citação">
            <span v-if="copied">Copiado!</span>
            <span v-else>Copiar</span>
          </button>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
const route = useRoute()
const { find } = useStrapi()
const config = useRuntimeConfig()

// Helper to get full URL for media
const getStrapiMedia = (url) => {
  if (url.startsWith('http')) return url
  return `${config.public.strapi.url}${url}`
}

const { data, pending, error } = await useAsyncData(
  `artigo-${route.params.slug}`, 
  () => find('artigos', {
    filters: {
      slug: route.params.slug
    },
    populate: ['autores', 'arquivo', 'palavras_chave', 'edicao']
  })
)

const article = computed(() => {
  if (data.value?.data?.length > 0) {
    return data.value.data[0]
  }
  return null
})

const formatAuthorName = (name) => {
  if (!name) return ''
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].toUpperCase()
  const lastName = parts.pop().toUpperCase()
  const firstName = parts.join(' ')
  return `${lastName}, ${firstName}`
}

const citation = computed(() => {
  if (!article.value) return ''
  
  const authors = article.value.autores?.map(a => formatAuthorName(a.nome)).join('; ') || ''
  const title = article.value.titulo
  const journal = 'Revista Topoi'
  const city = 'Rio de Janeiro'
  
  const ed = article.value.edicao
  if (!ed) return ''
  
  const vol = `v. ${ed.volume}`
  const num = `n. ${ed.numero}`
  
  // Try to get date from edition or article
  const dateStr = ed.data_de_publicacao || article.value.data_de_publicacao
  let datePart = ''
  
  if (dateStr) {
    const date = new Date(dateStr)
    const months = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.']
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    datePart = `${month} ${year}`
  }
  
  // Pages - checking if fields exist
  let pages = ''
  if (article.value.pagina_inicial && article.value.pagina_final) {
    pages = `p. ${article.value.pagina_inicial}-${article.value.pagina_final}, `
  }
  
  // Construct HTML string with bold journal name
  return `${authors}. ${title}. <strong>${journal}</strong>, ${city}, ${vol}, ${num}, ${pages}${datePart}.`
})

const copied = ref(false)
const copyCitation = async () => {
  const html = citation.value
  // Strip HTML tags for plain text version
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  const text = tempDiv.textContent || tempDiv.innerText || ''
  
  try {
    // Try using the Clipboard API with rich text
    if (navigator.clipboard && navigator.clipboard.write) {
      const typeHtml = 'text/html'
      const typeText = 'text/plain'
      
      const blobHtml = new Blob([html], { type: typeHtml })
      const blobText = new Blob([text], { type: typeText })
      
      const data = [new ClipboardItem({ 
        [typeHtml]: blobHtml, 
        [typeText]: blobText 
      })]
      
      await navigator.clipboard.write(data)
      copied.value = true
    } else {
      throw new Error('Clipboard API not supported')
    }
  } catch (err) {
    // Fallback to plain text if rich text fails
    console.warn('Rich text copy failed, falling back to plain text:', err)
    navigator.clipboard.writeText(text).then(() => {
      copied.value = true
    })
  }

  if (copied.value) {
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<style scoped>
.article-detail {
  max-width: 800px;
}

.article-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.meta {
  color: #666;
  margin: 0.5rem 0;
}

.section {
  font-weight: bold;
  color: var(--secondary-color);
  margin-right: 1rem;
}

.authors a {
  font-weight: bold;
}

.abstract {
  margin-bottom: 2rem;
  line-height: 1.8;
}

.keywords {
  margin-bottom: 2rem;
}

.keywords ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keywords li {
  background-color: #eee;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.citation-box {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.citation-box h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.citation-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.citation-content p {
  font-family: 'Times New Roman', Times, serif;
  background: #fff;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-copy {
  align-self: flex-start;
  background-color: #eee;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-copy:hover {
  background-color: #ddd;
}

.btn-download {
  display: inline-block;
  background-color: var(--secondary-color);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
}

.btn-download:hover {
  background-color: #6a1630;
}
</style>
