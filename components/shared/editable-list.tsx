// components/EditableList.tsx
"use client"

import { useState } from "react"

type Props = {
  items: string[]
  isAdmin: boolean
  onSave: (items: string[]) => void
  renderItem: (item: string) => React.ReactNode
}

export const EditableList = ({ items, isAdmin, onSave, renderItem }: Props) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(items.join('\n'))

  if (!isAdmin || !editing) {
    return (
      <>
        {items.map(renderItem)}
        {isAdmin && (
          <button
            onClick={() => { setDraft(items.join('\n')); setEditing(true) }}
            className="text-xs text-secondary border border-dashed border-secondary/40 rounded-full px-3 py-1 hover:bg-secondary/10 transition-colors"
          >
            + lijst bewerken
          </button>
        )}
      </>
    )
  }

  return (
    <div className="w-full space-y-2">
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        className="w-full bg-secondary/10 border border-secondary/50 rounded p-2 text-sm outline-none"
        rows={6}
        placeholder="Één item per regel"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={() => { onSave(draft.split('\n').filter(Boolean)); setEditing(false) }}
          className="text-xs bg-secondary text-background px-3 py-1 rounded-full"
        >
          Opslaan
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-xs border border-border px-3 py-1 rounded-full"
        >
          Annuleren
        </button>
      </div>
    </div>
  )
}