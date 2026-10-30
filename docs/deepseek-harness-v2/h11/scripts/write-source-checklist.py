"""H11人工控制流结论索引；此脚本只验证引用范围，语义与行为证据分别记录。"""
from pathlib import Path
import os,json
R=Path(__file__).resolve().parents[1];C='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
S=Path(os.environ.get('HARNESS_SOURCE_CACHE',r'C:\Users\QYF\.codex\research\harness-v2-source\deepseek-harness-'+C))
P='packages/core/system-prompt/src/index.ts';A='packages/core/agent-loop/src/agent.ts';RC='packages/core/agent-loop/src/runtime-context.ts';T='packages/core/tools/src/index.ts'
PT='packages/core/system-prompt/tests/system-prompt.spec.ts';ST='packages/core/system-prompt/tests/scoped.spec.ts';TT='packages/core/system-prompt/tests/tool-order.spec.ts';AT='packages/core/agent-loop/tests/system-prompt-admission.spec.ts';LT='packages/core/agent-loop/tests/loop.spec.ts'
rows=[
 ('展示对象只有sections/contexts/variables；完整assembly另含tools',P,120,134,'PromptPresentation / PromptAssembly',TT,81,89,'C23 + AST','类型表面与返回覆盖分开核'),
 ('Section同层同名拒绝，order须有限数',P,483,491,'SystemPrompt.section',PT,355,372,'C06','没有把name套用Variable的命名正则'),
 ('Section先按作用域同名合并，隐藏全局文本不求值',P,635,672,'assemble section definitions',ST,66,79,'C15/D09','本轮验证全局/单Scope与两个独立Agent，未执行全部祖先链组合'),
 ('Section排序为order升序，同序按名称代码单元',P,247,259,'compareNames / comparePromptSections',PT,305,312,'C01','不是localeCompare或加载序；Waterfall可改最终展示序'),
 ('默认身份/prefix/suffix分别-1000/0/10200，prefix/suffix默认空',P,450,473,'SystemPrompt constructor',PT,220,252,'SOURCE_READ + C01','默认true来自构造器/Config；本课组件夹具明确关闭身份，非完整Profile默认验证'),
 ('变量名正则、同层重复拒绝，Provider可返回undefined',P,558,574,'SystemPrompt.variable',PT,642,657,'C02/C06','登记与取值不同；undefined仅在实际被引用时render失败'),
 ('变量先全局再Scope远到近求值，近值覆盖但全局Provider仍执行',P,624,634,'assemble variables',ST,84,103,'C08/C16','变量遍历可重入细节仅选读；不承诺全局Provider被跳过'),
 ('assemble求文本但不插值；renderPrompt按段插值、删零长度、空行连接',P,286,300,'renderPrompt',PT,282,303,'C01/C07','空格不trim；替身没有重写此函数'),
 ('未知变量与注册但无值分别报错，拒绝原型属性冒充',P,364,377,'interpolate variable lookup',PT,729,749,'C02/C07','原型边界另见PT783–800；不是类型声明检查'),
 ('合法完整组才解析；无后续闭括号的孤立开组保留，替换值不递归扫描',P,345,381,'interpolate',PT,752,810,'C02/C07','不宣称所有含花括号文本都报错'),
 ('interpolate=false保留原段/Context文本，不查占位符',P,295,341,'renderPrompt / renderContextSections',PT,699,715,'C02/C09','literal是字面保留，不能变出缺失目录'),
 ('同名覆盖后计有效complete，多于一个在组装拒绝',P,635,661,'assemble complete validation',PT,515,523,'C04 + CONTROL_FLOW_READ','同名遮蔽后计数的所有组合未逐个执行'),
 ('complete副本在Waterfall后恢复唯一段，变换后的变量仍生效',P,662,693,'assemble complete restoration',PT,497,513,'C03','不是最终字节不受变量影响；不是删除注册表其他贡献'),
 ('complete不跳过其他Section Provider求值，Provider throw仍失败',P,657,672,'assemble text providers',PT,497,523,'C05','官方相关主要验证恢复/冲突；作者补Provider throw相邻路径'),
 ('Context登记有限order/同层唯一；组装仅按order排序，同序稳定收集',P,518,526,'context / assemble contexts',PT,374,383,'C14 + CONTROL_FLOW_READ','排序另见676–679；没有Section的名称二级比较'),
 ('Context独立渲染成带name文本，join形成完整快照，不附加到系统段',P,302,342,'renderContextSections / joinContextSections',PT,559,577,'C09/D04','空快照和带来源消息由Loop另处理'),
 ('includeRuntimeContext=false安装全局抑制器，required仍参与',P,435,473,'Config / constructor suppression',PT,36,53,'C12','抑制可选Provider与Waterfall额外项，未关闭事实所属服务'),
 ('抑制器为独立可释放登记，当前全局或Scope任一存在即抑制',P,529,541,'suppressRuntimeContext',ST,146,161,'C10/C17/D05','当前抑制判定另见587–596；撤单个不等全部撤销'),
 ('刷新补回缺失required，包含当前新required，非全量新增optional',P,587,607,'refreshContext required restoration',PT,87,101,'C11/C13','不是Waterfall一结束就保证所有必需名字存在；Loop接纳前再刷新'),
 ('刷新只遍历传入已接纳Context名字；无Provider保留接纳文本',P,593,598,'refreshContext accepted names',PT,54,85,'C09/C10','被过滤的optional不能靠刷新filtered对象自动重新收集'),
 ('refresh保留Section/tools/variables，不重跑它们或Waterfall',P,577,607,'refreshContext',PT,54,85,'C09/D04/D08','Provider计数实测；变量仍是接纳值'),
 ('匿名Tool Provider全局与匹配Scope一起参与，不是按名字替换',P,638,656,'assemble tool providers',ST,165,175,'C18','真正工具定义覆盖由Tools处理；文档概括需细分'),
 ('Tools提供方用当前executor.describe可见定义，并保留限制前knownNames',T,111,117,'ToolsService constructor',ST,190,204,'D03/D09 + C20','C20只模拟Schema/knownNames分离；D才用真实ToolRuntime'),
 ('Step先resolve当前工具集合，再把toolSet传给Prompt assemble',A,287,295,'preStep',LT,1325,1351,'D03/D09 + CONTROL_FLOW_READ','工具条件/执行完整生命周期留H13；无实际文件工具'),
 ('工具Schema参数structuredClone，单次变更不污染Provider原对象',P,645,655,'assemble schema detachment',PT,525,544,'C23','不把可变assembly误称最终冻结请求'),
 ('toolOrder需rest恰一次且无重复，形状在构造加载阶段校验',P,209,224,'validateToolOrder',TT,91,108,'C21 ×2','错误配置未放松；类型形状之外的语义分阶段校验'),
 ('未配置按名称排序；显式顺序在rest处插入未列可见工具',P,226,245,'orderTools',TT,27,49,'C19','不是以工具注册/插件加载先后直接呈现'),
 ('knownNames使已注册但隐藏名字正常缺席，typo在组装拒绝',P,237,244,'orderTools name validation',ST,190,204,'C20/D06-tool-order-error','toolOrder不会授权或复活隐藏工具'),
 ('Provider不可把rest标记当真实工具名称返回',P,231,235,'orderTools reserved guard',TT,64,72,'C22','注册与展示保留名机制不同，不展开其他保留名'),
 ('Waterfall不收到工具数组；返回伪造tools仍由Provider-owned tools覆盖',P,673,693,'assemble presentation waterfall',TT,81,89,'C23','同进程可信插件契约，不是恶意代码安全沙箱'),
 ('无complete时Waterfall返回展示权威，能改变量或段序且不自动重排',P,682,693,'assemble transformed presentation',PT,458,495,'C24','C24还验证throw传播；不能用bail继续值解释未调用next'),
 ('assemble事件按Scope筛选，change通知不使用同一筛选',P,18,37,'Events augmentation',ST,229,245,'C17/D09 + STATIC_ONLY','Scope匹配实测；change全局广播为源码审读，未另做坏观察者专项'),
 ('登记用当前Context的Effect归属Scope，精确Disposer撤销后回落', 'packages/core/scope/src/store.ts',219,260,'ScopedLayers.effect',PT,619,640,'C15/D09','不展开H09所有权/Factory teardown；无批量删除'),
 ('Loop只登记provider/model变量，cwd不内置','packages/core/agent-loop/src/index.ts',337,338,'AgentLoop init variables',LT,551,566,'D06-render-error + SOURCE_READ','官方测试自行注册cwd不能反推内置；未展开所有可选插件变量'),
 ('官方WorkingDirectory贡献required且不插值的动态目录','packages/session/working-directory/src/index.ts',90,95,'WorkingDirectoryService context registration',PT,124,149,'SOURCE_READ + C09','本课目录是纯变量夹具，未挂此服务或执行chdir/FS'),
 ('候选Step先assemble，再pre-step，默认回调渲染Context候选',A,283,317,'ReactLoopAgent.preStep',LT,1325,1369,'D06-context-error/D07-cancel-assemble','默认Context render失败可零Step；非所有监听器必委托默认回调'),
 ('正式Step内先renderPrompt，后prepareRequest',A,435,445,'ReactLoopAgent.step',LT,568,606,'D06-render-error','未知Section变量1Step0请求，尚未用户/系统接纳'),
 ('prepareRequest经过request Waterfall及配置约束，prepareCall绑定当前调用能力',A,613,652,'ReactLoopAgent.prepareRequest',AT,432,459,'D07-cancel-prepare + CONTROL_FLOW_READ','NO_ADAPTER兼容分支和metadata内部取消仅选读；不展开H12绑定实现'),
 ('prepare绑定后刷新/渲染Context；刷新不重新传候选toolSet',A,445,451,'step request admission',LT,846,865,'D04/D05 + CONTROL_FLOW_READ','不同render时刻不能合并；metadata等待内部取消未本轮执行'),
 ('初次尝试接纳输入一次，runtime snapshot按当前值提交，retry仍刷新',A,452,479,'step firstAttempt admission',LT,867,909,'D08','Context Provider组装1+两刷新，普通用户1；不证明全部重试策略'),
 ('系统投影初始即使为空也预留节点，未变可不新增消息',RC,93,107,'SystemPromptProjection.project',LT,622,674,'D11/D01','初始空日志节点不等于模型收到非空system角色消息'),
 ('plain协调已有节点；in-history序列延续可追加非空更新',RC,99,107,'SystemPromptProjection.project',AT,86,124,'D01-plain/D01-in-history','依本次prepareCall能力，不靠历史request/context猜'),
 ('新序列文本未变保留节点，变化时协调已有有效节点',RC,99,107,'SystemPromptProjection.project',AT,126,158,'D02','仅显式新序列实跑，compaction/resume/switch组合未执行'),
 ('完整文本为空清空生效系统节点，记录替换，不改旧事件',RC,93,114,'SystemPromptProjection.project / replace',AT,187,224,'D01','本课从有到空并重复空；不运行恢复后清空组合'),
 ('动态快照不变不新增，变空写清除说明；旧事实保留',RC,151,167,'RuntimeContextProjection.project',LT,911,940,'D10','无Compaction，清除说明不是删除整个历史'),
 ('buildRequest按需记header/context，derive并冻结messages；tools独立，无system字段',A,656,743,'ReactLoopAgent.buildRequest',AT,43,61,'D01/D03/D11','公共MockAdapter边界，非供应商HTTP wire或Token实测'),
 ('准备/assemble取消不接纳待进入系统/用户消息，Step边界取决于位置',A,283,317,'preStep cancellation checks',AT,432,459,'D07-cancel-assemble/D07-cancel-prepare','Step内检查另见435–451；自制等待门会释放，不声称强制杀Promise'),
 ('Session commit是内存log接纳并通知，derive从当前surface取消息','packages/core/session/src/index.ts',892,911,'Session.commit',AT,43,61,'D01 + SOURCE_READ','deriveMessages另见999–1029；无磁盘后端/flush承诺'),
]
def link(p,a,b):return f'https://github.com/deepseek-ai/deepseek-harness/blob/{C}/{p}#L{a}-L{b}'
out=['# H11固定Commit源码断言清单',f'\n官方Commit `{C}`。本清单是人工控制流审读结论；Git blob/SHA256与有效行范围另核，不能靠关键字或AST证明运行顺序。',
'\n每行含实现文件/符号/范围、预期结论、相关官方测试、作者用例及限制。官方测试均选读setup/action/assertions，未运行整套Vitest；相关测试未必覆盖本行全部条件，差异明确列出。C25/D15为本课40项互斥分级，用例可在多行引用但不重复计数。',
'\nSOURCE_READ/CONTROL_FLOW_READ只表示静态实现与await/条件/返回审阅；STATIC_ONLY未升级成执行。A独立算法模拟/B独立Cordis专项/E完整应用未执行；C/D中真实Cordis不另计。',
'\n| ID | 教学断言 | 固定实现 / 符号 | 相关官方测试（选读，未执行） | 作者证据与适用限制 |\n| --- | --- | --- | --- | --- |'];data=[]
for n,(claim,p,a,b,sym,tp,ta,tb,run,limit) in enumerate(rows,1):
 for f,lo,hi in [(p,a,b),(tp,ta,tb)]:assert 1<=lo<=hi<=len((S/f).read_text(encoding='utf8').splitlines()),(f,lo,hi)
 out.append(f'| H11-{n:02} | {claim} | [{p}:{a}–{b}]({link(p,a,b)}) · `{sym}` | [{tp}:{ta}–{tb}]({link(tp,ta,tb)}) | {run}；{limit} |')
 data.append(dict(id=f'H11-{n:02}',assertion=claim,source=p,start=a,end=b,symbol=sym,officialTest=dict(path=tp,start=ta,end=tb,status='SELECTED_READ_NOT_RUN'),authorTest=run,conditions=limit,method='Fixed control-flow reading; named actual component/integration tests where listed; byte/range/AST separately'))
