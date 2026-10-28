/** 教学简化模型。不是 DeepSeek Harness 实现或兼容 API。零依赖、无文件/网络/模型操作。 */
export function classifyResponsibilities() {
  return {propose:'model',execute:'runtime',record:'runtime',approve:'trusted policy/user channel'}
}
export function composeRows(rows, patches) {
  const copy=structuredClone(rows), warnings=[]
  for (const p of patches) {
    const row=copy.find(r=>r.id===p.id)
    if (!row) { warnings.push(`missing:${p.id}`); continue }
    if (p.config!==undefined) row.config=structuredClone(p.config)
  }
  return {rows:copy,warnings} // 仅示范整 config 替换；不实现官方 group/insert/!!js。
}
export function wrap(listeners, fallback) {
  let index=0
  const next=()=>{const fn=listeners[index++]; return fn ? fn(next) : fallback()}
  return next()
}
export class MemoryRegistry {
  #items=new Map()
  register(name,fn) {
    if(this.#items.has(name)) throw Error('duplicate')
    this.#items.set(name,fn)
    let active=true
    return ()=>{if(active){active=false;this.#items.delete(name)}}
  }
  call(name,value) {const fn=this.#items.get(name);if(!fn)throw Error('hidden/unknown');return fn(value)}
  names(){return [...this.#items.keys()]}
}
export function countWordsPlugin(registry) {
  return registry.register('count_words',text=>{
    if(typeof text!=='string')throw Error('type')
    // 本实验定义“词”为连续非空白片段，不声称中文自然语言分词。
    return text.trim()?text.trim().split(/\s+/u).length:0
  })
}
export function visibleTools(global,local,deny=[]) {
  const names=new Set(global.filter(n=>!deny.includes(n)))
  local.forEach(n=>names.add(n))
  return [...names].sort() // 只有全局+自有两层；真实继承链须读源码。
}
export async function boundedLoop({responses=[],reject=false,empty=false,failOnce=false,maxSteps=3,cancelAt}={}) {
  const events=['turn/start'], calls={model:0,tools:0}, messages=[]
  if(reject||empty) return {events:[...events,`turn/end:${reject?'blocked':'completed'}`],calls,messages}
  messages.push('user:fixture')
  for(let step=1;step<=maxSteps;step++) {
    events.push('step/start')
    if(cancelAt===step) {events.push('step/end','turn/end:aborted');return {events,calls,messages}}
    calls.model++
    if(failOnce&&step===1) {events.push('attempt:error','retry');calls.model++}
    const r=responses[step-1]??'done'
    if(r==='partial-json') {events.push('attempt:error','step/end','turn/end:error');return {events,calls,messages}}
    if(r==='tool') {calls.tools++;events.push('tool/call','tool/result','step/end');continue}
    events.push('assistant/message','step/end','turn/end:completed');return {events,calls,messages}
  }
  events.push('turn/end:budget')
  return {events,calls,messages}
}
export function oneUseCall(config,dispatch) {
  const expected=JSON.stringify(config);let used=false
  return supplied=>{
    if(used||JSON.stringify(supplied)!==expected)throw Error('INVALID_PREPARED_CALL')
    used=true;return dispatch(supplied)
  } // 教学模型仅处理测试 fixture 的稳定 key 顺序，非通用 config 等价算法。
}
export function replayStateFor(message,owner,target) {
  const m=structuredClone(message)
  if(owner!==target)delete m.source.replayState
  return m
}
export async function pipeline({name='read',registered=['read'],pre='allow',approval='unavailable',guard=false,throwBody=false,postBlock=false,signal}={}) {
  const trace=[],counts={body:0}
  const done=(error,text)=>({trace,counts,result:Object.freeze({isError:error,text})})
  if(!registered.includes(name))return done(true,'unknown')
  if(signal?.aborted)return done(true,'aborted-before-body')
  trace.push('pre')
  if(pre==='deny')return done(true,'denied')
  if(pre==='ask') {trace.push('approval');if(approval!=='allowed-once')return done(true,'approval-denied')}
  trace.push('guard')
  if(guard)return done(true,'guard-denied')
  if(signal?.aborted)return done(true,'aborted-before-body')
  trace.push('body');counts.body++
  const bodyError=throwBody
  trace.push('post')
  return done(bodyError||postBlock,bodyError?'body-error':postBlock?'post-block':'ok')
  // 此模型省略 batch、project/finalize 和工具错误细分类；详见 H14。
}
export function foldLog(events) {
  const messages=new Map(); let factCount=0
  for(let i=0;i<events.length;i++) {
    const e=events[i];if(e.seq!==i)throw Error('sequence gap')
    factCount++
    if(e.type==='message/add')messages.set(e.seq,e.data.text)
    if(e.type==='view/replace') {e.data.targets.forEach(n=>messages.delete(n));messages.set(e.seq,e.data.text)}
  }
  return {factCount,messages:[...messages.values()]}
}
export function forkLog(events,cut) {
  if(!Number.isInteger(cut)||cut<0||cut>events.length)throw Error('cut')
  return structuredClone(events.slice(0,cut)) // 只示范前缀，不实现官方 seed marker/closer。
}
export function mayRetry(outcome) {return outcome==='read-only-known' || outcome==='business-idempotent'}
export function compactComparison(texts,summary,required) {
  const variants={full:texts.join(' '),pruned:texts.map(t=>t.slice(0,24)).join(' '),summary}
  return Object.fromEntries(Object.entries(variants).map(([k,v])=>[k,{characters:v.length,facts:required.filter(f=>v.includes(f)).length}]))
}
export class ChildTasks {
  #open=true;#children=new Map();notifications=[]
  start(id,delivery='parent') {if(!this.#open)throw Error('closed');if(this.#children.has(id))throw Error('duplicate');this.#children.set(id,{delivery,status:'running'})}
  settle(id) {const c=this.#children.get(id);if(!c)throw Error('unknown');if(c.status!=='running')return;c.status='completed';if(c.delivery==='parent')this.notifications.push(id)}
  cancel() {this.#open=false;for(const c of this.#children.values())if(c.status==='running')c.status='cancelled'}
  statuses(){return [...this.#children.values()].map(c=>c.status)}
}
export class GenerationBridge {
  generation=0;tools=[]
  begin(){return ++this.generation}
  publish(g,tools,ok=true){if(g!==this.generation||!ok)return false;this.tools=[...tools];return true}
  dispose(){this.generation++;this.tools=[]}
}
export function deliverDue(schedule,now,seen) {
  if(schedule.at>now||seen.has(schedule.id))return []
  seen.add(schedule.id);return [schedule.message] // 教学虚拟时钟，不是分布式 scheduler。
}
export function canvasAction(state,signal) {
  if(signal.aborted)return state
  return {...state,clicks:state.clicks+1}
}
export function topo(graph) {
  const done=new Set(),visiting=new Set(),order=[]
  function visit(n){if(done.has(n))return;if(visiting.has(n))throw Error('cycle');if(!Object.hasOwn(graph,n))throw Error('missing artifact');visiting.add(n);graph[n].forEach(visit);visiting.delete(n);done.add(n);order.push(n)}
  Object.keys(graph).forEach(visit);return order
}
