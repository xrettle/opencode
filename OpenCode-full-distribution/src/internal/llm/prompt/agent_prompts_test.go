package prompt

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetAgentPrompt(t *testing.T) {
	// Test getting an existing prompt
	prompt, err := GetAgentPrompt("devin")
	assert.NoError(t, err)
	assert.Equal(t, "Devin AI", prompt.Name)
	assert.Equal(t, "A software engineering assistant focused on code understanding and implementation", prompt.Description)
	assert.NotEmpty(t, prompt.Content)

	// Test getting a non-existent prompt
	_, err = GetAgentPrompt("nonexistent")
	assert.Error(t, err)
	assert.Equal(t, "agent prompt 'nonexistent' not found", err.Error())

	// Test case insensitivity
	prompt, err = GetAgentPrompt("DEVIN")
	assert.NoError(t, err)
	assert.Equal(t, "Devin AI", prompt.Name)
}

func TestCombinePrompts(t *testing.T) {
	// Test combining multiple prompts
	combined, err := CombinePrompts([]string{"devin", "same"})
	assert.NoError(t, err)
	assert.Contains(t, combined, "[Devin AI]")
	assert.Contains(t, combined, "[Same.dev]")
	assert.Contains(t, combined, "---")

	// Test combining a single prompt
	combined, err = CombinePrompts([]string{"devin"})
	assert.NoError(t, err)
	assert.Contains(t, combined, "[Devin AI]")
	assert.NotContains(t, combined, "---")

	// Test combining no prompts
	_, err = CombinePrompts([]string{})
	assert.Error(t, err)
	assert.Equal(t, "no prompts provided", err.Error())

	// Test combining with non-existent prompt
	_, err = CombinePrompts([]string{"devin", "nonexistent"})
	assert.Error(t, err)
	assert.Equal(t, "error getting prompt 'nonexistent': agent prompt 'nonexistent' not found", err.Error())
}

func TestListAvailablePrompts(t *testing.T) {
	prompts := ListAvailablePrompts()
	assert.Equal(t, 2, len(prompts))

	// Check that both prompts are present
	foundDevin := false
	foundSame := false
	for _, prompt := range prompts {
		if prompt.Name == "Devin AI" {
			foundDevin = true
		}
		if prompt.Name == "Same.dev" {
			foundSame = true
		}
	}
	assert.True(t, foundDevin)
	assert.True(t, foundSame)
}
