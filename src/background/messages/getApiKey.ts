import type { PlasmoMessaging } from "@plasmohq/messaging"

export type GetApiKeyReqBody = {
	apiKeyProvider: "Anthropic" | "OpenAI" | "Gemini"
}

export type GetApiKeyResBody = {
	success: boolean
	apiKey?: string
	error?: string
}

const handler: PlasmoMessaging.MessageHandler<
	GetApiKeyReqBody,
	GetApiKeyResBody
> = async (req, res) => {
	// get api key from local storage
	const { apiKeyProvider } = req.body
	const apiKey = await chrome.storage.local.get(apiKeyProvider)
	if (apiKey[apiKeyProvider]) {
		res.send({ success: true, apiKey: apiKey[apiKeyProvider] })
	} else {
		res.send({ success: false, error: "API key not found" })
	}
}

export default handler 