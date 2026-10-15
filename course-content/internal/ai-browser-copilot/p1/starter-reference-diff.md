# Starter / Reference / Spike 的分工

| 文件/能力 | Student Starter | P1 Reference |
|---|---|---|
| package.json / lockfile | 相同，已锁定，安装和构建应通过 | 完全相同 |
| WXT/TS/HTML/React入口/CSS | 最小基础设施已准备 | 完全相同 |
| background.ts | 明确TODO、没有action连线 | 普通onClicked直接open，安装/启动/worker初始化恢复false设置 |
| App.tsx | 欢迎占位、禁用确认按钮 | 自有欢迎语与useState确认反馈 |
| README | 解释起点尚不能从工具栏打开 | 解释终点操作与边界 |
| 产品权限 | sidePanel | sidePanel |
| 网页/消息/选区/存储/模型 | 全部未提供 | 全部未提供 |

实际源文件应只有README、background.ts、App.tsx三处不同，由自动交付检查核对。Starter保留可独立安装构建的骨架，学员的核心工作是连接浏览器原生事件、识别用户手势边界，并实现和解释一个React交互；不要求手敲框架配置。课堂Prompt给目标和限制，关键代码审查解释事件顺序，不能将“AI说完成”当作验收。

Phase0 Spike保留全部验证源码、测试和GO证据，但包含的网页快照、上下文协调、右键选区、API故障测试均不适合作为P1学生初始工程。P1没有复制这些实现；只复用已验证技术组合、普通action入口设计和锁文件可达包版本。

对照实现的成功不等于学生作业成功；自动安装/类型/构建不等于原生图标点击与重开成功。Reference和学生完成的Starter必须分别在真实Chrome复验。未经完成的Starter不打开工具栏侧栏是预期练习状态，不能把这个预期标为产品功能PASS。
