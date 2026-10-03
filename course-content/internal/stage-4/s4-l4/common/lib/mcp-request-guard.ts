// One fixed internal client per process. This is deliberately not a distributed quota.
export const mcpRequestsPerMinute = 60;

export function createMcpRequestGuard(now: () => number = Date.now) {
  let windowStart = 0;
  let used = 0;
  return () => {
    const current = now();
    if (current - windowStart >= 60_000 || current < windowStart) {
      windowStart = current;
      used = 0;
    }
    if (used >= mcpRequestsPerMinute) return false;
    used++;
    return true;
  };
}

export const allowMcpProtocolRequest = createMcpRequestGuard();

export function guardedMcpHandler(request: Request, handler: (request: Request) => Promise<Response>,
  allow: () => boolean = allowMcpProtocolRequest): Promise<Response> {
  if (!allow()) return Promise.resolve(new Response(JSON.stringify({ error: "MCP request limit exceeded" }), {
    status: 429, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  }));
  return handler(request);
}
