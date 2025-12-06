import styles from "./seen.module.css";

export function SeenStatus({ state }: { state: string }) {
    if (state === "sent") return <span className={styles.seenIcon}><img src="svg/check.svg" alt="" /></span>;
    if (state === "delivered") return <span className={styles.seenIcon}><img src="svg/check-check.svg" alt="" /></span>;
    if (state === "read") return <span className={styles.seenIcon}><img src="svg/check-check-read.svg" alt="" /></span>;
    return null;
}
