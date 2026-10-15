# P1 → P2 衔接约定（设计规格，尚未实现）

P1终点为Reference：MV3、普通action事件、React Side Panel、生产权限仅sidePanel。P2以学员完成的P1为起点，不重新初始化WXT，不覆盖已有锁文件。Phase0 Spike是已验证依据，不作为P2初始学生包。

## 稳定入口

- 保留`extension/entrypoints/background.ts`中的普通`chrome.action.onClicked`。`sidePanel.open`紧随原生事件，不在前面await；`openPanelOnActionClick=false`，无popup。
- 保留`sidepanel/main.tsx`和`App.tsx`挂载边界。P2可增加只读当前页操作，不能把读取函数放到欢迎按钮中偷偷执行。
- 依赖继续WXT0.21.4 / React18.3.1 / TS5.9.3；新增依赖需有具体用途与锁文件审查。

## P2计划增加的边界

| 项 | P2约定 | P1现状 |
|---|---|---|
| 产品权限 | 明确加入activeTab、scripting、storage；用户点击工具栏后才允许当前页临时访问 | 只有sidePanel，不产生页面访问grant |
| 读取方式 | 动态`chrome.scripting.executeScript`只读当前顶层DOM；不常驻Content Script、不扫描所有tab | 无读取函数 |
| 请求方向 | Panel → Background协调 → 当前tab注入 → 返回快照 | 无消息监听或消息类型 |
| 页面身份 | PageContext含tabId/url/contextToken；contextToken为每tab匿名UUID，在storage.session恢复 | 不建存储、不造假上下文 |
| 快照 | requestId、snapshotId、tabId、url、contextToken、title、text、truncated；正文总量先沿用Phase0 6000字符 | 无快照 |
| 失效 | 刷新/导航/相关tab变化按Phase0规则替换代次；worker重建恢复已有代次；异步前后检查；丢弃旧结果 | 无异步页面数据 |
| 消息契约 | 以Phase0判别联合CAPTURE / CHECK_CONTEXT为基础，先声明再实现；严格校验sender和关联ID | 无空壳消息协议进入学生包 |
| UI | idle/loading/success/error；未授权、受限页、无内容有可观察反馈 | 欢迎与确认状态 |

P4再加入contextMenus、TAKE_SELECTION、60秒一次消费和2000字符限长；P3才引入API/模型适配。P1生产`connect-src 'none'`届时按真实API目的地显式收窄调整，不能一开始允许所有网络。CORS和浏览器权限分开验收。

## P2进入前检查

P1真实Chrome验收现已完成人工补齐，最终GO；保留P1源码/ZIP哈希和原始人工证据。只有获得后续研发授权才继续；P2另开版本与证据目录。Chrome155已在Phase0验证的结果可作为技术依据，P2新工程仍需真实操作。Chrome116和真实模型结果不能凭API文档或Mock继承。本文不代表授权继续P2研发。
