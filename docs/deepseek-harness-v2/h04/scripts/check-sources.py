"""H04 固定 Git blob/行范围/语义索引，关联实际辅助探针与 AST；不以匹配单词证明行为。"""
from pathlib import Path
import hashlib,json,os,re,subprocess
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parents[2]
COMMIT='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
lock=json.loads((ROOT.parent/'evidence/source-lock.json').read_text(encoding='utf-8-sig'))
CACHE=Path(os.environ.get('HARNESS_SOURCE_CACHE',lock['sourceCache']));GIT=Path(os.environ.get('HARNESS_GIT_CACHE',str(CACHE.parents[1]/'deepseek-harness-f3803c9')))
tree={}
for row in subprocess.check_output(['git','-C',str(GIT),'ls-tree','-r','-z',COMMIT]).split(b'\0'):
 if row:
  meta,path=row.split(b'\t',1);tree[path.decode()]=meta.split()[2].decode()
checked={}
def check(f):
 if f in checked:return checked[f]
 data=(CACHE/f).read_bytes();blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest();assert tree[f]==blob,f
 checked[f]={'path':f,'gitBlob':blob,'sha256':hashlib.sha256(data).hexdigest(),'lines':data.decode('utf8').splitlines()};return checked[f]
lesson=REPO/'course-content/internal/deepseek-harness/h04/lesson.md';text=lesson.read_text(encoding='utf8');assert '__H04' not in text and 'LOCKED/' not in text
refs=[]
for url in sorted(set(re.findall(r'https://github\.com/deepseek-ai/deepseek-harness/blob/[^\s)]+',text))):
 m=re.fullmatch(r'https://github\.com/deepseek-ai/deepseek-harness/blob/([a-f0-9]{40})/(.+)#L(\d+)-L(\d+)',url);assert m,url
 commit,f,a,b=m.groups();a,b=int(a),int(b);assert commit==COMMIT
 c=check(f);assert 1<=a<=b<=len(c['lines']),(url,len(c['lines']))
 refs.append({'url':url,'path':f,'start':a,'end':b,'sha256':c['sha256'],'gitBlob':c['gitBlob'],'excerpt':c['lines'][a-1:b],'status':'STATIC_VERIFIED'})