out+=['\n## 文档概括与实现细分',
'1. 包README把带Scope贡献概括为遮蔽全局；有名Section/Variable/Context与匿名Tool Provider必须分开。匿名Provider为全局+匹配Scope叠加，Tools定义自身另做shadow/restrict；C18和D09分别验证两层。',
'2. 文档将无效插值统称组装失败；实际assemble返回未插值文本。Section render在Step内，默认Context候选render可在Step前。D06按真实边界区分，未把两者说成同一失败位置。',
'3. Section同order有代码单元名字排序；Context只有order排序并保留同序收集次序。Waterfall能改展示顺序，结果不再自动规范化。图二按变量先求值、再规范化段与求文本；complete为独立组装分支，不画成render后的动作。',
'4. required在注册选择/抑制规则中保留；Waterfall可以删除接纳对象里的项，refresh再补回缺失required。refresh不会加入所有新optional，也不会恢复filtered对象中原已删去的可选名字；撤抑制与重新assemble分开。',
'5. renderPrompt在prepareCall前；refreshContext/renderContextSections在后，不能将用户研究检查表直接当真实时序。assemble本身不强制中断任意Promise，Loop检查显式signal。',
'6. complete恢复的是保存的未插值段及标志，仍用Waterfall返回的变量渲染；其他Provider求值/错误不自动略过。不是安全沙箱或全局不可变策略。',
'\n## Token和缓存分析单列',
'固定README关于文本/Schema成本与稳定前缀的描述是分析入口，不是本课性能数据。本文仅解释哪些公共请求字段可能改变前缀；不声明真实供应商Token、费用、缓存命中或延迟。没有运行缓存基准、真实usage或供应商wire转换；这些均MEASUREMENT_NOT_RUN，不给它们虚设通过测试。',
'\n## 保留未运行范围',
'完整应用E、Profile/Boot/CLI、真实LLM/网络、磁盘flush/恢复、Compaction、所有Adapter能力切换/恢复组合、metadata内部取消、完整Tool Registry/执行/审批安全、多个Scope祖先链组合与坏观察者回滚均未由本课执行。源码选读不替代这些运行；学员试读、实测时长、独立外审另为PENDING。']
(R/'source-checklist.md').write_text('\n'.join(out)+'\n',encoding='utf8',newline='\n')
(R/'evidence/source-assertions.json').write_text(json.dumps(dict(commit=C,assertions=data),ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
print(f'{len(data)} fixed-source assertions written')
