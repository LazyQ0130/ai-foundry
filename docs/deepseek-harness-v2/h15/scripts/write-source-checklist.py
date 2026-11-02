"""固定源码事实清单。字符串/range核验不是自动语义或安全证明。"""
from pathlib import Path
import json,re,hashlib
R=Path(__file__).resolve().parents[1];P=R.parents[2];lock=json.loads((R/'evidence/source-lock.json').read_text(encoding='utf-8'));S=Path(lock['sourceCache']);C=lock['commit']
A='packages/interaction/user-approval/src/index.ts';AT='packages/interaction/user-approval/tests/approval.spec.ts';F='packages/fs/fs-observation-policy/src/index.ts';FT='packages/fs/fs-observation-policy/tests/policy.spec.ts';B='packages/core/tools/src/pipeline.ts';BT='packages/core/agent-loop/tests/tool-calls.spec.ts';Q='packages/sandbox/sandbox-policy/src/index.ts';QT='packages/sandbox/sandbox-policy/tests/policy.spec.ts';N='packages/sandbox/sandbox-local/src/index.ts';NT='packages/sandbox/sandbox-local/tests/local.spec.ts';X='packages/fs/fs-sandbox/src/index.ts';XT='packages/fs/fs-sandbox/tests/fs-sandbox.spec.ts';L='packages/fs/fs-local/src/index.ts';LT='packages/fs/fs-local/tests/filesystem.spec.ts';E='packages/sandbox/sandbox/src/escalation.ts';RT='packages/sandbox/sandbox-local/tests/extra-roots.ts';ROOTS='packages/sandbox/sandbox/src/roots.ts'
# id,事实,文件,函数/接口,定位片段,原始证据,最高已运行等级,官方测试（仅静态参考）
rows=[
('S01','实验软件尚未安全审计；本课不升级其保证','SAFETY.zh.md','实验性状态',['尚未接受安全审计'],'static','STATIC',None),
('S02','minimal Profile不意味着最小文件权限','packages/bundle/sdk-minimal/cordis.patch.yml','sandbox-policy',['danger-full-access'],'static','STATIC',None),
('S03','Pipeline最终ask才调审批，缺服务/Agent拒绝',B,'serviceAsk',['const approval = this.ctx.get(\'approval\')','const outcome = await approval.request({'],'B_ask-missing / B_ask-allow','D',BT),
('S04','闭合policy；取消先于never，应答者不能绕过never',A,'ApprovalPolicy / decide',["export type ApprovalPolicy = 'ask' | 'never'","if (signal?.aborted) return 'cancelled'","if (this.effectivePolicy(session) === 'never') return 'rejected'"],'A_never / A_pre-abort / C deployment never','C',AT),
('S05','应答Waterfall路由、缺失、同步异步异常和非法结果失败关闭',A,'decide',["scopeTarget(req.agent, req.agent), 'approval/request', req","outcome => OUTCOMES.includes(outcome) ? outcome : 'unavailable'"],'A_missing / A_throw-sync / A_throw-async / A_invalid / A_delegate','C',AT),
('S06','Turn前提与正常审计配对；提交前故障不返回grant',A,'request',['if (!this.approvalStateOf(session).turnOpen)',"session.append('approval/asked'","session.append('approval/decided', { id, outcome })"],'A_idle / A_closed / A_audit-fail','C',AT),
('S07','审批ID服务生成；callId关联调用，不传req.id',A,'ApprovalRequest / request',['export interface ApprovalRequest extends ApprovalRequestEvent','const id = ApprovalRequestId(randomUUID())','...req.callId !== undefined ? { callId: req.callId } : {}'],'A_allow / repeated-approval-audit','C',AT),
('S08','取消先结算，迟到答案为settled Promise no-op',A,'decide',["resolve('cancelled')",'resolve(outcome)'],'A_late；提交后观察失败仅静态','C',AT),
('S09','会话override优先配置；effectivePolicy在实现中private',A,'effectivePolicy / overrideOf',['private effectivePolicy(session: Session)','return this.overrideOf(session) ?? this.config.policy ?? \'ask\''],'A_policy / C deployment never；私有诊断','C',AT),
('S10','运行时policy上下文与setPolicy切换说明分工',A,'Service.init / setPolicy',["name: 'approval:policy'",'setPolicy(agent: Agent, policy: ApprovalPolicy)','agent.inject(createUserMessage({'],'A_policy；setPolicy仅静态','C',AT),
('S11','pre决策、ask解析后仅allow检查guard',B,'prepare',["const gate = await this.ctx.waterfall(",'? await this.serviceAsk(exec, gate)',"decision.kind === 'allow' ? this.tools.checkGuards(exec)"],'B_override-deny / B_override-guard / B_approved-guard','D',BT),
('S12','最终观察与Session提交是两种事件，日志需单独接线',B,'notifyResult',["'tools/result'"],'B_*；Session tool/result沿H14，非本轮集成','D',BT),
('S13','三种mode只定义文件效果；danger绕过','packages/sandbox/sandbox/src/index.ts','SandboxMode',['export type SandboxMode','Network','danger-full-access'],'static + C policy（不执行danger）','STATIC',None),
('S14','逐调用覆盖 > Session > default',Q,'resolve',['mode: request.mode ?? (session === undefined ? undefined : this.overrideOf(session)) ?? this.defaultMode'],'C_policy','D',QT),
('S15','会话cwd胜过回退root，保留执行世界路径',Q,'resolve / constructor',['workspaceRoot: resolveWorkspaceRoot(session?.header.cwd ?? this.workspaceRoot)','this.workspaceRoot = resolveWorkspaceRoot(config.workspaceRoot ?? process.cwd())'],'C_policy','D',QT),
('S16','sandbox/mode持久事件；单次不写事件','packages/sandbox/sandbox-policy/src/session-mode.ts','setSandboxMode',["session.append('sandbox/mode', { mode })"],'C_policy aEvents / bEvents / replay','D',QT),
('S17','额外根严格物理目录校验，workspace仅canonicalPath',ROOTS,'additionalRoot / workspaceWritableRoots',['physical = realpathSync.native(path)',"if (!directory) throw new SandboxInvalidRootError",'canonicalPath(policy.workspaceRoot)'],'C_policy invalidRoot；链接/非目录未实测','D',RT),
('S18','workspace-write含临时区域；Windows不支持extra roots',ROOTS,'writableRoots',["canonicalPath('/tmp'), canonicalPath(tmpdir())"],'C_policy allWritable；Windows拒绝额外根静态','D',RT),
('S19','Provider返回argv/完整度/诊断，consumer spawn','packages/sandbox/sandbox/src/index.ts','SandboxProvider / ConfinedArgv',['export interface ConfinedArgv','abstract confine('],'C_policy reports（模拟探测）','D',NT),
('S20','平台链、单候选免仲裁、不可用拒绝',N,'chainVerdict / selectRunner',['const PLATFORM_CHAINS','if (rest.length === 0)','throw new SandboxUnavailableError(mode)'],'C_policy reports；原生未运行','D',NT),
('S21','Windows partial边界与两种授权生命周期',N,'STATIC_ENFORCEMENT / materializeAclGrant',["'windows-acl': 'partial'",'private readonly workspaceGrants','private readonly tempCapabilities'],'静态；C_policy windows-partial仅模拟argv','STATIC','packages/sandbox/sandbox-local/tests/acl-grants.spec.ts'),
('S22','bash消费者区分runner失败和策略拒绝，不静默裸跑','packages/shell/bash-sandbox/src/index.ts','SandboxBashExecutor.execute',['if (runnerFailure !== undefined)','throw new SandboxUnavailableError(mode, runnerFailure.detail)'],'仅静态，不执行Shell','STATIC',None),
('S23','观察插件无IO，按owner/target存状态',F,'ObservedStateGate',['private observed = new WeakMap<object, Map<string, FsObservation>>()','return (actor as FsObservationActor | undefined)?.agent?.session'],'D_files','D',FT),
('S24','未见/缺失write防护创建；edit分别拒绝',F,'writeIntent / editIntent',["? { kind: 'replaceIfVersion', version: prior.version }",": { kind: 'createIfAbsent' }","'FS_NOT_OBSERVED'","'FS_NOT_FOUND'"],'D_files create-unseen / missing-edit / same-create-cannot-overwrite','D',FT),
('S25','fs意图单槽且默认无guard，不是单调交集','packages/fs/fs/src/index.ts','Events',["'fs/edit-intent'","'fs/write-intent'",'Single-slot'],'D_files plugin-unloaded；错误抢槽仅静态','D',FT),
('S26','观察内存按对象身份，卸载清空并移除监听',F,'clear / apply',['this.observed = new WeakMap()','gate.clear()',"ctx.on('fs/observed'"],'D_files restored-same-id / remount-lost-state','D',FT),
('S27','bare可省略expected；受限fs替换local',X,'SandboxedFileSystem',['export class SandboxedFileSystem extends LocalFileSystem',"static inject = ['sandboxPolicy']"],'D_files','D',XT),
('S28','targetKey不透明；展示与process坐标分开','packages/fs/fs/src/types.ts','FsTarget',['export interface FsTarget','targetKey: FsTargetKey','displayPath: string'],'静态；D使用真实resolve不解析key','STATIC',LT),
('S29','mutation围栏按模式重新resolve并检查包含',X,'checkedTarget',["if (mode === 'danger-full-access')",'const fresh = await this.resolve(target.displayPath)','await isPathUnder(fresh.targetKey, root)'],'D_files read-only-denied；越界/别名攻击未运行','D',XT),
('S30','可信路径围栏，接受剩余祖先链接TOCTOU',X,'threat model',['NOT a kernel boundary','TOCTOU'],'静态威胁模型，未攻击验证','STATIC',XT),
('S31','local变更锁、版本检查、原子发布',L,'writeText / editText',['return this.withLock(target.targetKey',"existing.version !== expected.version",'await writeFileAtomic('],'D_files normal/stale/refresh + native Windows publication','D',LT),
('S32','相同mode无询问，严格扩大才需approver与agent',E,'approveEscalation',['if (mode === effectiveMode) return effectiveMode','WIDER_MODES[effectiveMode]','approval.approver === undefined','approval.agent === undefined'],'C_policy once / narrower / missingApprover','D',None),
('S33','工具消费者逐次解析，显式参数才发起升权','packages/shell/tool-bash/src/index.ts','execute / approveBashEscalation',['const approvedMode = args.sandbox_permissions !== undefined && args.justification !== undefined','await approveBashEscalation('],'静态，不运行Shell或完整工具消费者','STATIC',None),
('S34','文件consumer取得意图后传后端；非通用Pipeline阶段','packages/fs/tool-fs/src/edit.ts','file tool execution',["'fs/edit-intent'",'ctx.fs.editText('],'静态；D_files夹具consumer不同于tool-fs','STATIC',None),
('S35','确切四种ApprovalOutcome','packages/interaction/user-approval/src/types.ts','ApprovalOutcome',["'allowed-once' | 'rejected' | 'cancelled' | 'unavailable'"],'A_allow/reject/cancel-answer/unavailable','C',AT),
('S36','policy helper先验证再append',A,'setApprovalPolicy',['if (!APPROVAL_POLICIES.includes(policy))',"session.append('approval/policy', { policy })"],'静态；合法覆盖C已测','STATIC',AT),
('S37','审批state投影跟踪turn边界',A,'approvalStateDefinition',["case 'turn/start':","case 'turn/end':"],'A_idle/closed','C','packages/interaction/user-approval/tests/projection.spec.ts'),
('S38','mode只在workspace-write推导写根',ROOTS,'writableRoots',["if (policy.mode !== 'workspace-write') return []"],'C_policy roots','D',RT),
('S39','canonical失败保留原写法，非扩大fallback',ROOTS,'canonicalPath',['return realpathSync.native(path)','return path'],'静态；不伪装成extra验证','STATIC',RT),
('S40','full/partial只针对文件效果','packages/sandbox/sandbox/src/index.ts','SandboxEnforcement',["export type SandboxEnforcement = 'full' | 'partial'"],'C_policy reports只测报告','D',NT),
('S41','bwrap与Landlock探测分别返回完整度',N,'probeRunner',["case 'bwrap': {","case 'landlock': {",'return probe(this.landlockLauncher())'],'C_policy simulated full/partial','D',NT),
('S42','Windows额外根被明确拒绝',N,'windowsAclRunnerArgv',['Windows ACL confinement does not support additional writable directories'],'静态，原生未测','STATIC',NT),
('S43','pwsh危险模式绕过provider','packages/shell/pwsh-sandbox/src/index.ts','execute',["if (mode === 'danger-full-access')",'await super.execute(spec)'],'静态，不执行危险模式','STATIC',None),
('S44','失效版本先于literal匹配拒绝',L,'editText',["throw new FsError(`cannot edit",'const edited = applyLiteralEdit('],'D_files stale-edit','D',LT),
('S45','同provider target锁仅进程内串行',L,'withLock',['private async withLock'],'D_files顺序路径；并发证明未测','STATIC',LT),
('S46','本地版本源自stat身份和纳秒元数据','packages/fs/fs-local/src/fsio.ts','versionOf',['${info.dev}:${info.ino}:${info.size}:${info.mtimeNs}:${info.ctimeNs}'],'D_files opaque版本变化','D','packages/fs/fs-local/tests/fsio.spec.ts'),
('S47','createIfAbsent用不替换发布','packages/fs/fs-local/src/fsio.ts','writeFileAtomic',['await linkFile(tempPath, absolutePath)'],'D_files guarded-create','D','packages/fs/fs-local/tests/fsio.spec.ts'),
('S48','Windows发布使用实际DACL与ReplaceFileW','packages/fs/fs-local/src/win32.ts','copyFileDaclWin32 / replaceFileWin32',['export async function copyFileDaclWin32','export async function replaceFileWin32'],'D_files nativeFilePublication；无原语替身','D','packages/fs/fs-local/tests/win32.spec.ts'),
('S49','默认清理递归；本实验只替换清理钩子','packages/fs/fs-local/src/fsio.ts','writeFileAtomic',['const removeStagingDir = internals.removeStagingDir'],'D_files retainedDirectories；逐个明确文件','D','packages/fs/fs-local/tests/fsio.spec.ts'),
('S50','包含判断考虑Windows别名身份','packages/fs/fs-sandbox/src/containment.ts','isPathUnder',['if (isLexicallyUnder(path, root, caseSensitive)) return true','sameIdentity(ancestorInfo, rootInfo)'],'静态；未做别名或符号链接攻击','STATIC',XT),
('S51','扩大参数与理由配对，空理由拒绝',E,'validateEscalationArgs',['sandboxPermissions !== undefined && justification === undefined','justification.trim().length === 0'],'C_policy malformed（缺理由），其余静态','D',None),
('S52','严格更宽表不保留持久会话设置',E,'WIDER_MODES / approveEscalation',["'read-only': ['workspace-write', 'danger-full-access']","case 'allowed-once': return mode as SandboxMode"],'C_policy once / after / bEvents；不运行danger','D',None),
]
claims=[]
for id,fact,path,symbol,anchors,evidence,level,test in rows:
 data=(S/path).read_bytes();text=data.decode('utf-8');lines=text.splitlines();positions=[]
 for a in anchors:
  assert a in text,(id,path,a)
  positions.append(next(i+1 for i,line in enumerate(lines) if a in line))
 if test:assert (S/test).is_file(),(id,test)
 lo=max(1,min(positions)-2);hi=min(len(lines),max(positions)+6)
 claims.append({'id':id,'fact':fact,'path':path,'symbol':symbol,'start':lo,'end':hi,'anchors':anchors,'sourceSha256':hashlib.sha256(data).hexdigest(),'evidence':evidence,'level':level,'officialTest':test,'officialTestExecution':'NOT_RUN; selected static reference only','semanticReview':'author reviewed; fragment assertions and range validity are not a security proof'})
