import { Plugin } from "@opencode/plugin"

/**
 * Automatic retry for token/rate-limit errors (e.g. litellm "Token limit
 * reached: too many tokens per minute").
 *
 * Some AI gateways (litellm etc.) report the tokens-per-minute budget as
 * HTTP 429 (and sometimes 400 / "InvalidRequest"), so the agent step would
 * otherwise just stop and wait for a manual "continue" (продолжай).
 *
 * This plugin intercepts model HTTP responses. When a rate-limit-like failure
 * is detected it:
 *   1. waits out the rate-limit window (`delayMs`, default 60s) so the TPM
 *      budget resets, and
 *   2. hands back a normalized `429 + Retry-After`.
 *
 * OpenCode then retries the step against a fresh per-minute budget and the
 * agent keeps going automatically. Applies to primary calls, compaction,
 * title and generate requests alike, because they all share the same hook.
 *
 * Options (see plugins entry in opencode.json(c)):
 *   {
 *     "plugins": [{
 *       "package": "<path-to-this-extension>",
 *       "options": {
 *         "delayMs": 60000,     // ms to wait for the rate-limit window to reset
 *         "maxAttempts": 8,     // hard cap on retries per call, 0 = unlimited
 *         "statusCodes": [429], // HTTP statuses treated as rate-limited
 *         "patterns": [         // body/message regexes treated as rate-limited
 *           "too many tokens per minute",
 *           "token limit reached",
 *           "rate limit",
 *         ],
 *       },
 *     }],
 *   }
 */

const DEFAULTS = {
  delayMs: 10_000,
  maxAttempts: 10,
  statusCodes: [429, 503],
  patterns: ["too many requests per minute", "too many tokens per minute", "token limit reached", "rate limit"],
}

export default Plugin.define({
  id: "rate-limit-retry",
  async setup(ctx) {
    const options = ctx.options ?? {}
    const delay = typeof options.delayMs === "number" ? options.delayMs : DEFAULTS.delayMs
    const max = typeof options.maxAttempts === "number" ? options.maxAttempts : DEFAULTS.maxAttempts
    const codes = new Set<number>(options.statusCodes ?? DEFAULTS.statusCodes)
    const patterns: RegExp[] = (options.patterns ?? DEFAULTS.patterns).map(
      (p: string) => new RegExp(p, "i"),
    )

    const isRateLimitedText = (msg: string, status?: number): boolean => {
      if (typeof status === "number" && codes.has(status)) return true
      return patterns.some((re) => re.test(msg))
    }

    // Layer 1: explicit retry for provider/HTTP failures OpenCode classifies as
    // retryable (429 / rate-limit). Primary lever is layer 2, this is a fallback.
    await ctx.session.hook("retry", (event) => {
      console.warn(`[rate-limit-retry] retry:${event.error.status} - ${event.error.message} - ${event.attempt}/${max}`)
      if (!isRateLimitedText(event.error.message, event.error.status)) return
      if (max > 0 && event.attempt >= max) {
        event.decision = { retry: false }
        return
      }
      event.decision = { retry: true, delay }
    })

    // Layer 2: the effective fix. When the gateway reports a rate limit, wait
    // out the window before returning a normalized 429, so OpenCode's retry
    // hits a fresh per-minute budget instead of failing in the same window.
    await ctx.session.hook("http.response", async (event) => {
      const status = event.response.status
      if (status < 400) return

      let text = ""
      try {
        text = await event.response.clone().text()
      } catch {
        return
      }
      console.warn(`[rate-limit-retry] http.response:${status} - ${text.trim()}`)
      if (!isRateLimitedText(text, status)) return

      const sleepMs = Math.max(0, Math.floor(delay))
      if (sleepMs > 0) {
        console.warn(`[rate-limit-retry] sleep=${delay}ms`)
        await new Promise((resolve) => setTimeout(resolve, sleepMs))
      }

      event.response = new Response(text, {
        status: 429,
        headers: {
          "retry-after": String(Math.max(1, Math.ceil(sleepMs / 1000))),
          "content-type": event.response.headers.get("content-type") ?? "application/json",
        },
      })
    })
  },
})