# Deployment

## Architecture

```
┌──────────────────┐  HTTPS   ┌─────────────────────┐  HTTPS   ┌──────────────┐
│  Cloudflare      │ ───────▶ │  Cloudflare Worker  │ ───────▶ │  Anthropic   │
│  Pages (static)  │          │  (proxy + ratelimit)│          │  /v1/messages│
│  sandwich.app    │          │  api.sandwich.app   │          └──────────────┘
└──────────────────┘          └─────────────────────┘
```

The frontend is a static SPA. All Claude calls go through a Cloudflare Worker that holds the API key and applies rate limiting. **Never** put the API key in the frontend bundle.

## Step-by-step

### 1. Frontend (Cloudflare Pages)

```bash
npm run build
# Output: dist/

npx wrangler pages deploy dist --project-name=sandwich
```

Set environment variable in the Pages dashboard:

- `VITE_PROXY_URL` = `https://api.sandwich.yourdomain.com/api/claude`

### 2. Worker (proxy)

Create `worker/index.ts`:

```typescript
export interface Env {
  ANTHROPIC_API_KEY: string;
  RATELIMIT: KVNamespace;
}

const ALLOWED_ORIGINS = ["https://sandwich.yourdomain.com"];
const PER_IP_PER_MINUTE = 30;
const PER_IP_PER_DAY = 200;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get("Origin") ?? "";
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    if (req.method === "OPTIONS") {
      return cors(origin);
    }
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const ip = req.headers.get("CF-Connecting-IP") ?? "unknown";
    const minuteKey = `rl:m:${ip}:${Math.floor(Date.now() / 60000)}`;
    const dayKey = `rl:d:${ip}:${new Date().toISOString().slice(0, 10)}`;

    const [minuteCount, dayCount] = await Promise.all([
      env.RATELIMIT.get(minuteKey).then((v) => parseInt(v ?? "0", 10)),
      env.RATELIMIT.get(dayKey).then((v) => parseInt(v ?? "0", 10)),
    ]);

    if (minuteCount >= PER_IP_PER_MINUTE || dayCount >= PER_IP_PER_DAY) {
      return new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    const { prompt, model } = await req.json<{ prompt: string; model?: string }>();
    const claudeModel = model === "haiku" ? "claude-haiku-4-5-20251001" : "claude-sonnet-4-6";

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: claudeModel,
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    // Increment counters in background (don't block response)
    await Promise.all([
      env.RATELIMIT.put(minuteKey, String(minuteCount + 1), { expirationTtl: 90 }),
      env.RATELIMIT.put(dayKey, String(dayCount + 1), { expirationTtl: 90000 }),
    ]);

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...corsHeaders(origin),
        "Content-Type": "application/json",
      },
    });
  },
};

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function cors(origin: string) {
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}
```

Create `worker/wrangler.toml`:

```toml
name = "sandwich-proxy"
main = "index.ts"
compatibility_date = "2026-04-01"

routes = [
  { pattern = "api.sandwich.yourdomain.com/api/claude", zone_name = "yourdomain.com" }
]

[[kv_namespaces]]
binding = "RATELIMIT"
id = "<your-kv-namespace-id>"
```

Deploy:

```bash
cd worker
npx wrangler kv namespace create RATELIMIT
# Copy the ID into wrangler.toml

npx wrangler secret put ANTHROPIC_API_KEY
# Paste your key when prompted

npx wrangler deploy
```

### 3. DNS

In Cloudflare DNS for your domain:

- `sandwich` → Pages project (orange cloud)
- `api.sandwich` → Worker route (orange cloud)

### 4. Verify

```bash
curl -X POST https://api.sandwich.yourdomain.com/api/claude \
  -H "Origin: https://sandwich.yourdomain.com" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hi in JSON: {\"hi\": \"...\"}"}'
```

Should return `{"content":[{"type":"text","text":"{\"hi\":\"there\"}"}],...}`.

## Cost containment

- **Per-IP per-minute cap**: 30 (one full game run is ~10 calls; this allows three rapid runs per minute)
- **Per-IP per-day cap**: 200 (caps a single bad actor at ~$4/day on Sonnet, ~$1.80/day on Haiku-mix)
- **Account-level monthly budget alarm**: set in Anthropic console at $100. When approached, the worker should start returning 503 and a friendly "MARK IV is overwhelmed today" message.

## Diagnostic mode in production

The F5 RUN ALL button fires 42 calls in quick succession. **Gate it behind a query param** so users can't accidentally trigger it:

```typescript
const debugEnabled = new URLSearchParams(location.search).has("debug");
```

Only show the F5 listener when `debugEnabled` is true. Document the URL: `https://sandwich.yourdomain.com/?debug=1`.

## Observability

- Cloudflare Worker logs: free, real-time tail with `wrangler tail`
- Add Plausible or Cloudflare Web Analytics for traffic (no cookies, no banner needed)
- Consider logging anonymized run outcomes to a worker log for prompt iteration data: which moods rolled, what star ratings resulted, what mood × star pairs produced "share" clicks. Don't log the user's directives — those might be PII or NSFW.
