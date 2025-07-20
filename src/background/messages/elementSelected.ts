import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getFilledInputsFromLLM, type getResultsFromLLMResponse } from "@/services/fillInputs"

export type ElementSelectedReqBody = {
	elementHtml: string
}

export type ElementSelectedResBody = {
	success: boolean
	error?: string
	data?: getResultsFromLLMResponse['inputsValues']
}

const handler: PlasmoMessaging.MessageHandler<
	ElementSelectedReqBody,
	ElementSelectedResBody
> = async (req, res) => {
	try {
		console.log('message.payload.elementHtml', req.body?.elementHtml)

		const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
		if (!activeTab || !activeTab.id) {
			console.error('No active tab found')
			res.send({ success: false, error: "No active tab found" })
			return
		}

		const result = await getFilledInputsFromLLM({ elementHtml: req.body?.elementHtml || '' })

		res.send({
			success: true,
			data: result.inputsValues
		})
	} catch (error) {
		console.error('Error handling selected element:', error)
		res.send({
			success: false,
			error: error instanceof Error ? error.message : String(error)
		})
	}
}

export default handler
