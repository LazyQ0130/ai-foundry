import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {platform,release,arch,cpus,totalmem} from 'node:os';
const root=fileURLToPath(new URL('../',import.meta.url)),e=resolve(root,'evidence');
const caches=['h04-probe-deps','h09-probe-deps','module-four-probe-deps','h18-persistence-deps','h22-ptc-deps','h23-wire-deps','h24-fixed-test-deps','h24-http-deps'];
for(const name of caches){const dir=resolve(e,'dependency-manifests',name);await mkdir(dir,{recursive:true});for(const file of ['package.json','package-lock.json'])await copyFile(resolve('C:/Users/QYF/.codex/research',name,file),resolve(dir,file));}
const runtime=process.env.AIFOUNDRY_QA_NODE_MODULES??'C:/Users/QYF/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=createRequire(import.meta.url)(resolve(runtime,'playwright'));
const browser=await chromium.launch({headless:true,executablePath:process.env.AIFOUNDRY_QA_CHROME??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
let browserVersion;try{browserVersion=browser.version();}finally{await browser.close();}
await writeFile(resolve(e,'environment.json'),JSON.stringify({node:process.version,platform:platform(),release:release(),arch:arch(),cpu:cpus()[0].model,logicalCpus:cpus().length,totalMemoryBytes:totalmem(),authorRendererBrowser:{engine:'Chrome/Chromium',version:browserVersion,scope:'LessonMarkdown author fixture only, not Harness product Web'},shippedApplication:{status:'NOT_RUN',reason:'full fixed repository dependencies, native/build outputs and legal cleanup strategy not prepared; availability of author Chrome does not supply these product prerequisites'},performance:{status:'NOT_RUN',meaning:'environment identity only, not benchmark or cost results'},dependencyManifests:caches},null,2)+'\n');
console.log('Environment identity and eight unchanged dependency lock copies saved');
