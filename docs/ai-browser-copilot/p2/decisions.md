# P2 增量冻结与证据约定

2026-10-14；仅P2，未发布。上游V1.2、P1 Reference/GO、Phase0源码/GO保持原样；本轮新增路径限定docs/ai-browser-copilot/p2、course-content/internal/ai-browser-copilot/p2、starter/ai-browser-copilot/p2及私有验证目录。开始时1891份现有文件hash已记录，含其他未提交改动；不批量删除，不staging/commit/push。

## 工程延续

- 复制P1 Reference的明确源码清单，保留WXT0.21.4、React/DOM18.3.1、TS5.9.3、React模块1.2.2及可达锁版本。仅增加Phase0已用的Zod4.6.5；没有API、模型、选区、右键、问答、GitHub模式或笔记实现。
- 保留项目root/extension srcDir、回环开发3080、strictPort、手工加载和独立PostCSS；生产CSP connect-src none。产品权限为sidePanel/activeTab/scripting/storage，无tabs/host_permissions/content_scripts/default_popup。
- 普通action回调中立即open(windowId)，openPanelOnActionClick=false；P1欢迎和确认交互仍保留。Side Panel内按钮不获得新的activeTab授权。同源刷新与跨源撤权是不同概念：同URL刷新清除旧快照，但不虚称Chrome必定撤销同源grant。

## 本节数据与生命周期

- 严格Zod v1消息，仅CAPTURE/CHECK_CONTEXT。精确扩展ID、sidepanel.html与非网页sender校验；固定只读函数，ISOLATED、顶层frame0；不注册window消息或externally_connectable，不解释正文中的指令。
- PageContext包含windowId/tabId/url；匿名contextToken复用Phase0的storage.session租约、同步失效与串行写入。导航/loading/激活/移出窗口使相关租约失效，关闭tab删除其session键。存储只放匿名UUID，不放URL/正文/历史。
- Snapshot含snapshotId、contextToken、documentId、capturedAt、contentHash、title/url、text/blocks/truncated。documentId来自真实Chrome InjectionResult，并通过独立轻量注入前后核对，补充代次检查；不是用URL+tabId代替代次。
- 提取仅普通顶层HTML，跳过脚本、隐藏/透明子树、导航、表单和可编辑区、iframe/Shadow DOM；保留heading/paragraph/list/code块及b-001编号。总正文含分隔换行<=6000 UTF-16码元，单块<=1500、最多100块，扫描有上限；界面明确提示截断。复杂主文识别/SPA同URL无导航DOM变化不保证，需用户主动重读。
- Background每次注入及最终响应前复查活动window/tab/URL、租约身份和documentId；Panel用generation及请求ID、消息超时、最终CHECK_CONTEXT阻止旧返回提交。不能取消已经开始的executeScript，但超时/换页后忽略结果。MV3重启恢复session代次，不定时保活。
- 最终回归补充操作存活标记：Panel在晚到context之后、CAPTURE之前核对generation，错误/超时使旧操作失效；后台deadline结束后不再启动后续注入/探测。已开始的executeScript仍不能声称被取消。旧构建4项真实失败和修复后28项通过日志独立保留。

## Starter与Reference

Starter继承P1，提供严格契约与已有验证依据的session工具，核心提取器/协调器/客户端及读取UI是TODO。契约和基础工具不是整节答案；课堂重点是实现只读提取、连接扩展环境、选择正确失效时机和审核异步结果。Reference只完成P2。两者独立安装、构建，不把Spike或作者测试工具打入学员包。

## 验收分层

1. Node确定性契约/协调/竞态/超时测试：使用明确Chrome适配器替身，不能声称activeTab原生通过。
2. 真实Chrome受控集成：实际DOM/消息/存储/worker终止与重启。必要的测试夹具可单独声明本机fixture host权限，必须与无host权限产品包分开，记录差异；不能将其成功当作原生工具栏grant证据。
3. 产品真实Chrome原生交互：仅toolbar临时授权等确有必要的少数步骤合并一次人工操作。工具若仍无法读Chrome原生窗口，保留BLOCKED，不合成action点击。P1已验证且未变化的操作不反复要求。

先完成所有可自动验证项、包与课程，再交付一次完整路径的人工最小集合。Chrome155实测与116目标下限分开，P3真实模型未测，P1/Phase0不自动授予P2 GO。
