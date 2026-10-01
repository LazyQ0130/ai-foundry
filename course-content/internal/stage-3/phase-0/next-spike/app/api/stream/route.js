export const runtime = 'nodejs'

export async function POST(request) {
  const { input } = await request.json()
  if (typeof input !== 'string' || !input || input.length > 2000) return Response.json({ error: 'INPUT_LIMIT' }, { status: 400 })
  const encoder = new TextEncoder()
  let timer
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('MOCK: first'))
      timer = setTimeout(() => {
        if (request.signal.aborted) return
        controller.enqueue(encoder.encode(' second'))
        controller.close()
      }, 250)
      request.signal.addEventListener('abort', () => clearTimeout(timer), { once: true })
    },
    cancel() { clearTimeout(timer) },
  })
  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
}
