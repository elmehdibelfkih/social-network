import { CheckDeliveredIcon, CheckReadIcon, CheckSentIcon } from "../icons";
import styles from "./seen.module.css";

export interface SeenStatusProps {
    time: string;
    state: string;
}

export function SeenStatus({ state, time }: SeenStatusProps) {
    if (state === "sent") return <div className={styles.seenIcon}><div>{time}</div><CheckSentIcon /></div>;
    if (state === "delivered") return <div className={styles.seenIcon}><div>{time}</div><CheckDeliveredIcon /></div>;
    if (state === "read") return <div className={styles.seenIcon}><div>{time}</div><CheckReadIcon /></div>;
    return null;
}
