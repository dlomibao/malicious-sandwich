/**
 * LLM proxy client.
 *
 * In dev: Vite proxies /api -> 127.0.0.1:8000 (FastAPI).
 * In prod: same-origin reverse proxy, or VITE_PROXY_URL override.
 *
 * The backend is provider-agnostic and returns a canonical
 * `{ text, provider, model }` envelope. We extract the first JSON
 * object from `text` since the prompts ask for JSON output.
 */

const PROXY_URL = import.meta.env.VITE_PROXY_URL ?? "/api/llm";

export type ModelTier = "smart" | "fast";
export type ProviderName = "anthropic" | "openai" | "google";

export interface LLMRequest {
  prompt: string;
  model?: ModelTier;
  provider?: ProviderName;
  role?: "markiv" | "bureau" | "diagnostic";
}

export class LLMError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = "LLMError";
  }
}

export async function callLLM<T = unknown>(req: LLMRequest): Promise<T> {
  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (response.status === 429) {
    throw new LLMError("Rate limited", 429, true);
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new LLMError(
      `HTTP ${response.status}: ${body.slice(0, 100)}`,
      response.status,
      response.status >= 500,
    );
  }

  const data = (await response.json()) as { text?: unknown };
  if (typeof data?.text !== "string") {
    throw new LLMError(`Bad response shape: ${JSON.stringify(data).slice(0, 100)}`);
  }

  const text = data.text.trim().replace(/```json|```/g, "").trim();
  const match = text.match(/\{[\s\S]*\}/);
  try {
    return JSON.parse(match ? match[0] : text) as T;
  } catch (err) {
    throw new LLMError(`JSON parse failed: ${(err as Error).message}`);
  }
}
