# 来源与复验边界

官方源码：DeepSeek Harness 固定 Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`；Cordis 包版本 `4.0.6-alpha.1`。少量源码摘录和 Greeter/Consumer 教学改编依 MIT 许可保留，完整版权与许可见 [SOURCE-LICENSE.txt](SOURCE-LICENSE.txt)。改编缩短注释/排版，增加隔离装配、断言、测试与中文解释；不把独立实验称为官方教程测试套件。

三张图由本目录 `scripts/draw_figures.py` 原创生成，SVG 是矢量源文件，PNG 由实际浏览器输出。无第三方图片、官方截图或字体文件；是有省略的教学图，不是官方完整实现图。

练习 A 为普通 TypeScript 参数注入教学示例；固定模型与日志是内存替身。练习 B 真实加载 vendor Cordis/Cosmokit；问候业务为纯函数，框架没有用 Mock 替代。未执行 Loader/Profile/完整 Agent、真实 Provider、凭据、私人文件、生产存储、OS 沙箱或线上鉴权媒体。

作者 runner 新建 OS 临时夹具并保留，不执行批量删除。仅有本机 QA HTTP 服务器用于渲染图片和教材，不连接外部账户或花费模型费用。静态 HTML 没有无效复制按钮；真实复制行为在 React 挂载夹具另测。`/course-media` 只在本机夹具映射，素材未写 public，不代表已部署或已有线上鉴权。
