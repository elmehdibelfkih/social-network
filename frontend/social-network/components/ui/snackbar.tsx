'use client'

import { FailureIcon } from "./icons";
import styles from "../../styles/snackbar.module.css"
import { useEffect, useRef, useState } from "react";
import { ApiErrorResponse } from "../../features/auth/types";


let snackFn: ((payload: ApiErrorResponse) => void) | null = null;

export const ShowSnackbar = (payload: ApiErrorResponse) => {
    if (snackFn) {
        snackFn(payload)
    } else {
        console.warn("Snackbar component not mounted")
    }
}

export default function Snackbar() {
    const [snackbar, setSnackbar] = useState<ApiErrorResponse | null>(null)
    const timerRef = useRef<NodeJS.Timeout>(null)

    useEffect(() => {
        snackFn = (payload: ApiErrorResponse) => {
            setSnackbar(payload)

            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }

            timerRef.current = setTimeout(() => { setSnackbar(null) }, 4000)
        }
        return () => {
            snackFn = null
            if (timerRef.current) { clearTimeout(timerRef.current) }
        }
    }, [])

    if (!snackbar) return null

    return (
        <div className={`${styles.container} ${styles.failure}`}>
            <FailureIcon />
            <div >
                {snackbar?.error.errorMessage}
            </div>
        </div>
    )
}
