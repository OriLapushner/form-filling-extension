import * as React from "react"
import { Button } from "@/components/ui/button"
import { sendToBackground } from "@plasmohq/messaging"

// Type definitions for the startElementSelection message
type StartElementSelectionReqBody = {}

type StartElementSelectionResBody = {
	success: boolean
	error?: string
	message?: string
}

export function ElementSelector() {
	const [status, setStatus] = React.useState<string>("idle")

	const handleStartSelection = async () => {
		setStatus("starting...")
		try {
			const response = await sendToBackground<StartElementSelectionReqBody, StartElementSelectionResBody>({
				name: "startElementSelection",
				body: {}
			})

			if (response.success) {
				setStatus(response.message || "selection mode active")
			} else {
				setStatus("error: " + (response.error || "Unknown error"))
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