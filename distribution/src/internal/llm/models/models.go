package models

type (
	ModelID       string
	ModelProvider string
)

type Model struct {
	ID                  ModelID       `json:"id"`
	Name                string        `json:"name"`
	Provider            ModelProvider `json:"provider"`
	APIModel            string        `json:"api_model"`
	CostPer1MIn         float64       `json:"cost_per_1m_in"`
	CostPer1MOut        float64       `json:"cost_per_1m_out"`
	CostPer1MInCached   float64       `json:"cost_per_1m_in_cached"`
	CostPer1MOutCached  float64       `json:"cost_per_1m_out_cached"`
	ContextWindow       int64         `json:"context_window"`
	DefaultMaxTokens    int64         `json:"default_max_tokens"`
	CanReason           bool          `json:"can_reason"`
	SupportsAttachments bool          `json:"supports_attachments"`
}

// Model IDs
const (
	// Bedrock
	BedrockClaude37Sonnet ModelID = "bedrock.claude-3.7-sonnet"
	DeepSeekChat          ModelID = "deepseek-chat"
	DeepSeekReasoner      ModelID = "deepseek-reasoner"
)

const (
	ProviderBedrock ModelProvider = "bedrock"
	ProviderMock    ModelProvider = "__mock"
)

// Providers in order of popularity
var ProviderPopularity = map[ModelProvider]int{
	ProviderOpenAI:     1,
	ProviderAnthropic:  2,
	ProviderGemini:     3,
	ProviderBedrock:    4,
	ProviderGROQ:       5,
	ProviderAzure:      6,
	ProviderVertexAI:   7,
	ProviderOpenRouter: 8,
	ProviderXAI:        9,
	ProviderLocal:      10,
	ProviderVLLM:       11,
	ProviderMock:       12,
}

var SupportedModels = map[ModelID]Model{
	BedrockClaude37Sonnet: {
		ID:                 BedrockClaude37Sonnet,
		Name:               "Bedrock: Claude 3.7 Sonnet",
		Provider:           ProviderBedrock,
		APIModel:           "anthropic.claude-3-7-sonnet-20250219-v1:0",
		CostPer1MIn:        3.0,
		CostPer1MInCached:  3.75,
		CostPer1MOutCached: 0.30,
		CostPer1MOut:       15.0,
	},
	DeepSeekChat: {
		ID:                  DeepSeekChat,
		Name:                "DeepSeek Chat (V3)",
		Provider:            "puter",
		APIModel:            "deepseek-chat",
		CostPer1MIn:         0,
		CostPer1MInCached:   0,
		CostPer1MOut:        0,
		CostPer1MOutCached:  0,
		ContextWindow:       32768,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: false,
	},
	DeepSeekReasoner: {
		ID:                  DeepSeekReasoner,
		Name:                "DeepSeek Reasoner (R1)",
		Provider:            "puter",
		APIModel:            "deepseek-reasoner",
		CostPer1MIn:         0,
		CostPer1MInCached:   0,
		CostPer1MOut:        0,
		CostPer1MOutCached:  0,
		ContextWindow:       32768,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: false,
	},
}

func init() {
	// Copy all supported models into the SupportedModels map
	for id, model := range AnthropicModels {
		SupportedModels[id] = model
	}
	for id, model := range OpenAIModels {
		SupportedModels[id] = model
	}
	for id, model := range GeminiModels {
		SupportedModels[id] = model
	}
	for id, model := range XAIModels {
		SupportedModels[id] = model
	}
	for id, model := range OpenRouterModels {
		SupportedModels[id] = model
	}
}
