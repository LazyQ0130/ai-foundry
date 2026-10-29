from pathlib import Path
import json,os,re
R=Path(__file__).resolve().parents[1]
C='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
S=Path(os.environ.get('HARNESS_SOURCE_CACHE',r'C:\Users\QYF\.codex\research\harness-v2-source\deepseek-harness-'+C))
A='packages/core/agent/src/index.ts';L='packages/core/agent-loop/src/index.ts';D='packages/core/agent-loop/src/agent.ts';T='packages/core/agent/src/runtime-types.ts';SS='packages/core/session/src/index.ts';SC='packages/core/scope/src/index.ts'
AT='packages/core/agent/tests/agent.spec.ts';LT='packages/core/agent-loop/tests/scope-lifecycle.spec.ts'
# 每条含断言、精读符号/范围、官方相关测试全文范围、作者实测用例和适用限制。
rows=[
 ('Agent接口由type-only与runtime扩展构成；运行对象关联Session/Scope',T,190,231,'Agent augmentation',LT,250,256,'D04','公开表面；不分析全部驱动方法'),
 ('id等于session.id；同id登记拒绝而不覆盖',A,484,503,'AgentRegistry.enter',AT,118,128,'C03/D01/D14','最后冲突边界；不能以预查询代替'),
 ('实时entry保存id/Agent/显式owner及通知状态',A,217,227,'AgentEntry',AT,129,150,'C03/D08','不等于持久Session目录'),
 ('get返回同一个裸Agent或undefined',A,586,593,'get',AT,98,117,'D01/D02','不返回Handle，不保证create已完成'),
 ('list/roots为登记顺序的新数组；roots只看owner',A,607,625,'list / roots',AT,129,150,'D01/D08','数组新，不克隆Agent；历史父级不参与'),
 ('SessionStore负责内存会话，不实现持久化',SS,1057,1064,'SessionStore contract',LT,893,914,'D10','存储仅为内存后端替身；无磁盘结论'),
 ('SessionId只加编译期品牌，get不验证外部输入格式','packages/core/session/src/types.ts',22,30,'SessionId',AT,98,117,'D01','空串查询undefined因不存在；官方测试不专测空串'),
 ('dsh-agent不创建模型请求，默认loop实现工厂','packages/core/agent/README.zh.md',12,16,'概述',AT,341,359,'C01','文本事实加缺工厂行为；非任意自定义驱动证明'),
 ('Factory分createAgent与resume两契约',A,175,210,'AgentFactory',AT,341,374,'C02','局部替身只验证委托，不声称完整factory'),
 ('setFactory拒绝重复且Effect释放清空slot',A,379,399,'setFactory',AT,376,387,'C02','同时只一个工厂'),
 ('缺工厂时create/resume拒绝',A,401,440,'requireFactory/create/resume',AT,341,359,'C01','查询已有项不需要创建工厂'),
 ('Registry传调用方绑定Context；runtime依赖来源另外保留',A,416,440,'create/resume',AT,341,359,'C02/D02','实测fiber一致；不强称Context包装恒等'),
 ('默认loop注册工厂并持有投影依赖',L,329,338,'AgentLoop Service.init',LT,301,330,'D01/D07','不开默认配置agents'),
 ('Handle携带释放入口，Agent公开表面没有dispose',A,150,167,'AgentHandle',LT,1062,1081,'D02','能力纪律，不是同进程恶意代码安全边界'),
 ('工厂也是共同结构所有者，跟踪并停止等待活实例',L,54,106,'FactoryOwnership',LT,698,719,'D07-factory','官方该用例部分查询ID不一致；作者用准确id验证'),
 ('先登记所有权/取消联系再构造作用域并安装退出链',L,478,594,'initializeAgent ownership',LT,95,132,'D06/D07','异步mint竞态仅静态选读，不冒称本轮全覆盖'),
 ('Session准备与可选存储获取后进入initializeAgent',L,717,748,'createAgent',LT,665,675,'D01/D09','取得持久句柄前取消另有迟到关闭范围'),
 ('resume需要后端并先open(write)/read/prepare新对象',L,756,836,'resume/resumeWith','packages/core/agent-loop/tests/resume.spec.ts',514,537,'D09/D10','上游真实后端路径仅选读；作者resume使用内存后端替身'),
 ('有seed的重建可追加session/end-seed，旧事实前缀保留',SS,679,702,'Session seed marker','packages/core/session/tests/session.spec.ts',154,173,'D10','本轮一条model/selection前缀；非完整恢复算法'),
 ('Session先enter并同步announce，之后setup时Agent未登记',L,620,636,'initializeAgent publication',LT,377,425,'D04/D03-setup','Session同步通知期间只读，成功后才live append'),
 ('Session通知同步throw否决；返回Promise仅观察拒绝，不等待',SS,1287,1317,'SessionStore.announce',LT,944,962,'D03-session-listener','本轮只实测同步失败；异步拒绝语义静态审读'),
 ('setup全部等待后同步commit，紧邻Agent enter/announce',L,629,641,'setupCommit/enter/announce',LT,377,425,'D04/D03-commit','贡献按注册API可见，不等commit才普遍可见'),
 ('Scope登记可见性和退出归属；失效后拒绝新注册',SC,105,147,'Scope/createScope',LT,276,299,'D04','本轮Scoped事件验证；完整工具/提示词呈现只选读'),
 ('agent/created按serial等待，失败跳过后续并触发收尾',A,562,583,'announce',AT,165,218,'D05/D03-agent-listener','回调须遵守undefined契约，意外bail值会短路'),
 ('退出初始化维护才放行唤醒，不承诺调用方先于首轮',D,200,229,'runMaintenance',LT,67,93,'D12','真实Turn开始+pre-step拒绝；模型stream零次'),
 ('创建失败保留待办，通知结束后再收Scope与两表',L,642,658,'initializeAgent catch/finally',LT,134,156,'D05/D06','保存的是可读对象/内存后端事实，不保证磁盘恢复'),
 ('parentAgent作为独立选项进入entry.owner',L,733,745,'createAgent options forwarding',AT,361,374,'D08','调用方、持有者、历史父级分别记录'),
 ('isOwnedBy比较确切Agent对象，roots不看历史',A,595,625,'isOwnedBy/roots',AT,129,150,'D08','不存在条目对正常Agent参数为false'),
 ('parentAgent字段自身没有级联销毁或Scope父链绑定',L,566,594,'Scope minted on loopCtx',LT,257,274,'D08','独立caller案例；完整Subagent协议NOT_RUN'),
 ('发起方只是进程本地归因，不是授权和存活证明',A,240,250,'AgentRegistry contract','packages/core/agent/tests/agent-initiator.spec.ts',1,28,'STATIC_ONLY','AsyncLocalStorage深入机制未运行/不展开'),
 ('正常teardown等待活动后Scope→close→Agent→Session',L,495,546,'teardown',LT,1026,1060,'D07/D11','实际默认实现；非概述职责列举的文字顺序'),
 ('Handle各入口共享记忆化teardown，重复释放仍等待/观察原失败',L,495,559,'teardown/dispose',LT,1062,1081,'D07/D11','区别H07原始Effect重复调用'),
 ('创建通知开始即标记，使失败时disposed配对',A,522,583,'detachEntered/announce',AT,151,187,'C03/D03-agent-listener','未announce的插入回退不虚构disposed'),
 ('disposal监听逐项容纳throw/reject而不await全部异步工作',A,537,549,'emitDisposed',AT,165,187,'STATIC_ONLY','对应上游测试选读；本轮未独立运行坏观察者路径'),
 ('陈旧detach不能移除后来同id的确切entry',A,504,534,'detach/detachEntered',AT,220,243,'C03/D02/D14','同理Session保护见1267–1275'),
 ('正常dispose继续清理后报告收集错误，创建失败保留原始错误',L,495,546,'throwCollectedFailures + teardown','packages/core/agent-loop/tests/resume.spec.ts',195,222,'D11','实测内存close拒绝；创建错误优先级另见initializeAgent 653–658；不是任意外部资源close已成功'),
 ('signal只用于创建语义，成功后abort不销毁活Agent',L,478,503,'caller abort hook',LT,461,491,'D03-cancel/D13','只验证行为；没有声称成功时已物理removeEventListener'),
]
def link(p,a,b): return f'https://github.com/deepseek-ai/deepseek-harness/blob/{C}/{p}#L{a}-L{b}'
out=['# H09 固定源码断言清单',f'\n固定Commit `{C}`。文件Git blob/SHA256见evidence/source-lock.json；行号检查只防漂移，下面是人工控制流审阅与测试映射。',
'\n官方Vitest均为静态选读，未执行其清理钩子。C/D指本轮作者用例；STATIC_ONLY没有升级成执行。C=3、D=21、E=NOT_RUN，单项内多个事实按条件限定。',
'\n| ID | 教学断言 | 固定实现与符号 | 官方相关测试（仅选读） | 本轮证据 / 条件 |\n| --- | --- | --- | --- | --- |']
data=[]
for i,(claim,p,a,b,symbol,tp,ta,tb,run,limit) in enumerate(rows,1):
 for path,lo,hi in [(p,a,b),(tp,ta,tb)]: assert 1<=lo<=hi<=len((S/path).read_text(encoding='utf8').splitlines()),(path,lo,hi)
 out.append(f'| H09-{i:02} | {claim} | [{p}:{a}–{b}]({link(p,a,b)}) · `{symbol}` | [{tp}:{ta}–{tb}]({link(tp,ta,tb)}) | {run}；{limit} |')
 data.append(dict(id=f'H09-{i:02}',assertion=claim,source=p,start=a,end=b,symbol=symbol,officialTest=dict(path=tp,start=ta,end=tb,status='SELECTED_READ_NOT_RUN'),authorTest=run,conditions=limit))
