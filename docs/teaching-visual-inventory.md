# AIFoundry Learning Visuals V2｜配图清单

Stage 1 / 2 共 20 张正式配图，已按用户选定的 B、A、A、A 样板方案重设计。Stage 3 另有 9 张生图式教学配图，见下表。位置为课程 Markdown 中对应的概念段落；标题栏为该图之前最近的章节标题。

| 编号 | 课程 | 正文位置 | 理解目标 | 实际文件路径 | 状态 |
| --- | --- | --- | --- | --- | --- |
| s1-0-01 | s1-l0 | 开始之前，先知道我们要做什么（第 45 行） | 项目文件经 Node.js 启动后由浏览器访问 | `public/course-media/stage-1/s1-0-01.webp` | 已生成、已集成 |
| s1-1-01 | s1-l1 | 页面变了，刚才到底发生了什么？（第 116 行） | 页面变化来自实际项目文件的修改 | `public/course-media/stage-1/s1-1-01.webp` | 已生成、已集成 |
| s1-2-01 | s1-l2 | 多一个按钮，就算有功能了吗？（第 97 行） | 事件改变状态，状态决定列表 | `public/course-media/stage-1/s1-2-01.webp` | 已生成、已集成 |
| s1-3-01 | s1-l3 | 页面能打开，也可能有 Bug（第 39 行） | 组合筛选要同时满足所有启用的条件 | `public/course-media/stage-1/s1-3-01.webp` | 已生成、已集成 |
| s1-4-01 | s1-l4 | 一个小需求，应该改多少地方？（第 119 行） | 需求、改动与页面结果要能互相解释 | `public/course-media/stage-1/s1-4-01.webp` | 已生成、已集成 |
| s1-5-01 | s1-l5 | 回到刚才那个能用的版本（第 236 行） | 先存本地保存点，再做可恢复实验 | `public/course-media/stage-1/s1-5-01.webp` | 已生成、已集成 |
| s1-6-01 | s1-l6 | 先保存现在这个好版本（第 59 行） | 完成个人功能需要实现、验收与保存 | `public/course-media/stage-1/s1-6-01.webp` | 已生成、已集成 |
| s2-1-01 | s2-l1 | 先把整个过程连起来（第 110 行） | 本课的预览与后续全栈架构要区分 | `public/course-media/stage-2/s2-1-01.webp` | 已生成、已集成 |
| s2-2-01 | s2-l2 | 浏览器和服务端是怎么说话的？（第 53 行） | 服务端收到请求并不代表资料已保存 | `public/course-media/stage-2/s2-2-01.webp` | 已生成、已集成 |
| s2-3-01 | s2-l3 | 服务端收到了，为什么刷新后还是没有？（第 29 行） | 收到请求不等于保存，持久化需要重新读取 | `public/course-media/stage-2/s2-3-01.webp` | 已生成、已集成 |
| s2-3-02 | s2-l3 | 再建一条 GET：把资料读回来（第 181 行） | 迁移建结构，POST 和 GET 操作资料 | `public/course-media/stage-2/s2-3-02.webp` | 已生成、已集成 |
| s2-3-03 | s2-l3 | 原来的九条资料去哪了？（第 241 行） | 静态示例与数据库资料来源独立 | `public/course-media/stage-2/s2-3-03.webp` | 已生成、已集成 |
| s2-4-01 | s2-l4 | 删除不是让卡片暂时消失（第 111 行） | 四种操作都作用于数据库中的同一条资料 | `public/course-media/stage-2/s2-4-01.webp` | 已生成、已集成 |
| s2-5-01 | s2-l5 | 做出 /me 和退出登录（第 114 行） | 浏览器持有 Cookie，数据库保存哈希与会话 | `public/course-media/stage-2/s2-5-01.webp` | 已生成、已集成 |
| s2-5-02 | s2-l5 | 再注册一个 Bob（第 153 行） | 认证成功不等于资料已经按用户隔离 | `public/course-media/stage-2/s2-5-02.webp` | 已生成、已集成 |
| s2-6-01 | s2-l6 | 第一次真正进行 Alice / Bob 实验（第 113 行） | 资源所有权由服务端依据 Session 检查 | `public/course-media/stage-2/s2-6-01.webp` | 已生成、已集成 |
| s2-7-01 | s2-l7 | 网络和数据库失败时怎么办？（第 93 行） | 等待、空列表、错误和输入校验各有含义 | `public/course-media/stage-2/s2-7-01.webp` | 已生成、已集成 |
| s2-7-02 | s2-l7 | 最需要小心的一种情况：结果尚未确认（第 103 行） | 结果未确认时先重新读取再决定是否重试 | `public/course-media/stage-2/s2-7-02.webp` | 已生成、已集成 |
| s2-8-01 | s2-l8 | 把 README 变成真正的项目说明（第 153 行） | 代码、应用与生产数据位于不同位置 | `public/course-media/stage-2/s2-8-01.webp` | 已生成、已集成 |
| s2-8-02 | s2-l8 | 准备真正的云 PostgreSQL（第 93 行） | 本地和生产环境分离，网络可达性另行验收 | `public/course-media/stage-2/s2-8-02.webp` | 已生成、已集成 |

所有文件位于公开的 `public/course-media`，只表达抽象教学关系。四张选定样板与对比图保留在 `docs/teaching-visual-v2-samples/`；SVG 备用源保留在 `docs/teaching-visual-v2-sources/`。V1 备份见视觉规范。原有未制作的真实软件截图建议仍保留为注释；没有将其记录为已完成。

## Stage 3 生图式教学配图

| 编号 | 课程 | 教学关系 | 文件 |
| --- | --- | --- | --- |
| S3-1-01 | 3.1 | 单次问答经过服务端；Mock 与真实模型分路；Key 留在服务端 | `public/course-media/stage-3/s3-1-01.webp` |
| S3-2-01 | 3.2 | 模型返回 JSON 后，Zod 决定展示建议或拒绝 | `public/course-media/stage-3/s3-2-01.webp` |
| S3-3-01 | 3.3 | 六种状态与取消、重启、旧片段忽略 | `public/course-media/stage-3/s3-3-01.webp` |
| S3-4-01 | 3.4 | 文档切块后逐块 Embedding，再写入 pgvector | `public/course-media/stage-3/s3-4-01.webp` |
| S3-4-02 | 3.4 | 文档和分块的一对多关系，以及 ownerId 隔离 | `public/course-media/stage-3/s3-4-02.webp` |
| S3-5-01 | 3.5 | 提问、向量检索、Top-K、Context、生成回答 | `public/course-media/stage-3/s3-5-01.webp` |
| S3-6-01 | 3.6 | JSON 结构与本次来源集合双重校验；检索命中和实际引用分开 | `public/course-media/stage-3/s3-6-01.webp` |
| S3-7-01 | 3.7 | 固定题集顺序运行，结合自动指标与人工复核 | `public/course-media/stage-3/s3-7-01.webp` |
| S3-7-02 | 3.7 | 六类错误及其对应的检索、拒答、生成、引用和服务环节 | `public/course-media/stage-3/s3-7-02.webp` |

九张正式图均由生图工具直接生成完整构图与主要文字，再压缩为 WebP。先前六张 SVG 仍保留为历史源文件，课程正文不再引用。公开图片只表达抽象教学关系；正文细节仍在受保护 Markdown。
