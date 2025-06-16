import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	try {
		// Get the active tab
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

		if (tab.id) {
			// Inject script directly into the page to log the API key
			await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				func: (apiKey: string) => {
					console.log("API Key:", apiKey)
				},
				args: [req.body.apiKey]
			})

			res.send({ success: true })
		} else {
			res.send({ success: false, error: "No active tab found" })
		}
	} catch (error) {
		console.error("Failed to inject script into tab:", error)
		res.send({ success: false, error: error.message })
	}
}

export default handler 