import type { ChromeMessage, ChromeMessageResponse } from "@/types/messages"
import { sendToBackground } from "@plasmohq/messaging"
import type { ElementSelectedReqBody, ElementSelectedResBody } from "@/background/messages/elementSelected"

let savedMappedInputs = []

chrome.runtime.onMessage.addListener((
	message: ChromeMessage,
	sender: chrome.runtime.MessageSender,
	sendResponse: (response?: ChromeMessageResponse) => void
) => {
	if (message.type === 'START_ELEMENT_SELECTION') {
		startSelectionMessageHandler(message, sender, sendResponse)
		return true // Keep the message channel open for async response
	}
	return false // Let other message handlers process this message
})

function startSelectionMessageHandler(
	message: ChromeMessage,
	sender: chrome.runtime.MessageSender,
	sendResponse: (response?: ChromeMessageResponse) => void
) {
	console.log('received START_ELEMENT_SELECTION message', message)
	startElementSelection()
	sendResponse({ success: true })
}

function startElementSelection() {
	const existingOverlay = document.getElementById('element-selector-overlay')
	if (existingOverlay) {
		existingOverlay.remove()
	}

	// Create overlay styles
	const style = document.createElement('style')
	style.id = 'element-selector-style'
	style.textContent = `
    .element-selector-highlight {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px !important;
      background-color: rgba(59, 130, 246, 0.1) !important;
      cursor: pointer !important;
    }
  `
	document.head.appendChild(style)

	let currentHighlighted: Element | null = null

	function handleMouseMove(event: MouseEvent) {
		if (currentHighlighted) {
			currentHighlighted.classList.remove('element-selector-highlight')
		}

		// Don't highlight the overlay itself
		const target = event.target as Element
		if (target.closest('#element-selector-style')) {
			return
		}

		// Highlight new element
		target.classList.add('element-selector-highlight')
		currentHighlighted = target
	}

	function fillForm(inputsValues: { inputFillId: number, value: string }[]) {
		inputsValues.forEach(item => {
			const element = savedMappedInputs[item.inputFillId] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			const elementType = element.tagName.toLowerCase()
			const textBasedTypes = ['text', 'number', 'email', 'password', 'url', 'tel', 'search', 'date', 'datetime-local', 'month', 'time', 'week']
			if (elementType === 'textarea') {
				fillInputElement(element as HTMLTextAreaElement, item.value)
			} else if (elementType === 'input' && textBasedTypes.includes(element.type.toLowerCase())) {
				fillInputElement(element as HTMLInputElement, item.value)
			} else if (elementType === 'select') {
				fillSelectElement(element as HTMLSelectElement, item.value)
			} else {
				console.error(`type not supported, ${elementType}`)
			}
		})
	}

	function fillInputElement(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
		element.focus()

		// Clear existing value
		element.value = ''
		element.dispatchEvent(new Event('input', { bubbles: true }))

		// Simulate typing character by character
		for (let i = 0; i < value.length; i++) {
			element.value = value.substring(0, i + 1)
			element.dispatchEvent(new Event('input', { bubbles: true }))
		}

		element.dispatchEvent(new Event('change', { bubbles: true }))
		element.blur()
	}

	function fillSelectElement(element: HTMLSelectElement, value: string) {
		element.focus()

		// Try to find an option with matching value or text content
		const option = Array.from(element.options).find(opt =>
			opt.value === value || opt.textContent?.trim() === value
		)

		if (option) {
			element.value = option.value
			element.dispatchEvent(new Event('change', { bubbles: true }))
		} else {
			console.warn(`No option found for value: ${value} in select element`)
		}

		element.blur()
	}

	async function handleClick(event: MouseEvent) {
		event.preventDefault()
		event.stopPropagation()
		event.stopImmediatePropagation()
		const target = event.target as Element

		const { htmlWithFillIds, mappedInputs } = getMappedInputs(target)
		if (mappedInputs.length === 0) return console.error('No mapped inputs found')
		savedMappedInputs = mappedInputs
		cleanup()

		const result = await sendToBackground<ElementSelectedReqBody, ElementSelectedResBody>({
			name: 'elementSelected',
			body: {
				elementHtml: htmlWithFillIds,
			}
		})
		if (result.success) fillForm(result.data || [])


	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			cleanup()
		}
	}

	function cleanup() {
		document.removeEventListener('mousemove', handleMouseMove)
		document.removeEventListener('click', handleClick, true)
		document.removeEventListener('keydown', handleKeyDown)

		// Remove all highlights (in case UI thread was slow)
		document.querySelectorAll('.element-selector-highlight').forEach(el => {
			el.classList.remove('element-selector-highlight')
		})

		const style = document.getElementById('element-selector-style')
		if (style) style.remove()
	}

	document.addEventListener('mousemove', handleMouseMove)
	document.addEventListener('click', handleClick, true)
	document.addEventListener('keydown', handleKeyDown)
}


function getMappedInputs(element: Element) {
	const htmlWithFillIds = document.createElement('div')
	htmlWithFillIds.innerHTML = element.outerHTML

	htmlWithFillIds.querySelectorAll('*').forEach(el => {
		el.removeAttribute('class')
		el.removeAttribute('style')
	})

	htmlWithFillIds.querySelectorAll('svg').forEach(svg => {
		svg.remove()
	})
	const inputsElementsTags = ['input', 'textarea', 'select']
	const elements = element.querySelectorAll(inputsElementsTags.join(','))
	const mappedInputs = []

	// handle single input case
	if (inputsElementsTags.includes(element.tagName.toLowerCase())) {
		element.setAttribute('fill-id', '0')
		mappedInputs.push(element)
	}
	else {
		elements.forEach((element, index) => {
			element.setAttribute('fill-id', index.toString())
			mappedInputs.push(element)
		})
	}

	return { mappedInputs, htmlWithFillIds: htmlWithFillIds.innerHTML }
} 