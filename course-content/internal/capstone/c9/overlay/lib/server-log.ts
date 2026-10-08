type Event = 'research_started' | 'research_finished' | 'research_step_finished'
type Fields = { runId: number; step?: number; status?: string; errorCode?: string | null; latencyMs?: number }
export function serverLog(event: Event, fields: Fields) {
 // Explicit field allowlist: no spreading arbitrary objects, exceptions, text or URLs.
 console.info(JSON.stringify({event,runId:fields.runId,step:fields.step,
  status:fields.status,errorCode:fields.errorCode,latencyMs:fields.latencyMs}))
}
