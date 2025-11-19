'use client'

import { FailureIcon, SuccessIcon } from "./icons";
import styles from "../../styles/snackbar.module.css"
import { useEffect, useRef, useState } from "react";

type SnackbarData = {
    status: boolean
    message: string
}

let snackFn: ((payload: SnackbarData) => void) | null = null;

export const ShowSnackbar = (payload: SnackbarData) => {
    if (snackFn) {
        snackFn(payload)
    } else {
        console.warn("Snackbar component not mounted")
    }
}

export default function Snackbar() {
    const [snackbar, setSnackbar] = useState<SnackbarData | null>(null)
    const timerRef = useRef<NodeJS.Timeout>(null)

    useEffect(() => {
        snackFn = (payload: SnackbarData) => {
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
        <div className={`${styles.container} ${snackbar?.status ? styles.success : styles.failure}`}>
            {snackbar?.status ? <SuccessIcon /> : <FailureIcon />}
            <div >
                {snackbar?.message}
            </div>
        </div>
    )
}
