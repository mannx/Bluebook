package models

// ServerReturnMessage is used to return a simple message from a post for error or success
type ServerReturnMessage struct {
	Message string `json:"Message"`
	Error   bool   `json:"Error"`
	Data    string `json:"Data"` // optional extra data in a json formatted string
}

type ApiReturnMessage struct {
	Error   bool   // if true, message contains the error message
	Data    string // json encoded data
	Message string // error message if Error==true, message to display to user if Error==false, empty if nothing to show
}

type ApiTestMessage struct {
	Error   bool
	Message string
	Data    interface{}
}
