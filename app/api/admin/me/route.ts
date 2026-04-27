import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/auth/admin-session";

export const GET = async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_session")?.value

    if(!token){
        return NextResponse.json({
            isAdmin: false
        })
    }

    const valid = await verifyAdminSession(token)

    return NextResponse.json({
        isAdmin: valid

    })
}