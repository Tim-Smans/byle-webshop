"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wrench } from "lucide-react"

export function UnderConstructionPopup() {
  const [open, setOpen] = useState(false)

    useEffect(() => {
    const lastSeen = localStorage.getItem("construction-popup-seen")

    const ONE_HOUR = 60 * 60 * 1000
    const now = Date.now()

    if (!lastSeen) {
        setOpen(true)
        localStorage.setItem(
        "construction-popup-seen",
        now.toString()
        )
        return
    }

    const lastSeenTime = Number(lastSeen)

    if (now - lastSeenTime > ONE_HOUR) {
        setOpen(true)
        localStorage.setItem(
        "construction-popup-seen",
        now.toString()
        )
    }

    }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full">
            <Wrench className="h-6 w-6" />
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-xl font-heading">
            Website under construction
          </DialogTitle>

          <DialogDescription className="mt-2">
            We're currently working hard to improve this website.
            Some features may not be available yet.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Button onClick={() => setOpen(false)}>
            Continue browsing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}