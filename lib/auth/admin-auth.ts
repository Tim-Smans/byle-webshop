import { cookies } from "next/headers";
import { verifyAdminSession } from "./admin-session";

export const isAdmin = async () => {
    const cookieStore = await cookies()

    const token = cookieStore.get("admin_session")?.value

    if(!token) {
        return false
    }

    return await verifyAdminSession(token)
}