out += ['\n## 文档概括、实作与证据不能互换',
'1. AgentHandle注释及core概述按职责列“注销→移Session→最后Scope”；可执行teardown为等待工作→Scope→write.close→Agent→Session。本文和四图均按实作；没有修改官方源码或H01–H08。',
'2. agent-loop中文README的根关停持久化限制与shutdown-drain.spec.ts的测试目标存在张力。本课未运行根关停真实后端，保留NOT_RUN；不根据一个注释宣称所有Handle.close失效，也不根据选读测试宣称磁盘关停已通过。',
'3. 工厂结构共同所有者的官方scope-lifecycle 698用例创建factory-live-s，却用factory-live检查部分移除断言。该两条undefined不能单独证明实际对象移除。作者D07-factory始终使用h.agent.id，并等work-end后检查精确对象和两表；不改官方测试。',
'4. 选项注释说creation signal在返回前detached；实作removeEventListener位于teardown等退出路径。作者D13和官方461用例验证的是成功后abort不销毁，未验证成功返回时监听物理移除。正文不把两个结论混同。',
'5. Blueprint旧版H07粗调用链不作为严格销毁时序；最终H07正文已引用Scope先收尾。本课补足内部顺序，不修改历史蓝图/审查成果。',
'\n## 三层判定',
'源码文件和引用校验PASS只证明固定字节/有效范围；C/D的24项执行只证明列明子路径；学员理解、真实时长、独立外审和E级集成均未验证。恢复后端为内存fixture，禁止把D10称官方JSONL恢复通过。']
(R/'source-checklist.md').write_text('\n'.join(out)+'\n',encoding='utf8')
(R/'evidence/source-assertions.json').write_text(json.dumps(dict(commit=C,assertions=data),ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(f'{len(rows)} source assertions written')
