import * as React from "react"
import { Button } from "@/components/ui/button"
import type { ChromeMessage, ChromeMessageResponse } from "@/types/messages"

export function ElementSelector() {
	const [status, setStatus] = React.useState<string>("idle")

	const handleStartSelection = async () => {
		setStatus("starting...")
		try {
			// Get the active tab
			const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })

			if (!activeTab || !activeTab.id) {
				setStatus("error: No active tab found")
				return
			}
			const message: ChromeMessage = { type: 'START_ELEMENT_SELECTION' }

			const response = await chrome.tabs.sendMessage<ChromeMessage, ChromeMessageResponse>(
				activeTab.id,
				message
			)

			console.log('response from content script', response)
			if (response?.success) {
				setStatus("selection mode active")
			} else {
				setStatus("error: " + (response?.error || "Unknown error"))
			}
		} catch (error) {
			setStatus("error: " + (error instanceof Error ? error.message : String(error)))
		}
	}

	return (
		<div className="space-y-4 w-96">
			<div className="space-y-2">
				<h3 className="text-lg font-medium">Element Selector</h3>
			</div>
			<p className="text-sm text-gray-500">Status: {status}</p>
			<Button onClick={handleStartSelection} className="w-full">
				Start Element Selection
			</Button>
		</div>
	)
} 