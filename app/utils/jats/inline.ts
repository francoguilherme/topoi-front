import { Fragment, h, type VNode, type VNodeChild } from 'vue'

const XLINK_NS = 'http://www.w3.org/1999/xlink'

const safeExternalHref = (href: string | null): string | null => {
  if (!href) return null
  const trimmed = href.trim()
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed
  return null
}

/**
 * Renders the inline (character-level) content of a JATS element: plain text
 * mixed with formatting tags such as <italic>, <bold>, <sup>/<sub>, cross
 * references (<xref>) and external links (<ext-link>).
 *
 * Unknown tags are "unwrapped" (their children are still rendered) so that
 * content is never silently dropped, even for elements this renderer doesn't
 * explicitly know about.
 */
export const renderInlineNodes = (
  nodes: ArrayLike<ChildNode>,
  keyPrefix: string,
): VNodeChild[] => {
  const result: VNodeChild[] = []

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i]
    const key = `${keyPrefix}-${i}`

    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) {
        result.push(node.textContent)
      }
      continue
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      continue
    }

    result.push(renderInlineElement(node as Element, key))
  }

  return result
}

const renderInlineChildren = (el: Element, keyPrefix: string) =>
  renderInlineNodes(el.childNodes, keyPrefix)

const renderInlineElement = (el: Element, key: string): VNode => {
  const tag = el.tagName.toLowerCase()
  const children = () => renderInlineChildren(el, key)

  switch (tag) {
    case 'italic':
    case 'i':
      return h('em', { key }, children())

    case 'bold':
    case 'b':
      return h('strong', { key }, children())

    case 'bold-italic':
      return h('strong', { key }, [h('em', children())])

    case 'underline':
      return h('span', { key, style: { textDecoration: 'underline' } }, children())

    case 'strike':
    case 'sc':
      return tag === 'sc'
        ? h('span', { key, style: { fontVariant: 'small-caps' } }, children())
        : h('span', { key, style: { textDecoration: 'line-through' } }, children())

    case 'sup':
      return h('sup', { key }, children())

    case 'sub':
      return h('sub', { key }, children())

    case 'monospace':
      return h('code', { key }, children())

    case 'break':
      return h('br', { key })

    case 'xref': {
      const rid = el.getAttribute('rid')
      if (!rid) {
        return h(Fragment, { key }, children())
      }
      return h('a', { key, href: `#${rid}`, class: 'jats-xref' }, children())
    }

    case 'ext-link':
    case 'uri': {
      const href = safeExternalHref(
        el.getAttributeNS(XLINK_NS, 'href') ||
          el.getAttribute('xlink:href') ||
          el.getAttribute('href'),
      )
      if (!href) {
        return h(Fragment, { key }, children())
      }
      return h('a', { key, href, target: '_blank', rel: 'noreferrer' }, children())
    }

    case 'email': {
      const address = el.textContent ?? ''
      return h('a', { key, href: `mailto:${address}` }, children())
    }

    default:
      return h(Fragment, { key }, children())
  }
}
