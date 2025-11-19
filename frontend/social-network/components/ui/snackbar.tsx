import { FailureIcon, SuccessIcon } from "./icons";
import styles from "../../styles/snackbar.module.css"
import { useEffect, useState } from "react";

type SnackbarData = {
    status: boolean
    message: string
}

// initialize to null so it's safe to check before use
let snackFn: ((payload: SnackbarData) => void) | null = null;

export const ShowSnackbar = (payload: SnackbarData) => {
    if (snackFn) {
        snackFn(payload)
    } else {
        console.warn("Snackbar component not mounted")
    }
}

function Snackbar() {
    const [snackbar, setSnackbar] = useState<SnackbarData | null>(null)

    useEffect(() => {
        snackFn = (payload: SnackbarData) => {
            setSnackbar(payload)
            const timer = setTimeout(() => { setSnackbar(null) }, 4000)
            return () => { clearTimeout(timer) }
        }
        return () => { snackFn = null }
    }, [])

    return (
        <div className={`${styles.container} ${snackbar?.status ? styles.success : styles.failure}`}>
            {snackbar?.status ? <SuccessIcon /> : <FailureIcon />}
            <div >
                {snackbar?.message}
            </div>
        </div>
    )
}
