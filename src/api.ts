/**
 * Claude API client.
 *
 * In development: calls /api/claude on the local proxy (Wrangler dev).
 * In production: calls the Cloudflare Worker subdomain.
 *
 * NEVER call api.anthropic.com directly from the browser — that leaks
 * the API key. Always route through the proxy. See docs/DEPLOYMENT.md.
 */

const PROXY_URL = import.meta.env.VITE_PROXY_URL ?? "/api/claude";

export interface ClaudeRequest {
  prompt: string;
  /** Override the default model. Defaults to Sonnet for the Bureau. */
  model?: "sonnet" | "haiku";
  /** Tag for cost tracking (optional, surfaced in worker logs). */
  role?: "markiv" | "bureau" | "diagnostic";
}

export class ClaudeError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = "ClaudeError";
  }
}

export async function callClaude<T = unknown>(req: ClaudeRequest): Promise<T> {
  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (response.status === 429) {
    throw new ClaudeError("Rate limited", 429, true);
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ClaudeError(
      `HTTP ${response.status}: ${body.slice(0, 100)}`,
      response.status,
      response.status >= 500,
    );
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.content)) {
    throw new ClaudeError(`Bad response shape: ${JSON.stringify(data).slice(0, 100)}`);
  }

  const text = data.content
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n")
    .trim()
    .replace(/```json|```/g, "")
    .trim();

  // Extract first JSON object if there's preamble or extra prose
  const match = text.match(/\{[\s\S]*\}/);
  try {
    return JSON.parse(match ? match[0] : text) as T;
  } catch (err) {
    throw new ClaudeError(`JSON parse failed: ${(err as Error).message}`);
  }
}
