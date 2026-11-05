import {createServer} from 'node:http';
import {createServer as netServer} from 'node:net';
import {spawn} from 'node:child_process';
import {writeFile,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),scratch=await mkdtemp(resolve(tmpdir(),'aifoundry-h24-p1-native-'));
const code=`import {createServer,get} from 'node:http';
const mode=process.argv[2],url=process.argv[3];
process.on('exit',c=>{process.stderr.write('EXIT_EVENT '+JSON.stringify({pid:process.pid,code:c})+'\\n')});
if(mode.startsWith('fetch')){const r=await fetch(url);if(await r.text()!=='fixture')throw Error('bad body');}
if(mode==='request-exit'){await new Promise((ok,bad)=>get(url,r=>{r.resume();r.on('end',ok)}).on('error',bad));}
if(mode==='listener-exit'){const s=createServer((_q,r)=>r.end('owned'));await new Promise(r=>s.listen(0,'127.0.0.1',r));await new Promise(r=>s.close(r));}
if(mode==='redirect-exit'){const s=createServer((_q,r)=>{r.writeHead(302,{Location:'/'});r.end()});await new Promise(r=>s.listen(0,'127.0.0.1',r));try{await fetch('http://127.0.0.1:'+s.address().port+'/')}catch{console.log('controlled redirect limit reached')}await new Promise(r=>{s.close(r);s.closeAllConnections()});}
console.log(JSON.stringify({pid:process.pid,mode,node:process.version,workComplete:true}));
if(mode==='fetch-natural')process.exitCode=0;else process.exit(0);
`;
const bin=resolve(scratch,'minimum.mjs');await writeFile(bin,code);
const server=createServer((_q,r)=>r.end('fixture')),sockets=new Set();server.on('connection',s=>{sockets.add(s);s.on('close',()=>sockets.delete(s))});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port,env=Object.fromEntries(['SystemRoot','WINDIR','TEMP','TMP','PATH','PATHEXT'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]])),rows=[];
try{
 for(const node of [process.execPath,process.env.H24_P1_NODE_ALT??'C:/Users/QYF/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'])for(const mode of ['plain-exit','listener-exit','request-exit','fetch-exit','fetch-natural','redirect-exit'])for(let repeat=1;repeat<=3;repeat++){
  const row=await new Promise((ok,bad)=>{const args=[bin,mode,`http://127.0.0.1:${port}/`],child=spawn(node,args,{cwd:scratch,env,stdio:['ignore','pipe','pipe']});let stdout='',stderr='',forced=false;const timer=setTimeout(()=>{forced=true;child.kill('SIGKILL')},8000);child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);child.on('error',bad);child.on('close',(exit,signal)=>{clearTimeout(timer);ok({node,args,cwd:scratch,envNames:Object.keys(env),pid:child.pid,mode,repeat,exit,signal,forced,stdout,stderr,assertion:stderr.includes('UV_HANDLE_CLOSING')})});});rows.push(row);console.log(JSON.stringify({mode,repeat,exit:row.exit,node,assertion:row.assertion,forced:row.forced}));
 }
}finally{await new Promise(r=>{server.close(r);server.closeAllConnections()});}
const verify=netServer();await new Promise((ok,bad)=>{verify.once('error',bad);verify.listen(port,'127.0.0.1',ok)});await new Promise(r=>verify.close(r));
const result={scratch,kind:'Node builtins only; no Harness, tsx, execa, koffi, npm packages or secrets',listener:{port,closed:true,rebound:true,remainingSockets:sockets.size},rows};await writeFile(resolve(root,`evidence/native-minimum-${Date.now()}.json`),JSON.stringify(result,null,2)+'\n');
