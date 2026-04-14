import { GEMINI_API_KEY } from './constants';

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const CACHE_KEY = "gemini_available_models";
const CACHE_TTL_MS = 60 * 60 * 1000;

interface ModelCache {
  models: string[];
  timestamp: number;
}

const PREFERENCE_ORDER = [
  "gemini-3",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5",
  "gemini-2.0-flash",
  "gemini-2.0",
];

function scoreModel(name: string): number {
  const lower = name.toLowerCase();
  for (let i = 0; i < PREFERENCE_ORDER.length; i++) {
    if (lower.includes(PREFERENCE_ORDER[i])) {
      const isExperimental = lower.includes("preview") || lower.includes("exp") || lower.includes("thinking");
      return PREFERENCE_ORDER.length - i + (isExperimental ? 0.5 : 1);
    }
  }
  return 0;
}

function loadFromCache(): string[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: ModelCache = JSON.parse(raw);
    if (Date.now() - cache.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cache.models;
  } catch {
    return null;
  }
}

function saveToCache(models: string[]): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ models, timestamp: Date.now() }));
  } catch {
    // sessionStorage not available
  }
}

export async function discoverAvailableModels(): Promise<string[]> {
  const cached = loadFromCache();
  if (cached && cached.length > 0) {
    console.info(`[ModelDiscovery] Usando cache: ${cached.slice(0, 3).join(', ')}...`);
    return cached;
  }

  try {
    const res = await fetch(`${BASE_URL}/models?key=${GEMINI_API_KEY}`);
    if (!res.ok) {
      console.warn(`[ModelDiscovery] Falha ao listar modelos: HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    const models: string[] = (data.models || [])
      .filter((m: any) =>
        Array.isArray(m.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes("generateContent")
      )
      .map((m: any) => (m.name as string).replace("models/", ""))
      .filter((name: string) => name.startsWith("gemini"))
      .sort((a: string, b: string) => scoreModel(b) - scoreModel(a));

    if (models.length > 0) {
      console.info(`[ModelDiscovery] Modelos encontrados: ${models.join(', ')}`);
      saveToCache(models);
    }

    return models;
  } catch (err) {
    console.warn(`[ModelDiscovery] Erro:`, err);
    return [];
  }
}

export function clearModelCache(): void {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
