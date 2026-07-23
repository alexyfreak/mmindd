import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
  preview?: boolean
}

export default function MarkdownNoteCard({ content, preview }: Props) {
  if (!content) return null

  const truncated = preview && content.length > 500
    ? content.slice(0, 500) + '\n\n*…*'
    : content

  return (
    <div className="prose prose-sm prose-invert max-w-none [&_*]:text-text-dim [&_h1]:text-text [&_h2]:text-text [&_h3]:text-text [&_strong]:text-text [&_code]:text-accent [&_code]:bg-background [&_code]:px-1 [&_code]:rounded [&_pre]:bg-background [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_a]:text-accent [&_a]:underline [&_img]:rounded-lg [&_blockquote]:border-l-accent [&_blockquote]:text-muted [&_ul]:list-disc [&_ol]:list-decimal [&_li]:text-text-dim">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {truncated}
      </ReactMarkdown>
    </div>
  )
}
