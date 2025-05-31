package provider

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/opencode-ai/opencode/internal/llm/prompt"
	"github.com/opencode-ai/opencode/internal/llm/tools"
	"github.com/opencode-ai/opencode/internal/message"
)

// VLLMClient represents a client for the vLLM API
type VLLMClient struct {
	apiKey      string
	apiEndpoint string
	model       string
	httpClient  *http.Client
}

// NewVLLMClient creates a new vLLM client
func NewVLLMClient(apiKey, apiEndpoint, model string) *VLLMClient {
	return &VLLMClient{
		apiKey:      apiKey,
		apiEndpoint: apiEndpoint,
		model:       model,
		httpClient:  &http.Client{},
	}
}

// vLLMRequest represents the request body for the vLLM API
type vLLMRequest struct {
	Model       string        `json:"model"`
	Messages    []vLLMMessage `json:"messages"`
	Stream      bool          `json:"stream"`
	MaxTokens   int           `json:"max_tokens,omitempty"`
	Temperature float64       `json:"temperature,omitempty"`
	TopP        float64       `json:"top_p,omitempty"`
}

// vLLMMessage represents a message in the vLLM API format
type vLLMMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// vLLMResponse represents the response from the vLLM API
type vLLMResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index   int `json:"index"`
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}

// vLLMStreamResponse represents a streaming response from the vLLM API
type vLLMStreamResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index int `json:"index"`
		Delta struct {
			Role    string `json:"role,omitempty"`
			Content string `json:"content,omitempty"`
		} `json:"delta"`
		FinishReason string `json:"finish_reason,omitempty"`
	} `json:"choices"`
}

// VLLMOptions replaces the missing prompt.Options type
// and is used for passing generation options to vLLM.
type VLLMOptions struct {
	MaxTokens   int
	Temperature float64
	TopP        float64
}

// SendMessages sends messages to the vLLM API and returns the response
func (c *VLLMClient) SendMessages(messages []prompt.Message, options interface{}) (*ProviderResponse, error) {
	// Convert messages to vLLM format
	vllmMessages := make([]vLLMMessage, len(messages))
	for i, msg := range messages {
		vllmMessages[i] = vLLMMessage{
			Role:    string(msg.Role),
			Content: msg.Content,
		}
	}

	// Create request body
	reqBody := vLLMRequest{
		Model:    c.model,
		Messages: vllmMessages,
		Stream:   false,
	}

	if options != nil {
		if opts, ok := options.(VLLMOptions); ok {
			if opts.MaxTokens > 0 {
				reqBody.MaxTokens = opts.MaxTokens
			}
			if opts.Temperature > 0 {
				reqBody.Temperature = opts.Temperature
			}
			if opts.TopP > 0 {
				reqBody.TopP = opts.TopP
			}
		}
	}

	// Convert request body to JSON
	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %v", err)
	}

	// Create HTTP request
	req, err := http.NewRequest("POST", c.apiEndpoint, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	if c.apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.apiKey)
	}

	// Send request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}

	// Check for error response
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	// Parse response
	var vllmResp vLLMResponse
	if err := json.Unmarshal(body, &vllmResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %v", err)
	}

	// Check if there are any choices
	if len(vllmResp.Choices) == 0 {
		return nil, fmt.Errorf("no choices in response")
	}

	// Create provider response
	providerResp := &ProviderResponse{
		Content: vllmResp.Choices[0].Message.Content,
		Usage: TokenUsage{
			InputTokens:  int64(vllmResp.Usage.PromptTokens),
			OutputTokens: int64(vllmResp.Usage.CompletionTokens),
		},
	}

	return providerResp, nil
}

// send implements the ProviderClient interface
func (c *VLLMClient) send(ctx context.Context, messages []message.Message, tools []tools.BaseTool) (*ProviderResponse, error) {
	// Convert messages to vLLM format
	vllmMessages := make([]vLLMMessage, 0, len(messages))
	for _, msg := range messages {
		vllmMessages = append(vllmMessages, vLLMMessage{
			Role:    string(msg.Role),
			Content: msg.Content().String(),
		})
	}

	// Create request body
	reqBody := vLLMRequest{
		Model:       c.model,
		Messages:    vllmMessages,
		Stream:      false,
		MaxTokens:   1024,
		Temperature: 0.7,
		TopP:        0.95,
	}

	// Convert request body to JSON
	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %v", err)
	}

	// Create HTTP request
	req, err := http.NewRequestWithContext(ctx, "POST", c.apiEndpoint, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	if c.apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.apiKey)
	}

	// Send request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}

	// Check for error response
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	// Parse response
	var vllmResp vLLMResponse
	if err := json.Unmarshal(body, &vllmResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %v", err)
	}

	// Check if there are any choices
	if len(vllmResp.Choices) == 0 {
		return nil, fmt.Errorf("no choices in response")
	}

	// Create provider response
	providerResp := &ProviderResponse{
		Content: vllmResp.Choices[0].Message.Content,
		Usage: TokenUsage{
			InputTokens:  int64(vllmResp.Usage.PromptTokens),
			OutputTokens: int64(vllmResp.Usage.CompletionTokens),
		},
		FinishReason: message.FinishReasonEndTurn,
	}

	return providerResp, nil
}

