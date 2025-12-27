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
    const timeoutRef = useRef<number | null>(null);
    const cbfRef = useRef<T>(cbf);

    useEffect(() => {
        cbfRef.current = cbf;
    }, [cbf]);

    return (...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            cbfRef.current(...args);
        }, delay);
    };
}

