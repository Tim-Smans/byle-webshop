"use client"

import { LogOut } from "lucide-react"

export default function LogoutButton() {
    async function handleLogout() {
        await fetch("/api/admin/logout", { method: "POST" })
        window.location.href = "/"
    }

    return (
        <button
            onClick={handleLogout}
            className="group flex w-full items-start gap-4 rounded-lg border border-border p-5 transition-colors hover:bg-red-50 hover:border-red-200 text-left"
        >
            <div className="mt-0.5 shrink-0 text-red-500">
                <LogOut size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-red-600">Uitloggen</div>
                <div className="text-xs text-muted-foreground mt-0.5">Afmelden als administrator</div>
            </div>
        </button>
    )
}
