import { useEffect, useRef } from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'

interface UseScrollOnLoadOptions {
    shouldScroll?: boolean
    behavior?: 'smooth' | 'auto'
    block?: 'start' | 'center' | 'end' | 'nearest'
    inline?: 'start' | 'center' | 'end' | 'nearest'
    delay?: number
}

export function useScrollOnLoad<T extends HTMLElement = HTMLDivElement>(
    isLoading: boolean,
    options: UseScrollOnLoadOptions = {}
) {
    const ref = useRef<T>(null)

    const {
        shouldScroll = true,
        behavior = 'smooth',
        block = 'start',
        inline = 'nearest',
        delay = 100
    } = options

    useEffect(() => {
        // Scrollea cuando: NO está cargando Y shouldScroll es true Y el ref existe
        if (!isLoading && shouldScroll && ref.current) {
            const timeoutId = setTimeout(() => {
                if (ref.current) {
                    scrollIntoView(ref.current, {
                        behavior,
                        block,
                        inline
                    })
                }
            }, delay)

            return () => clearTimeout(timeoutId)
        }
    }, [isLoading, shouldScroll, behavior, block, inline, delay])

    return ref
}