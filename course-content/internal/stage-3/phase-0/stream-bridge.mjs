// Internal HTTP contract spike. A Next.js Route Handler can use the same
// request.signal and provider iterator; this is not a published lesson route.
export function createStreamBridge(provider) {
  return async function handle(req, res) {
    if (req.method !== 'POST' || req.url !== '/api/ai/stream') { res.writeHead(404); res.end(); return }
    const controller = new AbortController()
    res.on('close', () => controller.abort())
    let body = ''
    for await (const part of req) {
      body += part
      if (body.length > 3000) { res.writeHead(413); res.end(); return }
    }
    let input
    try { input = JSON.parse(body).input } catch { res.writeHead(400); res.end(); return }
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' })
    try {
      for await (const part of provider.stream(input, { signal: controller.signal })) {
        if (controller.signal.aborted) break
        if (part.text) res.write(part.text)
      }
      if (!res.destroyed) res.end()
    } catch {
      // A response already started cannot change status; terminate the stream.
      if (!res.destroyed) res.destroy()
    }
  }
}

export function createLatestResponseState() {
  let generation = 0
  let currentController
  return {
    async run(fetcher, input, onText) {
      currentController?.abort()
      const id = ++generation
      const controller = new AbortController()
      currentController = controller
      const response = await fetcher(input, controller.signal)
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (id === generation && !controller.signal.aborted) onText(decoder.decode(value, { stream: true }))
      }
    },
    cancel() { generation++; currentController?.abort() },
  }
}
