package provider

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/opencode-ai/opencode/internal/config"
	"github.com/opencode-ai/opencode/internal/llm/models"
	"github.com/opencode-ai/opencode/internal/llm/prompt"
	"github.com/opencode-ai/opencode/internal/llm/tools"
	"github.com/opencode-ai/opencode/internal/message"
)

type PuterClient struct {
	options providerClientOptions
	client  *http.Client
}

func newPuterClient(options providerClientOptions) *PuterClient {
	return &PuterClient{
		options: options,
		client:  &http.Client{},
	}
}

func (c *PuterClient) Model() models.Model {
	return c.options.model
}

func (c *PuterClient) WithModel(model models.Model) Provider {
	c.options.model = model
	return c
}

// No-op implementation to satisfy Provider interface
func (c *PuterClient) WithAPIKey(apiKey string) Provider {
	return c
}

// No-op implementation to satisfy Provider interface
func (c *PuterClient) WithAPIEndpoint(endpoint string) Provider {
	return c
}

func (c *PuterClient) WithAgentPrompt(prompt string) Provider {
	c.options.agentPrompt = prompt
	return c
}

func (c *PuterClient) send(ctx context.Context, messages []message.Message, tools []tools.BaseTool) (*ProviderResponse, error) {
	// Convert messages to Puter.js format
	puterMessages := make([]map[string]interface{}, len(messages))
	for i, msg := range messages {
		puterMsg := map[string]interface{}{
			"role":    msg.Role,
			"content": msg.Content().Text,
		}
		puterMessages[i] = puterMsg
	}

	// Add system message with agent prompt if specified
	if c.options.agentPrompt != "" {
		promptContent := prompt.GetAgentPromptString(config.AgentName(c.options.agentPrompt), c.options.model.Provider)
		systemMsg := map[string]interface{}{
			"role":    "system",
			"content": promptContent,
		}
		puterMessages = append([]map[string]interface{}{systemMsg}, puterMessages...)
	}

	// Prepare request body
	reqBody := map[string]interface{}{
		"messages": puterMessages,
		"model":    c.options.model.APIModel,
		"stream":   false,
	}

	if len(tools) > 0 {
		reqBody["tools"] = tools
	}

	// Make request to Puter.js
	req, err := http.NewRequestWithContext(ctx, "POST", "https://js.puter.com/v2/ai/chat", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("request failed with status: %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Extract response content
	content := result["message"].(map[string]interface{})["content"].(string)

	return &ProviderResponse{
		Content: content,
		Usage: TokenUsage{
			InputTokens:  0, // Puter.js doesn't provide token usage
			OutputTokens: 0,
		},
		FinishReason: message.FinishReasonEndTurn,
	}, nil
}

func (c *PuterClient) stream(ctx context.Context, messages []message.Message, tools []tools.BaseTool) <-chan ProviderEvent {
	events := make(chan ProviderEvent)

	go func() {
		defer close(events)

		// Convert messages to Puter.js format
		puterMessages := make([]map[string]interface{}, len(messages))
		for i, msg := range messages {
			puterMsg := map[string]interface{}{
				"role":    msg.Role,
				"content": msg.Content().Text,
			}
			puterMessages[i] = puterMsg
		}

		// Add system message with agent prompt if specified
		if c.options.agentPrompt != "" {
			promptContent := prompt.GetAgentPromptString(config.AgentName(c.options.agentPrompt), c.options.model.Provider)
			systemMsg := map[string]interface{}{
				"role":    "system",
				"content": promptContent,
			}
			puterMessages = append([]map[string]interface{}{systemMsg}, puterMessages...)
		}

		// Prepare request body
		reqBody := map[string]interface{}{
			"messages": puterMessages,
			"model":    c.options.model.APIModel,
			"stream":   true,
		}

		if len(tools) > 0 {
			reqBody["tools"] = tools
		}

		// Make request to Puter.js
		req, err := http.NewRequestWithContext(ctx, "POST", "https://js.puter.com/v2/ai/chat", nil)
		if err != nil {
			events <- ProviderEvent{
				Type:  EventError,
				Error: fmt.Errorf("failed to create request: %w", err),
			}
			return
		}

		req.Header.Set("Content-Type", "application/json")

		resp, err := c.client.Do(req)
		if err != nil {
			events <- ProviderEvent{
				Type:  EventError,
				Error: fmt.Errorf("failed to send request: %w", err),
			}
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			events <- ProviderEvent{
				Type:  EventError,
				Error: fmt.Errorf("request failed with status: %d", resp.StatusCode),
			}
			return
		}

		// Stream response
		decoder := json.NewDecoder(resp.Body)
		for {
			var result map[string]interface{}
			if err := decoder.Decode(&result); err != nil {
				if err.Error() == "EOF" {
					break
				}
				events <- ProviderEvent{
					Type:  EventError,
					Error: fmt.Errorf("failed to decode response: %w", err),
				}
				return
			}

			if content, ok := result["content"].(string); ok {
				events <- ProviderEvent{
					Type:    EventContentDelta,
					Content: content,
				}
			}
		}

		events <- ProviderEvent{
			Type: EventComplete,
		}
	}()

	return events
}

func (c *PuterClient) SendMessages(ctx context.Context, messages []message.Message, tools []tools.BaseTool) (*ProviderResponse, error) {
	return c.send(ctx, messages, tools)
}

func (c *PuterClient) StreamResponse(ctx context.Context, messages []message.Message, tools []tools.BaseTool) <-chan ProviderEvent {
	return c.stream(ctx, messages, tools)
}
