# SP-12最后两组人工验收（其余已通过项目保持原记录）

## 1. 扩展重载

先在原测试Profile按Ctrl+N开一个管理窗口，地址栏打开chrome://extensions；原Example窗口保持原tab/URL。回Example窗口点击读取并Mock成功，再新划词右键发送但先不接收。切到管理窗口点击本扩展卡片的重新加载圆箭头，确认仍0.0.2；回Example窗口点击工具栏A。应无旧正文/摘要、Mock初始禁用；接收重载前未消费选区应NO_SELECTION。之后重新读取/Mock、新划词发送接收均应成功。两个窗口用于避免因切换Example窗口的标签页而先清空选区，便于归属重载行为。界面操作必须由用户真实完成。

## 2. 第二个干净Profile

新目录已由代理创建并记录初始为空，无旧Profile复制。PowerShell执行second-profile-launch-command.txt中的一行命令。新窗口不登录、不同步，打开chrome://extensions，开发者模式→加载已解压扩展，选择现有最终目录：
C:\Users\QYF\Desktop\AIFoundry\spikes\ai-browser-copilot-spike\.output\chrome-mv3

确认0.0.2及扩展ID。打开https://example.com/，从拼图固定扩展后亲自点击A，原生Side Panel初始无旧正文/摘要；先接收应NO_SELECTION，点A授权后读取/Mock均成功，新划词右键发送/接收成功、再接收NO_SELECTION。来源文字与当前Example相符。原API精确Origin使用hijkflihajcoealnhjnepmgabohaimcn；如实际ID不同，回传ID，由代理调整本地API精确Origin后继续，不扩权。

请一并回传两组结果和第二Profile扩展ID；建议各保存一张完整窗口截图。未执行项目仍BLOCKED；两组通过后核对证据并收尾报告，不自行进入P1–P8或标发布。
