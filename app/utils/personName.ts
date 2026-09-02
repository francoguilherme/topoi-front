const NAME_PARTICLES = new Set([
  'da',
  'de',
  'do',
  'dos',
  'das',
  'del',
  'della',
  'van',
  'von',
  'di',
  "d'",
])

const stripAccents = (value: string): string => value.normalize('NFD').replace(/\p{M}/gu, '')

const normalizeNameSuffixToken = (token: string): string =>
  stripAccents(token).toLowerCase().replace(/\.+$/, '')

const NAME_SUFFIXES = new Set([
  'filho',
  'filha',
  'junior',
  'jr',
  'neto',
  'neta',
  'bisneto',
  'bisneta',
  'sobrinho',
  'sobrinha',
  'senior',
  'sr',
  'son',
  'ii',
  'iii',
  'iv',
  'v',
  'hijo',
  'hija',
  'nieto',
  'nieta',
  'bisnieto',
  'bisnieta',
])

const isNameSuffix = (token: string): boolean => NAME_SUFFIXES.has(normalizeNameSuffixToken(token))

export const splitPersonName = (full: string): { given: string; surname: string; suffix?: string } => {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { given: '', surname: '' }
  }

  let suffix: string | undefined
  if (parts.length > 1 && isNameSuffix(parts[parts.length - 1])) {
    suffix = parts.pop()!
  }

  if (parts.length === 0) {
    return { given: '', surname: suffix || '' }
  }
  if (parts.length === 1) {
    return { given: '', surname: parts[0], ...(suffix ? { suffix } : {}) }
  }

  let index = parts.length - 1
  while (index > 1 && NAME_PARTICLES.has(parts[index - 1].toLowerCase())) {
    index -= 1
  }
  return {
    given: parts.slice(0, index).join(' '),
    surname: parts.slice(index).join(' '),
    ...(suffix ? { suffix } : {}),
  }
}

export const formatAuthorName = (name: string): string => {
  if (!name) return ''

  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''

  let suffix: string | undefined
  if (parts.length > 1 && isNameSuffix(parts[parts.length - 1])) {
    suffix = parts.pop()!
  }

  if (parts.length === 0) {
    return suffix ? suffix.toUpperCase() : ''
  }

  if (parts.length === 1) {
    const surname = parts[0].toUpperCase()
    return suffix ? `${surname} ${suffix.toUpperCase()}` : surname
  }

  const surnameIndex = parts.length - 1
  let particleStart = surnameIndex
  while (particleStart > 0 && NAME_PARTICLES.has(parts[particleStart - 1].toLowerCase())) {
    particleStart -= 1
  }

  const surname = parts[surnameIndex]
  const particles = parts.slice(particleStart, surnameIndex)
  const given = [...parts.slice(0, particleStart), ...particles].join(' ')

  const surnamePart = suffix
    ? `${surname.toUpperCase()} ${suffix.toUpperCase()}`
    : surname.toUpperCase()

  return `${surnamePart}, ${given}`
}
