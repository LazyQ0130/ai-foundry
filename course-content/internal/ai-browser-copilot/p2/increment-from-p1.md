# P1 → P2 工程增量

P2从P1 Reference明确的13文件白名单复制而来，未重新脚手架，也未修改上游P1或Phase0。两份源码包各19文件，保留project root/extension srcDir、WXT0.21.4、React/DOM18.3.1、TS5.9.3、React模块1.2.2和普通CSS。

| 部位 | P1 | P2增量 |
|---|---|---|
| package/lock | 固定工具链 | 版本0.2.0；只新增Phase0已有Zod4.6.5；原170个锁条目的version/integrity全保留，新增1个Zod条目 |
| Node约束 | >=22，正文说明下游至少22.12 | engines明确>=22.12.0；实测仍24.16.0，避免允许已知不满足下游的22.0 |
| Manifest | sidePanel | 加activeTab/scripting/storage；没有tabs/host权限/content_scripts/popup |
| 工具栏 | 普通onClicked立即open，模式false | 保留；没有先await读取或存储 |
| contracts | 无 | v1 CAPTURE/CHECK_CONTEXT严格契约、来源、块、快照、错误和时限工具 |
| session工具 | 无 | Phase0租约身份/串行写入增量复用；补关闭清理和存储失败后重试 |
| extract | 无 | 自包含只读顶层HTML；排除、块、总量/单块/节点上限，非HTML/空正文错误 |
| coordinator | 无 | sender/当前window-tab-URL/租约/documentId前后检查；固定ISOLATED注入；4秒整体时限 |
| read-client | 无 | 校验响应ID/结构/来源、最终CHECK_CONTEXT+context核对、本地generation和6秒整体时限 |
| Background | P1工具栏监听 | 同步注册消息与activated/loading/url/removed/detached/attached/replaced失效监听 |
| Side Panel | 欢迎、确认 | 读/核对按钮、状态、来源、编号正文、限长提示、折叠元数据；普通React文本渲染 |
| 练习工具 | 无 | 127.0.0.1:8002普通HTML夹具，不接收数据、不是API |

V1.2/Phase0的匿名页面代次、activeTab和MV3路线保持。补充windowId隔离及Chrome真实documentId，目的是覆盖同URL换文档、窗口归属和事件处理间隙，不用URL+tabId退化替代代次。

本轮不引入HTTP客户端、模型密钥、API服务器、selection/contextMenus、问答、GitHub模式、笔记持久化或平台发布代码。生产CSP仍connect-src none。开发Manifest由WXT添加tabs与回环host权限，不能拿它做产品权限验收。

支持范围刻意有限：普通顶层HTML、首次可见主区域候选或body；排除表单/隐藏等明显无关内容，不保证语义上完美识别每个站点的主文。SPA同URL局部更新需主动重读。没有声明支持Chrome116实机或全部网站。
