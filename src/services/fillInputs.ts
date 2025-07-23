import { generateObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'
import { getSelectedProviderKey } from '@/services/apiKeys'
import { getSelectedPrompt } from '@/services/prompts'
import { getSelectedModel, type Model } from '@/services/models'


const InputDataSchema = z.object({
	inputFillId: z.number(),
	value: z.string()
})

type InputData = {
	inputFillId: number
	value: string
}

export interface getResultsFromLLMResponse {
	success: boolean
	error?: string
	inputsValues: InputData[]
}

interface getResultsFromLLMPayload {
	elementHtml: string
}

const getModel = async (selectedModel: Model, apiKey: string) => {
	if (selectedModel.provider === 'anthropic') {
		const anthropic = createAnthropic({
			apiKey: apiKey,
			headers: { 'anthropic-dangerous-direct-browser-access': 'true' }
		})
		return anthropic(selectedModel.modelVersion)
	}
	if (selectedModel.provider === 'openai') {
		const openAI = createOpenAI({ apiKey })
		return openAI(selectedModel.modelVersion)
	}
	if (selectedModel.provider === 'google') {
		const google = createGoogleGenerativeAI({ apiKey })
		return google(selectedModel.modelVersion)
	}
	throw new Error('Invalid provider')
}

export async function getFilledInputsFromLLM({ elementHtml }: getResultsFromLLMPayload): Promise<getResultsFromLLMResponse> {
	try {
		const selectedPrompt = await getSelectedPrompt()
		const selectedModel = await getSelectedModel()
		const apiKey = await getSelectedProviderKey(selectedModel.provider)
		if (!apiKey) throw new Error('No API key selected')
		const model = await getModel(selectedModel, apiKey.apiKey)

		const startTime = performance.now()
		const result = await generateObject({
			model,
			system: `You are a helpful assistant that fills HTML form inputs. The user will supply you
					with information about form inputs and instructions on how to fill them.
					Each input has a unique "Form Fill ID" which you will use to identify the fields.
					You will fill every input with the provided data following the instructions.
					If the input you're trying to fill has no data from the user, you will fill the input as "N/A".
					You always fill out all the input fields - if unknown set the result as N/A.
					Return your response in the following format:
					{
						"inputFillId": 0,
						"value": "the value to fill"
						}`,
			prompt: `<form-inputs>
						${elementHtml}
						</form-inputs>
						<user-prompt>
						${selectedPrompt.prompt} 
						</user-prompt>`,
			output: "array",
			schema: InputDataSchema,
		})

		const endTime = performance.now()
		const duration = endTime - startTime
		console.log(`API request completed in ${duration.toFixed(2)} ms (${(duration / 1000).toFixed(2)} seconds)`)
		console.log('result', result.object)

		return {
			success: true,
			inputsValues: result.object as InputData[],
		}
	} catch (error) {
		console.error('Error when filling inputs:', error)
		return {
			success: false,
			inputsValues: [],
			error: error.toString()
		}
	}
} 