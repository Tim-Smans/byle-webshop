import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const GET = async () => {
    const authorized = await isAdmin()
    if (!authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data: subscribers, error } = await supabase
        .from("NewsletterSubscriber")
        .select("email, createdAt")
        .order("createdAt", { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet("Nieuwsbrief")

    sheet.columns = [
        { header: "E-mail", key: "email", width: 40 },
        { header: "Ingeschreven op", key: "createdAt", width: 22, style: { numFmt: "dd/mm/yyyy hh:mm" } },
    ]
    sheet.getRow(1).font = { bold: true }

    subscribers.forEach((subscriber) => {
        sheet.addRow({
            email: subscriber.email,
            createdAt: new Date(subscriber.createdAt),
        })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const date = new Date().toISOString().split("T")[0]

    return new Response(buffer, {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="nieuwsbrief-${date}.xlsx"`,
            "Cache-Control": "no-store",
        },
    })
}
