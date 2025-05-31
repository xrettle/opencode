package prompt

import (
	"testing"

	"github.com/opencode-ai/opencode/internal/llm/models"

	"github.com/stretchr/testify/assert"
)

func TestPuterPromptTemplate_Format(t *testing.T) {
	template := NewPuterPromptTemplate(models.SupportedModels[models.PuterGPT41])

	messages := []Message{
		{
			Role:    "system",
			Content: "You are a helpful assistant.",
		},
		{
			Role:    "user",
			Content: "Hello, how are you?",
		},
		{
			Role:    "assistant",
			Content: "I'm doing well, thank you! How can I help you today?",
		},
	}

	expected := `system: You are a helpful assistant.

user: Hello, how are you?

assistant: I'm doing well, thank you! How can I help you today?`

	formatted := template.Format(messages)
	assert.Equal(t, expected, formatted)
}

func TestPuterPromptTemplate_FormatWithAttachments(t *testing.T) {
	template := NewPuterPromptTemplate(models.SupportedModels[models.PuterGPT41])

	messages := []Message{
		{
			Role:    "system",
			Content: "You are a helpful assistant.",
		},
		{
			Role:    "user",
			Content: "Please analyze this image.",
			Attachments: []Attachment{
				{
					Type:    "image",
					Content: "base64_encoded_image_data",
				},
			},
		},
	}

	expected := `system: You are a helpful assistant.

user: Please analyze this image.

Attachments:
- Type: image
  Content: base64_encoded_image_data`

	formatted := template.Format(messages)
	assert.Equal(t, expected, formatted)
}

func TestPuterPromptTemplate_GetModel(t *testing.T) {
	model := models.SupportedModels[models.PuterGPT41]
	template := NewPuterPromptTemplate(model)

	assert.Equal(t, model, template.GetModel())
}
