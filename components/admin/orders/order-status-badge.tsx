import { getOrderStatusLabel, getOrderStatusStyle } from "@/lib/orders/status"

export default function OrderStatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${getOrderStatusStyle(status)}`}>
            {getOrderStatusLabel(status)}
        </span>
    )
}
