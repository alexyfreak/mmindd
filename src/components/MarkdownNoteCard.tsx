import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import { Copy, Check } from 'lucide-react'
import { useRef, useState, useCallback } from 'react'
import 'highlight.js/styles/github-dark.css'

interface Props {
  content: string
  preview?: boolean
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
      className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#26262b] text-[#a1a3b0] opacity-0 group-hover:opacity-100 hover:text-orange-400 transition-all"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  )
}

export default function MarkdownNoteCard({ content, preview }: Props) {
  if (!content) return null

  const truncated = preview && content.length > 500
    ? content.slice(0, 500) + '\n\n*…*'
    : content

  const components = {
    pre: ({ children, ...props }: React.ComponentPropsWithoutRef<'pre'>) => {
      const preRef = useRef<HTMLPreElement>(null)
      return (
        <div className="relative group">
          <pre ref={preRef} {...props}>{children}</pre>
          {!preview && <CopyButton codeRef={preRef as React.RefObject<HTMLPreElement | null>} />}
        </div>
      )
    },
  }

  return (
    <div className="prose prose-sm prose-invert max-w-none
      [&_*]:text-text-dim
      [&_h1]:text-text [&_h2]:text-text [&_h3]:text-text [&_h4]:text-text
      [&_strong]:text-text
      [&_code]:text-orange-400 [&_code]:bg-[#18181c] [&_code]:px-1 [&_code]:rounded
      [&_pre]:bg-[#18181c] [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-[#26262b] [&_pre]:text-xs [&_pre]:overflow-x-auto
      [&_a]:text-accent [&_a]:underline
      [&_img]:rounded-lg [&_img]:max-h-60 [&_img]:object-cover
      [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:text-muted [&_blockquote]:pl-3 [&_blockquote]:italic
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight]}
        components={components}
      >
        {truncated}
      </ReactMarkdown>
    </div>
  )
}
