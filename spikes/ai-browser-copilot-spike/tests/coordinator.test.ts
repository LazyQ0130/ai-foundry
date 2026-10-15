import { describe, expect, it, vi } from 'vitest';
import { createCoordinator, type Platform } from '../extension/src/coordinator';
import { Snapshot } from '../shared/contracts';

function deferred<T>() { let resolve!: (v:T)=>void; const promise = new Promise<T>(r => {resolve=r;}); return {promise,resolve}; }
function harness() {
  const id = 'a'.repeat(32), url = 'https://example.com/article';
  const tabs = new Map<number, chrome.tabs.Tab>([[1,{id:1,windowId:10,url,active:true} as chrome.tabs.Tab],[2,{id:2,windowId:10,url:'https://other.example/',active:false} as chrome.tabs.Tab]]);
  const state = {active:1,time:100000,authorized:true};
  const store: Record<string,unknown> = {};
  const api = {
    runtime:{id,getURL:(path:string)=>`chrome-extension://${id}/${path}`},
    tabs:{get:vi.fn(async (tabId:number)=>{const tab=tabs.get(tabId);if(!tab)throw Error('missing tab');return {...tab};}),query:vi.fn(async ()=>[{...tabs.get(state.active)!}])},
    storage:{session:{get:vi.fn(async (key:string)=>({[key]:structuredClone(store[key])})),set:vi.fn(async (values:Record<string,unknown>)=>{Object.assign(store,structuredClone(values));}),remove:vi.fn(async (key:string)=>{delete store[key];})}},
    scripting:{executeScript:vi.fn(async ()=>{if(!state.authorized)throw Error('no activeTab grant');return [{frameId:0,result:{url,title:'fixture',text:'ALPHA',truncated:false}}];})},
    sidePanel:{open:vi.fn(async ()=>{})},
  };
  const coordinator=createCoordinator(api as unknown as Platform,()=>state.time);
  const sender={id,url:api.runtime.getURL('sidepanel.html')};
  const request=(type='CAPTURE',tabId=1,contextUrl=url)=>({v:1,type,requestId:crypto.randomUUID(),context:{tabId,url:contextUrl}});
  const select=(text='ALPHA',frameId=0)=>coordinator.select({menuItemId:'phase0-selection',pageUrl:url,selectionText:text,frameId,editable:false},tabs.get(1)!);
  return {api,coordinator,state,store,tabs,sender,request,select,url};
}
describe('deterministic Chrome adapter tests (NOT native browser acceptance)',()=>{
  it('rejects webpage/content-script/external/wrong-page senders before any injection',async()=>{
    const h=harness();
    for(const sender of [{...h.sender,tab:h.tabs.get(1)},{...h.sender,id:'b'.repeat(32)},{...h.sender,url:'https://evil.example/'},{...h.sender,url:h.sender.url+'?forged=1'}])
      expect(await h.coordinator.handle(h.request(),sender)).toMatchObject({ok:false,code:'BAD_MESSAGE'});
    expect(h.api.scripting.executeScript).not.toHaveBeenCalled();
  });
  it('rejects unknown fields, restricted pages, missing and inactive tabs',async()=>{
    const h=harness();
    expect(await h.coordinator.handle({...h.request(),execute:'evil'},h.sender)).toMatchObject({code:'BAD_MESSAGE'});
    expect(await h.coordinator.handle(h.request('CAPTURE',1,'chrome://version/'),h.sender)).toMatchObject({code:'UNSUPPORTED_PAGE'});
    expect(await h.coordinator.handle(h.request('CAPTURE',1,'https://chromewebstore.google.com/detail/x'),h.sender)).toMatchObject({code:'UNSUPPORTED_PAGE'});
    expect(await h.coordinator.handle(h.request('CAPTURE',99),h.sender)).toMatchObject({code:'TAB_CHANGED'});
    expect(await h.coordinator.handle(h.request('CAPTURE',2,'https://other.example/'),h.sender)).toMatchObject({code:'TAB_CHANGED'});
    expect(h.api.scripting.executeScript).not.toHaveBeenCalled();
  });
  it('propagates permission failure without widening permissions or returning old data',async()=>{
    const h=harness();h.state.authorized=false;
    expect(await h.coordinator.handle(h.request(),h.sender)).toMatchObject({ok:false,code:'NEEDS_PERMISSION'});
    expect(h.api.scripting.executeScript).toHaveBeenCalledTimes(1);
  });
  it('captures bounded typed data and validates the same snapshot context',async()=>{
    const h=harness(); const result=await h.coordinator.handle(h.request(),h.sender);
    const snapshot=Snapshot.parse('data' in result ? result.data : undefined);
    expect(snapshot).toMatchObject({tabId:1,url:h.url,text:'ALPHA'});
    expect(await h.coordinator.handle({...h.request('CHECK_CONTEXT'),contextToken:snapshot.contextToken},h.sender)).toMatchObject({ok:true,data:{current:true}});
    h.coordinator.invalidate(1,10);
    expect(await h.coordinator.handle({...h.request('CHECK_CONTEXT'),contextToken:snapshot.contextToken},h.sender)).toMatchObject({code:'TAB_CHANGED'});
  });
  it.each(['switch-tab','same-url-reload','A-B-A','close-tab'])('discards delayed extraction after %s',async scenario=>{
    const h=harness(),gate=deferred<{frameId:number;result:{url:string;title:string;text:string;truncated:boolean}}[]>();
    h.api.scripting.executeScript.mockImplementationOnce(()=>gate.promise);
    const pending=h.coordinator.handle(h.request(),h.sender);
    await vi.waitFor(()=>expect(h.api.scripting.executeScript).toHaveBeenCalledOnce());
    if(scenario==='switch-tab')h.state.active=2;
    if(scenario==='same-url-reload')h.coordinator.invalidate(1,10);
    if(scenario==='A-B-A'){h.state.active=2;h.coordinator.invalidate(2,10);h.state.active=1;h.coordinator.invalidate(1,10);}
    if(scenario==='close-tab')h.tabs.delete(1);
    gate.resolve([{frameId:0,result:{url:h.url,title:'old',text:'OLD',truncated:false}}]);
    expect(await pending).toMatchObject({ok:false,code:'TAB_CHANGED'});
  });
  it('does not classify malformed extraction as a permission problem',async()=>{
    const h=harness();h.api.scripting.executeScript.mockResolvedValueOnce([{frameId:0,result:{url:h.url,title:'x',text:'x'.repeat(6001),truncated:false}}]);
    expect(await h.coordinator.handle(h.request(),h.sender)).toMatchObject({code:'BAD_MESSAGE'});
    h.api.scripting.executeScript.mockResolvedValueOnce([{frameId:0,result:{url:h.url,title:'x',text:' ',truncated:false}}]);
    expect(await h.coordinator.handle(h.request(),h.sender)).toMatchObject({code:'NO_CONTENT'});
  });
  it('opens synchronously and consumes a selection once under concurrent takes',async()=>{
    const h=harness();const pending=h.select();expect(h.api.sidePanel.open).toHaveBeenCalledOnce();await pending;
    const results=await Promise.all([h.coordinator.handle(h.request('TAKE_SELECTION'),h.sender),h.coordinator.handle(h.request('TAKE_SELECTION'),h.sender)]);
    expect(results.filter(r=>r.ok)).toHaveLength(1);expect(results.filter(r=>'code' in r&&r.code==='NO_SELECTION')).toHaveLength(1);
  });
  it.each([['empty','',0],['long','x'.repeat(2001),0],['iframe','subframe text',2]] as const)('invalid %s selection replaces old pending data',async(_label,text,frame)=>{
    const h=harness();await h.select('OLD');await h.select(text,frame);
    expect(await h.coordinator.handle(h.request('TAKE_SELECTION'),h.sender)).toMatchObject({ok:false,code:'NO_SELECTION'});
  });
  it.each([[59999,true],[60000,false],[-1,false]] as const)('enforces TTL with age=%i',async(age,ok)=>{
    const h=harness();await h.select();h.state.time+=age;
    expect(await h.coordinator.handle(h.request('TAKE_SELECTION'),h.sender)).toMatchObject({ok});
  });
  it('uses event time before async storage work, not the later completion time',async()=>{
    const h=harness(),gate=deferred<void>();h.api.storage.session.remove.mockImplementationOnce(()=>gate.promise);
    const pending=h.select();await vi.waitFor(()=>expect(h.api.storage.session.remove).toHaveBeenCalled());h.state.time+=60001;gate.resolve();await pending;
    expect(await h.coordinator.handle(h.request('TAKE_SELECTION'),h.sender)).toMatchObject({ok:false});
  });
  it('keeps the latest rapid selection and rejects late publication after navigation',async()=>{
    const h=harness();await Promise.all([h.select('FIRST'),h.select('SECOND')]);
    expect(await h.coordinator.handle(h.request('TAKE_SELECTION'),h.sender)).toMatchObject({ok:true,data:{text:'SECOND'}});
    const gate=deferred<void>();h.api.storage.session.remove.mockImplementationOnce(()=>gate.promise);
    const pending=h.select('STALE');await vi.waitFor(()=>expect(h.api.sidePanel.open).toHaveBeenCalledTimes(3));h.coordinator.invalidate(1,10);gate.resolve();await pending;
    expect(await h.coordinator.handle(h.request('TAKE_SELECTION'),h.sender)).toMatchObject({ok:false});
  });
  it('preserves valid session selections across worker restart and unrelated background navigation',async()=>{
    const h=harness();await h.select();h.coordinator.invalidate(2,10,false);
    expect(await h.coordinator.handle(h.request('TAKE_SELECTION'),h.sender)).toMatchObject({ok:true});
    await h.select();const restarted=createCoordinator(h.api as unknown as Platform,()=>h.state.time);
    expect(await restarted.handle(h.request('TAKE_SELECTION'),h.sender)).toMatchObject({ok:true,data:{text:'ALPHA'}});
  });
  it('preserves a captured snapshot across worker sleep/restart when the page has not changed',async()=>{
    const h=harness();const result=await h.coordinator.handle(h.request(),h.sender);
    const snapshot=Snapshot.parse('data' in result?result.data:undefined);
    const restarted=createCoordinator(h.api as unknown as Platform,()=>h.state.time);
    expect(await restarted.handle({...h.request('CHECK_CONTEXT'),contextToken:snapshot.contextToken},h.sender)).toMatchObject({ok:true,data:{current:true}});
  });
  it('persists actual navigation invalidation across another worker restart',async()=>{
    const h=harness();const result=await h.coordinator.handle(h.request(),h.sender);
    const snapshot=Snapshot.parse('data' in result?result.data:undefined);
    const restarted=createCoordinator(h.api as unknown as Platform,()=>h.state.time);
    restarted.invalidate(1,10);
    const request={...h.request('CHECK_CONTEXT'),contextToken:snapshot.contextToken};
    expect(await restarted.handle(request,h.sender)).toMatchObject({ok:false,code:'TAB_CHANGED'});
    const again=createCoordinator(h.api as unknown as Platform,()=>h.state.time);
    expect(await again.handle(request,h.sender)).toMatchObject({ok:false,code:'TAB_CHANGED'});
  });
  it('does not extend selection expiry when the worker restarts',async()=>{
    const h=harness();await h.select();h.state.time+=60001;
    const restarted=createCoordinator(h.api as unknown as Platform,()=>h.state.time);
    expect(await restarted.handle(h.request('TAKE_SELECTION'),h.sender)).toMatchObject({ok:false,code:'TAB_CHANGED'});
  });
});