B='packages/boot/app-boot/';C='apps/cli/';U='packages/util/';P='packages/bundle/'
raw=[
 ('S01','dsh 分派到具名 profile/其他模式，不是五个独立 bin',C+'src/bin.ts',26,69,'switch (invocation.mode)',C+'tests/args.spec.ts',24,57),
 ('S02','模板四种 base-backed；minimal 独立',U+'official-bundles/src/bundles.ts',10,25,"'sdk-minimal'",P+'sdk-minimal/tests/sdk-minimal.spec.ts',1,65),
 ('S03','正常环境加载嵌在 runProfile 参数；dump 另分支',C+'src/bin.ts',31,69,"loadLayeredEnv('dsh')",None,0,0),
 ('S04','启动器第一未知 token 后全部交应用',C+'src/args.ts',146,185,'.passThroughOptions()',C+'tests/args.spec.ts',35,57),
 ('S05','dump 互斥、拒绝应用参数；默认 dump 拒绝 patch',C+'src/args.ts',111,135,'config dumps take no app arguments',C+'tests/args.spec.ts',158,178),
 ('S06','desktop 为 Electron 保留，普通名字不在解析阶段查目录',C+'src/args.ts',78,87,'managed exclusively',C+'tests/args.spec.ts',217,249),
 ('S07','应用共享不可变参数快照', 'packages/boot/cmdline/src/index.ts',84,89,'Object.freeze', 'packages/boot/cmdline/tests/cmdline.spec.ts',223,230),
 ('S08','Home 不等于工作区；显式 helper 参数/进程DSH_HOME/默认',U+'home-paths/src/index.ts',125,136,'resolveDshHome',None,0,0),
 ('S09','Profile 名不能变成路径穿越',B+'src/profile.ts',165,172,'node_modules',B+'tests/profile.spec.ts',192,198),
 ('S10','只有随附模板自动初始化，未知自定义配置报错',B+'src/profile.ts',728,744,'PROFILE_TEMPLATES[name]',B+'tests/profile.spec.ts',357,366),
 ('S11','组合包从安装锚点优先解析，再看 profile',B+'src/profile.ts',639,661,'[installAnchor, join(profileDir',B+'tests/profile.spec.ts',257,267),
 ('S12','不可读/平台/版本问题可跳过 bundle并报告；非全局一律致命',B+'src/profile.ts',678,712,'skippedBundles.push',B+'tests/profile.spec.ts',79,111),
 ('S13','Profile空根每次重写；用户应改patch',C+'src/profile-boot.ts',179,199,'writeFileSync',None,0,0),
 ('S14','proxy安装先于composeProfile',C+'src/profile-boot.ts',271,295,'installProxyFromEnvironment',None,0,0),
 ('S15','主机准备中提供上下文/环境/参数，之后才挂配置条目',C+'src/profile-boot.ts',313,345,'provideCmdline',B+'tests/app-boot.spec.ts',1003,1019),
 ('S16','boot先准备宿主再挂根树，等待与激活审查',B+'src/index.ts',1203,1244,'await prepare?.(ctx)',B+'tests/app-boot.spec.ts',1003,1019),
 ('S17','required失败致命，optional失败可警告',B+'src/index.ts',1156,1200,'required',B+'tests/app-boot.spec.ts',1091,1212),
 ('S18','启动环境process>project-env>user-env；Home先解析',B+'src/index.ts',236,256,'const home = resolveDshHome()',B+'tests/app-boot.spec.ts',107,137),
 ('S19','两文件先检查、后物化；禁止名即使被遮住仍拒绝',B+'src/index.ts',191,256,'only the launching environment may set',B+'tests/app-boot.spec.ts',139,159),
 ('S20','Home文件可代理例外，project仍拒绝，CA/TLS不例外',B+'src/index.ts',133,178,'HOME_LAYER_PROXY_NAMES',B+'tests/app-boot.spec.ts',167,223),
 ('S21','启动快照保留来源，后续 chdir 不重读',U+'launch-environment/src/index.ts',31,103,'bySource',None,0,0),
 ('S22','Bundle/Profile/Home/CLI层顺序，加专门遥测关闭处理',B+'src/profile-context.ts',74,84,'...context.overlays',B+'tests/profile.spec.ts',201,226),
 ('S23','dump默认省略全部用户层；完整dump含home与argv',C+'src/dump-config.ts',51,74,'if (!defaultOnly)',B+'tests/config-dump.spec.ts',48,101),
 ('S24','dump可准备Profile，不挂应用且表达式不求值',C+'src/dump-config.ts',32,42,'prepareProfile',B+'tests/config-dump.spec.ts',70,100),
 ('S25','受管凭据优先于继承，再dotenv，独立于普通环境','packages/credentials/credentials-local/src/index.ts',624,631,'this.values.get(ref)','packages/credentials/credentials-local/tests/local.spec.ts',79,87),
 ('S26','headless关闭交互凭据和HMR',P+'headless/cordis.patch.yml',35,46,'disabled: true',None,0,0),
 ('S27','base配置HMR启用而模块root为空；Web未停用此项',P+'base/cordis.patch.yml',27,32,'root: []',None,0,0),
 ('S28','HMR监视manifest及profile/home两个patch，不是全部输入','packages/boot/hmr/src/index.ts',384,407,'patchFiles',None,0,0),
 ('S29','SDK/ACP禁用hmr，minimal树独立',P+'sdk-app/cordis.patch.yml',23,24,'disabled: true',None,0,0),
 ('S30','SDK实际JsonRpcLineTransport接stdin/stdout','packages/sdk/server/src/index.ts',45,64,'JsonRpcLineTransport',None,0,0),
 ('S31','ACP实际ndJsonStream接stdin/stdout','packages/acp/acp/src/index.ts',374,384,'ndJsonStream',None,0,0),
 ('S32','minimal明示danger-full-access，并非低权限',P+'sdk-minimal/cordis.patch.yml',70,74,'danger-full-access',P+'sdk-minimal/tests/sdk-minimal.spec.ts',1,65),
 ('S33','SDK应用启动提供方处理EOF',P+'sdk-app/src/index.ts',55,61,'exitOnStdinEnd',None,0,0),
 ('S34','ACP应用启动提供方处理EOF',P+'acp-app/src/index.ts',41,47,'exitOnStdinEnd',None,0,0),
 ('S35','Web端口来自应用服务表达式；替掉表达式会失去这层关系',P+'web-app/cordis.patch.yml',171,177,'ctx.webStartup.port', 'packages/boot/cmdline/tests/cmdline.spec.ts',166,175),
 ('S36','Node/pnpm工具链固定，不由最小教学实验要求替代','package.json',1,10,'pnpm@11.28.5',None,0,0),
 ('S37','自定义profile重置会替换原依赖与patch，不作为恢复建议',C+'src/profile-boot.ts',90,107,'deleted',None,0,0),
 ('S38','base默认不在启动时创建Agent实例',P+'base/cordis.patch.yml',511,516,'agents: []',None,0,0),
 ('S39','未审计实验性预览，Profile选择不证明安全','SAFETY.zh.md',5,15,'尚未接受安全审计',None,0,0),
 ('S40','base挂载平台Shell，默认策略不是只读',P+'base/cordis.patch.yml',244,296,'workspace-write',None,0,0),
]
claims=[]
for cid,claim,f,a,b,needle,test,ta,tb in raw:
 c=check(f);assert needle in '\n'.join(c['lines'][a-1:b]),(cid,needle)
 item={'id':cid,'claim':claim,'commit':COMMIT,'path':f,'start':a,'end':b,'url':f'https://github.com/deepseek-ai/deepseek-harness/blob/{COMMIT}/{f}#L{a}-L{b}','status':'STATIC_SEMANTIC_REVIEWED','test':None}
 if test:
  t=check(test);assert 1<=ta<=tb<=len(t['lines']);item['test']={'path':test,'start':ta,'end':tb,'excerpt':t['lines'][ta-1:tb],'execution':'SELECTED_READING_NOT_FULL_SUITE'}
 claims.append(item)
