import type { H3Event } from 'h3'

/**
 * Reenvia um download canônico de artigo a partir do Strapi, mantendo a URL no
 * domínio da revista — é ela que agregadores como o Redalyc indexam.
 */
export const proxyArtigoDownload = (event: H3Event, recurso: 'xml' | 'pacote-xml' | 'pdf') => {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
        throw createError({ statusCode: 404, statusMessage: 'Artigo não encontrado.' })
    }

    const base = useRuntimeConfig(event).public.strapi.url

    return proxyRequest(event, `${base}/api/artigos/${encodeURIComponent(slug)}/${recurso}`)
}
