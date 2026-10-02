# AIFoundry Learning Visuals V2｜配图清单

共 20 张正式配图，已按用户选定的 B、A、A、A 样板方案重设计并替换图片文件；课程 Markdown 中的图号、路径、Alt、Caption 与插入位置保持原样。位置为课程 Markdown 中对应的概念段落；标题栏为该图之前最近的章节标题。

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

## Stage 3 V1.1 已完成图

| 编号 | 课程 | 教学关系 | 文件 |
| --- | --- | --- | --- |
| S3-1-01 | 3.1 | Browser → Next.js Server → Provider，Key 只在服务端 | `public/course-media/stage-3/s3-1-01.svg` |
| S3-3-01 | 3.3 | A 取消、B 启动、A 迟到片段被忽略 | `public/course-media/stage-3/s3-3-01.svg` |
| S3-4-01 | 3.4 | Document → Chunk → Embedding → vector(1024) → pgvector | `public/course-media/stage-3/s3-4-01.svg` |
| S3-5-01 | 3.5 | Question → Query Embedding → Top-K → Context → Model → Answer | `public/course-media/stage-3/s3-5-01.svg` |
| S3-6-01 | 3.6 | JSON Schema 与本次来源集合的双层校验 | `public/course-media/stage-3/s3-6-01.svg` |
| S3-7-01 | 3.7 | 固定题集、自动指标、人工支持度与错误类别 | `public/course-media/stage-3/s3-7-01.svg` |

六张均为从零绘制的完整 SVG 信息图，生成源为 `docs/teaching-visual-v2-sources/stage-3-diagrams.py`。抽象关系可公开；正文细节仍在受保护 Markdown。
