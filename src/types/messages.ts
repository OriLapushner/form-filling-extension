// Message types for Chrome API messaging

export const START_ELEMENT_SELECTION = 'START_ELEMENT_SELECTION' as const
export const ELEMENT_SELECTED = 'ELEMENT_SELECTED' as const

export interface StartElementSelectionMessage {
	type: typeof START_ELEMENT_SELECTION
}

export const START_ELEMENT_SELECTION_RESPONSE = 'START_ELEMENT_SELECTION_RESPONSE' as const

interface StartElementSelectionResponse {
	success: boolean
	error?: string,
}

export type ChromeMessage = StartElementSelectionMessage

export type ChromeMessageResponse = StartElementSelectionResponse
