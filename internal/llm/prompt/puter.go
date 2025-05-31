package prompt

import (
	"fmt"
	"strings"

	"github.com/opencode-ai/opencode/internal/llm/models"
)

// Message represents a message in the prompt
type Message struct {
	Role        string
	Content     string
	Attachments []Attachment
}

// Attachment represents an attachment in a message
type Attachment struct {
	Type    string
	Content string
}

// PuterPromptTemplate implements the PromptTemplate interface for Puter.js models
type PuterPromptTemplate struct {
	model models.Model
}

// NewPuterPromptTemplate creates a new PuterPromptTemplate
func NewPuterPromptTemplate(model models.Model) *PuterPromptTemplate {
	return &PuterPromptTemplate{
		model: model,
	}
}

// Format formats the prompt for Puter.js models
func (t *PuterPromptTemplate) Format(messages []Message) string {
	var formattedMessages []string

	for _, msg := range messages {
		role := strings.ToLower(msg.Role)
		if role == "assistant" {
			role = "assistant"
		} else if role == "user" {
			role = "user"
		} else if role == "system" {
			role = "system"
		}

		content := msg.Content
		if msg.Attachments != nil && len(msg.Attachments) > 0 {
			// Add attachments to the content
			content = fmt.Sprintf("%s\n\nAttachments:\n%s", content, formatAttachments(msg.Attachments))
		}

		formattedMessages = append(formattedMessages, fmt.Sprintf("%s: %s", role, content))
	}

	return strings.Join(formattedMessages, "\n\n")
}

// formatAttachments formats the attachments for the prompt
func formatAttachments(attachments []Attachment) string {
	var formattedAttachments []string

	for _, attachment := range attachments {
		formattedAttachment := fmt.Sprintf("- Type: %s\n  Content: %s", attachment.Type, attachment.Content)
		formattedAttachments = append(formattedAttachments, formattedAttachment)
	}

	return strings.Join(formattedAttachments, "\n\n")
}

// GetModel returns the model associated with this template
func (t *PuterPromptTemplate) GetModel() models.Model {
	return t.model
}
