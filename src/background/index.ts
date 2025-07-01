import { fillForm } from "@/lib/formFilling/fillForm"

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'elementSelected') {
		handleElementSelected(message.elementHtml)
	}
})

async function handleElementSelected(elementHtml: string) {
	try {
		const result = await fillForm(elementHtml, 1)
		console.log('Fill form result:', result)

	} catch (error) {
		console.error('Error handling selected element:', error)
	}
} 