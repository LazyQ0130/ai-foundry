// Builtins only. The HTTP listener and all its connections close BEFORE exit.
import {createServer} from 'node:http';
process.on('exit',code=>process.stderr.write(`EXIT_EVENT pid=${process.pid} requested=${code}\n`));
const server=createServer((_request,response)=>{response.writeHead(302,{Location:'/'});response.end();});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
try{await fetch(`http://127.0.0.1:${port}/`);}catch{process.stdout.write('controlled redirect limit reached\n');}
await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
process.stdout.write(JSON.stringify({pid:process.pid,node:process.version,port,listenerClosed:true})+'\n');
process.exit(0);
