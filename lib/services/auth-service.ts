import { supabase } from "@/lib/supabase/client"
import type {
    IAuthService,
    User,
    LoginData,
    RegisterData,
    AuthResult
} from "../types"



class SupabaseAuthService implements IAuthService {
    async getCurrentUser(): Promise<User | null> {
        const {
            data: { user },
            error
        } = await supabase.auth.getUser()

        if (error || !user) {
            return null
        }

        return this.mapUser(user)
    }
    async login(data: LoginData): Promise<AuthResult> {
        const { email, password } = data

        const {
            data: result,
            error
        } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error || !result.user) {
            return {
                success: false,
                error: error?.message ?? "Login failed"
            }
        }

        return {
            success: true,
            user: this.mapUser(result.user)
        }
    }

    async register(data: RegisterData): Promise<AuthResult> {
        const {
            email,
            password,
            firstName,
            lastName
        } = data

        const {
            data: result,
            error
        } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    firstName,
                    lastName
                }
            }
        })

        if (error || !result.user) {
            return {
                success: false,
                error: error?.message ?? "Registration failed"
            }
        }

        return {
            success: true,
            user: this.mapUser(result.user)
        }
    }

    async logout(): Promise<void> {
        await supabase.auth.signOut()
    }

    async updateProfile(
        userId: string,
        data: Partial<User>
    ): Promise<AuthResult> {

        const {
            data: result,
            error
        } = await supabase.auth.updateUser({
            data: {
                firstName: data.firstName,
                lastName: data.lastName
            }
        })

        if (error || !result.user) {
            return {
                success: false,
                error: error?.message ?? "Update failed"
            }
        }

        return {
            success: true,
            user: this.mapUser(result.user)
        }
    }

    private mapUser(user: any): User {
        return {
            id: user.id,
            email: user.email,
            firstName: user.user_metadata?.firstName ?? "",
            lastName: user.user_metadata?.lastName ?? "",
            createdAt: new Date(user.created_at)
        }
    }
}

export const authService: IAuthService = new SupabaseAuthService()
