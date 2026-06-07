// components/EditableText.tsx
"use client"

import { useRef, useState } from "react"

type Props = {
  value: string
  isAdmin: boolean
  onSave: (newValue: string) => void
  className?: string
  multiline?: boolean
}

export const EditableText = ({ value, isAdmin, onSave, className, multiline }: Props) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null)

  if (!isAdmin) return <span className={className}>{value}</span>

  if (editing) {
    const sharedProps = {
      ref,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft(e.target.value),
      onBlur: () => { onSave(draft); setEditing(false) },
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) { onSave(draft); setEditing(false) }
        if (e.key === 'Escape') { setDraft(value); setEditing(false) }
      },
      autoFocus: true,
      className: `${className} bg-secondary/10 border border-secondary/50 rounded px-1 outline-none w-full`,
    }

    return multiline
      ? <textarea {...sharedProps} rows={4} />
      : <input {...sharedProps} />
  }

  return (
    <span
      className={`${className} cursor-pointer hover:bg-secondary/10 rounded px-1 -mx-1 transition-colors group relative`}
      onClick={() => { setDraft(value); setEditing(true) }}
      title="Klik om te bewerken"
    >
      {value}
      <span className="absolute -top-5 left-0 text-xs text-secondary opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border px-1.5 py-0.5 rounded whitespace-nowrap">
        Bewerken
      </span>
    </span>
  )
}