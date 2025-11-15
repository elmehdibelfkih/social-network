export enum ErrorTypes {
    redirect = "redirect",
    alert = "alert"
}

export interface ErrorResponse {
    statusCode: number,
    statusText: string,
    description: string,
    type: ErrorTypes
}

export interface WebSocketMessage<T> {
    origin: number,
    success: boolean,
    payload?: T,
    error?: ErrorResponse
}