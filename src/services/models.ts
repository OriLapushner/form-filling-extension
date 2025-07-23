import { Storage } from "@plasmohq/storage"

interface Model {
	modelDisplayName: string
	modelVersion: string
	provider: 'anthropic' | 'openai' | 'google'
}

const storage = new Storage()

const ALL_LLM_MODELS: Model[] = [
	// Anthropic models
	{
		modelDisplayName: "Claude Sonnet 4",
		modelVersion: "claude-sonnet-4-20250514",
		provider: "anthropic"
	},
	{
		modelDisplayName: "Claude Haiku",
		modelVersion: "claude-3-5-haiku-20241022",
		provider: "anthropic"
	},
	// OpenAI models
	{
		modelDisplayName: "GPT-4o",
		modelVersion: "gpt-4o",
		provider: "openai"
	},
	{
		modelDisplayName: "O3 Mini",
		modelVersion: "o3-mini",
		provider: "openai"
	},
	{
		modelDisplayName: "O4 Mini",
		modelVersion: "o4-mini",
		provider: "openai"
	},
	// Google models
	{
		modelDisplayName: "Gemini 2.5 Pro",
		modelVersion: "gemini-2.5-pro",
		provider: "google"
	}
]

async function getModelsByProvider(provider: 'anthropic' | 'openai' | 'google'): Promise<Model[]> {
	return ALL_LLM_MODELS.filter(model => model.provider === provider)
}

async function getModel(modelVersion: string): Promise<Model> {
	const model = ALL_LLM_MODELS.find(model => model.modelVersion === modelVersion)
	if (!model) throw new Error(`Model with version "${modelVersion}" not found`)
	return model
}

async function setSelectedModel(modelVersion: string): Promise<void> {
	await getModel(modelVersion) // Validate model exists
	await storage.set('selectedModel', modelVersion)
}

async function getSelectedModel(): Promise<Model> {
	const selectedModelVersion = await storage.get('selectedModel')
	if (!selectedModelVersion) throw new Error('No model selected and default model not found')
	return getModel(selectedModelVersion)
}

const PROVIDERS = [
	{ value: "anthropic", label: "Anthropic" },
	{ value: "openai", label: "OpenAI" },
	{ value: "google", label: "Google" }
]

export { ALL_LLM_MODELS, PROVIDERS, getModelsByProvider, getModel, setSelectedModel, getSelectedModel }
export type { Model }
