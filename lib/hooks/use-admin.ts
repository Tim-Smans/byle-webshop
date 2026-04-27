"use client"

import { useEffect, useState } from "react"

export const useAdmin = () => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

    useEffect(() => {
        fetch('/api/admin/me')
            .then(res => res.json())
            .then(data => setIsAdmin(data.isAdmin))
    }, [])

    return isAdmin
}