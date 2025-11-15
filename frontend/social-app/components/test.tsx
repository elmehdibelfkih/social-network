"use client";

import styles from "@/styles/components/test.module.css"
import { sendMessage } from "@/libs/ws/client"
import { WebSocketMessage } from "@/libs/ws/types"

type RootMessage = {
    name: string;
}

const howa: WebSocketMessage<string> = {
    origin: -1,
    success: true,
    payload: "howa"
}

const click = () => { sendMessage<string>(howa) }

export default function TestComponent({ name }: RootMessage) {
    return (
        <h1 className={styles.test} onClick={click}>{name}</h1>
    )
}