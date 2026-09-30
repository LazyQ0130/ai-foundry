# AIFoundry Learning Visuals V2｜质量检查

检查范围：20 张正式 WebP、15 篇已发布课程 Markdown、选定的 B/A/A/A 样板及真实课程页桌面与 390px 显示。2026-10-01 完成。

## 制作与概念复核

- 20/20 张 V2 图片已替换为原图号的 WebP；四张选定样板来自 `docs/teaching-visual-v2-samples/`。其余 16 张中，15 张由 Codex 内置 image_gen 生成或局部编辑，`s2-5-02` 因复杂的 Session 位置关系改用从零设计的 SVG，源文件保留于 `docs/teaching-visual-v2-sources/`。
- 逐张查看原尺寸和约 335px 总览。曾发现并淘汰：虚构的 Resource 字段、被画成两座的数据库、误放在浏览器请求路径上的 Session、与课程不符的 Stage 1 文件名，以及不准确的筛选图。正式图已改为与课程对应的关系。
- 重点复核：S2-3-01 的写库和刷新后回读；S2-3-02 的 Migration 与 POST/GET 两条流；S2-5-01 的 Browser、Server、Database 与 Cookie/Session；S2-5-02 的独立 Session 和共享 Resource；S2-6-01 的两条所有权通道与 404；S2-8-01 的代码流、构建和独立生产数据库。没有将生图草稿或缓存提交到 Git。
- 四张样板中 S2-5-01、S2-6-01 的小标签在 335px 下仍较紧凑；主节点、颜色路径和关键箭头可辨，细节可打开原图放大。课程正文保留完整技术说明。

## 文件与安全

- 20 张正式 WebP 均存在且可解码，宽度为 1600 或 1672px，总大小为 1,736,956 字节（约 1.66 MiB）。课程 Markdown 的图片引用、Alt、Caption 和图号没有改动。
- 公开图仅含抽象技术关系和无敏感性的示意元素。检查文本源文件及可见图中文字，未发现真实连接串、密码、Cookie 值、Token、账号隐私或完整付费正文。
- V1 本地备份：`C:\Users\QYF\Desktop\AIFoundry-teaching-visual-v1-backup-2026-10-01`，20 张原 WebP；GitHub 替换前的提交 `fd677d722c9a955cc0c649cfb1616377e1cb571d` 可回退。

## 自动验收

- `DATABASE_URL` 的非秘密目标为 `localhost:55432/aifoundry`；Docker Engine 恢复后使用本地测试 schema，未使用生产 Neon。
- `npm run verify` 通过：类型检查、构建、67/67 测试、15 篇已发布正文及稳定清单键、171 个构建文件的 Bundle 检查。
- `npm run check` 通过：课程正文与 Starter ZIP 检查。

## 真实课程页视觉与交互验收

使用正常启动的本地 AIFoundry 平台与已登录且有 Stage 1/2 权限的账号，逐篇打开 15 篇已发布课程。各图滚动进入视口触发懒加载；桌面视口 1699px 和移动视口 390px 均检查 20/20 张：全部成功解码，桌面图片宽度 740px、移动宽度 335px，均不超出文章容器；每图有非空 Alt 和 Caption；图与下一段不重叠，页面无横向溢出。

在 390px 真实课程页中实际查看 S2-3-02、S2-5-01、S2-6-01、S2-8-01 的图片和相邻正文。S2-3-01 在原图和课程页中检查了单一数据库的写入与回读。点击课程“复制提示词”后出现“已复制”；第 0 课清单一项从未勾选到勾选，刷新后保持，随后取消并刷新，确认恢复原状态。没有将普通图片容器预览算作真实课程页验收。
