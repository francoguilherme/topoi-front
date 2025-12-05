<template>
  <div v-if="content" class="blocks-renderer">
    <component
      v-for="(block, index) in content"
      :key="index"
      :is="getBlockComponent(block)"
      :block="block"
    />
  </div>
</template>

<script setup>
import { h } from 'vue'

const props = defineProps({
  content: {
    type: Array,
    default: () => []
  }
})

const config = useRuntimeConfig()

const getStrapiMedia = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${config.public.strapi.url}${url}`
}

const getBlockComponent = (block) => {
  switch (block.type) {
    case 'paragraph':
      return renderParagraph
    case 'heading':
      return renderHeading
    case 'list':
      return renderList
    case 'quote':
      return renderQuote
    case 'code':
      return renderCode
    case 'image':
      return renderImage
    case 'link':
      return renderLink
    default:
      return () => h('div', `Unknown block type: ${block.type}`)
  }
}

// Render inline text with formatting
const renderText = (children) => {
  if (!children) return []
  
  return children.map((child, index) => {
    if (child.type === 'text') {
      let text = child.text
      
      if (child.bold) {
        return h('strong', { key: index }, text)
      }
      if (child.italic) {
        return h('em', { key: index }, text)
      }
      if (child.underline) {
        return h('u', { key: index }, text)
      }
      if (child.strikethrough) {
        return h('del', { key: index }, text)
      }
      if (child.code) {
        return h('code', { key: index }, text)
      }
      
      return text
    }
    
    if (child.type === 'link') {
      return h('a', { 
        key: index,
        href: child.url,
        target: '_blank',
        rel: 'noopener noreferrer'
      }, renderText(child.children))
    }
    
    return child.text || ''
  })
}

const renderParagraph = (props) => {
  return h('p', renderText(props.block.children))
}

const renderHeading = (props) => {
  const level = props.block.level || 1
  return h(`h${level}`, renderText(props.block.children))
}

const renderList = (props) => {
  const tag = props.block.format === 'ordered' ? 'ol' : 'ul'
  const items = props.block.children.map((item, index) => 
    h('li', { key: index }, renderText(item.children))
  )
  return h(tag, items)
}

const renderQuote = (props) => {
  return h('blockquote', renderText(props.block.children))
}

const renderCode = (props) => {
  return h('pre', h('code', props.block.plainText || ''))
}

const renderImage = (props) => {
  const image = props.block.image
  if (!image) return null
  
  return h('img', {
    src: getStrapiMedia(image.url),
    alt: image.alternativeText || image.name || '',
    width: image.width,
    height: image.height
  })
}

const renderLink = (props) => {
  return h('a', {
    href: props.block.url,
    target: '_blank',
    rel: 'noopener noreferrer'
  }, renderText(props.block.children))
}
</script>

<style scoped>
.blocks-renderer {
  line-height: 1.8;
}

.blocks-renderer p {
  margin-bottom: 1rem;
}

.blocks-renderer h1,
.blocks-renderer h2,
.blocks-renderer h3,
.blocks-renderer h4,
.blocks-renderer h5,
.blocks-renderer h6 {
  margin-bottom: 1rem;
}

.blocks-renderer ul,
.blocks-renderer ol {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.blocks-renderer li {
  margin-bottom: 0.5rem;
}

.blocks-renderer blockquote {
  border-left: 4px solid var(--secondary-color);
  padding-left: 1.5rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #555;
}

.blocks-renderer pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.blocks-renderer code {
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.blocks-renderer img {
  max-width: 100%;
  height: auto;
  margin: 1.5rem 0;
  border-radius: 4px;
}

.blocks-renderer a {
  color: var(--secondary-color);
  text-decoration: underline;
}
</style>
