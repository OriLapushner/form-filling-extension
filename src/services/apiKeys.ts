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
	const selectedApiKeyName = await storage.get('selectedApiKey')
	if (selectedApiKeyName === name) await setSelectedApiKey('')
	return filteredApiKeys
}

async function getApiKey(name: string) {
	const apiKeys: ApiKey[] = await storage.get("apiKeys")
	const apiKey = apiKeys.find((apiKey) => apiKey.name === name)
	if (!apiKey) throw new Error("API key not found")
	return apiKey
}

async function setSelectedApiKey(name: string): Promise<void> {
	await storage.set('selectedApiKey', name)
}

async function getApiKeys(): Promise<ApiKey[]> {
	const apiKeys: ApiKey[] = await storage.get("apiKeys") || []
	return apiKeys
}

async function getSelectedApiKey(): Promise<ApiKey> {
	const selectedApiKey = await storage.get('selectedApiKey')
	if (!selectedApiKey) throw new Error('No API key selected')
	return getApiKey(selectedApiKey)
}
export { saveApiKey, deleteApiKey, getApiKey, getApiKeys, setSelectedApiKey, getSelectedApiKey }
export type { ApiKey }
