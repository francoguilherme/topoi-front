import { Fragment, h, type VNode, type VNodeChild } from 'vue'

import { sectionAnchorId } from './anchors'
import type { FigureHrefResolver } from './figures'
import { renderInlineNodes } from './inline'

const BLOCK_TAGS = new Set([
  'p',
  'sec',
  'list',
  'table-wrap',
  'fig',
  'disp-quote',
  'boxed-text',
  'verse-group',
])

const directChild = (el: Element, tagName: string): Element | null => {
  for (const child of Array.from(el.children)) {
    if (localTag(child) === tagName) {
      return child
    }
  }
  return null
}

const localTag = (el: Element): string => (el.localName || el.tagName).toLowerCase()

const paragraphNestedBlockChildren = (el: Element): Element[] =>
  Array.from(el.children).filter((child) => {
    const tag = localTag(child)
    return BLOCK_TAGS.has(tag) && tag !== 'p'
  })

const XLINK_NS = 'http://www.w3.org/1999/xlink'

const getGraphicHref = (el: Element): string | null =>
  el.getAttributeNS(XLINK_NS, 'href') || el.getAttribute('xlink:href') || el.getAttribute('href')

/** JATS often wraps `<fig>` in a `<p>`; detect that pattern for block-level rendering. */
const singleFigChild = (el: Element): Element | null => {
  const elementChildren = Array.from(el.children).filter(
    (c) => c.nodeType === Node.ELEMENT_NODE,
  ) as Element[]
  if (elementChildren.length === 1 && elementChildren[0].tagName.toLowerCase() === 'fig') {
    return elementChildren[0]
  }
  return null
}

const present = (items: VNodeChild[]): VNodeChild[] =>
  items.filter((item) => item !== null && item !== undefined && item !== false && item !== '')

/**
 * Renders a sequence of JATS block-level nodes (as found directly under
 * <body>, <sec>, <disp-quote>, <boxed-text>, list items, table cells...).
 */
export const renderBlockNodes = (
  nodes: ArrayLike<ChildNode>,
  keyPrefix: string,
  depth = 2,
  resolveHref: FigureHrefResolver = (href) => href,
  sectionPath?: string,
): VNode[] => {
  const result: VNode[] = []
  let secIndex = 0

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i]
    if (node.nodeType !== Node.ELEMENT_NODE) {
      continue
    }

    const el = node as Element
    const key = `${keyPrefix}-${i}`
    let secPath: string | undefined
    if (localTag(el) === 'sec') {
      secPath = sectionPath !== undefined ? `${sectionPath}-${secIndex}` : `${secIndex}`
      secIndex += 1
    }
    const rendered = renderBlockElement(el, key, depth, resolveHref, secPath)
    if (rendered) {
      result.push(rendered)
    }
  }

  return result
}

/** Renders the content of a cell/item that may hold either inline text or block content. */
const renderMixedContent = (
  el: Element,
  keyPrefix: string,
  depth: number,
  resolveHref: FigureHrefResolver,
): VNodeChild => {
  const hasBlockChild = paragraphNestedBlockChildren(el).length > 0

  return hasBlockChild
    ? renderBlockNodes(el.childNodes, keyPrefix, depth, resolveHref)
    : renderInlineNodes(el.childNodes, keyPrefix)
}

/** Renders a `<p>` that may contain block-level children such as `<list>`. */
const renderParagraphContent = (
  el: Element,
  key: string,
  depth: number,
  resolveHref: FigureHrefResolver,
): VNode => {
  const figEl = singleFigChild(el)
  if (figEl) {
    return renderFigure(figEl, key, resolveHref)
  }

  if (paragraphNestedBlockChildren(el).length === 0) {
    return h('p', { key }, renderInlineNodes(el.childNodes, key))
  }

  const parts: VNode[] = []
  let inlineNodes: ChildNode[] = []
  let partIndex = 0

  const flushInline = () => {
    const hasContent = inlineNodes.some(
      (node) =>
        (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) ||
        node.nodeType === Node.ELEMENT_NODE,
    )
    if (hasContent) {
      parts.push(
        h('p', { key: `${key}-p-${partIndex}` }, renderInlineNodes(inlineNodes, `${key}-p-${partIndex}`)),
      )
      partIndex += 1
    }
    inlineNodes = []
  }

  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as Element
      const tag = localTag(child)
      if (BLOCK_TAGS.has(tag) && tag !== 'p') {
        flushInline()
        const rendered = renderBlockElement(child, `${key}-blk-${partIndex}`, depth, resolveHref)
        if (rendered) {
          parts.push(rendered)
          partIndex += 1
        }
        continue
      }
    }
    inlineNodes.push(node)
  }
  flushInline()

  if (parts.length === 1) {
    return parts[0]
  }
  return h(Fragment, { key }, parts)
}

