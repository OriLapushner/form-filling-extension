import React, { useRef } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { savePrompt } from "@/services/prompts"

export function CreatePromptForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const setTextAreaHeight = (textarea: HTMLTextAreaElement) => {
		textarea.style.height = 'auto'
		const newHeight = Math.min(textarea.scrollHeight, 600)
		textarea.style.height = `${newHeight}px`
		textarea.style.overflowY = newHeight >= 600 ? 'auto' : 'hidden'
	}

	const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setTextAreaHeight(e.target)
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const form = e.currentTarget
		const formData = new FormData(form)
		const promptName = formData.get("promptName") as string
		const promptText = formData.get("promptText") as string

		if (promptName.trim() && promptText.trim()) {
			try {
				await savePrompt(promptName.trim(), promptText.trim())
				toast.success(`Prompt "${promptName.trim()}" saved successfully!`)
				form.reset()

				// Access the textarea reference here if needed
				if (textareaRef.current) {
					// You can perform any operations on the textarea element
					// For example: reset height, focus, scroll, etc.
					setTextAreaHeight(textareaRef.current)
				}
			} catch (error) {
				if (error instanceof Error) {
					toast.error(error.message)
				} else {
					toast.error("Failed to save prompt. Please try again.")
				}
				console.error("Error saving prompt:", error)
			}
		}
	}

	return (
		<div
			className={`space-y-4 rounded-lg border p-4 bg-muted/50 ${className || ""}`}
			{...props}
		>
			<h3 className="font-semibold">Add New Prompt</h3>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="prompt-name">Prompt Name</Label>
						<Input
							id="prompt-name"
							name="promptName"
							placeholder="e.g., Billing Form"
							required
						/>
					</div>
					<div className="space-y-2 md:col-span-2">
						<Label htmlFor="prompt-text">Prompt Text</Label>
						<Textarea
							ref={textareaRef}
							id="prompt-text"
							name="promptText"
							placeholder="Enter your custom prompt text..."
							className="min-h-[100px] max-h-[600px]"
							onChange={handleTextareaChange}
							required
						/>
					</div>
				</div>
				<Button
					type="submit"
					className="w-full md:w-auto"
				>
					<Plus className="h-4 w-4 mr-2" />
					Add Prompt
				</Button>
			</form>
		</div>
	)
} 