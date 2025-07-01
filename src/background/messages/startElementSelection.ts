import type { PlasmoMessaging } from "@plasmohq/messaging"
import { startElementSelection } from "@/lib/selectElement"

export type StartElementSelectionReqBody = {}

export type StartElementSelectionResBody = {
	success: boolean
	error?: string
	message?: string
}

const handler: PlasmoMessaging.MessageHandler<
	StartElementSelectionReqBody,
	StartElementSelectionResBody
> = async (req, res) => {
	try {
		// Get the active tab
		const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })

		if (!activeTab || !activeTab.id) {
			res.send({ success: false, error: "No active tab found" })
			return
		}

		// Inject the content script to start element selection
		await chrome.scripting.executeScript({
			target: { tabId: activeTab.id },
			func: startElementSelection
		})

		res.send({
			success: true,
			message: "Element selection started. Click on any element to select it."
		})
	} catch (error) {
		res.send({ success: false, error: error instanceof Error ? error.message : String(error) })
	}
}

export default handler 