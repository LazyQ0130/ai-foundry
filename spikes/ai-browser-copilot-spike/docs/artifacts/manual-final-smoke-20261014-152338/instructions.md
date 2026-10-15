# Phase 0 最后一次合并人工验收

目的：一次补齐SP-12的干净Profile全链路与扩展重载恢复。当前仍11 PASS / 0未解决FAIL / 1 BLOCKED，NO-GO。上次“最后两组都通过”的确认随后由用户更正为未验证，原始回传均保留；本次重新执行，不用旧确认补PASS。

## 1. 打开全新Profile

代理已创建空目录，未复制旧配置。PowerShell执行：

```powershell
& 'C:\Program Files\Google\Chrome\Application\chrome.exe' '--user-data-dir=C:\Users\QYF\Desktop\AIFoundry\spikes\ai-browser-copilot-spike\.runtime\manual-profile-final-20261014-152338' '--no-first-run' '--no-default-browser-check' 'chrome://extensions/'
```

在新开的Chrome窗口跳过登录；本窗口作为扩展管理窗口，保留它。

## 2. 加载同一最终包

chrome://extensions → 开启开发者模式 → 加载已解压扩展 → 选择：

```text
C:\Users\QYF\Desktop\AIFoundry\spikes\ai-browser-copilot-spike\.output\chrome-mv3
```

应为0.0.2，记录扩展ID。当前API精确Origin使用hijkflihajcoealnhjnepmgabohaimcn；如实际不同，回传ID，由代理调整本地API来源后再继续，不放宽来源或加全站权限。

## 3. 首次全链路

在这个新Profile中按Ctrl+N新开网页窗口，访问https://example.com/。从拼图固定扩展，亲自点A打开原生Side Panel。

- 读取当前网页 → Mock：标题/URL/正文对应Example，摘要正常。保存完整窗口截图12-clean-profile-summary.png。
- 划词 → 在选中文字上右键“验证：发送选中文字到阅读侧栏” → 接收：文字和来源正确。

## 4. 为重载保留旧状态

保持Example网页窗口的tab/URL不变，重新读取并Mock成功；再选另一小段文字右键发送，先不接收。这样侧栏有旧快照/摘要，后台还有未消费选区。

## 5. 重载并检查清除与恢复

切换窗口到步骤1保留的扩展管理窗口，点该扩展卡片的重新加载圆箭头；版本仍0.0.2。再切回Example网页窗口，点工具栏A。

- 先不要读取：旧正文/摘要应清空，Mock禁用；直接接收应NO_SELECTION，不出现重载前选区。
- 再读取 → Mock → 新划词发送/接收：均成功，文字和来源正确。保存完整窗口截图12-reload-selection.png。

两个窗口用于使Example在重载前保持自身窗口的原tab/URL，避免先切tab清空待测状态。不用脚本点击或调用扩展API替代上述原生操作。

## 回传

一并回复“首次读取/摘要/划词结果；重载后旧状态是否清除、链路是否恢复；扩展ID”，并附上述两张截图。如有异常附完整提示。完成本组后只核对证据并收尾报告，不进入P1–P8、不发布。普通Mock当前运行在127.0.0.1:8787；不需要另开API或重新构建。
