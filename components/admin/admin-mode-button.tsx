"use client"

import { useAdmin } from "@/lib/hooks/use-admin";
import { useRouter } from "next/navigation";
import { FC } from "react";

const AdminModeButton: FC = () => {
    const isAdmin = useAdmin();
    const router = useRouter();


    async function handleLogout(
        e: React.FormEvent
    ) {
        e.preventDefault();

        const res = await fetch(
            "/api/admin/logout",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

        if(res.status == 200){
            window.location.href = "/";
        }
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <>
            <a onClick={handleLogout}>
                ADMIN MODE
            </a>
        </>
    )
}

export default AdminModeButton