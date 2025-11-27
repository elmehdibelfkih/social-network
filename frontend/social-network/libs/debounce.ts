import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number = 150) {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timerId = setTimeout(() => {
            
        }, delay);
    })

    return debouncedValue
}
