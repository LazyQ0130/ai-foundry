// 教学夹具时钟：只替换本隔离子进程的定时器，不替换官方重试算法。
import {setImmediate as immediate} from 'node:timers/promises';
import assert from 'node:assert/strict';
export async function pump(){await immediate();}
export async function until(predicate:()=>boolean,label='condition'){
 for(let n=0;n<1000;n++){if(predicate())return;await pump();}throw Error('bounded fixture did not reach '+label);
}
export function gate(){let release!:()=>void;const promise=new Promise<void>(r=>release=r);return {promise,release};}
export class Clock{
 now=0;delays:number[]=[];private next=0;private timers=new Map<any,{at:number;fn:()=>void}>();
 private originalSet=globalThis.setTimeout;private originalClear=globalThis.clearTimeout;
 install(){const self=this;globalThis.setTimeout=((fn:any,ms=0,...args:any[])=>{const id={id:++self.next,ref(){return this;},unref(){return this;}};self.delays.push(ms);self.timers.set(id,{at:self.now+ms,fn:()=>fn(...args)});return id;}) as any;globalThis.clearTimeout=((id:any)=>{self.timers.delete(id);}) as any;}
 get pending(){return this.timers.size;}
 advance(ms:number){this.now+=ms;for(const [id,t] of [...this.timers].sort((a,b)=>a[1].at-b[1].at)){if(t.at<=this.now&&this.timers.delete(id))t.fn();}}
 nextTimer(){assert.ok(this.pending);const at=Math.min(...[...this.timers.values()].map(t=>t.at));this.advance(at-this.now);}
 async idle(agent:any){let done=false;const p=agent.whenIdle().then(()=>{done=true;});for(let n=0;n<200;n++){await pump();if(done){await p;return;}if(this.pending)this.nextTimer();}agent.cancel({kind:'user'});throw Error('fixture exceeded 200 bounded scheduler rounds');}
 restore(){const pending=this.pending;globalThis.setTimeout=this.originalSet;globalThis.clearTimeout=this.originalClear;assert.equal(pending,0,'all virtual timers must be drained/cancelled');}
}
