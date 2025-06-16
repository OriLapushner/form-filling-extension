import type { PlasmoMessaging } from "@plasmohq/messaging"

export type SaveApiKeyReqBody = {
	apiKey: string
	apiKeyProvider: "Anthropic" | "OpenAI" | "Gemini"
}

export type SaveApiKeyResBody = {
	success: boolean
	error?: string
}

const handler: PlasmoMessaging.MessageHandler<SaveApiKeyReqBody, SaveApiKeyResBody> = async (req, res) => {
	// save api key to local storage
	try {

		const { apiKey, apiKeyProvider } = req.body

		await chrome.storage.local.set({ [apiKeyProvider]: apiKey })
		res.send({ success: true })
	} catch (error) {
		res.send({ success: false, error: error.message })
	}
}

export default handler 