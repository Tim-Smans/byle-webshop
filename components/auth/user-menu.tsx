"use client"

import { useState, useRef, useEffect, FC } from "react"
import { User, LogOut, Package, Heart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/context/auth-context"

const UserMenu: FC = () => {
  const { user, isLoading, openAuth, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
  }

  // Show loading state
  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled className="hidden sm:flex">
        <User className="h-5 w-5 animate-pulse" />
      </Button>
    )
  }

  // Not logged in - show login button
  if (!user) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="hidden sm:flex"
        onClick={() => openAuth("login")}
      >
        <User className="h-5 w-5" />
        <span className="sr-only">Sign in</span>
      </Button>
    )
  }

  // Logged in - show user menu
  return (
    <div className="relative hidden sm:block" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {/* User avatar with initials */}
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-xs font-medium text-primary-foreground">
            {user.firstName[0]}
            {user.lastName[0]}
          </span>
        </div>
        <span className="sr-only">User menu</span>
      </Button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background rounded-lg shadow-lg border border-border py-2 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Package className="h-4 w-4" />
              My Orders
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Heart className="h-4 w-4" />
              Wishlist
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="h-4 w-4" />
              Account Settings
            </button>
          </div>

          {/* Logout */}
          <div className="pt-2 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu