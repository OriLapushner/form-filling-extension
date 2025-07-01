import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, Trash2 } from "lucide-react"
import { useStorage } from "@plasmohq/storage/hook"
import { toast } from "sonner"
import { deletePrompt } from "@/services/prompts"

interface CustomPrompt {
	name: string
	prompt: string
}

interface PromptsListProps extends React.HTMLAttributes<HTMLDivElement> {
}

export function PromptsList({ className, ...props }: PromptsListProps) {
	const [prompts] = useStorage<CustomPrompt[]>("prompts", [])
	const [deleting, setDeleting] = useState<string | null>(null)
	const handleDeletePrompt = async (name: string) => {
		try {
			setDeleting(name)
			await deletePrompt(name)
		} catch (error) {
			console.error("Error deleting prompt:", error)
			toast.error(`Failed to delete prompt "${name}". Please try again.`)
		} finally {
			setDeleting(null)
		}
	}

	return (
		<div className={`space-y-4 ${className || ""}`} {...props}>
			<h3 className="font-semibold">Saved Prompts ({prompts.length})</h3>
			{prompts.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
					<p>No custom prompts yet.</p>
					<p className="text-sm">Add your first prompt above to get started.</p>
				</div>
			) : (
				<div className="space-y-3">
					{prompts.reverse().map((prompt) => (
						<div
							key={prompt.name}
							className="flex items-start justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
						>
							<div className="flex-1 space-y-2">
								<div className="flex items-center gap-2">
									<h4 className="font-medium">{prompt.name}</h4>
								</div>
								<p className="text-sm text-muted-foreground line-clamp-2">{prompt.prompt}</p>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleDeletePrompt(prompt.name)}
								disabled={deleting === prompt.name}
								className="text-destructive hover:text-destructive hover:bg-destructive/10"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	)
} 