"use client"

import { FC, useState } from "react"
import { X, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/context/auth-context"


const AuthModal: FC = () => {
    const { isAuthOpen, closeAuth, authMode, setAuthMode, login, register } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    // Form state
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

    const resetForm = () => {
        setEmail("")
        setPassword("")
        setFirstName("")
        setLastName("")
        setError(null)
        setShowPassword(false)
    }

    const handleClose = () => {
        resetForm()
        closeAuth()
    }

    const switchMode = () => {
        resetForm()
        setAuthMode(authMode === "login" ? "register" : "login")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            let result: { success: boolean; error?: string }

            if (authMode === "login") {
                result = await login({ email, password })
            } else {
                result = await register({ email, password, firstName, lastName })
            }

            if (!result.success) {
                setError(result.error || "Something went wrong")
            } else {
                resetForm()
            }
        } catch {
            setError("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isAuthOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="relative w-full max-w-md bg-background rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted transition-colors"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>

                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 text-center border-b border-border">
                        <h2 className="text-2xl font-semibold text-foreground">
                            {authMode === "login" ? "Welcome Back" : "Create Account"}
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            {authMode === "login"
                                ? "Sign in to your By Lé account"
                                : "Join the By Lé art community"}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
                        {/* Error message */}
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        {/* Name fields (register only) */}
                        {authMode === "register" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="firstName"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        First Name
                                    </label>
                                    <Input
                                        id="firstName"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="John"
                                        required
                                        disabled={isSubmitting}
                                        className="bg-background"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="lastName"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Last Name
                                    </label>
                                    <Input
                                        id="lastName"
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Doe"
                                        required
                                        disabled={isSubmitting}
                                        className="bg-background"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-foreground"
                            >
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                disabled={isSubmitting}
                                className="bg-background"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-foreground"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={authMode === "register" ? "Min. 6 characters" : "Your password"}
                                    required
                                    disabled={isSubmitting}
                                    className="bg-background pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Forgot password (login only) */}
                        {authMode === "login" && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {/* Submit button */}
                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {authMode === "login" ? "Signing in..." : "Creating account..."}
                                </>
                            ) : (
                                authMode === "login" ? "Sign In" : "Create Account"
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="px-8 pb-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            {authMode === "login" ? (
                                <>
                                    {"Don't have an account? "}
                                    <button
                                        type="button"
                                        onClick={switchMode}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={switchMode}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AuthModal