import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useStorage } from "@plasmohq/storage/hook"
import { toast } from "sonner"
import { deleteApiKey, setSelectedProviderKey, type ApiKey } from "@/services/apiKeys"
import { PROVIDERS } from "@/services/models"


interface ApiKeysListProps extends React.HTMLAttributes<HTMLDivElement> {
	onApiKeysChange?: () => void // Optional callback when API keys are modified
}

export function ApiKeysList({ onApiKeysChange, className, ...props }: ApiKeysListProps) {
	const [apiKeys] = useStorage<ApiKey[]>("apiKeys", [])
	const [deleting, setDeleting] = useState<string | null>(null)

	// Create storage hooks for each provider's selected key
	const [selectedAnthropicKey] = useStorage<ApiKey | undefined>("selectedApiKey_anthropic", undefined)
	const [selectedOpenAIKey] = useStorage<ApiKey | undefined>("selectedApiKey_openai", undefined)
	const [selectedGoogleKey] = useStorage<ApiKey | undefined>("selectedApiKey_google", undefined)

	const getSelectedKeyForProvider = (provider: string): ApiKey | null => {
		switch (provider) {
			case "anthropic": return selectedAnthropicKey
			case "openai": return selectedOpenAIKey
			case "google": return selectedGoogleKey
			default: return null
		}
	}

	const handleDeleteApiKey = async (name: string) => {
		try {
			setDeleting(name)
			await deleteApiKey(name)
			onApiKeysChange?.()
			toast.success(`API key "${name}" deleted successfully.`)
		} catch (error) {
			console.error("Error deleting API key:", error)
			toast.error(`Failed to delete API key "${name}". Please try again.`)
		} finally {
			setDeleting(null)
		}
	}

	const handleSelectApiKey = async (provider: string, keyName: string) => {
		try {
			await setSelectedProviderKey(provider, keyName)
			toast.success(`Selected "${keyName}" for ${provider}`)
		} catch (error) {
			console.error("Error selecting API key:", error)
			toast.error("Failed to select API key")
		}
	}

	const handleDeselectApiKey = async (provider: string) => {
		try {
			await setSelectedProviderKey(provider, null)
			toast.success(`Deselected API key for ${provider}`)
		} catch (error) {
			console.error("Error deselecting API key:", error)
			toast.error("Failed to deselect API key")
		}
	}

	const maskApiKey = (apiKey: string | undefined | null) => {
		if (!apiKey || typeof apiKey !== "string") return "***"
		if (apiKey.length <= 8) return apiKey
		return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`
	}

	const groupedApiKeys = PROVIDERS.reduce((acc, provider) => {
		acc[provider.value] = apiKeys.filter(key => key.apiKeyProvider === provider.value)
		return acc
	}, {} as Record<string, ApiKey[]>)

	const totalKeys = apiKeys.length

	const renderProviderKeys = (provider: any) => {
		const providerKeys = groupedApiKeys[provider.value] || []
		const selectedKey = getSelectedKeyForProvider(provider.value)

		const emptyProviderState = (
			<div className="text-center py-4 text-muted-foreground text-sm border border-dashed rounded-lg">
				No {provider.label} API keys yet
			</div>
		)

		const providerKeysList = (
			<div className="space-y-2">
				{providerKeys
					.slice()
					.reverse()
					.map((apiKey) => {
						if (!apiKey || typeof apiKey !== "object") return null

						const isSelected = selectedKey?.name === apiKey.name

						const selectedButton = (
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleDeselectApiKey(provider.value)}
								className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:hover:bg-yellow-800 dark:text-yellow-200 dark:border-yellow-700"
							>
								Deselect
							</Button>
						)

						const selectButton = (
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleSelectApiKey(provider.value, apiKey.name)}
								className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-200 dark:border-green-700"
							>
								Select
							</Button>
						)

						return (
							<div
								key={apiKey.name || Math.random().toString()}
								className={`flex items-start justify-between gap-4 rounded-lg border p-3 transition-colors ${isSelected
									? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
									: 'hover:bg-muted/50'
									}`}
							>
								<div className="flex-1 space-y-1">
									<h5 className="font-medium">
										{apiKey.name || "Unnamed"}
									</h5>
									<p className="text-sm text-muted-foreground font-mono">
										{maskApiKey(apiKey.apiKey)}
									</p>
								</div>
								<div className="flex items-center gap-2">
									{isSelected ? selectedButton : selectButton}
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDeleteApiKey(apiKey.name)}
										disabled={deleting === apiKey.name || !apiKey.name}
										className="text-destructive hover:text-destructive hover:bg-destructive/10"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)
					})
					.filter(Boolean)}
			</div>
		)

		return (
			<div key={provider.value} className="space-y-3">
				<div className="flex items-center gap-2">
					<h4 className="font-medium text-sm">{provider.label}</h4>
					<span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
						{providerKeys.length} key{providerKeys.length !== 1 ? 's' : ''}
					</span>
				</div>
				{providerKeys.length === 0 ? emptyProviderState : providerKeysList}
			</div>
		)
	}

	return (
		<div className={`space-y-6 ${className || ""}`} {...props}>
			<h3 className="font-semibold">API Keys by Provider ({totalKeys} total)</h3>
			<div className="space-y-6">
				{PROVIDERS.map(renderProviderKeys)}
			</div>
		</div>
	)
}
