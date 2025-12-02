# Revista Topoi - Frontend

Este é o frontend da **Revista Topoi**, a Revista de História do Programa de Pós-Graduação em História Social da UFRJ. O projeto foi desenvolvido utilizando **Nuxt 4**.

## Funcionalidades

O portal oferece acesso completo ao acervo da revista, com as seguintes funcionalidades:

### 📚 Navegação por Edições
- Visualize todas as edições publicadas.
- Detalhes de cada edição com capa, editorial, apresentação e lista de artigos.
- Organização dos artigos por seção (Dossiê, Artigos Livres, Resenhas, Traduções, etc.).

### 🔍 Busca e Publicações
- Listagem completa de publicações.
- **Busca Avançada**: Filtre artigos por título ou nome do autor.
- Paginação para facilitar a navegação em grandes volumes de dados.

### 👥 Índice de Autores
- Lista alfabética de todos os autores que já publicaram na revista.
- Página de perfil do autor listando todas as suas publicações.
- Busca de autores por nome.

### 📄 Detalhes do Artigo
- Página dedicada para cada publicação.
- Exibição de Resumo e Palavras-chave.
- **Download de PDF**: Acesso direto ao arquivo do artigo.
- **Citação ABNT Automática**:
  - Gera automaticamente a referência do artigo no formato ABNT.
  - Botão **Copiar** com suporte a Rich Text (mantém o negrito do nome da revista ao colar no Word/Docs).

### 📱 Design Responsivo
- Interface adaptada para dispositivos móveis e desktops.
- Menu hambúrguer para navegação em telas pequenas.

## Tecnologias Utilizadas

- **Nuxt 4**: Framework Vue.js para renderização híbrida e estática.
- **Vue 3**: Biblioteca JavaScript para construção de interfaces.
- **Strapi (Backend)**: CMS Headless para gerenciamento de conteúdo (consumido via API).

## Configuração e Instalação

Certifique-se de ter o Node.js instalado.

### Instalar Dependências

```bash
# yarn
yarn install
```

### Servidor de Desenvolvimento

Inicie o servidor de desenvolvimento em `http://localhost:3000`:

```bash
# yarn
yarn dev
```

### Build para Produção

Para gerar a versão de produção:

```bash
# yarn
yarn build
```

---
Desenvolvido para o Programa de Pós-Graduação em História Social da UFRJ.
