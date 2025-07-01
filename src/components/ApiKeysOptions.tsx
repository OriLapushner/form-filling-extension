import { ApiKeyForm } from "@/components/ApiKeyForm"
import { ApiKeysList } from "@/components/ApiKeysList"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function ApiKeysOptions() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>API Keys</CardTitle>
				<CardDescription>
					Manage your API keys for different providers
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<ApiKeyForm />
				<Separator />
				<ApiKeysList />
			</CardContent>
		</Card>
	)
} 