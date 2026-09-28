export const abstractAnchorId = (): string => 'jats-abstract'

export const sectionAnchorId = (el: Element, path: string): string =>
  el.getAttribute('id') || `jats-sec-${path}`

export type BackMatterKind = 'notes' | 'refs'

export const backMatterAnchorId = (kind: BackMatterKind): string =>
  kind === 'notes' ? 'jats-notes' : 'jats-refs'
