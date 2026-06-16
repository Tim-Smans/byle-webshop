import { useRef } from "react"

const SWIPE_THRESHOLD = 50

export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
    const startX = useRef<number | null>(null)
    const isDragging = useRef(false)

    const onTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX
    }

    const onTouchEnd = (e: React.TouchEvent) => {
        if (startX.current === null) return
        const delta = e.changedTouches[0].clientX - startX.current
        if (Math.abs(delta) >= SWIPE_THRESHOLD) {
            delta < 0 ? onSwipeLeft() : onSwipeRight()
        }
        startX.current = null
    }

    const onMouseDown = (e: React.MouseEvent) => {
        startX.current = e.clientX
        isDragging.current = true
    }

    const onMouseUp = (e: React.MouseEvent) => {
        if (!isDragging.current || startX.current === null) return
        const delta = e.clientX - startX.current
        if (Math.abs(delta) >= SWIPE_THRESHOLD) {
            delta < 0 ? onSwipeLeft() : onSwipeRight()
        }
        startX.current = null
        isDragging.current = false
    }

    const onMouseLeave = () => {
        startX.current = null
        isDragging.current = false
    }

    return { onTouchStart, onTouchEnd, onMouseDown, onMouseUp, onMouseLeave }
}
