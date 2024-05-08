package models

// ServerReturnMessage is used to return a simple message from a post for error or success
type ServerReturnMessage struct {
	Message string `json:"Message"`
	Error   bool   `json:"Error"`
	Data    string `json:"Data"` // optional extra data in a json formatted string
}
