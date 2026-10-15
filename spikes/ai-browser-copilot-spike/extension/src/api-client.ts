import { Snapshot, SummaryResponse } from '../../shared/contracts';

export const SUMMARY_URL = 'http://127.0.0.1:8787/api/ai/summary';
export async function requestSummary(snapshot: Snapshot, signal: AbortSignal, transport: typeof fetch = fetch, timeoutMs = 2500) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal.addEventListener('abort', cancel, {once:true});
  if (signal.aborted) controller.abort();
  const timer = setTimeout(cancel, timeoutMs);
  try {
    const requestId = crypto.randomUUID();
    const res = await transport(SUMMARY_URL, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({v:1,requestId,snapshot}),signal:controller.signal,redirect:'error',credentials:'omit'});
    if (!res.ok) throw new Error(`API_HTTP_${res.status}`);
    const data = SummaryResponse.parse(await res.json());
    if (data.requestId !== requestId || data.snapshotId !== snapshot.snapshotId) throw new Error('API_RESPONSE_MISMATCH');
    return data;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', cancel);
  }
}
