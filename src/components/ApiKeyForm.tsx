import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type HtmlHTMLAttributes } from "react"
import { Save } from "lucide-react"
import { Label } from "@/components/ui/label"
import { saveApiKey } from "@/services/apiKeys"
import { PROVIDERS } from "@/services/models"
import { toast } from "sonner"
interface ApiKeyFormProps extends HtmlHTMLAttributes<HTMLDivElement> {
}

export function ApiKeyForm({ className, ...props }: ApiKeyFormProps) {
	// using select state so reset form doesn't break the state
	const [selectedProvider, setSelectedProvider] = React.useState("anthropic")

	const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const apiKey = formData.get("api-key") as string
		const apiKeyName = formData.get("api-key-name") as string
		const formRef = e.currentTarget
		try {
			await saveApiKey(apiKey, selectedProvider, apiKeyName)
			toast.success("API key saved successfully")
			formRef.reset()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to save API key")
		}
	}

	return (
		<div className="space-y-4" {...props}>
			<form onSubmit={handleSave} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="provider">LLM Provider</Label>
					<Select name="provider" value={selectedProvider} onValueChange={setSelectedProvider}>
						<SelectTrigger>
							<SelectValue placeholder="Select a provider" />
						</SelectTrigger>
						<SelectContent>
							{PROVIDERS.map((provider) => (
								<SelectItem key={provider.value} value={provider.value}>
									{provider.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="api-key">API Key</Label>
					<Input
						id="api-key"
						name="api-key"
						placeholder="Enter your API key"
						className="w-full"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="api-key-name">API Key Name</Label>
					<Input
						id="api-key-name"
						name="api-key-name"
						placeholder="Enter a name for your API key"
						className="w-full"
						required
					/>
				</div>

				<Button type="submit" className="w-full">
					<Save className="h-4 w-4 mr-2" />
					Save
				</Button>
			</form>
			<p className="text-sm text-muted-foreground">
				Your API key is saved locally and used only for authorized requests.
			</p>
		</div>
	)
}
