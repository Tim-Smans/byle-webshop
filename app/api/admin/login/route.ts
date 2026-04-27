import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminSession } from "@/lib/auth/admin-session";

export async function POST(req: Request) {
    const { password } = await req.json();

    if (!password) {
        return NextResponse.json(
            { error: "Password required" },
            { status: 400 }
        );
    }

    const encoded = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH_BASE64

    if (encoded === undefined) {
        throw new Error("NEXT_PUBLIC_ADMIN_PASSWORD_HASH env variable not filled out")
    }

    const hash = Buffer.from(encoded, "base64").toString("utf-8");

    const valid = await bcrypt.compare(
        password,
        hash
    );

    if (!valid) {
        return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
        )
    }

    const token = await createAdminSession()

    const response = NextResponse.json({ success: true })

    response.cookies.set(
        "admin_session",
        token,
        {
            httpOnly: true,
            secure:
                process.env.NODE_ENV ===
                "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24
        }
    );
    
    return response;
}