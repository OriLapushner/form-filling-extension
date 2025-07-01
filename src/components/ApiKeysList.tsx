import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Key, Trash2 } from "lucide-react"
import { useStorage } from "@plasmohq/storage/hook"
import { toast } from "sonner"
import { deleteApiKey } from "@/services/apiKeys"

interface ApiKey {
	apiKey: string
	apiKeyProvider: string
	name: string
}

interface ApiKeysListProps extends React.HTMLAttributes<HTMLDivElement> {
	onApiKeysChange?: () => void // Optional callback when API keys are modified
}

export function ApiKeysList({ onApiKeysChange, className, ...props }: ApiKeysListProps) {
	const [apiKeys, setApiKeys] = useStorage<ApiKey[]>("apiKeys", [])
	const [deleting, setDeleting] = useState<string | null>(null)

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

	const maskApiKey = (apiKey: string | undefined | null) => {
		if (!apiKey || typeof apiKey !== "string") return "***"
		if (apiKey.length <= 8) return apiKey
		return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`
	}

	const safeApiKeys = Array.isArray(apiKeys) ? apiKeys : []

	return (
		<div className={`space-y-4 ${className || ""}`} {...props}>
			<h3 className="font-semibold">Saved API Keys ({safeApiKeys.length})</h3>
			{safeApiKeys.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
					<p>No API keys yet.</p>
					<p className="text-sm">Add your first API key above to get started.</p>
				</div>
			) : (
				<div className="space-y-3">
					{safeApiKeys
						.slice()
						.reverse()
						.map((apiKey) => {
							// Add safety checks for each apiKey object
							if (!apiKey || typeof apiKey !== "object") return null

							return (
								<div
									key={apiKey.name || Math.random().toString()}
									className="flex items-start justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
								>
									<div className="flex-1 space-y-2">
										<div className="flex items-center gap-2">
											<h4 className="font-medium">{apiKey.name || "Unnamed"}</h4>
											<span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
												{apiKey.apiKeyProvider || "Unknown"}
											</span>
										</div>
										<p className="text-sm text-muted-foreground font-mono">
											{maskApiKey(apiKey.apiKey)}
										</p>
									</div>
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
							)
						})
						.filter(Boolean)} {/* Remove any null entries */}
				</div>
			)}
		</div>
	)
}
