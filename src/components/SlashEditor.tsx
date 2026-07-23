import { useState, useCallback, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import ImageExt from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { Markdown } from 'tiptap-markdown'
import { common, createLowlight } from 'lowlight'
import SlashMenu from './editor/SlashMenu'
import { Loader2 } from 'lucide-react'

const lowlight = createLowlight(common)

interface Props {
  initialContent?: string
  onChange?: (markdown: string) => void
  placeholder?: string
  minHeight?: string
}

export default function SlashEditor({
  initialContent = '',
  onChange,
  placeholder = "Type '/' for commands…",
  minHeight = '200px',
}: Props) {
  const [slashOpen, setSlashOpen] = useState(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      ImageExt,
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Markdown.configure({
        html: false,
        tightLists: true,
        linkify: true,
        breaks: true,
      }),
    ],
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      const md = (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown()
      onChangeRef.current?.(md)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-4',
      },
      handleKeyDown: (_view, event) => {
        if (slashOpen) {
          if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
            event.preventDefault()
            return true
          }
        }

        if (event.key === '/') {
          setSlashOpen(true)
          return false
        }

        return false
      },
    },
  })

  const closeSlash = useCallback(() => {
    setSlashOpen(false)
    if (editor) {
      const { state, dispatch } = editor.view
      const tr = state.tr.delete(
        state.selection.from - 1,
        state.selection.from
      )
      dispatch(tr)
    }
  }, [editor])

  useEffect(() => {
    if (!slashOpen || !editor) return
  }, [slashOpen, editor])

  if (!editor) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight }}>
        <Loader2 size={20} className="animate-spin text-muted" />
      </div>
    )
  }

  return (
    <div className="relative">
      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          color: #6b6d7b;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .tiptap {
          caret-color: #F95738;
          min-height: ${minHeight};
        }
        .tiptap ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        .tiptap ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .tiptap ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-top: 4px;
        }
        .tiptap ul[data-type="taskList"] li > label input[type="checkbox"] {
          accent-color: #6c63ff;
          cursor: pointer;
        }
        .tiptap ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }
        .tiptap table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
        }
        .tiptap table th,
        .tiptap table td {
          border: 1px solid #26262b;
          padding: 8px 12px;
          min-width: 80px;
          text-align: left;
        }
        .tiptap table th {
          background: #1c1d27;
          font-weight: 600;
        }
        .tiptap table td {
          background: transparent;
        }
        .tiptap pre {
          background: #18181c;
          border: 1px solid #26262b;
          border-radius: 12px;
          padding: 16px;
          overflow-x: auto;
          font-size: 13px;
          line-height: 1.6;
        }
        .tiptap pre code {
          color: #e4e4e7;
          background: none;
          padding: 0;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }
        .tiptap blockquote {
          border-left: 3px solid #6c63ff;
          padding-left: 16px;
          color: #a1a3b0;
          font-style: italic;
          margin: 8px 0;
        }
        .tiptap hr {
          border: none;
          border-top: 1px solid #26262b;
          margin: 24px 0;
        }
        .tiptap img {
          max-width: 100%;
          border-radius: 8px;
          margin: 8px 0;
        }
        .tiptap h1 { font-size: 1.5rem; font-weight: 700; margin: 16px 0 8px; color: #e4e4e7; }
        .tiptap h2 { font-size: 1.25rem; font-weight: 600; margin: 14px 0 6px; color: #e4e4e7; }
        .tiptap h3 { font-size: 1.1rem; font-weight: 600; margin: 12px 0 4px; color: #e4e4e7; }
        .tiptap p { margin: 4px 0; color: #a1a3b0; line-height: 1.7; }
        .tiptap ul, .tiptap ol { padding-left: 20px; color: #a1a3b0; }
        .tiptap li { margin: 2px 0; }
        .tiptap a { color: #6c63ff; text-decoration: underline; }
        .tiptap code {
          background: #1c1d27;
          color: #F95738;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.875em;
        }
        .hljs {
          background: transparent !important;
        }
      `}</style>
      <EditorContent editor={editor} />
      <SlashMenu editor={editor} isOpen={slashOpen} onClose={closeSlash} />
    </div>
  )
}
