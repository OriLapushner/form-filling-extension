import { parseDocument } from 'htmlparser2'
import { selectAll } from 'css-select'
import type { Element, Node } from 'domhandler'
// check if can use Element equivalent in htmlparser2
import serialize from 'dom-serializer'

export interface FillFormResult {
	success: boolean
	elementData: string
	message: string
	tabId: number
}

function extractInputFields(elementHtml: string) {
	const doc = parseDocument(elementHtml)
	return selectAll('input, textarea, select', doc)
}

function removeNoisyHtml(elementHtml: string): string {
	const doc = parseDocument(elementHtml)
	const element = doc.children[0] as Element
	console.log("element from removeClasses", element)
	const stack: Element[] = [element]

	while (stack.length > 0) {
		const currentNode = stack.pop()

		if (currentNode.attribs && currentNode.attribs.class) {
			delete currentNode.attribs['class']
		}
		let filteredChildren = []

		if (currentNode.children) {
			filteredChildren = currentNode.children.filter(child => child.type === 'tag' || child.type === 'text')
			currentNode.children = filteredChildren
			stack.push(...filteredChildren.filter(child => child.type === 'tag'))
		}
	}
	return serialize(element)
}

export async function fillForm(elementData: string, tabId: number): Promise<FillFormResult> {
	try {
		const inputFields = extractInputFields(elementData)
		console.log("inputFields count: ", inputFields.length)
		if (inputFields.length === 0) {
			return {
				success: false,
				elementData,
				message: 'No input fields found',
				tabId
			}
		}
		console.log('raw html', elementData)
		const cleanedHtml = removeNoisyHtml(elementData)
		console.log("cleanedHtml", cleanedHtml)
		// send to LLM to fill the form

		return {
			success: true,
			elementData,
			message: `Element selected with ${inputFields.length} input fields`,
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