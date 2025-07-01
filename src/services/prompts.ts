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
}

export { getPrompts, savePrompt, deletePrompt }
export type { Prompt } 