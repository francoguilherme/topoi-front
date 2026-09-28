import { h, type VNode, type VNodeChild } from 'vue'

import { abstractAnchorId, backMatterAnchorId } from './anchors'
import { renderBlockNodes } from './blocks'
import type { FigureHrefResolver } from './figures'
import { renderInlineNodes } from './inline'

const qs = (root: Element | Document | null | undefined, selector: string): Element | null =>
  root ? root.querySelector(selector) : null

const qsa = (root: Element | Document | null | undefined, selector: string): Element[] =>
  root ? Array.from(root.querySelectorAll(selector)) : []

const directChildren = (el: Element | null | undefined, tagName: string): Element[] =>
  el ? Array.from(el.children).filter((c) => c.tagName.toLowerCase() === tagName) : []

const directChild = (el: Element | null | undefined, tagName: string): Element | null =>
  directChildren(el, tagName)[0] ?? null

const langOf = (el: Element): string | null =>
  el.getAttribute('xml:lang') || el.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'lang')

const textOf = (el: Element | null | undefined): string => el?.textContent?.trim() ?? ''

const present = (items: VNodeChild[]): VNodeChild[] =>
  items.filter((item) => item !== null && item !== undefined && item !== false && item !== '')

export const renderArticle = (doc: Document, resolveHref: FigureHrefResolver): VNode => {
  const article = doc.documentElement
  const rootLang = langOf(article) || 'en'
  const meta = qs(doc, 'front > article-meta')
  const body = qs(doc, 'body')
  const back = qs(doc, 'back')

  const eyebrow = textOf(qs(meta, 'article-categories subj-group subject'))
  const titleEl = qs(meta, 'title-group > article-title')
  const transTitles = qsa(meta, 'title-group > trans-title-group').map((group) => ({
    lang: langOf(group),
    titleEl: directChild(group, 'trans-title'),
  }))

  const affiliations = directChildren(meta, 'aff')
  const authors = qsa(meta, 'contrib-group > contrib').map((contrib) => {
    const nameEl = directChild(contrib, 'name')
    const surname = textOf(directChild(nameEl, 'surname'))
    const given = textOf(directChild(nameEl, 'given-names'))
    const stringName = textOf(directChild(contrib, 'string-name'))
    const displayName = given || surname ? [given, surname].filter(Boolean).join(' ') : stringName
    const markers = qsa(contrib, 'xref[ref-type="aff"]').map((x) => textOf(x))
    return { displayName, markers }
  })

  const abstracts = [
    { lang: rootLang, el: directChild(meta, 'abstract') },
    ...directChildren(meta, 'trans-abstract').map((el) => ({ lang: langOf(el), el })),
  ].filter((a): a is { lang: string | null; el: Element } => Boolean(a.el))

  const kwdGroups = directChildren(meta, 'kwd-group')

  const ackEl = directChild(back, 'ack')
  const fundingStatementEl = qs(meta, 'funding-group > funding-statement')

  const fnGroups = directChildren(back, 'fn-group')
  const refListEl = directChild(back, 'ref-list')
  const refs = refListEl ? directChildren(refListEl, 'ref') : []

  const receivedDate = qs(meta, 'history > date[date-type="received"]')
  const acceptedDate = qs(meta, 'history > date[date-type="accepted"]')
  const editedByFn = qs(meta, 'author-notes > fn[fn-type="edited-by"]')

  const children: VNodeChild[] = []

  if (eyebrow) {
    children.push(h('p', { class: 'jats-eyebrow', key: 'eyebrow' }, eyebrow))
  }

  if (titleEl) {
    children.push(h('h1', { key: 'title' }, renderInlineNodes(titleEl.childNodes, 'title')))
  }

  transTitles.forEach(({ lang, titleEl: tEl }, index) => {
    if (!tEl) return
    children.push(
      h(
        'p',
        { class: 'jats-trans-title', key: `trans-title-${index}`, lang: lang || undefined },
        renderInlineNodes(tEl.childNodes, `trans-title-${index}`),
      ),
    )
  })

  if (authors.length > 0) {
    const authorNodes: VNodeChild[] = []
    authors.forEach((author, index) => {
      if (index > 0) authorNodes.push('; ')
      authorNodes.push(author.displayName)
      author.markers.forEach((marker, mIndex) => {
        authorNodes.push(h('sup', { key: `author-${index}-marker-${mIndex}` }, marker))
      })
    })
    children.push(h('p', { class: 'jats-authors', key: 'authors' }, authorNodes))
  }

  if (affiliations.length > 0) {
    children.push(
      h(
        'div',
        { class: 'jats-affiliations', key: 'affiliations' },
        affiliations.map((aff, index) => {
          const label = textOf(directChild(aff, 'label'))
          const original = textOf(qs(aff, 'institution[content-type="original"]'))
          const institutions = directChildren(aff, 'institution')
            .filter((inst) => inst.getAttribute('content-type') !== 'original')
            .map((inst) => textOf(inst))
            .filter(Boolean)
            .join(' / ')
          const email = textOf(directChild(aff, 'email'))
          const description = original || institutions
          return h(
            'p',
            { key: `aff-${index}` },
            present([
              label ? h('sup', label) : null,
              label ? ` ${description}` : description,
              email ? ` – E-mail: ${email}` : null,
            ]),
          )
        }),
      ),
    )
  }

  abstracts.forEach(({ lang, el }, index) => {
    const abstractTitleEl = directChild(el, 'title')
    const paragraphs = directChildren(el, 'p')
    const kwdGroup = kwdGroups.find((g) => langOf(g) === lang) ?? null
    const kwdTitle = textOf(directChild(kwdGroup, 'title'))
    const kwds = kwdGroup ? directChildren(kwdGroup, 'kwd').map((k) => textOf(k)) : []

    children.push(
      h(
        'div',
        {
          class: 'jats-abstract',
          key: `abstract-${index}`,
          lang: lang || undefined,
          id: index === 0 ? abstractAnchorId() : undefined,
        },
        present([
          abstractTitleEl
            ? h(
                'h4',
                { key: `abstract-${index}-title` },
                renderInlineNodes(abstractTitleEl.childNodes, `abstract-${index}-title`),
              )
            : null,
          ...paragraphs.map((p, pIndex) =>
            h(
              'p',
              { key: `abstract-${index}-p-${pIndex}` },
              renderInlineNodes(p.childNodes, `abstract-${index}-p-${pIndex}`),
            ),
          ),
          kwds.length > 0
            ? h(
                'p',
                { class: 'jats-keywords', key: `abstract-${index}-kwd` },
                present([kwdTitle ? h('strong', kwdTitle) : null, kwds.join('; ')]),
              )
            : null,
        ]),
      ),
    )
  })

  if (body) {
    children.push(...renderBlockNodes(body.childNodes, 'body', 2, resolveHref))
  }

  if (ackEl || fundingStatementEl) {
    const ackTitle = textOf(directChild(ackEl, 'title')) || 'Financiamento'
    children.push(
      h('section', { key: 'ack' }, [
        h('h2', ackTitle),
        ...(ackEl
          ? renderBlockNodes(
              Array.from(ackEl.childNodes).filter(
                (n) => !(n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName.toLowerCase() === 'title'),
              ),
              'ack',
              3,
              resolveHref,
            )
          : fundingStatementEl
            ? [h('p', { key: 'funding' }, renderInlineNodes(fundingStatementEl.childNodes, 'funding'))]
            : []),
      ]),
    )
  }

  const footnotes = fnGroups.flatMap((group) => directChildren(group, 'fn'))
  if (footnotes.length > 0) {
    children.push(
      h('div', { class: 'jats-back', key: 'notes', id: backMatterAnchorId('notes') }, [
        h('h2', 'Notas'),
        ...footnotes.map((fn, index) => {
          const label = textOf(directChild(fn, 'label')) || String(index + 1)
          const contentNodes = Array.from(fn.childNodes).filter(
            (n) => !(n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName.toLowerCase() === 'label'),
          )
          return h(
            'div',
            {
              class: 'jats-fn',
              key: fn.getAttribute('id') || `fn-${index}`,
              id: fn.getAttribute('id') || undefined,
            },
            [
              h('span', { class: 'jats-fn-label' }, `${label}.`),
              h('div', renderBlockNodes(contentNodes, `fn-${index}`, 6, resolveHref)),
            ],
          )
        }),
      ]),
    )
  }

  if (refs.length > 0) {
    children.push(
      h('div', { class: 'jats-back', key: 'refs', id: backMatterAnchorId('refs') }, [
        h('h2', textOf(directChild(refListEl, 'title')) || 'Referências'),
        ...refs.map((ref, index) => {
          const mixed = directChild(ref, 'mixed-citation')
          const id = ref.getAttribute('id') || `ref-${index}`
          if (mixed) {
            return h(
              'p',
              { class: 'jats-ref', key: id, id },
              renderInlineNodes(mixed.childNodes, `ref-${index}`),
            )
          }
          return h('p', { class: 'jats-ref', key: id, id }, renderElementCitationFallback(directChild(ref, 'element-citation')))
        }),
      ]),
    )
  }

  if (receivedDate || acceptedDate || editedByFn) {
    children.push(
      h(
        'p',
        { class: 'jats-meta', key: 'meta' },
        present([
          receivedDate ? `Recebido em: ${formatJatsDate(receivedDate)}` : null,
          receivedDate && acceptedDate ? ' – ' : null,
          acceptedDate ? `Aprovado em: ${formatJatsDate(acceptedDate)}` : null,
          editedByFn ? h('br', { key: 'edited-by-br' }) : null,
          editedByFn ? formatEditedBy(editedByFn) : null,
        ]),
      ),
    )
  }

  return h('div', { class: 'jats-article' }, children)
}

const formatEditedBy = (fn: Element): string => {
  const label = textOf(directChild(fn, 'label'))
  const paragraphs = directChildren(fn, 'p')
    .map((p) => textOf(p))
    .filter(Boolean)
  const body = paragraphs.join(' ')
  if (label) {
    return body ? `${label} ${body}` : label
  }
  return body || 'Editores responsáveis:'
}

const formatJatsDate = (dateEl: Element): string => {
  const day = textOf(directChild(dateEl, 'day'))
  const month = textOf(directChild(dateEl, 'month'))
  const year = textOf(directChild(dateEl, 'year'))
  return [day, month, year].filter(Boolean).join('/')
}

const renderElementCitationFallback = (el: Element | null): string | null => {
  if (!el) {
    return null
  }

  const authors = qsa(el, 'person-group > name')
    .map((n) => [textOf(directChild(n, 'surname')), textOf(directChild(n, 'given-names'))].filter(Boolean).join(', '))
    .join('; ')
  const articleTitle = textOf(directChild(el, 'article-title'))
  const source = textOf(directChild(el, 'source'))
  const year = textOf(directChild(el, 'year'))

  return [authors, articleTitle, source, year].filter(Boolean).join('. ')
}
