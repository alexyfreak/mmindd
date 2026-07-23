import { Settings, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function IconRail() {
  const signOut = useAuthStore((s) => s.signOut)
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="fixed left-0 top-0 bottom-0 w-14 flex flex-col items-center justify-end pb-6 z-10">
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-muted hover:text-text hover:bg-surface transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </button>

        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl text-muted hover:text-text hover:bg-surface transition-colors"
          title="Coming soon"
        >
          <Sparkles size={20} />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute left-14 bottom-0 bg-surface border border-border rounded-xl py-2 min-w-[160px] shadow-xl z-20">
              <button
                onClick={() => { signOut(); setShowMenu(false) }}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-surface-hover transition-colors"
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
