"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart3, Plus, Trash2, GripVertical } from "lucide-react"

export interface Statistic {
  id?: string
  title: string
  value: string
}

interface EditStatisticsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  statistics: Statistic[]
  onSave: (statistics: Statistic[]) => void
}

export function EditStatisticsDialog({
  open,
  onOpenChange,
  statistics,
  onSave,
}: EditStatisticsDialogProps) {
  const [items, setItems] = useState<Statistic[]>(statistics)
  
  useEffect(() => {
    if (open) {
      setItems(statistics)
    }
  }, [statistics, open])

  const handleAddStatistic = () => {
    const newStat: Statistic = {
      id: crypto.randomUUID(),
      title: "",
      value: "",
    }
    setItems([...items, newStat])
  }

  const handleRemoveStatistic = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleUpdateStatistic = (
    id: string,
    field: "title" | "value",
    newValue: string
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: newValue } : item
      )
    )
  }

  const handleSave = () => {
    // Filter out empty items
    const validItems = items.filter(
      (item) => item.title.trim() !== "" && item.value.trim() !== ""
    )
    onSave(validItems)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setItems(statistics) // Reset to original
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-secondary/20 text-secondary p-2.5 rounded-full">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-serif">
                Edit Statistics
              </DialogTitle>
              <DialogDescription className="mt-0.5">
                Manage the statistics displayed in the About section.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Statistics Table */}
        <div className="mt-4">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_40px] gap-3 px-2 pb-2 border-b border-border">
            <p className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
              Title
            </p>
            <p className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
              Value
            </p>
            <span />
          </div>

          {/* Table Rows */}
          <div className="space-y-2 mt-3 max-h-[300px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">No statistics added yet.</p>
                <p className="text-xs mt-1">Click the button below to add one.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_1fr_40px] gap-3 items-center group"
                >
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      handleUpdateStatistic(item.id!, "title", e.target.value)
                    }
                    placeholder="Original Pieces"
                    className="h-10 font-sans text-sm"
                  />
                  <Input
                    value={item.value}
                    onChange={(e) =>
                      handleUpdateStatistic(item.id!, "value", e.target.value)
                    }
                    placeholder="500+"
                    className="h-10 font-sans text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveStatistic(item.id!)}
                    className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove statistic</span>
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Add Button */}
          <Button
            variant="outline"
            onClick={handleAddStatistic}
            className="w-full mt-4 border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Statistic
          </Button>
        </div>

        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
