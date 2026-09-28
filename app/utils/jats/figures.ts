export type FigureHrefResolver = (href: string) => string

export interface StrapiImageFile {
  name?: string | null
  url?: string | null
}

/** Caminhos externos são usados como estão; não precisam de upload. */
export const isExternalHref = (href: string): boolean => /^(https?:)?\/\//i.test(href)

/** Último segmento do caminho — os pacotes SciELO usam nomes de arquivo planos. */
export const hrefBasename = (href: string): string => href.split(/[\\/]/).pop() || href

/**
 * Mapeia o nome do arquivo (em caixa baixa) para a URL absoluta no Strapi.
 * A comparação é case-insensitive porque as pastas vêm do Windows, onde o nome
 * gravado no XML nem sempre bate exatamente com o do arquivo em disco.
 */
export const buildImageMap = (
  imagens: StrapiImageFile[] | null | undefined,
  toAbsoluteUrl: (url: string) => string,
): Record<string, string> => {
  const map: Record<string, string> = {}

  for (const file of imagens ?? []) {
    if (!file?.name || !file?.url) continue
    map[file.name.toLowerCase()] = toAbsoluteUrl(file.url)
  }

  return map
}

/**
 * Resolve o href de uma figura para algo exibível: caminhos externos passam
 * direto, caminhos locais viram a URL do arquivo no Strapi. Sem correspondência,
 * devolve o href original (a imagem aparece quebrada, sinalizando o que falta).
 */
export const resolveFigureHref = (href: string, imageMap: Map<string, string>): string => {
  if (!href || isExternalHref(href)) {
    return href
  }

  return imageMap.get(hrefBasename(href).toLowerCase()) ?? href
}
