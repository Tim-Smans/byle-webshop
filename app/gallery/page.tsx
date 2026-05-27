import ShopComponent from "@/components/shop/shop-component"
import { Suspense } from "react"

const ShopPage = () => {

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ShopComponent />
        </Suspense>
    )
}

export default ShopPage