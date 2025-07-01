import { CreatePromptForm } from "@/components/CreatePromptForm"
import { PromptsList } from "@/components/PromptsList"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MessageSquare } from "lucide-react"

export function PromptOptions() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MessageSquare className="h-5 w-5" />
					Custom Prompts
				</CardTitle>
				<CardDescription>Create and manage reusable prompts to streamline your workflow.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<CreatePromptForm />
				<Separator />
				<PromptsList />
			</CardContent>
		</Card>
	)
} 