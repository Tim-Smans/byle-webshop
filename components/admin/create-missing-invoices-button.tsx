"use client"

import { useState } from "react"
import { FilePlus2, Loader2 } from "lucide-react"
import { useFeedback } from "@/lib/context/feedback-context"
import { createMissingInvoicesAction } from "@/app/admin/facturen/actions"

export default function CreateMissingInvoicesButton() {
    const { showSuccess, showError } = useFeedback()
    const [isRunning, setIsRunning] = useState(false)

    const run = async () => {
        setIsRunning(true)
        try {
            const { created } = await createMissingInvoicesAction()
            showSuccess(
                created === 0
                    ? "Alle betaalde bestellingen hebben al een factuur."
                    : `${created} ontbrekende factu${created === 1 ? "ur" : "ren"} aangemaakt.`
            )
        } catch (err) {
            showError(err instanceof Error ? err.message : "Onbekende fout")
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <button
            onClick={run}
            disabled={isRunning}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border hover:bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors disabled:opacity-50"
        >
            {isRunning ? <Loader2 size={16} className="animate-spin" /> : <FilePlus2 size={16} />}
            Ontbrekende facturen aanmaken
        </button>
    )
}
