export class JatsParseError extends Error {}

/**
 * Parses raw XML text into a JATS `<article>` DOM Document, throwing
 * `JatsParseError` when the content isn't a well-formed JATS article.
 */
export const parseJatsXml = (xml: string): Document => {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')

  if (doc.querySelector('parsererror')) {
    throw new JatsParseError('O arquivo não é um XML bem formado.')
  }

  if (doc.documentElement?.tagName.toLowerCase() !== 'article') {
    throw new JatsParseError('O XML não parece ser um artigo no padrão JATS.')
  }

  return doc
}
