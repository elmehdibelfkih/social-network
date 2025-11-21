package socket

type Event struct {
	Type    string  `json:"type"`
	Payload Message `json:"payload"`
}

type Message struct {
	SenderId     int64    `json:"senderId"`
	Content      string   `json:"message"`
	RecipientId  *int64   `json:"recipientId"`
	GroupId      *int64   `json:"groupId"`
	CustomTarget *[]int64 `json:"targetIds"`
}

func NewEvent(eventType string, senderId int64, content string,
	recipientId, groupId *int64, customTargets *[]int64) *Event {
	return &Event{
		Type: eventType,
		Payload: Message{
			SenderId:     senderId,
			Content:      content,
			RecipientId:  recipientId,
			GroupId:      groupId,
			CustomTarget: customTargets,
		},
	}
}
