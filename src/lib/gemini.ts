import { GEMINI_API_KEY, SYSTEM_PROMPT, FALLBACK_MODELS, GEMINI_MODEL } from './constants';
import { discoverAvailableModels, clearModelCache } from './modelDiscovery';
import { fetchKnowledgeContext } from './knowledgeBase';

class InternalAgent {
  private apiKey: string;
  private systemPrompt: string;
  private baseUrl: string = "https://generativelanguage.googleapis.com/v1beta";
  private discoveredModels: string[] = [];
  private discoveryDone = false;

  constructor(apiKey: string, systemPrompt: string) {
    this.apiKey = apiKey;
    this.systemPrompt = systemPrompt;
  }

  private async ensureDiscovery(): Promise<void> {
    if (this.discoveryDone) return;
    this.discoveryDone = true;
    this.discoveredModels = await discoverAvailableModels();
  }

  private buildModelList(modelOverride?: string): string[] {
    const preferred = modelOverride || GEMINI_MODEL;
    const discovered = this.discoveredModels.length > 0 ? this.discoveredModels : [];
    return [...new Set([preferred, ...discovered, ...FALLBACK_MODELS])];
  }

  async chat(history: any[], modelOverride?: string) {
    await this.ensureDiscovery();

    const knowledgeContext = await fetchKnowledgeContext();
    
    // Construção de prompt mais enfática para forçar o uso da base de conhecimento
    const enrichedPrompt = `
${this.systemPrompt}

INSTRUÇÃO CRÍTICA: Você recebeu acesso a uma Base de Conhecimento Interna abaixo. Você DEVE consultá-la antes de responder. Caso a resposta esteja na base, use-a obrigatoriamente, citando as fontes quando disponíveis.
${knowledgeContext}`;

    let modelsToTry = this.buildModelList(modelOverride);
    let lastError: any = null;
    let rediscovered = false;

    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];
      try {
        if (lastError && (lastError.includes('429') || lastError.toLowerCase().includes('quota'))) {
          console.info(`[Agente Interno] Aguardando reset de cota para tentar ${model}...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const response = await fetch(
          `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: enrichedPrompt }]
              },
              contents: history,
              generationConfig: {
                temperature: 0.1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
              }
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          const errorDetails = data.error?.message || JSON.stringify(data.error);
          console.warn(`[Agente Interno] Tentativa falhou (${model}): ${errorDetails}`);

          if (response.status === 403) {
            throw new Error(`Chave da API inválida ou sem permissão: ${errorDetails}. Por favor, atualize a GEMINI_API_KEY em constants.ts com uma chave válida.`);
          }

          const isModelNotFound = response.status === 404 || errorDetails.toLowerCase().includes('not found') || errorDetails.toLowerCase().includes('not supported');
          const isRetryable = isModelNotFound || response.status === 400 || response.status === 429;

          if (isRetryable) {
            lastError = errorDetails;

            if (isModelNotFound && !rediscovered) {
              rediscovered = true;
              clearModelCache();
              this.discoveredModels = await discoverAvailableModels();
              const freshList = this.buildModelList(modelOverride);
              const remaining = freshList.filter(m => m !== model && !modelsToTry.slice(0, i + 1).includes(m));
              modelsToTry = [...modelsToTry.slice(0, i + 1), ...remaining];
            }
            continue;
          }
          throw new Error(errorDetails);
        }

        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) throw new Error("A API retornou uma estrutura de dados sem conteúdo.");

        console.info(`[Agente Interno] Operando via modelo: ${model}`);
        return {
          content,
          actualModel: model
        };
      } catch (err: any) {
        lastError = err.message || err;
        continue;
      }
    }

    if (lastError?.toLowerCase().includes('quota')) {
      throw new Error("O limite de uso da API foi atingido (Quota Exceeded). Por favor, aguarde alguns segundos antes de tentar novamente.");
    }

    throw new Error(`O Agente Interno está temporariamente indisponível. Último erro: ${lastError}`);
  }
}

const agent = new InternalAgent(GEMINI_API_KEY, SYSTEM_PROMPT);

export async function generateChatResponse(history: any[], preferredModel: string) {
  return await agent.chat(history, preferredModel);
}
