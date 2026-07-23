import { Brain } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <Brain size={48} className="text-muted mb-4" />
      <h2 className="text-lg font-medium text-text mb-1">Your vault is empty</h2>
      <p className="text-sm text-muted max-w-xs">
        Use the compose card above to add your first note — text, image, or markdown.
      </p>
    </div>
  )
}
