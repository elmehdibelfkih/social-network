'use client';

import { useEffect } from "react";
import { chatService } from "@/features/chat/services/chat";

export default function SharedWorekerClient() {
    useEffect(() => {
        chatService.initSharedWorker();
        chatService.getGlobalPort().postMessage({ type: 'init_ws'});
    }, []);
    return null
}