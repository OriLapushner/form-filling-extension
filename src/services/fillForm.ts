import { parseDocument } from 'htmlparser2'
import { selectAll } from 'css-select'
import type { Element } from 'domhandler'
import serialize from 'dom-serializer'
import { Storage } from '@plasmohq/storage'
import { generateObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import z from 'zod'
import { getSelectedApiKey } from '@/services/apiKeys'
import { getSelectedPrompt } from '@/services/prompts'

const storage = new Storage()

const getSelector = (node: Element) => {
	const escapeCSSAttributeValue = (value: string): string => {
		if (typeof CSS !== 'undefined' && CSS.escape) {
			return CSS.escape(value)
		}

		return value.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&')
	}

	const attributesSelectors = Object.keys(node.attribs)
		.filter(key => key !== 'value' && key !== 'class') // avoid value in case user fills value
		.map(key => {
			const attribute = node.attribs[key]
			if (attribute) {
				const escapedAttribute = escapeCSSAttributeValue(attribute)
				return `[${key}="${escapedAttribute}"]`
			} else {
				return `[${key}]`
			}
		})
		.join('')

	return `${node.name}${attributesSelectors}`
}

interface processedInput {
	html: string
	id: string
	selector: string
}

function processHtmlData(elementHtml: string): { html: string, inputs: processedInput[] } {
	const elementsToRemove = ['svg', 'script', 'style']
	const doc = parseDocument(elementHtml)
	const element = doc.children[0] as Element
	const stack: Element[] = [element]
	let idCounter = 0
	const inputs: processedInput[] = []

	while (stack.length > 0) {
		const currentNode = stack.pop()

		let filteredChildren = []
		const inputTags = ['input', 'textarea', 'select']
		if (currentNode.type === 'tag' && inputTags.includes(currentNode.name)) {
			const selector = getSelector(currentNode)
			inputs.push({ html: serialize(currentNode), id: `${idCounter}`, selector })
			currentNode.attribs['fill-id'] = `${idCounter}`
			idCounter++
		}

		if (currentNode.attribs && currentNode.attribs.class) {
			delete currentNode.attribs['class']
		}

		if (currentNode.children) {
			filteredChildren = currentNode.children.filter(child => {
				if (child.type === 'tag' && !elementsToRemove.includes(child.name)) return true
				if (child.type === 'text') return true
			})

			currentNode.children = filteredChildren
			stack.push(...filteredChildren.filter(child => child.type === 'tag'))
		}
	}
	return {
		html: serialize(element),
		inputs
	}
}

export interface FillFormResult {
	success: boolean
	elementData: string
	message: string
	tabId: number
}

interface valuesToFill {
	id: string
	value: string
	selector: string
}

async function insertInputsValues(inputsValues: valuesToFill[], tabId: number) {
	chrome.scripting.executeScript({
		target: { tabId },
		func: (inputsValues) => {
			inputsValues.forEach(inputValue => {
				const element = document.querySelector(inputValue.selector) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
				if (element) {
					element.value = inputValue.value
				}
			})
		},
		args: [inputsValues]
	})
}

export async function fillForm(elementData: string, tabId: number): Promise<FillFormResult> {
	try {
		const { html: cleanedHtml, inputs } = processHtmlData(elementData)
		if (inputs.length === 0) {
			return {
				success: false,
				elementData,
				message: 'No input fields found',
				tabId
			}
		}

		const selectedApiKey = await getSelectedApiKey()
		const selectedPrompt = await getSelectedPrompt()
		const anthropic = createAnthropic({
			apiKey: selectedApiKey.apiKey,
			headers: { 'anthropic-dangerous-direct-browser-access': 'true' }
		})

		const startTime = performance.now()

		const result = await generateObject({
			model: anthropic('claude-3-5-haiku-latest'),
			system: `You are a helpful assistant that fills HTML inputs. The user will supply you
					with partial HTML that the user selected, data and instructions on how to fill the inputs.
					each input will contain a "fill-id" attribute which you will use to identify the fields.
					You will then fill every input/select/textarea with the provided data following the instructions.
					If the input you're trying to fill has no data from the user you will NOT fill out randomly,
					you will fill the input as "N/A" You always fill out all the input/select/textarea fields
					if unknown set the result as N/A. You will fill the inputs in the following format:
					{
						"fillId": "0",
						"value": "value"
					}`,
			prompt: `<html-inputs>
					${cleanedHtml}
					</html-inputs>
					<user-prompt>
					${selectedPrompt.prompt} 
					</user-prompt>`,
			output: "array",
			schema: z.object({
				fillId: z.string(),
				value: z.string()
			})
		})

		const endTime = performance.now()
		const duration = endTime - startTime
		console.log(`API request completed in ${duration.toFixed(2)} ms (${(duration / 1000).toFixed(2)} seconds)`)
		console.log('result', result.object)

		const valuesToFill = result.object.map(item => ({
			id: item.fillId,
			value: item.value,
			selector: inputs.find(input => input.id === item.fillId)?.selector || ''
		}))

		insertInputsValues(valuesToFill, tabId)

		return {
			success: true,
			elementData,
			message: `Element selected with ${inputs.length} input fields`,
			tabId
		}
	} catch (error) {
		console.error('Error in fillForm:', error)
		return {
			success: false,
			elementData,
			message: `Error processing element: ${error instanceof Error ? error.message : 'Unknown error'}`,
			tabId
		}
	}
} 