import "@/style.css"
import { ElementSelector } from "@/components/ElementSelector"
import { Button } from "@/components/ui/button"
import { MenuIcon } from "@/components/svgs/MenuIcon"
import { SettingsIcon } from "@/components/svgs/SettingsIcon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStorage } from "@plasmohq/storage/hook"
import { setSelectedApiKey, type ApiKey } from "@/services/apiKeys"
import { setSelectedPrompt, type Prompt } from "@/services/prompts"

function IndexPopup() {
  const [selectedApiKey] = useStorage<string>("selectedApiKey", "")
  const [selectedPrompt] = useStorage<string>("selectedPrompt", "")
  const [prompts] = useStorage<Prompt[]>("prompts", [])
  const [apiKeys] = useStorage<ApiKey[]>("apiKeys", [])

  const handleApiKeyChange = async (value: string) => {
    await setSelectedApiKey(value)
  }

  const handlePromptChange = async (value: string) => {
    await setSelectedPrompt(value)
  }

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage()
  }

  const openSidePanel = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    chrome.sidePanel.open({ tabId: tab.id })
  }

  return (
    <div className="p-10 space-y-6">
      <ElementSelector />

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">API Key</label>
          <Select value={selectedApiKey} onValueChange={handleApiKeyChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an API key" />
            </SelectTrigger>
            <SelectContent>
              {apiKeys.map((apiKey) => (
                <SelectItem key={apiKey.name} value={apiKey.name}>
                  {apiKey.name} ({apiKey.apiKeyProvider})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt</label>
          <Select value={selectedPrompt} onValueChange={handlePromptChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a prompt" />
            </SelectTrigger>
            <SelectContent>
              {prompts.map((prompt) => (
                <SelectItem key={prompt.name} value={prompt.name}>
                  {prompt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t pt-4 flex justify-center gap-4">
        <Button
          variant="link"
          size="sm"
          onClick={openSidePanel}
          className="text-muted-foreground hover:text-foreground"
        >
          <MenuIcon className="w-4 h-4 mr-2" />
          Side Panel
        </Button>
        <Button
          variant="link"
          size="sm"
          onClick={openOptionsPage}
          className="text-muted-foreground hover:text-foreground"
        >
          <SettingsIcon className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  )
}

export default IndexPopup
