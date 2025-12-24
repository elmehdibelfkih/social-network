import { useCallback, useEffect, useRef, useState } from "react";

export function useDebounce<T>(value: T, delay: number = 350) {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedValue(value)
        }, delay);
        return () => clearTimeout(timerId)
    }, [value, delay])

    return debouncedValue
}

export function useDebounceCbf<T extends (...args: any[]) => any>(cbf: T, delay: number) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const canInvock = useRef<boolean>(true)
    const cbfRef = useRef<T>(cbf);

    useEffect(() => {
        cbfRef.current = cbf;
    }, [cbf]);

    return (...args: Parameters<T>) => {
        if (canInvock.current) {
            cbfRef.current(...args);
            canInvock.current = false;
            return
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            canInvock.current = true;
        }, delay);
    }
}
