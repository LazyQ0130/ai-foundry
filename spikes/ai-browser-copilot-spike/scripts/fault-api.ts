// Manual QA fixture only. It reuses the exact production boundary, always Mock, loopback only.
import { createApp } from '../api/src/app';
import { mock, type SummaryProvider } from '../api/src/provider/mock';
const mode = process.env.SPIKE_FAULT;
if (!['delay','timeout','invalid-provider'].includes(mode ?? '')) throw Error('Set SPIKE_FAULT=delay|timeout|invalid-provider');
const provider:SummaryProvider = {
  async summarize(input,signal) {
    if (mode === 'timeout') return new Promise<never>(()=>{});
    if (mode === 'invalid-provider') return {} as never;
    await new Promise<void>((resolve,reject)=>{
      const abort=()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'));};
      const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},1200);
      signal.addEventListener('abort',abort,{once:true});
      if(signal.aborted)abort();
    });
    return mock.summarize(input,signal);
  },
};
createApp(process.env.EXTENSION_ORIGIN ?? '',provider).listen(8787,'127.0.0.1',()=>console.log(`Phase 0 QA fixture on 127.0.0.1:8787; mode=${mode}; Mock only`));
