import styles from "./seen.module.css";

export interface SeenStatusProps {
    time: string;
    state: string;
}

export function SeenStatus({ state, time }: SeenStatusProps) {
    if (state === "sent") return <div className={styles.seenIcon}><div>{time}</div><img src="/svg/check.svg" alt="" /></div>;
    if (state === "delivered") return <div className={styles.seenIcon}><div>{time}</div><img src="/svg/check-check.svg" alt="" /></div>;
    if (state === "read") return <div className={styles.seenIcon}><div>{time}</div><img src="/svg/check-check-read.svg" alt="" /></div>;
    return null;
}
