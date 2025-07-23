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
import { setSelectedPrompt, type Prompt } from "@/services/prompts"
import { ALL_LLM_MODELS, setSelectedModel } from "@/services/models"

function IndexPopup() {
  const [selectedPrompt] = useStorage<string>("selectedPrompt", "")
  const [selectedModel] = useStorage<string>("selectedModel", "")
  const [prompts] = useStorage<Prompt[]>("prompts", [])


  const handlePromptChange = async (value: string) => {
    await setSelectedPrompt(value)
  }

  const handleModelChange = async (value: string) => {
    await setSelectedModel(value)
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
          <label className="text-sm font-medium">Model</label>
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {ALL_LLM_MODELS.map((model) => (
                <SelectItem key={model.modelVersion} value={model.modelVersion}>
                  {model.modelDisplayName} ({model.provider})
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
