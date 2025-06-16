import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendToBackground } from "@plasmohq/messaging"

import type { GetApiKeyReqBody, GetApiKeyResBody } from "@/background/messages/getApiKey"
import type { SaveApiKeyReqBody, SaveApiKeyResBody } from "@/background/messages/saveApiKey"

const ANTHROPIC = "Anthropic"

export function ApiKeyForm() {
	const [apiKey, setApiKey] = React.useState("")
	const [handleSaveStatus, setHandleSaveStatus] = React.useState("idle")
	const [apiKeyFromStorage, setApiKeyFromStorage] = React.useState("N/A")

	const handleGetApiKey = async () => {
		const response = await sendToBackground<GetApiKeyReqBody, GetApiKeyResBody>({
			name: "getApiKey",
			body: {
				apiKeyProvider: ANTHROPIC
			}
		})
		if (response.success) {
			setApiKeyFromStorage(JSON.stringify(response.apiKey))
		} else {
			setApiKeyFromStorage("Error: " + (response.error || "Unknown error"))
		}
	}
	const handleSave = async () => {
		const response = await sendToBackground<SaveApiKeyReqBody, SaveApiKeyResBody>({
			name: "saveApiKey",
			body: {
				apiKey,
				apiKeyProvider: ANTHROPIC
			}
		})
		if (response.success) {
			setHandleSaveStatus("success")

		} else {
			setHandleSaveStatus(response.error)
		}
	}

	return (
		<div className="space-y-4 w-96">
			<div className="space-y-2">
				<label htmlFor="anthropic-api-key" className="text-sm font-medium">
					Anthropic API Key
				</label>
				<Input
					id="anthropic-api-key"
					type="text"
					placeholder="Enter your Anthropic API key"
					value={apiKey}
					onChange={(e) => setApiKey(e.target.value)}
				/>
			</div>
			<p className="text-sm text-gray-500">handleSaveStatus: {handleSaveStatus}</p>
			<p className="text-sm text-gray-500">api key from storage: {apiKeyFromStorage}</p>
			<Button onClick={handleGetApiKey} className="w-full">
				Get API Key
			</Button>
			<Button onClick={handleSave} className="w-full">
				Save
			</Button>
		</div>
	)
}