const renderBlockElement = (
  el: Element,
  key: string,
  depth: number,
  resolveHref: FigureHrefResolver,
  secPath?: string,
): VNode | null => {
  const tag = localTag(el)

  switch (tag) {
    case 'title':
    case 'label':
    case 'caption':
    case 'table-wrap-foot':
    case 'attrib':
      return null

    case 'p':
      return renderParagraphContent(el, key, depth, resolveHref)

    case 'sec':
      return renderSection(el, key, depth, resolveHref, secPath ?? `orphan-${key}`)

    case 'disp-quote': {
      const attrib = directChild(el, 'attrib')
      const contentNodes = Array.from(el.childNodes).filter(
        (child) => !(child.nodeType === Node.ELEMENT_NODE && (child as Element) === attrib),
      )
      return h('blockquote', { key, class: 'jats-blockquote' }, [
        ...renderBlockNodes(contentNodes, key, depth, resolveHref),
        attrib
          ? h('p', { class: 'jats-attrib' }, renderInlineNodes(attrib.childNodes, `${key}-attrib`))
          : null,
      ])
    }

    case 'boxed-text':
      return h(
        'div',
        { key, class: 'jats-boxed' },
        renderBlockNodes(el.childNodes, key, depth, resolveHref),
      )

    case 'verse-group': {
      const attrib = directChild(el, 'attrib')
      const lines = Array.from(el.children).filter(
        (child) => child.tagName.toLowerCase() === 'verse-line',
      )
      if (lines.length === 0) {
        return null
      }
      return h('div', { key, class: 'jats-verse' }, [
        ...lines.map((line, index) =>
          h(
            'div',
            { key: `${key}-vl-${index}`, class: 'jats-verse-line' },
            renderInlineNodes(line.childNodes, `${key}-vl-${index}`),
          ),
        ),
        attrib
          ? h('p', { class: 'jats-attrib' }, renderInlineNodes(attrib.childNodes, `${key}-attrib`))
          : null,
      ])
    }

    case 'list': {
      const bulleted = (el.getAttribute('list-type') || '').toLowerCase() === 'bullet'
      const items = Array.from(el.children).filter((c) => localTag(c) === 'list-item')
      return h(
        'ul',
        { key, class: bulleted ? 'jats-list jats-list--bullet' : 'jats-list' },
        items.map((item, index) => {
          const pEl = directChild(item, 'p')
          return h(
            'li',
            { key: `${key}-li-${index}` },
            pEl
              ? renderInlineNodes(pEl.childNodes, `${key}-li-${index}`)
              : renderMixedContent(item, `${key}-li-${index}`, depth, resolveHref),
          )
        }),
      )
    }

    case 'table-wrap':
      return renderTableWrap(el, key, resolveHref)

    case 'fig':
      return renderFigure(el, key, resolveHref)

    default: {
      const hasBlockChild = paragraphNestedBlockChildren(el).length > 0
      if (hasBlockChild) {
        return h(Fragment, { key }, renderBlockNodes(el.childNodes, key, depth, resolveHref))
      }
      if (!el.textContent?.trim()) {
        return null
      }
      return h('p', { key }, renderInlineNodes(el.childNodes, key))
    }
  }
}

const renderSection = (
  el: Element,
  keyPrefix: string,
  depth: number,
  resolveHref: FigureHrefResolver,
  secPath: string,
): VNode => {
  const titleEl = directChild(el, 'title')
  const headingDepth = Math.min(depth, 4)
  const headingTag = headingDepth <= 2 ? 'h2' : headingDepth === 3 ? 'h3' : 'h4'
  const otherChildren = Array.from(el.childNodes).filter(
    (child) => !(child.nodeType === Node.ELEMENT_NODE && (child as Element) === titleEl),
  )

  return h(
    'section',
    { key: keyPrefix, id: sectionAnchorId(el, secPath) },
    present([
      titleEl
        ? h(
            headingTag,
            { class: 'jats-sec-title', key: `${keyPrefix}-title` },
            renderInlineNodes(titleEl.childNodes, `${keyPrefix}-title`),
          )
        : null,
      ...renderBlockNodes(otherChildren, keyPrefix, depth + 1, resolveHref, secPath),
    ]),
  )
}

