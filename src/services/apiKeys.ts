import { Storage } from "@plasmohq/storage"
interface ApiKey {
	apiKey: string
	apiKeyProvider: string
	name: string
}
const storage = new Storage()

async function saveApiKey(apiKey: string, apiKeyProvider: string, name: string) {
	const apiKeys: ApiKey[] = await storage.get("apiKeys") || []
	if (apiKeys.find((apiKey) => apiKey.name === name)) throw new Error("API key already exists")
	apiKeys.push({ apiKey, apiKeyProvider, name })
	await storage.set("apiKeys", apiKeys)
}

async function deleteApiKey(name: string) {
	const apiKeys: ApiKey[] = await storage.get("apiKeys")
	const filteredApiKeys = apiKeys.filter((apiKey) => apiKey.name !== name)
	await storage.set("apiKeys", filteredApiKeys)
	return filteredApiKeys
}

export { saveApiKey, deleteApiKey }