// stream implements the ProviderClient interface
func (c *VLLMClient) stream(ctx context.Context, messages []message.Message, tools []tools.BaseTool) <-chan ProviderEvent {
	eventCh := make(chan ProviderEvent, 100)

	go func() {
		defer close(eventCh)

		// Convert messages to vLLM format
		vllmMessages := make([]vLLMMessage, 0, len(messages))
		for _, msg := range messages {
			vllmMessages = append(vllmMessages, vLLMMessage{
				Role:    string(msg.Role),
				Content: msg.Content().String(),
			})
		}

		// Create request body
		reqBody := vLLMRequest{
			Model:       c.model,
			Messages:    vllmMessages,
			Stream:      true,
			MaxTokens:   1024,
			Temperature: 0.7,
			TopP:        0.95,
		}

		// Convert request body to JSON
		jsonBody, err := json.Marshal(reqBody)
		if err != nil {
			eventCh <- ProviderEvent{Type: EventError, Error: fmt.Errorf("failed to marshal request body: %v", err)}
			return
		}

		// Create HTTP request
		req, err := http.NewRequestWithContext(ctx, "POST", c.apiEndpoint, bytes.NewBuffer(jsonBody))
		if err != nil {
			eventCh <- ProviderEvent{Type: EventError, Error: fmt.Errorf("failed to create request: %v", err)}
			return
		}

		// Set headers
		req.Header.Set("Content-Type", "application/json")
		if c.apiKey != "" {
			req.Header.Set("Authorization", "Bearer "+c.apiKey)
		}

		// Send request
		resp, err := c.httpClient.Do(req)
		if err != nil {
			eventCh <- ProviderEvent{Type: EventError, Error: fmt.Errorf("failed to send request: %v", err)}
			return
		}
		defer resp.Body.Close()

		// Check for error response
		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			eventCh <- ProviderEvent{Type: EventError, Error: fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))}
			return
		}

		// Read response stream
		reader := bufio.NewReader(resp.Body)
		content := ""
		finishReason := message.FinishReasonUnknown

		// Send content start event
		eventCh <- ProviderEvent{Type: EventContentStart}

		for {
			select {
			case <-ctx.Done():
				eventCh <- ProviderEvent{Type: EventError, Error: ctx.Err()}
				return
			default:
				// Read a line from the stream
				line, err := reader.ReadString('\n')
				if err != nil {
					if err == io.EOF {
						break
					}
					eventCh <- ProviderEvent{Type: EventError, Error: fmt.Errorf("failed to read stream: %v", err)}
					return
				}

				// Skip empty lines
				line = strings.TrimSpace(line)
				if line == "" || line == "data: [DONE]" {
					continue
				}

				// Remove "data: " prefix if present
				if strings.HasPrefix(line, "data: ") {
					line = line[6:]
				}

				// Parse the response
				var streamResp vLLMStreamResponse
				if err := json.Unmarshal([]byte(line), &streamResp); err != nil {
					eventCh <- ProviderEvent{Type: EventError, Error: fmt.Errorf("failed to unmarshal stream response: %v", err)}
					continue
				}

				// Check if there are any choices
				if len(streamResp.Choices) == 0 {
					continue
				}

				// Process delta content
				if delta := streamResp.Choices[0].Delta.Content; delta != "" {
					content += delta
					eventCh <- ProviderEvent{Type: EventContentDelta, Content: delta}
				}

				// Check for finish reason
				if reason := streamResp.Choices[0].FinishReason; reason != "" {
					switch reason {
					case "stop":
						finishReason = message.FinishReasonEndTurn
					case "length":
						finishReason = message.FinishReasonMaxTokens
					default:
						finishReason = message.FinishReasonError
					}
				}
			}
		}

		// Send content stop event
		eventCh <- ProviderEvent{Type: EventContentStop}

		// Send complete event
		eventCh <- ProviderEvent{Type: EventComplete, Response: &ProviderResponse{
			Content:      content,
			FinishReason: finishReason,
		}}
	}()

	return eventCh
}

// SetAPIEndpoint sets the API endpoint for the vLLM client
func (c *VLLMClient) SetAPIEndpoint(endpoint string) {
	c.apiEndpoint = endpoint
}

// SetAgentPrompt sets the agent prompt for the vLLM client
func (c *VLLMClient) SetAgentPrompt(prompt string) {
	// Not applicable for vLLM
}
