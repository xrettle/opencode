package models

// Model IDs
const (
	// OpenAI Models
	PuterGPT41        ModelID = "puter.gpt-4.1"
	PuterGPT41Mini    ModelID = "puter.gpt-4.1-mini"
	PuterGPT41Nano    ModelID = "puter.gpt-4.1-nano"
	PuterGPT45Preview ModelID = "puter.gpt-4.5-preview"
	PuterGPT4o        ModelID = "puter.gpt-4o"
	PuterGPT4oMini    ModelID = "puter.gpt-4o-mini"
	PuterO1           ModelID = "puter.o1"
	PuterO1Mini       ModelID = "puter.o1-mini"
	PuterO1Pro        ModelID = "puter.o1-pro"
	PuterO3Mini       ModelID = "puter.o3-mini"
	PuterO4Mini       ModelID = "puter.o4-mini"

	// Claude Models
	PuterClaude37Sonnet ModelID = "puter.claude-3.7-sonnet"

	// Gemini Models
	PuterGemini25Flash ModelID = "puter.gemini-2.5-flash"
	PuterGemini25Pro   ModelID = "puter.gemini-2.5-pro"
	PuterGemini15Flash ModelID = "puter.gemini-1.5-flash"
	PuterGeminiPro     ModelID = "puter.gemini-pro"

	// Llama Models
	PuterLlama4Maverick ModelID = "puter.llama-4-maverick"
	PuterLlama4Scout    ModelID = "puter.llama-4-scout"
	PuterLlama33        ModelID = "puter.llama-3.3"
	PuterLlama31        ModelID = "puter.llama-3.1"
	PuterLlama3         ModelID = "puter.llama-3"
	PuterLlama2         ModelID = "puter.llama-2"

	// DeepSeek Models
	PuterDeepSeekChat     ModelID = "puter.deepseek-chat"
	PuterDeepSeekReasoner ModelID = "puter.deepseek-reasoner"
)

const (
	ProviderPuter ModelProvider = "puter"
)

