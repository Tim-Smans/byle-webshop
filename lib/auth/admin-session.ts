import { SignJWT, jwtVerify} from "jose"

const secret = new TextEncoder().encode(
    process.env.NEXT_PUBLIC_ADMIN_SESSION_SECRET
)

export const createAdminSession = async () => {
    return await new SignJWT({
        role: "admin"
    })
    .setProtectedHeader({alg: "HS256"})
    .setExpirationTime("1d")
    .sign(secret)
}

export const verifyAdminSession = async (token: string) => {
    try{
        const { payload } = await jwtVerify(
            token,
            secret
        )

        return payload.role === "admin"
    }catch{
        return false
    }
}