flow=json.loads((ROOT/'evidence/control-flow.json').read_text(encoding='utf8'));actual=json.loads((ROOT/'evidence/actual-probes.json').read_text(encoding='utf8'))
assert len(flow['checks'])==5 and len(actual['checks'])==10 and actual['status']=='PASS'
for f in flow['files']+actual['files']:assert f['sha256']==check(f['path'])['sha256']
deps=json.loads((ROOT/'evidence/probe-dependencies.json').read_text(encoding='utf8'));upstream='\n'.join(check('pnpm-lock.yaml')['lines'])
for p in deps['packages']:assert p['integrity'] in upstream,p
fixture=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {reference} from './course-content/internal/deepseek-harness/h04/lab/launch-lab.mjs';console.log(JSON.stringify(reference))"],cwd=REPO).decode())
for item in fixture['A'].values():
 check(item['entry']);check(item['app'])
 for package in item['bundles']:assert package in '\n'.join(check(U+'official-bundles/src/bundles.ts')['lines'])
report={'status':'STATIC_VERIFIED_WITH_HELPER_PROBES','commit':COMMIT,'lessonSha256':hashlib.sha256(lesson.read_bytes()).hexdigest(),'references':refs,'claims':claims,'files':[{k:v for k,v in c.items() if k!='lines'} for c in checked.values()],'astStructureChecks':5,'actualHelperProbes':10,'officialSuite':'NOT_RUN; selected setup/action/assertions read','differences':['CLI reference credential summary conflicts with managed-first implementation/test','profile bundle load can skip and warn; required activation and optional warnings differ','config dump omits app flag evaluation and additional runtime telemetry hard-disable patch'],'limit':'Anchors alone do not prove behavior. See manual branch review, actual helpers and selected official assertions. Full boot, real networks/models, HMR filesystem delivery not run.'}
(ROOT/'evidence/source-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps({'status':report['status'],'references':len(refs),'claims':len(claims),'files':len(checked),'actualHelperProbes':10},ensure_ascii=False))
