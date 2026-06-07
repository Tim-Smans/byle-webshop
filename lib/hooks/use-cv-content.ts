// hooks/useCvContent.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { CvData } from "../types" 

export const useCvContent = () => {
  const [data, setData] = useState<CvData | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/cv')
      .then(res => res.json())
      .then(setData)
  }, [])

  const update = useCallback(async (newData: CvData) => {
    setData(newData)
    setSaving(true)
    try {
      const resp = await fetch('/api/cv', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      })
      console.log('resp', resp)
    } finally {
      setSaving(false)
    }
  }, [])

  return { data, update, saving }
}