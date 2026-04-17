'use client'
import { useEffect, useState } from 'react'

export function renderMathString(value, katex) {
  if (!value || !katex) return value || ''
  try {
    let result = value
    result = result.replace(/\$\$([^$]+)\$\$/g, (_, m) => {
      try { return katex.renderToString(m.trim(), { throwOnError: false, displayMode: true, output: 'html', strict: false }) } catch { return m }
    })
    result = result.replace(/\$([^$\n]+)\$/g, (_, m) => {
      try { return katex.renderToString(m.trim(), { throwOnError: false, displayMode: false, output: 'html', strict: false }) } catch { return m }
    })
    if (!result.includes('$') && /\\[a-zA-Z]/.test(result)) {
      try { return katex.renderToString(result.trim(), { throwOnError: false, displayMode: false, output: 'html', strict: false }) } catch {}
    }
    return result.replace(/\n/g, '<br/>')
  } catch { return value }
}

export default function KaTexRenderer({ text, style = {}, className = '' }) {
  const [katex, setKatex] = useState(null)
  const [html, setHtml]   = useState(text || '')

  useEffect(() => {
    import('katex').then(k => setKatex(k.default))
  }, [])

  useEffect(() => {
    if (katex && text) setHtml(renderMathString(text, katex))
    else setHtml(text || '')
  }, [katex, text])

  return <span style={style} className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
