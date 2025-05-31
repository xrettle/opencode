package models

// Model IDs
const (
	// vLLM Models
	VLLMLlama3                  ModelID = "vllm.llama-3"
	VLLMLlama2                  ModelID = "vllm.llama-2"
	VLLMMistral                 ModelID = "vllm.mistral"
	VLLMMixtral                 ModelID = "vllm.mixtral"
	VLLMPhi2                    ModelID = "vllm.phi-2"
	VLLMPhi15                   ModelID = "vllm.phi-1.5"
	VLLMNeuralChat              ModelID = "vllm.neural-chat"
	VLLMNeuralHermes            ModelID = "vllm.neural-hermes"
	VLLMNeuralHermes2           ModelID = "vllm.neural-hermes-2"
	VLLMNeuralHermes2Pro        ModelID = "vllm.neural-hermes-2-pro"
	VLLMNeuralHermes2ProMax     ModelID = "vllm.neural-hermes-2-pro-max"
	VLLMNeuralHermes2ProMaxV2   ModelID = "vllm.neural-hermes-2-pro-max-v2"
	VLLMNeuralHermes2ProMaxV3   ModelID = "vllm.neural-hermes-2-pro-max-v3"
	VLLMNeuralHermes2ProMaxV4   ModelID = "vllm.neural-hermes-2-pro-max-v4"
	VLLMNeuralHermes2ProMaxV5   ModelID = "vllm.neural-hermes-2-pro-max-v5"
	VLLMNeuralHermes2ProMaxV6   ModelID = "vllm.neural-hermes-2-pro-max-v6"
	VLLMNeuralHermes2ProMaxV7   ModelID = "vllm.neural-hermes-2-pro-max-v7"
	VLLMNeuralHermes2ProMaxV8   ModelID = "vllm.neural-hermes-2-pro-max-v8"
	VLLMNeuralHermes2ProMaxV9   ModelID = "vllm.neural-hermes-2-pro-max-v9"
	VLLMNeuralHermes2ProMaxV10  ModelID = "vllm.neural-hermes-2-pro-max-v10"
	VLLMNeuralHermes2ProMaxV11  ModelID = "vllm.neural-hermes-2-pro-max-v11"
	VLLMNeuralHermes2ProMaxV12  ModelID = "vllm.neural-hermes-2-pro-max-v12"
	VLLMNeuralHermes2ProMaxV13  ModelID = "vllm.neural-hermes-2-pro-max-v13"
	VLLMNeuralHermes2ProMaxV14  ModelID = "vllm.neural-hermes-2-pro-max-v14"
	VLLMNeuralHermes2ProMaxV15  ModelID = "vllm.neural-hermes-2-pro-max-v15"
	VLLMNeuralHermes2ProMaxV16  ModelID = "vllm.neural-hermes-2-pro-max-v16"
	VLLMNeuralHermes2ProMaxV17  ModelID = "vllm.neural-hermes-2-pro-max-v17"
	VLLMNeuralHermes2ProMaxV18  ModelID = "vllm.neural-hermes-2-pro-max-v18"
	VLLMNeuralHermes2ProMaxV19  ModelID = "vllm.neural-hermes-2-pro-max-v19"
	VLLMNeuralHermes2ProMaxV20  ModelID = "vllm.neural-hermes-2-pro-max-v20"
	VLLMNeuralHermes2ProMaxV21  ModelID = "vllm.neural-hermes-2-pro-max-v21"
	VLLMNeuralHermes2ProMaxV22  ModelID = "vllm.neural-hermes-2-pro-max-v22"
	VLLMNeuralHermes2ProMaxV23  ModelID = "vllm.neural-hermes-2-pro-max-v23"
	VLLMNeuralHermes2ProMaxV24  ModelID = "vllm.neural-hermes-2-pro-max-v24"
	VLLMNeuralHermes2ProMaxV25  ModelID = "vllm.neural-hermes-2-pro-max-v25"
	VLLMNeuralHermes2ProMaxV26  ModelID = "vllm.neural-hermes-2-pro-max-v26"
	VLLMNeuralHermes2ProMaxV27  ModelID = "vllm.neural-hermes-2-pro-max-v27"
	VLLMNeuralHermes2ProMaxV28  ModelID = "vllm.neural-hermes-2-pro-max-v28"
	VLLMNeuralHermes2ProMaxV29  ModelID = "vllm.neural-hermes-2-pro-max-v29"
	VLLMNeuralHermes2ProMaxV30  ModelID = "vllm.neural-hermes-2-pro-max-v30"
	VLLMNeuralHermes2ProMaxV31  ModelID = "vllm.neural-hermes-2-pro-max-v31"
	VLLMNeuralHermes2ProMaxV32  ModelID = "vllm.neural-hermes-2-pro-max-v32"
	VLLMNeuralHermes2ProMaxV33  ModelID = "vllm.neural-hermes-2-pro-max-v33"
	VLLMNeuralHermes2ProMaxV34  ModelID = "vllm.neural-hermes-2-pro-max-v34"
	VLLMNeuralHermes2ProMaxV35  ModelID = "vllm.neural-hermes-2-pro-max-v35"
	VLLMNeuralHermes2ProMaxV36  ModelID = "vllm.neural-hermes-2-pro-max-v36"
	VLLMNeuralHermes2ProMaxV37  ModelID = "vllm.neural-hermes-2-pro-max-v37"
	VLLMNeuralHermes2ProMaxV38  ModelID = "vllm.neural-hermes-2-pro-max-v38"
	VLLMNeuralHermes2ProMaxV39  ModelID = "vllm.neural-hermes-2-pro-max-v39"
	VLLMNeuralHermes2ProMaxV40  ModelID = "vllm.neural-hermes-2-pro-max-v40"
	VLLMNeuralHermes2ProMaxV41  ModelID = "vllm.neural-hermes-2-pro-max-v41"
	VLLMNeuralHermes2ProMaxV42  ModelID = "vllm.neural-hermes-2-pro-max-v42"
	VLLMNeuralHermes2ProMaxV43  ModelID = "vllm.neural-hermes-2-pro-max-v43"
	VLLMNeuralHermes2ProMaxV44  ModelID = "vllm.neural-hermes-2-pro-max-v44"
	VLLMNeuralHermes2ProMaxV45  ModelID = "vllm.neural-hermes-2-pro-max-v45"
	VLLMNeuralHermes2ProMaxV46  ModelID = "vllm.neural-hermes-2-pro-max-v46"
	VLLMNeuralHermes2ProMaxV47  ModelID = "vllm.neural-hermes-2-pro-max-v47"
	VLLMNeuralHermes2ProMaxV48  ModelID = "vllm.neural-hermes-2-pro-max-v48"
	VLLMNeuralHermes2ProMaxV49  ModelID = "vllm.neural-hermes-2-pro-max-v49"
	VLLMNeuralHermes2ProMaxV50  ModelID = "vllm.neural-hermes-2-pro-max-v50"
	VLLMNeuralHermes2ProMaxV51  ModelID = "vllm.neural-hermes-2-pro-max-v51"
	VLLMNeuralHermes2ProMaxV52  ModelID = "vllm.neural-hermes-2-pro-max-v52"
	VLLMNeuralHermes2ProMaxV53  ModelID = "vllm.neural-hermes-2-pro-max-v53"
	VLLMNeuralHermes2ProMaxV54  ModelID = "vllm.neural-hermes-2-pro-max-v54"
	VLLMNeuralHermes2ProMaxV55  ModelID = "vllm.neural-hermes-2-pro-max-v55"
	VLLMNeuralHermes2ProMaxV56  ModelID = "vllm.neural-hermes-2-pro-max-v56"
	VLLMNeuralHermes2ProMaxV57  ModelID = "vllm.neural-hermes-2-pro-max-v57"
	VLLMNeuralHermes2ProMaxV58  ModelID = "vllm.neural-hermes-2-pro-max-v58"
	VLLMNeuralHermes2ProMaxV59  ModelID = "vllm.neural-hermes-2-pro-max-v59"
	VLLMNeuralHermes2ProMaxV60  ModelID = "vllm.neural-hermes-2-pro-max-v60"
	VLLMNeuralHermes2ProMaxV61  ModelID = "vllm.neural-hermes-2-pro-max-v61"
	VLLMNeuralHermes2ProMaxV62  ModelID = "vllm.neural-hermes-2-pro-max-v62"
	VLLMNeuralHermes2ProMaxV63  ModelID = "vllm.neural-hermes-2-pro-max-v63"
	VLLMNeuralHermes2ProMaxV64  ModelID = "vllm.neural-hermes-2-pro-max-v64"
	VLLMNeuralHermes2ProMaxV65  ModelID = "vllm.neural-hermes-2-pro-max-v65"
	VLLMNeuralHermes2ProMaxV66  ModelID = "vllm.neural-hermes-2-pro-max-v66"
	VLLMNeuralHermes2ProMaxV67  ModelID = "vllm.neural-hermes-2-pro-max-v67"
	VLLMNeuralHermes2ProMaxV68  ModelID = "vllm.neural-hermes-2-pro-max-v68"
	VLLMNeuralHermes2ProMaxV69  ModelID = "vllm.neural-hermes-2-pro-max-v69"
	VLLMNeuralHermes2ProMaxV70  ModelID = "vllm.neural-hermes-2-pro-max-v70"
	VLLMNeuralHermes2ProMaxV71  ModelID = "vllm.neural-hermes-2-pro-max-v71"
	VLLMNeuralHermes2ProMaxV72  ModelID = "vllm.neural-hermes-2-pro-max-v72"
	VLLMNeuralHermes2ProMaxV73  ModelID = "vllm.neural-hermes-2-pro-max-v73"
	VLLMNeuralHermes2ProMaxV74  ModelID = "vllm.neural-hermes-2-pro-max-v74"
	VLLMNeuralHermes2ProMaxV75  ModelID = "vllm.neural-hermes-2-pro-max-v75"
	VLLMNeuralHermes2ProMaxV76  ModelID = "vllm.neural-hermes-2-pro-max-v76"
	VLLMNeuralHermes2ProMaxV77  ModelID = "vllm.neural-hermes-2-pro-max-v77"
	VLLMNeuralHermes2ProMaxV78  ModelID = "vllm.neural-hermes-2-pro-max-v78"
	VLLMNeuralHermes2ProMaxV79  ModelID = "vllm.neural-hermes-2-pro-max-v79"
	VLLMNeuralHermes2ProMaxV80  ModelID = "vllm.neural-hermes-2-pro-max-v80"
	VLLMNeuralHermes2ProMaxV81  ModelID = "vllm.neural-hermes-2-pro-max-v81"
	VLLMNeuralHermes2ProMaxV82  ModelID = "vllm.neural-hermes-2-pro-max-v82"
	VLLMNeuralHermes2ProMaxV83  ModelID = "vllm.neural-hermes-2-pro-max-v83"
	VLLMNeuralHermes2ProMaxV84  ModelID = "vllm.neural-hermes-2-pro-max-v84"
	VLLMNeuralHermes2ProMaxV85  ModelID = "vllm.neural-hermes-2-pro-max-v85"
	VLLMNeuralHermes2ProMaxV86  ModelID = "vllm.neural-hermes-2-pro-max-v86"
	VLLMNeuralHermes2ProMaxV87  ModelID = "vllm.neural-hermes-2-pro-max-v87"
	VLLMNeuralHermes2ProMaxV88  ModelID = "vllm.neural-hermes-2-pro-max-v88"
	VLLMNeuralHermes2ProMaxV89  ModelID = "vllm.neural-hermes-2-pro-max-v89"
	VLLMNeuralHermes2ProMaxV90  ModelID = "vllm.neural-hermes-2-pro-max-v90"
	VLLMNeuralHermes2ProMaxV91  ModelID = "vllm.neural-hermes-2-pro-max-v91"
	VLLMNeuralHermes2ProMaxV92  ModelID = "vllm.neural-hermes-2-pro-max-v92"
	VLLMNeuralHermes2ProMaxV93  ModelID = "vllm.neural-hermes-2-pro-max-v93"
	VLLMNeuralHermes2ProMaxV94  ModelID = "vllm.neural-hermes-2-pro-max-v94"
	VLLMNeuralHermes2ProMaxV95  ModelID = "vllm.neural-hermes-2-pro-max-v95"
	VLLMNeuralHermes2ProMaxV96  ModelID = "vllm.neural-hermes-2-pro-max-v96"
	VLLMNeuralHermes2ProMaxV97  ModelID = "vllm.neural-hermes-2-pro-max-v97"
	VLLMNeuralHermes2ProMaxV98  ModelID = "vllm.neural-hermes-2-pro-max-v98"
	VLLMNeuralHermes2ProMaxV99  ModelID = "vllm.neural-hermes-2-pro-max-v99"
	VLLMNeuralHermes2ProMaxV100 ModelID = "vllm.neural-hermes-2-pro-max-v100"
)

