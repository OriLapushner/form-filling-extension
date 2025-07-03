import { fillForm } from "@/services/fillForm"

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'elementSelected') {
		handleElementSelected(message.elementHtml)
	}
})

async function handleElementSelected(elementHtml: string) {
	try {
		const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
		if (!activeTab || !activeTab.id) {
			console.error('No active tab found')
			return
		}
		await fillForm(elementHtml, activeTab.id)

	} catch (error) {
		console.error('Error handling selected element:', error)
	}
}