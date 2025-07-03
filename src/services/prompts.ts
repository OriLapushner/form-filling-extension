import { Storage } from "@plasmohq/storage"

interface Prompt {
	name: string
	prompt: string
}

const storage = new Storage()

async function getPrompts(): Promise<Prompt[]> {
	const prompts: Prompt[] = await storage.get("prompts") || []
	return prompts
}

async function savePrompt(name: string, prompt: string): Promise<void> {
	const prompts: Prompt[] = await getPrompts()

	const existingPrompt = prompts.find(p => p.name === name)
	if (existingPrompt) {
		throw new Error(`A prompt with the name "${name}" already exists`)
	}

	prompts.push({ name, prompt })
	await storage.set("prompts", prompts)
}

async function deletePrompt(name: string): Promise<void> {
	const prompts: Prompt[] = await getPrompts()
	const updatedPrompts = prompts.filter(p => p.name !== name)
	await storage.set("prompts", updatedPrompts)
	const selectedPromptName = await storage.get('selectedPrompt')
	if (selectedPromptName === name) await setSelectedPrompt('')
}

async function getPrompt(name: string): Promise<Prompt> {
	const prompts: Prompt[] = await getPrompts()
	const prompt = prompts.find(p => p.name === name)
	if (!prompt) throw new Error(`Prompt with the name "${name}" not found`)
	return prompt
}

async function setSelectedPrompt(name: string): Promise<void> {
	await storage.set('selectedPrompt', name)
}

async function getSelectedPrompt(): Promise<Prompt> {
	const selectedPrompt = await storage.get('selectedPrompt')
	if (!selectedPrompt) throw new Error('No prompt selected')
	return getPrompt(selectedPrompt)
}


export { getPrompts, savePrompt, deletePrompt, getPrompt, getSelectedPrompt, setSelectedPrompt }
export type { Prompt } 