var PuterModels = map[ModelID]Model{
	// OpenAI Models
	PuterGPT41: {
		ID:                  PuterGPT41,
		Name:                "GPT-4.1",
		Provider:            ProviderPuter,
		APIModel:            "gpt-4.1",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       128000,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterGPT41Mini: {
		ID:                  PuterGPT41Mini,
		Name:                "GPT-4.1 Mini",
		Provider:            ProviderPuter,
		APIModel:            "gpt-4.1-mini",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       64000,
		DefaultMaxTokens:    2048,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterGPT41Nano: {
		ID:                  PuterGPT41Nano,
		Name:                "GPT-4.1 Nano",
		Provider:            ProviderPuter,
		APIModel:            "gpt-4.1-nano",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       32000,
		DefaultMaxTokens:    1024,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterGPT45Preview: {
		ID:                  PuterGPT45Preview,
		Name:                "GPT-4.5 Preview",
		Provider:            ProviderPuter,
		APIModel:            "gpt-4.5-preview",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       256000,
		DefaultMaxTokens:    8192,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterGPT4o: {
		ID:                  PuterGPT4o,
		Name:                "GPT-4o",
		Provider:            ProviderPuter,
		APIModel:            "gpt-4o",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       128000,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterGPT4oMini: {
		ID:                  PuterGPT4oMini,
		Name:                "GPT-4o Mini",
		Provider:            ProviderPuter,
		APIModel:            "gpt-4o-mini",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       64000,
		DefaultMaxTokens:    2048,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterO1: {
		ID:                  PuterO1,
		Name:                "O1",
		Provider:            ProviderPuter,
		APIModel:            "o1",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       128000,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterO1Mini: {
		ID:                  PuterO1Mini,
		Name:                "O1 Mini",
		Provider:            ProviderPuter,
		APIModel:            "o1-mini",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       64000,
		DefaultMaxTokens:    2048,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterO1Pro: {
		ID:                  PuterO1Pro,
		Name:                "O1 Pro",
		Provider:            ProviderPuter,
		APIModel:            "o1-pro",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       128000,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterO3Mini: {
		ID:                  PuterO3Mini,
		Name:                "O3 Mini",
		Provider:            ProviderPuter,
		APIModel:            "o3-mini",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       64000,
		DefaultMaxTokens:    2048,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterO4Mini: {
		ID:                  PuterO4Mini,
		Name:                "O4 Mini",
		Provider:            ProviderPuter,
		APIModel:            "o4-mini",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       64000,
		DefaultMaxTokens:    2048,
		CanReason:           true,
		SupportsAttachments: true,
	},

	// Claude Models
	PuterClaude37Sonnet: {
		ID:                  PuterClaude37Sonnet,
		Name:                "Claude 3.7 Sonnet",
		Provider:            ProviderPuter,
		APIModel:            "claude-3.7-sonnet",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       200000,
		DefaultMaxTokens:    8192,
		CanReason:           true,
		SupportsAttachments: true,
	},

	// Gemini Models
	PuterGemini25Flash: {
		ID:                  PuterGemini25Flash,
		Name:                "Gemini 2.5 Flash",
		Provider:            ProviderPuter,
		APIModel:            "gemini-2.5-flash",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       128000,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterGemini25Pro: {
		ID:                  PuterGemini25Pro,
		Name:                "Gemini 2.5 Pro",
		Provider:            ProviderPuter,
		APIModel:            "gemini-2.5-pro",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       128000,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterGemini15Flash: {
		ID:                  PuterGemini15Flash,
		Name:                "Gemini 1.5 Flash",
		Provider:            ProviderPuter,
		APIModel:            "gemini-1.5-flash",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       64000,
		DefaultMaxTokens:    2048,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterGeminiPro: {
		ID:                  PuterGeminiPro,
		Name:                "Gemini Pro",
		Provider:            ProviderPuter,
		APIModel:            "gemini-pro",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       64000,
		DefaultMaxTokens:    2048,
		CanReason:           true,
		SupportsAttachments: true,
	},

	// Llama Models
	PuterLlama4Maverick: {
		ID:                  PuterLlama4Maverick,
		Name:                "Llama 4 Maverick",
		Provider:            ProviderPuter,
		APIModel:            "llama-4-maverick",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       128000,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterLlama4Scout: {
		ID:                  PuterLlama4Scout,
		Name:                "Llama 4 Scout",
		Provider:            ProviderPuter,
		APIModel:            "llama-4-scout",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       64000,
		DefaultMaxTokens:    2048,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterLlama33: {
		ID:                  PuterLlama33,
		Name:                "Llama 3.3",
		Provider:            ProviderPuter,
		APIModel:            "llama-3.3",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       128000,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterLlama31: {
		ID:                  PuterLlama31,
		Name:                "Llama 3.1",
		Provider:            ProviderPuter,
		APIModel:            "llama-3.1",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       128000,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterLlama3: {
		ID:                  PuterLlama3,
		Name:                "Llama 3",
		Provider:            ProviderPuter,
		APIModel:            "llama-3",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       128000,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterLlama2: {
		ID:                  PuterLlama2,
		Name:                "Llama 2",
		Provider:            ProviderPuter,
		APIModel:            "llama-2",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       64000,
		DefaultMaxTokens:    2048,
		CanReason:           true,
		SupportsAttachments: true,
	},

	// DeepSeek Models
	PuterDeepSeekChat: {
		ID:                  PuterDeepSeekChat,
		Name:                "DeepSeek Chat",
		Provider:            ProviderPuter,
		APIModel:            "deepseek-chat",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       128000,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: true,
	},
	PuterDeepSeekReasoner: {
		ID:                  PuterDeepSeekReasoner,
		Name:                "DeepSeek Reasoner",
		Provider:            ProviderPuter,
		APIModel:            "deepseek-reasoner",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       128000,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: true,
	},
}
