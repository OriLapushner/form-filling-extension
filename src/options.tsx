import { ApiKeysOptions } from "@/components/ApiKeysOptions"
import { PromptOptions } from "@/components/PromptOptions"
import { Toaster } from "sonner"
import "@/style.css"

export default function SettingsPage() {

	return (
		<div className="min-h-screen bg-gray-50 p-4 md:p-8">
			<Toaster />
			<div className="mx-auto max-w-4xl space-y-8">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				</div>
				<ApiKeysOptions />
				<PromptOptions />
				<div className="text-center text-sm text-muted-foreground">
					<p>Your data is stored locally.</p>
				</div>
			</div>
		</div>
	)
}
