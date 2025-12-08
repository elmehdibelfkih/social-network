'use client';

import { useEffect } from "react";
import { chatService } from "@/features/chat/services/chat";

export default function SharedWorekerClient() {
    useEffect(() => {
        chatService.initPort();
        chatService.sendToWorker({ source: 'client', type: 'init_ws' });
    }, []);
    return null
}