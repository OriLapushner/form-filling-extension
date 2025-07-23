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

	const deletedKey = apiKeys.find(key => key.name === name)
	if (deletedKey) {
		const providerSelectedKey = await storage.get(`selectedApiKey_${deletedKey.apiKeyProvider}`)
		if (providerSelectedKey === name) {
			await storage.set(`selectedApiKey_${deletedKey.apiKeyProvider}`, '')
		}
	}

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

async function setSelectedProviderKey(provider: string, name: string | null): Promise<void> {
	const keys = await getApiKeys()
	if (name === null) return await storage.remove(`selectedApiKey_${provider}`)
	const key = keys.find(key => key.name === name)
	if (!key) throw new Error('API key not found')
	if (key.apiKeyProvider !== provider) throw new Error('API key provider does not match')
	const keyToSave = { name: key.name, apiKeyProvider: key.apiKeyProvider, apiKey: key.apiKey }
	await storage.set(`selectedApiKey_${provider}`, keyToSave)
}

async function getSelectedProviderKey(provider: string): Promise<ApiKey | undefined> {
	const selectedKey = await storage.get<ApiKey>(`selectedApiKey_${provider}`)
	return selectedKey
}


export { saveApiKey, deleteApiKey, getApiKey, getApiKeys, setSelectedApiKey, getSelectedApiKey, setSelectedProviderKey, getSelectedProviderKey }
export type { ApiKey }