const renderCaptionTitle = (captionEl: Element | null, keyPrefix: string): VNodeChild[] | null => {
  if (!captionEl) {
    return null
  }
  const titleEl = directChild(captionEl, 'title')
  if (titleEl) {
    return renderInlineNodes(titleEl.childNodes, `${keyPrefix}-caption-title`)
  }
  return renderInlineNodes(captionEl.childNodes, `${keyPrefix}-caption`)
}

const renderCaptionHeading = (
  label: Element | null,
  captionTitle: VNodeChild[] | null,
): VNode | null => {
  if (!label && !captionTitle) {
    return null
  }

  return h(
    'p',
    { class: 'jats-caption' },
    present([
      label ? h('strong', label.textContent) : null,
      label && captionTitle ? ': ' : null,
      ...(captionTitle ?? []),
    ]),
  )
}

const renderTableWrap = (el: Element, keyPrefix: string, resolveHref: FigureHrefResolver): VNode => {
  const label = directChild(el, 'label')
  const caption = directChild(el, 'caption')
  const table = directChild(el, 'table')
  const foot = directChild(el, 'table-wrap-foot')
  const attrib = foot ? directChild(foot, 'attrib') : null
  const captionTitle = renderCaptionTitle(caption, keyPrefix)

  return h(
    'div',
    { key: keyPrefix, class: 'jats-table', id: el.getAttribute('id') || undefined },
    present([
      renderCaptionHeading(label, captionTitle),
      table ? renderHtmlTable(table, keyPrefix, resolveHref) : null,
      attrib
        ? h('p', { class: 'jats-attrib' }, renderInlineNodes(attrib.childNodes, `${keyPrefix}-attrib`))
        : null,
    ]),
  )
}

const TABLE_STRUCTURE_TAGS = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr', 'col', 'colgroup'])

const cellStyle = (el: Element): Record<string, string> | undefined => {
  const style: Record<string, string> = {}
  const align = el.getAttribute('align')
  const valign = el.getAttribute('valign')
  if (align) style.textAlign = align
  if (valign) style.verticalAlign = valign
  return Object.keys(style).length > 0 ? style : undefined
}

const renderHtmlTable = (el: Element, keyPrefix: string, resolveHref: FigureHrefResolver): VNode => {
  const walk = (node: Element, key: string): VNode => {
    const tag = node.tagName.toLowerCase()

    if (tag === 'th' || tag === 'td') {
      const rowSpan = node.getAttribute('rowspan')
      const colSpan = node.getAttribute('colspan')
      return h(
        tag,
        {
          key,
          style: cellStyle(node),
          rowspan: rowSpan ? Number(rowSpan) : undefined,
          colspan: colSpan ? Number(colSpan) : undefined,
        },
        renderMixedContent(node, key, 6, resolveHref),
      )
    }

    if (TABLE_STRUCTURE_TAGS.has(tag)) {
      const children = Array.from(node.children).map((child, index) => walk(child, `${key}-${index}`))
      return h(tag, { key }, children)
    }

    return h(
      Fragment,
      { key },
      Array.from(node.children).map((child, index) => walk(child, `${key}-${index}`)),
    )
  }

  return walk(el, keyPrefix)
}

const renderFigure = (el: Element, keyPrefix: string, resolveHref: FigureHrefResolver): VNode => {
  const label = directChild(el, 'label')
  const caption = directChild(el, 'caption')
  const graphic = directChild(el, 'graphic')
  const attrib = directChild(el, 'attrib')
  const captionTitle = renderCaptionTitle(caption, keyPrefix)
  const href = graphic ? getGraphicHref(graphic) : null

  return h(
    'figure',
    { class: 'jats-figure', id: el.getAttribute('id') || undefined, key: keyPrefix },
    present([
      renderCaptionHeading(label, captionTitle),
      href
        ? h('img', { src: resolveHref(href), alt: label?.textContent || 'Figura' })
        : null,
      attrib
        ? h('p', { class: 'jats-attrib' }, renderInlineNodes(attrib.childNodes, `${keyPrefix}-attrib`))
        : null,
    ]),
  )
}