link=lambda c:f'[{c["symbol"]}]'+'(https://github.com/deepseek-ai/deepseek-harness/blob/'+C+'/'+c['path']+f'#L{c["start"]}-L{c["end"]})'
lesson=P/'course-content/internal/deepseek-harness/h15/lesson.md';body=lesson.read_text(encoding='utf-8')
for c in claims:body=body.replace('@@'+c['id']+'@@',link(c))
assert not re.search(r'@@S\d+@@',body);lesson.write_text(body,encoding='utf-8')
head='# H15 固定源码核对清单\n\nCommit `'+C+'`。52条作者语义核对，逐条验证缓存字节、定位片段及范围。STATIC不等于已运行；C/D最高级别只覆盖证据栏列出的分支，不能把一行中的其他平台静态事实升级成实测。官方测试只作静态参考，未执行上游完整测试。\n\n文档差异：approval.zh.md推荐调用effectivePolicy，但实现声明private；lab显式any诊断，不当公开API。蓝图的权限总链拆成实际消费者的条件组合；extra根严格验证不误套workspace根。\n\n| ID | 事实 / 函数 | 实际源码 | 本轮证据与等级 | 官方测试（未运行） |\n|---|---|---|---|---|\n'
for c in claims:
 test='—' if not c['officialTest'] else '['+c['officialTest']+'](https://github.com/deepseek-ai/deepseek-harness/blob/'+C+'/'+c['officialTest']+')'
 head+='| '+c['id']+' | '+c['fact']+' | '+link(c)+'<br>`'+c['path']+'` | '+c['level']+' · '+c['evidence']+' | '+test+' |\n'
(R/'source-checklist.md').write_text(head,encoding='utf-8');(R/'evidence/source-assertions.json').write_text(json.dumps(claims,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(f'PASS: {len(claims)} fixed source assertions')
