# rate-limit-retry

An **OpenCode plugin** that automatically recovers from token / rate-limit errors
(e.g. litellm `"Token limit reached: too many tokens per minute"`).

---

## Why

Some AI gateways (litellm and similar) report the per-minute token budget as an
HTTP **429** (and sometimes **400** / `InvalidRequest`). Without handling, the
agent step just stops and waits for a manual `continue`.

The plugin intercepts model HTTP responses. When a rate-limit-like failure is
detected it:

1. **waits out** the rate-limit window (`delayMs`, default 60 s) so the per-minute
   budget resets, and
2. **returns a normalized** `429 + Retry-After` to OpenCode.

OpenCode then retries the step against a fresh per-minute budget and the agent
keeps going automatically. The same hook covers primary calls, compaction, title
and `generate` requests alike.

## Installation

Add the plugin to `opencode.json(c)`:

```json
{
  "plugins": [
    {
      "package": "file:///C:/Users/b.prokhorov/.config/opencode/plugins/rate-limit-retry",
      "options": {
        "delayMs": 60000,
        "maxAttempts": 8
      }
    }
  ]
}
```

If you clone the repository elsewhere, point `package` to your local path
(prefix with `file:///`) or build it:

```bash
npm install
npm run build
```

> **Important:** OpenCode loads a local plugin *directory* by resolving
> `index.ts` / `index.js` in the directory root — it does **not** read the
> `main` field of `package.json` for local paths. The root `index.ts` is that
> entrypoint: it just re-exports the plugin from `src/index.ts`, so local use
> needs **no build step**. `dist/` (from `npm run build`) is only for package
> consumers; node_modules/ and dist/ are gitignored.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `delayMs` | `number` | `60000` | ms to wait for the rate-limit window to reset |
| `maxAttempts` | `number` | `8` | hard cap on retries per call, `0` = unlimited |
| `statusCodes` | `number[]` | `[429, 503]` | HTTP statuses treated as rate-limited |
| `patterns` | `string[]` | `["too many tokens per minute", "token limit reached", "rate limit"]` | body/message regexes treated as rate-limited (matched case-insensitively) |

All options are optional; unset options fall back to their defaults.

## How it works

Two layers:

- **`retry` hook (fallback):** if OpenCode classifies a provider failure as
  retryable, the plugin forces a retry with the configured delay, capped by
  `maxAttempts`.
- **`http.response` hook (the effective fix):** when the gateway returns a
  rate-limit-like status/body, the plugin sleeps for `delayMs` and rewrites the
  response into a normalized `429` with a `Retry-After` header, so the retry
  lands on a fresh per-minute budget.

## Project structure

```
├── index.ts            # OpenCode entrypoint (re-exports from src/) -- required
├── src/
│   └── index.ts        # plugin implementation: hooks retry + http.response
├── dist/               # built artifact for package consumers (gitignored)
├── package.json
├── tsconfig.json
└── README.md
```

## Technologies

- [@opencode/plugin](https://opencode.ai) -- OpenCode plugin API (`Plugin.define`,
  session hooks)
- TypeScript 5.x

## License

This project is licensed under the [MIT License](./LICENSE).