# Phase 0 最终架构与权限决策

日期：2026-10-14。**Phase0技术闸门GO，12项PASS；未发布，未进入P1–P8。** 结论和证据范围见[最终报告](evidence.md)。首轮[决策原文](decisions-round1.md)及[最终更新前决策](artifacts/phase0-final-20261014-152950/before-final-decisions.md)保留。

## 1. 保留的技术路线

WXT0.21.4、React18.3.1、TypeScript5.9.3、MV3 Background、按需注入只读DOM函数、独立Express5.2.1回环API、Zod4.6.5共享契约、Mock Provider。当前测试环境为Windows11/Chrome155.0.8059.41/Node24.16.0/npm11.13.0，使用独立lockfile。manifest的Chrome116下限仍未实测。

原型只有读取网页、接收原生右键选区、调用本机Mock三个操作。没有常驻Content Script、popup、问答/笔记/RAG/自动浏览器操作、真实Provider或平台接入。最小snapshot的text/代次字段是Phase0契约，不代替蓝图未来blocks/引用/Note设计。

## 2. 工具栏与临时授权

采用`openPanelOnActionClick:false`和普通`chrome.action.onClicked`回调，在用户手势中同步`chrome.sidePanel.open`；安装/启动均覆盖旧行为设置。Chrome155的自动Side Panel action会在grant前返回，旧0.0.0已实测失败；[同版源码取证](artifacts/toolbar-grant-fix/chromium-source-evidence.json)与旧截图保留。修复后的读取、未授权拒绝、同tab跨源撤权和重新授权均已由用户亲自验证。

Side Panel按钮复用仍有效的activeTab，不生成新grant。只申请activeTab/scripting/sidePanel/contextMenus/storage；未永久申请tabs、host_permissions或全站matches。无授权URL不可得时提示用户点工具栏；受限页拒绝，不扩大权限。

## 3. 内容读取与消息边界

Panel发CAPTURE/TAKE_SELECTION/CHECK_CONTEXT，Background验证精确扩展ID、sidepanel.html、无sender.tab和严格Schema；只对当前目标tab进行scripting只读提取。网页文字作为不可信纯文本处理，不执行其指令。内容函数不拿Key、不调用模型、不接受网页任意命令桥。

快照上限6000字符；选区上限2000字符。Panel按具体结果类型解析，核对ID/tab/URL。后台及Panel在异步边界复查上下文；CHECK_CONTEXT在HTTP前后运行，generation和Abort防止旧请求覆盖当前页面。确定性消息伪造测试和真实多tab人工操作分别提供证据，不相互冒充。

## 4. 生命周期与选区

0.0.1内存代次在普通worker休眠后丢失，已复现误报TAB_CHANGED。0.0.2采用匿名UUID保存在storage.session，工作进程重建恢复；真正导航/相关激活同步更换lease，串行持久化防止旧初始化覆盖新代次，存储失败保守拒绝。[真实Chrome worker夹具](artifacts/worker-lifecycle-fix/chrome-lifecycle-probe.json)与用户45/65秒继续使用均支持修复；仅等待时长不证明生产worker确已终止。

选区按window队列串行存取、一次消费、最新事件覆盖，计时从原生事件开始。age<0或>=60000ms拒绝，空/长/子框架不使用旧槽位；无关后台tab导航或关闭不清除当前有效选区。session包含临时选区文字/来源及代次UUID，60秒是有效性边界，不是定时删除承诺。Panel快照和摘要在内存中，无持久笔记。

## 5. 本机API最小权限

**Chrome155的实测最小方案：新增host权限为0。** API精确允许实际扩展Origin，扩展按普通CORS请求；CSP connect-src固定`http://127.0.0.1:8787`，客户端固定summary URL、redirect:error、credentials:omit。activeTab不授予本机API网络权限，CSP也不产生网页读取授权。

实际worker/普通扩展文档网络证据见[Chrome probe](artifacts/round2/chrome-verified/chrome-network-probe.json)，普通文档不冒充Side Panel；原生侧栏Mock成功及[Network200/204截图](artifacts/manual-user-20261014-144851/09-network-no-throttling-baseline.png)另有用户证据。当前不需要新增host权限，其他Chrome版本/策略不能据此一概保证。

Express仅绑定127.0.0.1，检查精确Host/Origin、POST/JSON、预检方法/header、64KiB正文、输入Schema/6000字符、30次每分钟，Provider响应Schema和ID匹配；服务端1.8秒超时，客户端2.5秒超时，断连传播取消。Origin不是公网鉴权，回环绑定不阻止恶意本地进程；当前只Mock、不公开部署、不读真实Key。

SummaryProvider职责已分离，但响应provider目前固定mock；真实供应商需要后续同时改共享契约和适配器，不能宣称原型无改动切真实模型。网络/模型费用与质量需未来授权和验收。

## 6. 交付与教学扩展

0.0.2 ZIP五文件与本次新Profile配置指向的磁盘目录一致，[最终核对](artifacts/phase0-final-20261014-152950/final-profile-package-check.json)记录hash。44项自动测试和新目录ci/types/test/build/zip的原始日志保留。QA生命周期脚本相对成功重建仅更改输出证据目录，保护旧记录，不影响产品代码或验证逻辑。

新建证据/Profile目录保留旧材料，无批量删除。最后两组原先的未执行确认已撤回；本次新Profile有独立安装和进程证据，用户重新实际确认通过，[最终说明](evidence.md#1-最终结论与范围)区分两个回合。最后一次未附新截图，界面结果按用户文字确认，不伪造。

连续教学扩展建议见[蓝图调整建议](blueprint-adjustments-phase0.md)。当前没有正式课、Starter业务功能、P1–P8 Reference、平台迁移或发布操作。原有Stage/Capstone/数据库/权益边界保持。本轮在Phase0最终报告处停止。

## 7. 设计依据与适用限制

以下官方资料用于解释设计，实际PASS以本地日志和人工记录为准：

- [WXT入口](https://wxt.dev/guide/essentials/entrypoints)、[Chrome Side Panel](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)、[activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab)。
- [scripting](https://developer.chrome.com/docs/extensions/reference/api/scripting)、[storage.session](https://developer.chrome.com/docs/extensions/reference/api/storage)、[worker生命周期](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)。
- [扩展跨源请求](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)、[声明权限](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)、[DevTools限速配置](https://developer.chrome.com/docs/devtools/settings/throttling)。

许可证/依赖清单见[原始记录](artifacts/dependency-licenses.json)。Chrome116/企业策略、真实模型质量与复杂网页仍未实测；详细状态在最终报告中单列，不扩大Phase0的GO范围。
