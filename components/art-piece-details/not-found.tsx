import Link from "next/link";
import { FC } from "react";
import { Button } from "../ui/button";

const NotFound: FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-medium text-foreground mb-4">Art piece not found</h1>
                <Link href="/gallery">
                    <Button variant="outline">Back to Shop</Button>
                </Link>
            </div>
        </div>
    )
}

export default NotFound 