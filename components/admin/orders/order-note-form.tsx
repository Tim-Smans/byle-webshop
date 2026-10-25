"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useFeedback } from "@/lib/context/feedback-context"
import { saveOrderNote } from "@/app/admin/bestellingen/actions"

export default function OrderNoteForm({ orderId, initialNote }: { orderId: string; initialNote: string }) {
    const { showError } = useFeedback()
    const [note, setNote] = useState(initialNote)
    const [savedNote, setSavedNote] = useState(initialNote)
    const [isSaving, setIsSaving] = useState(false)

    const save = async () => {
        setIsSaving(true)
        try {
            await saveOrderNote(orderId, note)
            setSavedNote(note)
        } catch (err) {
            showError(err instanceof Error ? err.message : "Opslaan mislukt")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-2">
            <Textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Alleen zichtbaar voor jou, bv. afspraak voor afhalen"
                disabled={isSaving}
            />
            {note !== savedNote && (
                <Button size="sm" onClick={save} disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Notitie opslaan
                </Button>
            )}
        </div>
    )
}
