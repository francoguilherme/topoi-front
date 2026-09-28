import {
  abstractAnchorId,
  backMatterAnchorId,
  sectionAnchorId,
} from './anchors'

export type TocItem = { id: string; label: string; level: number }

export type TocLabels = {
  abstract: string
  footnotes: string
  references: string
}

const normalizeTitleKey = (value: string): string =>
  value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()

const REFERENCES_TITLE_KEYS = new Set([
  'bibliografia',
  'bibliography',
  'referencias',
  'references',
])

/** Maps standard ref-list headings from the XML to the active UI locale. */
export const refListTocLabel = (rawTitle: string, labels: TocLabels): string => {
  const trimmed = rawTitle.trim()
  if (!trimmed) {
    return labels.references
  }

  const key = normalizeTitleKey(trimmed)
  if (REFERENCES_TITLE_KEYS.has(key)) {
    return labels.references
  }

  return trimmed
}

const directChildren = (el: Element | null | undefined, tagName: string): Element[] =>
  el ? Array.from(el.children).filter((c) => c.tagName.toLowerCase() === tagName) : []

const directChild = (el: Element | null | undefined, tagName: string): Element | null =>
  directChildren(el, tagName)[0] ?? null

const textOf = (el: Element | null | undefined): string => el?.textContent?.trim() ?? ''

const walkBodySections = (
  container: Element,
  parentPath: string | null,
  level: number,
  items: TocItem[],
): void => {
  let secIndex = 0

  for (const child of Array.from(container.children)) {
    if (child.tagName.toLowerCase() !== 'sec') {
      continue
    }

    const path = parentPath === null ? `${secIndex}` : `${parentPath}-${secIndex}`
    secIndex += 1

    const titleEl = directChild(child, 'title')
    const label = titleEl ? textOf(titleEl) : ''
    if (label) {
      items.push({ id: sectionAnchorId(child, path), label, level })
    }

    walkBodySections(child, path, level + 1, items)
  }
}

export const extractArticleToc = (doc: Document, labels: TocLabels): TocItem[] => {
  const items: TocItem[] = []
  const meta = doc.querySelector('front > article-meta')
  const body = doc.querySelector('body')
  const back = doc.querySelector('back')

  const abstractEl = directChild(meta, 'abstract')
  if (abstractEl) {
    const title = textOf(directChild(abstractEl, 'title'))
    items.push({
      id: abstractAnchorId(),
      label: title || labels.abstract,
      level: 1,
    })
  }

  if (body) {
    walkBodySections(body, null, 2, items)
  }

  const fnGroups = back ? directChildren(back, 'fn-group') : []
  const footnotes = fnGroups.flatMap((group) => directChildren(group, 'fn'))
  if (footnotes.length > 0) {
    const groupTitle = fnGroups.map((g) => textOf(directChild(g, 'title'))).find(Boolean)
    items.push({
      id: backMatterAnchorId('notes'),
      label: groupTitle || labels.footnotes,
      level: 1,
    })
  }

  const refListEl = back ? directChild(back, 'ref-list') : null
  const refs = refListEl ? directChildren(refListEl, 'ref') : []
  if (refs.length > 0) {
    const refTitle = textOf(directChild(refListEl, 'title'))
    items.push({
      id: backMatterAnchorId('refs'),
      label: refListTocLabel(refTitle, labels),
      level: 1,
    })
  }

  return items
}