const (
	ProviderVLLM ModelProvider = "vllm"
)

var VLLMModels = map[ModelID]Model{
	// vLLM Models
	VLLMLlama3: {
		ID:                  VLLMLlama3,
		Name:                "Llama 3",
		Provider:            ProviderVLLM,
		APIModel:            "meta-llama/Llama-3-8B-Instruct",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       8192,
		DefaultMaxTokens:    2048,
		CanReason:           true,
		SupportsAttachments: false,
	},
	VLLMLlama2: {
		ID:                  VLLMLlama2,
		Name:                "Llama 2",
		Provider:            ProviderVLLM,
		APIModel:            "meta-llama/Llama-2-7b-chat-hf",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       4096,
		DefaultMaxTokens:    1024,
		CanReason:           true,
		SupportsAttachments: false,
	},
	VLLMMistral: {
		ID:                  VLLMMistral,
		Name:                "Mistral",
		Provider:            ProviderVLLM,
		APIModel:            "mistralai/Mistral-7B-Instruct-v0.2",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       8192,
		DefaultMaxTokens:    2048,
		CanReason:           true,
		SupportsAttachments: false,
	},
	VLLMMixtral: {
		ID:                  VLLMMixtral,
		Name:                "Mixtral",
		Provider:            ProviderVLLM,
		APIModel:            "mistralai/Mixtral-8x7B-Instruct-v0.1",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       32768,
		DefaultMaxTokens:    4096,
		CanReason:           true,
		SupportsAttachments: false,
	},
	VLLMPhi2: {
		ID:                  VLLMPhi2,
		Name:                "Phi-2",
		Provider:            ProviderVLLM,
		APIModel:            "microsoft/phi-2",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       2048,
		DefaultMaxTokens:    512,
		CanReason:           true,
		SupportsAttachments: false,
	},
	VLLMPhi15: {
		ID:                  VLLMPhi15,
		Name:                "Phi-1.5",
		Provider:            ProviderVLLM,
		APIModel:            "microsoft/phi-1.5",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       2048,
		DefaultMaxTokens:    512,
		CanReason:           true,
		SupportsAttachments: false,
	},
	VLLMNeuralChat: {
		ID:                  VLLMNeuralChat,
		Name:                "Neural Chat",
		Provider:            ProviderVLLM,
		APIModel:            "Intel/neural-chat-7b-v3-1",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       4096,
		DefaultMaxTokens:    1024,
		CanReason:           true,
		SupportsAttachments: false,
	},
	VLLMNeuralHermes: {
		ID:                  VLLMNeuralHermes,
		Name:                "Neural Hermes",
		Provider:            ProviderVLLM,
		APIModel:            "Intel/neural-hermes-7b",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       4096,
		DefaultMaxTokens:    1024,
		CanReason:           true,
		SupportsAttachments: false,
	},
	VLLMNeuralHermes2: {
		ID:                  VLLMNeuralHermes2,
		Name:                "Neural Hermes 2",
		Provider:            ProviderVLLM,
		APIModel:            "Intel/neural-hermes-2-7b",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       4096,
		DefaultMaxTokens:    1024,
		CanReason:           true,
		SupportsAttachments: false,
	},
	VLLMNeuralHermes2Pro: {
		ID:                  VLLMNeuralHermes2Pro,
		Name:                "Neural Hermes 2 Pro",
		Provider:            ProviderVLLM,
		APIModel:            "Intel/neural-hermes-2-pro-7b",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       4096,
		DefaultMaxTokens:    1024,
		CanReason:           true,
		SupportsAttachments: false,
	},
	VLLMNeuralHermes2ProMax: {
		ID:                  VLLMNeuralHermes2ProMax,
		Name:                "Neural Hermes 2 Pro Max",
		Provider:            ProviderVLLM,
		APIModel:            "Intel/neural-hermes-2-pro-max-7b",
		CostPer1MIn:         0,
		CostPer1MOut:        0,
		CostPer1MInCached:   0,
		CostPer1MOutCached:  0,
		ContextWindow:       4096,
		DefaultMaxTokens:    1024,
		CanReason:           true,
		SupportsAttachments: false,
	},
}
