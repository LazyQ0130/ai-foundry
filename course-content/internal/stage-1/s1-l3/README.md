# 1.3 内部参考实现

仅用于课程验证、后续课程开发、配图和升级检查，不是学生下载内容，不接入课程资源注册表。学生只需达到相同的行为，不必采用这里的变量名或组件结构。

- `common/`：2026-09-28 保留的项目配置、锁文件、样式、数据与卡片组件；不含首页。
- `implementation-a/page.tsx`：标准 1.3 合格状态，沿用上轮 1.2 验证副本的 checkbox、单次 filter。
- `implementation-b/page.tsx`：等价合格状态，button + aria-pressed、不同状态名、搜索/标签/重要分步筛选。
- 两个 `faulty-page.tsx`：分别准备的实验故障，重要与工具组合时绕过重要限制；控件状态不重置，其他条件照常生效。
- `prompts.json`：正文三个 Prompt 原文，自动测试核对一致性。
- `diagnosis.md`：当前 Codex 的只读定位记录和页面哈希。

## 在新目录运行

在仓库根目录执行，例如：

```powershell
node course-content/internal/stage-1/s1-l3/prepare.mjs a fixed
cd .runtime/s1-l3-reference-a-fixed
npm install
npm run dev
```

换成 `b fixed` 可组装 B，`a faulty` 或 `b faulty` 可查看实验故障。第四个参数可以指定一个新的输出目录。工具拒绝覆盖已有目录，不删除任何文件。合格 1.2 起点与本节修好后的行为相同，因此 `fixed` 也能用作下一次故障实验的起点。

## 合格行为

默认 9；重要 3；工具 2；重要 + 工具 0；重要 + 教程为 Next.js、Tailwind 两条；Next.js 搜索 1；Excalidraw + 重要 0。关闭重要保留搜索与标签，刷新为空搜索、全部标签、重要关闭、9 条。原始资料总数文字保持 9。

`tests/s1-l3-reference.test.ts` 执行真实首页组件的不同输入状态，核对交给卡片的资料 ID；两种写法各检查 60 种组合，并同时检查故障版只在重要与工具组合偏离。这是状态与呈现逻辑检查，不能替代浏览器事件、刷新和 AI 工具实测。

浏览器按正文依次操作两种实现的起点、故障、修复状态，详见 `docs/s1-l3-validation.md`。

## 验证边界

目前只有当前 Codex 按正文 Prompt 的两轮实做，编写者知道故障设置，不是独立盲测。WorkBuddy 已安装且在运行，但本会话没有可用的原生应用控制入口，未能完成默认演示工具验证。**尚未跨工具验证。** 后续必须实际把三个 Prompt 交给 WorkBuddy，再按正文检查；不能把这里的固定故障文件当成 AI 工具已经通过的证据。
