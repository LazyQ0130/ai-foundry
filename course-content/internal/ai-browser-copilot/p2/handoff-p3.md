# P2 → P3 技术衔接规格（仅设计，不是P3实现）

P2功能研发与自动化已完成，产品原生工具栏授权验收仍有待人工补齐，详见P2最终报告；只有P2闸门关闭且用户另行授权后才能研发P3。本轮没有模型、HTTP API、Key配置或摘要按钮。

## 稳定输入

P3以学员完成的P2/Reference继续，保留普通action立即open、严格来源、fixed frame0 ISOLATED注入、匿名storage.session租约和Panel generation。不要复制整个Phase0替换教学工程。

SnapshotSchema定义为唯一完整快照契约：

| 字段 | 含义/限制 |
|---|---|
| context.windowId/tabId/url | 当前侧栏所属窗口、活动标签页、来源；原URL不擅自重写 |
| snapshotId | 本次提取随机UUID |
| contextToken | session中匿名UUID页面代次；不是认证令牌 |
| documentId | Chrome InjectionResult的真实文档ID字符串；不强行当小写UUID解析 |
| capturedAt/contentHash | UTC ISO时间、text的SHA-256；hash不证明页面可信度 |
| title/url | 最多512/4096码元；url必须与context.url相同 |
| blocks/text | heading/paragraph/list/code、连续b-001编号；text严格为块换行拼接 |
| truncated/scanLimited | <=6000总码元、<=1500单块、<=100块、<=20000扫描节点的范围提示 |

文本来自不可信网页，模型调用不得把网页指令升级为系统指令。只传本节已提取的有限正文，不额外读取表单或在后台偷偷扫描标签页。截断、来源和块编号应保留给用户核对。

## 继续复用的操作

- CAPTURE产生快照。CHECK_CONTEXT请求仍为v1、随机requestId、context、contextToken、documentId；成功只返回current:true。非法来源、格式、旧代次、非活动页或文档变化均拒绝。
- 每次真正发送模型前重新查询context并CHECK_CONTEXT。网络结束后也要按generation、context、token/documentId审查提交；发送前有效不代表长请求返回时仍有效。
- 超时与取消分开：P2的deadline只停止等待并丢弃旧结果，不能取消executeScript。P3的HTTP可另加AbortController，但仍需丢弃旧返回。
- P2还在每个等待后的新操作前核对存活状态：超时/失效后晚到的context不能再启动CAPTURE，后台超时后不再发起下一次注入/probe。P3要延续这种检查，不能让“最终UI没更新”掩盖超时后仍发送模型请求的问题。
- P2已有错误NEEDS_PERMISSION/UNSUPPORTED_PAGE/NO_CONTENT/TAB_CHANGED/BAD_MESSAGE/TIMEOUT/CONTEXT_UNAVAILABLE不能被API错误覆盖。未来新增模型操作须有单独严格schema、可区分响应与版本兼容决定；P2没有预留可执行任意命令的空口。
- 侧栏关闭丢弃正文；session只保存匿名代次，不是P7笔记存储。worker重启不应让同文档快照无故失效，也不能恢复已经换文档的旧内容。

## P3必须另行完成的验收

P2生产无网络目的地、connect-src none。P3必须在明确本地API/Provider目的地后，分别审查最小浏览器host权限、精确CORS来源和CSP connect-src；不得提前全站放开。可以参考Phase0的127.0.0.1:8787方案，但不得把夹具host权限或Mock往返当真实模型通过。

P3另需真实Provider成功、认证失败/超时/异常返回、前后上下文变更、来源/块引用正确性与费用/隐私控制证据。Chrome155已有证据，116仍未实测。Phase0和P2的PASS不能自动升级为真实模型或最终产品验收。
