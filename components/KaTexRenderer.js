"use client";
import { useEffect, useState, memo } from "react";

// ── Shared render util (import in AttemptPage, SolutionsPage, etc.) ──────────
export function renderMathString(value, katex) {
  if (!value || !katex) return value || "";
  try {
    let r = value;
    // Block math: $$...$$
    r = r.replace(/\$\$([^$]+)\$\$/g, (_, m) => {
      try {
        return katex.renderToString(m.trim(), {
          throwOnError: false,
          displayMode: true,
          output: "html",
          strict: false,
        });
      } catch {
        return m;
      }
    });
    // Inline math: $...$
    r = r.replace(/\$([^$\n]+)\$/g, (_, m) => {
      try {
        return katex.renderToString(m.trim(), {
          throwOnError: false,
          displayMode: false,
          output: "html",
          strict: false,
        });
      } catch {
        return m;
      }
    });
    // Raw LaTeX (no $ delimiters, contains \cmd)
    if (!r.includes("$") && /\\[a-zA-Z]/.test(r)) {
      try {
        return katex.renderToString(r.trim(), {
          throwOnError: false,
          displayMode: false,
          output: "html",
          strict: false,
        });
      } catch {}
    }
    return r.replace(/\n/g, "<br/>");
  } catch {
    return value;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
// block=true renders a <div> (for display-mode math), default is <span>
function KaTexRenderer({ text, className = "", block = false }) {
  const [katex, setKatex] = useState(null);
  const [html, setHtml] = useState(text || "");

  useEffect(() => {
    import("katex").then((k) => setKatex(k.default));
  }, []);

  useEffect(() => {
    setHtml(katex && text ? renderMathString(text, katex) : text || "");
  }, [katex, text]);

  const Tag = block ? "div" : "span";
  return (
    <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export default memo(KaTexRenderer);
