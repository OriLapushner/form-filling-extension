
export function startElementSelection() {
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

	// Mouse move handler for highlighting
	function handleMouseMove(event: MouseEvent) {
		// Remove previous highlight
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

	// Click handler for selection
	function handleClick(event: MouseEvent) {
		// Completely prevent the event from reaching the website
		event.preventDefault()
		event.stopPropagation()
		event.stopImmediatePropagation()

		const target = event.target as Element

		// Don't select overlay elements
		if (target.closest('#element-selector-style')) {
			return
		}


		// Send the element data back to the background script
		chrome.runtime.sendMessage({
			type: 'elementSelected',
			elementHtml: target.outerHTML
		})

		// Clean up
		cleanup()
	}

	// Escape key handler
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			cleanup()
		}
	}

	// Cleanup function
	function cleanup() {
		document.removeEventListener('mousemove', handleMouseMove)
		document.removeEventListener('click', handleClick, true)
		document.removeEventListener('keydown', handleKeyDown)

		// Remove all highlights (in case UI thread was slow)
		document.querySelectorAll('.element-selector-highlight').forEach(el => {
			el.classList.remove('element-selector-highlight')
		})

		// Remove styles
		const style = document.getElementById('element-selector-style')
		if (style) style.remove()
	}

	// Add event listeners
	document.addEventListener('mousemove', handleMouseMove)
	document.addEventListener('click', handleClick, true) // Use capture phase to intercept before website handlers
	document.addEventListener('keydown', handleKeyDown)
} 