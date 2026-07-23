import { useState, useEffect, useRef, useCallback } from 'react'
import { Heading1, Heading2, ListTodo, ImageIcon, Minus, Quote, Code2, Table2 } from 'lucide-react'
import type { Editor } from '@tiptap/react'

interface SlashItem {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  searchTerms: string[]
  action: (editor: Editor) => void
}

const items: SlashItem[] = [
  {
    id: 'h1',
    label: 'H1 Heading',
    icon: <Heading1 size={16} />,
    description: 'Big section heading',
    searchTerms: ['heading1', 'h1', '#'],
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'h2',
    label: 'H2 Heading',
    icon: <Heading2 size={16} />,
    description: 'Section heading',
    searchTerms: ['heading2', 'h2', '##'],
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'task',
    label: 'Task List',
    icon: <ListTodo size={16} />,
    description: 'Checklist with items',
    searchTerms: ['task', 'todo', 'checklist', 'checkbox'],
    action: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    id: 'image',
    label: 'Image',
    icon: <ImageIcon size={16} />,
    description: 'Insert an image URL',
    searchTerms: ['image', 'img', 'picture', 'photo'],
    action: (editor) => {
      const url = window.prompt('Image URL:')
      if (url) editor.chain().focus().setImage({ src: url }).run()
    },
  },
  {
    id: 'divider',
    label: 'Divider',
    icon: <Minus size={16} />,
    description: 'Horizontal rule',
    searchTerms: ['divider', 'hr', 'separator', '---'],
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    id: 'quote',
    label: 'Block Quote',
    icon: <Quote size={16} />,
    description: 'Blockquote for citations',
    searchTerms: ['quote', 'blockquote', '>'],
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'code',
    label: 'Code Block',
    icon: <Code2 size={16} />,
    description: 'Code block with syntax highlighting',
    searchTerms: ['code', 'pre', '```'],
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'table',
    label: 'Table',
    icon: <Table2 size={16} />,
    description: 'Insert a 3x3 table',
    searchTerms: ['table', 'grid', 'columns'],
    action: (editor) =>
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
]

interface Props {
  editor: Editor
  isOpen: boolean
  onClose: () => void
}

export default function SlashMenu({ editor, isOpen, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const filtered = query
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.searchTerms.some((t) => t.includes(query.toLowerCase()))
      )
    : items

  const updatePosition = useCallback(() => {
    const { view } = editor
    const { selection } = view.state
    const coords = view.coordsAtPos(selection.from)
    if (coords) {
      setPosition({ top: coords.bottom + 4, left: Math.max(coords.left - 120, 16) })
    }
  }, [editor])

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setSelectedIndex(0)
      return
    }
    updatePosition()
    setSelectedIndex(0)
  }, [isOpen, updatePosition])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => (i + 1) % filtered.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length)
          break
        case 'Enter':
          e.preventDefault()
          if (filtered[selectedIndex]) {
            filtered[selectedIndex].action(editor)
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filtered, selectedIndex, editor, onClose])

  useEffect(() => {
    if (!isOpen) return
    const el = menuRef.current?.querySelector(`[data-index="${selectedIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex, isOpen])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        ref={menuRef}
        className="fixed z-40 bg-[#18181c] border border-[#26262b] rounded-xl shadow-2xl p-1 w-56 text-sm"
        style={{ top: position.top, left: position.left }}
      >
        {filtered.length === 0 ? (
          <div className="px-3 py-2 text-xs text-muted">No results</div>
        ) : (
          filtered.map((item, i) => (
            <button
              key={item.id}
              data-index={i}
              onClick={() => {
                item.action(editor)
                onClose()
              }}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors ${
                i === selectedIndex ? 'bg-[#23242e] text-text' : 'text-text-dim hover:text-text hover:bg-[#1c1d27]'
              }`}
            >
              <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-[#23242e] text-accent">
                {item.icon}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted truncate">{item.description}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </>
  )
}
