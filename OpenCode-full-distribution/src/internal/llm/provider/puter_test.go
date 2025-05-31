package provider

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/opencode-ai/opencode/internal/llm/models"
	"github.com/opencode-ai/opencode/internal/message"

	"github.com/stretchr/testify/assert"
)

func TestPuterClient_Send(t *testing.T) {
	client := newPuterClient(providerClientOptions{
		model: models.SupportedModels[models.PuterGPT41],
	})

	messages := []message.Message{
		{
			Role:  "system",
			Parts: []message.ContentPart{message.TextContent{Text: "You are a helpful assistant."}},
		},
		{
			Role:  "user",
			Parts: []message.ContentPart{message.TextContent{Text: "Hello, how are you?"}},
		},
	}

	response, err := client.send(context.Background(), messages, nil)
	assert.NoError(t, err)
	assert.NotNil(t, response)
	assert.NotEmpty(t, response.Content)
}

func TestPuterClient_Stream(t *testing.T) {
	client := newPuterClient(providerClientOptions{
		model: models.SupportedModels[models.PuterGPT41],
	})

	messages := []message.Message{
		{
			Role:  "system",
			Parts: []message.ContentPart{message.TextContent{Text: "You are a helpful assistant."}},
		},
		{
			Role:  "user",
			Parts: []message.ContentPart{message.TextContent{Text: "Hello, how are you?"}},
		},
	}

	events := client.stream(context.Background(), messages, nil)
	for event := range events {
		assert.NotNil(t, event)
	}
}

func TestPuterClient_WithAgentPrompt(t *testing.T) {
	client := newPuterClient(providerClientOptions{
		model: models.SupportedModels[models.PuterGPT41],
	})

	// Test setting agent prompt
	client = client.WithAgentPrompt("Devin AI").(*PuterClient)
	assert.Equal(t, "Devin AI", client.options.agentPrompt)

	// Test that the prompt is included in the request
	messages := []message.Message{
		{
			Role:  "user",
			Parts: []message.ContentPart{message.TextContent{Text: "Hello"}},
		},
	}

	// Create a test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify request body contains the agent prompt
		var reqBody map[string]interface{}
		json.NewDecoder(r.Body).Decode(&reqBody)
		msgs := reqBody["messages"].([]interface{})
		assert.Equal(t, "system", msgs[0].(map[string]interface{})["role"])
		assert.Contains(t, msgs[0].(map[string]interface{})["content"], "Devin AI")
		assert.Equal(t, "user", msgs[1].(map[string]interface{})["role"])
		assert.Equal(t, "Hello", msgs[1].(map[string]interface{})["content"])

		// Send response
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": map[string]interface{}{
				"content": "Hi there!",
			},
		})
	}))
	defer server.Close()

	// Override the API endpoint for testing
	client = client.WithAPIEndpoint(server.URL).(*PuterClient)

	// Send request
	resp, err := client.send(context.Background(), messages, nil)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.Equal(t, "Hi there!", resp.Content)
}
