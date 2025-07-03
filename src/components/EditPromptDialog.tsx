import React, { useRef, useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Save } from "lucide-react"
import { updatePrompt, type Prompt } from "@/services/prompts"

interface EditPromptDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	prompt: Prompt | null
}

export function EditPromptDialog({ open, onOpenChange, prompt }: EditPromptDialogProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const [promptName, setPromptName] = useState("")
	const [promptText, setPromptText] = useState("")
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		if (prompt) {
			setPromptName(prompt.name)
			setPromptText(prompt.prompt)
		}
	}, [prompt])

	const setTextAreaHeight = (textarea: HTMLTextAreaElement) => {
		// With flex-1, the textarea will automatically fill available space
		// Just ensure overflow is handled properly
		textarea.style.overflowY = 'auto'
	}

	const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setPromptText(e.target.value)
		setTextAreaHeight(e.target)
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (!prompt) return

		if (promptName.trim() && promptText.trim()) {
			try {
				setSaving(true)
				await updatePrompt(prompt.name, promptName.trim(), promptText.trim())
				toast.success(`Prompt "${promptName.trim()}" updated successfully!`)
				onOpenChange(false)
			} catch (error) {
				if (error instanceof Error) {
					toast.error(error.message)
				} else {
					toast.error("Failed to update prompt. Please try again.")
				}
				console.error("Error updating prompt:", error)
			} finally {
				setSaving(false)
			}
		}
	}

	const handleCancel = () => {
		if (prompt) {
			setPromptName(prompt.name)
			setPromptText(prompt.prompt)
		}
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Edit Prompt</DialogTitle>
					<DialogDescription>
						Make changes to your prompt. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="flex flex-col flex-1 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="edit-prompt-name">Prompt Name</Label>
						<Input
							id="edit-prompt-name"
							value={promptName}
							onChange={(e) => setPromptName(e.target.value)}
							placeholder="e.g., Billing Form"
							required
						/>
					</div>
					<div className="space-y-2 flex-1 flex flex-col">
						<Label htmlFor="edit-prompt-text">Prompt Text</Label>
						<Textarea
							ref={textareaRef}
							id="edit-prompt-text"
							value={promptText}
							onChange={handleTextareaChange}
							placeholder="Enter your custom prompt text..."
							className="flex-1 min-h-0 resize-none"
							required
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
							disabled={saving}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={saving}
						>
							<Save className="h-4 w-4 mr-2" />
							{saving ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
} 