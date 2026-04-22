"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { User, LoginData, RegisterData } from "../types"
import { authService } from "../services/auth-service"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthOpen: boolean
  authMode: "login" | "register"
  openAuth: (mode?: "login" | "register") => void
  closeAuth: () => void
  setAuthMode: (mode: "login" | "register") => void
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Failed to load user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const openAuth = useCallback((mode: "login" | "register" = "login") => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }, [])

  const closeAuth = useCallback(() => setIsAuthOpen(false), [])

  const login = useCallback(async (data: LoginData) => {
    try {
      const result = await authService.login(data)
      if (result.success && result.user) {
        setUser(result.user)
        setIsAuthOpen(false)
      }
      return { success: result.success, error: result.error }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    try {
      const result = await authService.register(data)
      if (result.success && result.user) {
        setUser(result.user)
        setIsAuthOpen(false)
      }
      return { success: result.success, error: result.error }
    } catch (error) {
      console.error("Register error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }, [])

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) return { success: false, error: "Not logged in" }
    
    try {
      const result = await authService.updateProfile(user.id, data)
      if (result.success && result.user) {
        setUser(result.user)
      }
      return { success: result.success, error: result.error }
    } catch (error) {
      console.error("Update profile error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthOpen,
        authMode,
        openAuth,
        closeAuth,
        setAuthMode,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
