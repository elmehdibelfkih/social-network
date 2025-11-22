let globalPort: MessagePort | null = null;

export const chatService = {

    initSharedWorker(): MessagePort {
        if (!globalPort) {
            const worker = new SharedWorker('/shared_worker.js')
            globalPort = worker.port
            globalPort.start()
        }
        return globalPort
    },

    getGlobalPort(): MessagePort | null {
        return globalPort
    }
}