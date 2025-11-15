package socket

type Event struct {
	Type    string  `json:"type"`
	Payload Message `json:"payload"`
}

type Message struct {
	SenderId    int64  `json:"sender_id"`
	Message     string `json:"message"`
	RecipientId int64  `json:"recipientId_id"`
}
