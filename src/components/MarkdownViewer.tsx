import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { Copy, Check, ListTree } from 'lucide-react'
import 'highlight.js/styles/github-dark.css'

interface TocItem {
  id: string
  text: string
  level: number
}

interface Props {
  content: string
}

function extractToc(content: string): TocItem[] {
  const regex = /^(#{1,3})\s+(.+)$/gm
  const items: TocItem[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim().replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*_~]/g, '')
    const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')
    items.push({ id, text, level })
  }
  return items
}

function CopyButton({ codeRef }: { codeRef: React.RefObject<HTMLPreElement | null> }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const code = codeRef.current?.querySelector('code')?.textContent || ''
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [codeRef])

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-mono bg-[#26262b] text-[#a1a3b0] opacity-0 group-hover:opacity-100 hover:text-orange-400 hover:bg-[#32323a] transition-all"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

function TocSidebar({ items, activeId, onItemClick }: {
  items: TocItem[]
  activeId: string | null
  onItemClick: (id: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <button
          onClick={() => setCollapsed(false)}
          className="w-10 h-10 flex items-center justify-center rounded-l-xl bg-surface border border-border border-r-0 text-muted hover:text-text transition-colors"
          title="Show outline"
        >
          <ListTree size={18} />
        </button>
      </div>
    )
  }

  return (
    <aside className="fixed right-0 top-0 h-screen w-64 bg-background/80 backdrop-blur-sm border-l border-border overflow-y-auto z-40">
      <div className="sticky top-0 bg-background/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Outline</h3>
        <button
          onClick={() => setCollapsed(true)}
          className="text-muted hover:text-text transition-colors"
          title="Collapse"
        >
          <ListTree size={16} />
        </button>
      </div>
      <nav className="p-3 space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`block w-full text-left text-sm py-1.5 rounded-md transition-colors ${
              item.level === 1 ? 'pl-2' : item.level === 2 ? 'pl-5' : 'pl-8'
            } ${
              activeId === item.id
                ? 'text-orange-400 bg-orange-400/5 font-medium'
                : 'text-text-dim hover:text-text hover:bg-surface'
            }`}
          >
            {item.text}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default function MarkdownViewer({ content }: Props) {
  const toc = extractToc(content)
  const [activeId, setActiveId] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (toc.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    const ids = toc.map((t) => document.getElementById(t.id)).filter(Boolean)
    ids.forEach((el) => el && observer.observe(el))

    return () => observer.disconnect()
  }, [toc])

  const handleTocClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }

  const components = {
    pre: ({ children, ...props }: React.ComponentPropsWithoutRef<'pre'>) => {
      const preRef = useRef<HTMLPreElement>(null)
      return (
        <div className="relative group my-6">
          <pre ref={preRef} {...props}>{children}</pre>
          <CopyButton codeRef={preRef as React.RefObject<HTMLPreElement | null>} />
        </div>
      )
    },
  }

  return (
    <div className="flex">
      <div
        ref={contentRef}
        className="flex-1 min-w-0 max-w-3xl mx-auto px-6 py-8 xl:pr-24"
      >
        <div className="prose prose-invert prose-lg max-w-none
          prose-headings:font-serif prose-headings:text-text prose-headings:scroll-mt-20
          prose-h1:text-3xl prose-h1:font-bold prose-h1:mt-10 prose-h1:mb-6
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border
          prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-text-dim prose-p:leading-relaxed prose-p:my-4
          prose-a:text-accent prose-a:no-underline hover:prose-a:underline
          prose-strong:text-text prose-strong:font-semibold
          prose-code:text-orange-400 prose-code:bg-[#18181c] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-mono
          prose-pre:bg-[#18181c] prose-pre:border prose-pre:border-[#26262b] prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto
          prose-pre:text-sm prose-pre:leading-relaxed
          prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-accent/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-text-dim prose-blockquote:italic
          prose-img:rounded-xl prose-img:my-8
          prose-hr:border-border prose-hr:my-10
          prose-ul:list-disc prose-ol:list-decimal prose-li:text-text-dim prose-li:my-1
          prose-table:w-full prose-table:border-collapse
          prose-th:bg-surface prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:text-text prose-th:text-sm
          prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2 prose-td:text-sm prose-td:text-text-dim
        "
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap' }],
              rehypeHighlight,
            ]}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {toc.length > 0 && (
        <TocSidebar items={toc} activeId={activeId} onItemClick={handleTocClick} />
      )}
    </div>
  )
}
